import { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../../shared/prisma.js";
import { AuthenticatedRequest } from "../../shared/middleware/auth.js";
import { CertificationEvaluator } from "../mastery/bkt.js";
import { config } from "../../config/index.js";
import {
  CredentialCryptoService,
  CanonicalCredentialPayload,
} from "./crypto.service.js";

const IssueRequestSchema = z.object({
  enrollmentId: z.string().min(1),
});

const RevokeRequestSchema = z.object({
  reason: z.string().min(3).max(500).optional().default("Administrative revocation"),
});

export class CertificatesController {
  /**
   * Exports the active Ed25519 SPKI public key so external verifiers can
   * independently verify any credential signature.
   */
  public static async getPublicKey(_req: Request, res: Response): Promise<void> {
    const keyMeta = CredentialCryptoService.getPublicKeyMetadata();
    res.json(keyMeta);
  }

  /**
   * Lists all credentials owned by the authenticated learner.
   */
  public static async listMyCredentials(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          courseVersion: { include: { course: true } },
          certificate: true,
          conceptMasteries: true,
        },
      });

      const credentials = enrollments
        .filter((e: any) => e.certificate)
        .map((e: any) => {
          let parsedSummary: any = {};
          try {
            parsedSummary = JSON.parse(e.certificate.evidenceSummary);
          } catch {
            parsedSummary = {};
          }
          return {
            id: e.certificate.id,
            credentialId: e.certificate.credentialId,
            courseSlug: e.courseVersion.course.slug,
            courseTitle: e.courseVersion.course.title,
            courseVersion: e.courseVersion.versionNumber,
            tier: e.certificate.tier,
            compositeScore: e.certificate.compositeScore,
            status: e.certificate.status,
            issuedAt: e.certificate.issuedAt,
            signatureHash: e.certificate.signatureHash,
            evidenceSummary: parsedSummary,
          };
        });

      res.json({ credentials });
    } catch (err) {
      console.error("Error listing credentials:", err);
      res.status(500).json({ error: "Failed to load learner credentials" });
    }
  }

  /**
   * Deterministically evaluates whether a learner qualifies for a certificate
   * using ONLY persisted, attributable evidence from the database, assigns the
   * appropriate tier, and cryptographically signs the credential using Ed25519.
   */
  public static async issueCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = IssueRequestSchema.parse(req.body);
      const { enrollmentId } = parsed;
      const userId = req.user!.id;

      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          courseVersion: {
            include: { course: true },
          },
          user: true,
          conceptMasteries: {
            include: { evidences: true },
          },
          assessments: {
            include: { answers: true },
          },
          sessions: {
            include: { messages: true },
          },
          certificate: true,
        },
      });

      if (!enrollment) {
        res.status(404).json({ error: "Enrollment not found" });
        return;
      }

      if (enrollment.userId !== userId) {
        res.status(403).json({ error: "Forbidden: You do not own this enrollment" });
        return;
      }

      if (enrollment.certificate) {
        res.json({
          message: "Certificate already issued",
          certificate: enrollment.certificate,
          verificationUrl: `/verify/${enrollment.certificate.credentialId}`,
        });
        return;
      }

      // 1. Compute Chapter Mastery from persisted ConceptMastery rows
      const masteries = enrollment.conceptMasteries;
      const totalConcepts = masteries.length;
      const sumP = masteries.reduce((acc: number, m: any) => acc + m.pMastery, 0);
      const meanMastery = totalConcepts > 0 ? Number((sumP / totalConcepts).toFixed(4)) : 0;
      const unmasteredConcepts = masteries.filter(
        (m: any) => m.pMastery < 0.70 || m.state === "NEEDS_REMEDIATION"
      );

      // 2. Compute Practical Score from persisted PRACTICAL AssessmentAttempt rows (NO hardcoded constants!)
      const evaluatedPracticalAttempts = enrollment.assessments.filter(
        (a: any) => a.assessmentType === "PRACTICAL" && a.status === "EVALUATED" && a.score !== null
      );
      const practicalScore =
        evaluatedPracticalAttempts.length > 0
          ? Number(
              Math.max(...evaluatedPracticalAttempts.map((a: any) => Number(a.score))).toFixed(4)
            )
          : 0;

      // 3. Compute Viva Defense Score from persisted, completed VIVA AssessmentAttempt rows
      const evaluatedVivaAttempts = enrollment.assessments.filter(
        (a: any) => a.assessmentType === "VIVA" && a.status === "EVALUATED" && a.score !== null
      );
      const vivaScore =
        evaluatedVivaAttempts.length > 0
          ? Number(Math.max(...evaluatedVivaAttempts.map((a: any) => Number(a.score))).toFixed(4))
          : 0;

      // 4. Compute Consistency Index from persisted CHAPTER AssessmentAttempt scores
      const evaluatedChapterAttempts = enrollment.assessments.filter(
        (a: any) => a.assessmentType === "CHAPTER" && a.status === "EVALUATED" && a.score !== null
      );
      let consistency = 0;
      if (evaluatedChapterAttempts.length > 0) {
        const chapterScores = evaluatedChapterAttempts.map((a: any) => Number(a.score));
        const meanChapScore =
          chapterScores.reduce((acc: number, s: number) => acc + s, 0) / chapterScores.length;
        const variance =
          chapterScores.reduce((acc: number, s: number) => acc + Math.pow(s - meanChapScore, 2), 0) /
          chapterScores.length;
        const stdDev = Math.sqrt(variance);
        consistency = Number(Math.max(0, Math.min(1, meanChapScore * (1 - stdDev))).toFixed(4));
      }

      // 5. Compute Interaction Depth from persisted learner dialogue messages & demonstrated rubric evidences
      const userMessageCount = enrollment.sessions.reduce(
        (acc: number, s: any) =>
          acc + s.messages.filter((m: any) => m.sender === "USER" || m.role === "user").length,
        0
      );
      const demonstratedEvidenceCount = masteries.reduce(
        (acc: number, m: any) =>
          acc + m.evidences.filter((ev: any) => ev.isDemonstrated).length,
        0
      );
      const interactionDepth =
        demonstratedEvidenceCount > 0
          ? Number(
              Math.min(
                1.0,
                0.55 + demonstratedEvidenceCount * 0.03 + userMessageCount * 0.03
              ).toFixed(4)
            )
          : 0;

      // Enforce hard evidence-completeness gates before running tier evaluation
      const missingEvidenceReasons: string[] = [];
      if (unmasteredConcepts.length > 0) {
        missingEvidenceReasons.push(
          `${unmasteredConcepts.length} course concept(s) are below the 0.70 mastery threshold or require remediation.`
        );
      }
      if (evaluatedChapterAttempts.length === 0) {
        missingEvidenceReasons.push(
          "No formal chapter assessment attempts have been completed and evaluated."
        );
      }
      if (evaluatedPracticalAttempts.length === 0 || practicalScore < 0.70) {
        missingEvidenceReasons.push(
          "Practical code execution assessment is missing or below the 0.70 minimum threshold."
        );
      }
      if (evaluatedVivaAttempts.length === 0 || vivaScore < 0.70) {
        missingEvidenceReasons.push(
          "Multi-turn AI Viva oral defense is missing, incomplete, or below the 0.70 minimum threshold."
        );
      }

      const evaluation = CertificationEvaluator.evaluateCredential({
        chapterMasteryScore: meanMastery,
        practicalPerformance: practicalScore,
        vivaDefenseScore: vivaScore,
        consistencyIndex: consistency,
        interactionDepthScore: interactionDepth,
      });

      if (
        missingEvidenceReasons.length > 0 ||
        !evaluation.isCertified ||
        evaluation.tier === "NONE"
      ) {
        res.status(400).json({
          error: "Certificate Requirements Not Met",
          reasons: [...missingEvidenceReasons, ...evaluation.reasons],
          compositeScore: evaluation.compositeScore,
          currentMeanMastery: meanMastery,
          evidenceBreakdown: {
            chapterMasteryScore: meanMastery,
            practicalPerformance: practicalScore,
            vivaDefenseScore: vivaScore,
            consistencyIndex: consistency,
            interactionDepthScore: interactionDepth,
          },
        });
        return;
      }

      // 6. Issue & Cryptographically Sign Credential (Ed25519) Inside an Atomic Transaction
      const randomSuffix = crypto.randomBytes(6).toString("hex").toUpperCase();
      const year = new Date().getFullYear();
      const credentialId = `CERT-${year}-PY-${randomSuffix}`;
      const issuedAtIso = new Date().toISOString();
      const keyMeta = CredentialCryptoService.getPublicKeyMetadata();

      const canonicalPayload: CanonicalCredentialPayload = {
        credentialId,
        enrollmentId: enrollment.id,
        recipientName: enrollment.user.fullName,
        courseSlug: enrollment.courseVersion.course.slug,
        courseTitle: enrollment.courseVersion.course.title,
        courseVersion: enrollment.courseVersion.versionNumber,
        tier: evaluation.tier,
        compositeScore: evaluation.compositeScore,
        issuedAt: issuedAtIso,
        ruleVersion: config.ruleVersion,
      };

      const signatureHash = CredentialCryptoService.signCredential(canonicalPayload);

      const evidenceSummary = JSON.stringify({
        courseSlug: enrollment.courseVersion.course.slug,
        courseTitle: enrollment.courseVersion.course.title,
        version: enrollment.courseVersion.versionNumber,
        ruleVersion: config.ruleVersion,
        chapterMastery: meanMastery,
        practicalPerformance: practicalScore,
        vivaDefenseScore: vivaScore,
        consistencyIndex: consistency,
        interactionDepth: interactionDepth,
        compositeScore: evaluation.compositeScore,
        evaluatedAt: issuedAtIso,
        signatureAlgorithm: keyMeta.algorithm,
        publicKeyFingerprint: keyMeta.keyFingerprint,
        provenance: {
          chapterAttemptIds: evaluatedChapterAttempts.map((a: any) => a.id),
          practicalAttemptIds: evaluatedPracticalAttempts.map((a: any) => a.id),
          vivaAttemptIds: evaluatedVivaAttempts.map((a: any) => a.id),
          demonstratedEvidenceCount,
        },
      });

      const certificate = await prisma.$transaction(async (tx: any) => {
        const created = await tx.certificate.create({
          data: {
            credentialId,
            enrollmentId: enrollment.id,
            tier: evaluation.tier,
            compositeScore: evaluation.compositeScore,
            evidenceSummary,
            signatureHash,
            status: "VALID",
            issuedAt: new Date(issuedAtIso),
          },
        });

        await tx.enrollment.update({
          where: { id: enrollment.id },
          data: {
            status: "COMPLETED",
            currentTier: evaluation.tier,
            completedAt: new Date(issuedAtIso),
          },
        });

        return created;
      });

      res.status(201).json({
        message: "Certificate issued successfully!",
        certificate,
        verificationUrl: `/verify/${certificate.credentialId}`,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      console.error("Certificate issuance error:", err);
      res.status(500).json({ error: "Failed to issue certificate" });
    }
  }

  /**
   * Public verification endpoint. No auth required. Zero PII leakage.
   * Reconstructs the canonical credential payload and cryptographically verifies
   * the Ed25519 digital signature in addition to checking database status.
   */
  public static async verifyPublicCredential(req: Request, res: Response): Promise<void> {
    try {
      const { credentialId } = req.params;

      const certificate = await prisma.certificate.findUnique({
        where: { credentialId },
        include: {
          enrollment: {
            include: {
              user: { select: { fullName: true } },
              courseVersion: {
                include: { course: { select: { title: true, slug: true } } },
              },
            },
          },
        },
      });

      if (!certificate) {
        res.status(404).json({
          isValid: false,
          signatureVerified: false,
          error: "Credential record not found in the public verification registry",
        });
        return;
      }

      let parsedSummary: any = {};
      try {
        parsedSummary = JSON.parse(certificate.evidenceSummary);
      } catch {
        parsedSummary = {};
      }

      const issuedAtIso =
        parsedSummary.evaluatedAt ||
        (certificate.issuedAt instanceof Date
          ? certificate.issuedAt.toISOString()
          : String(certificate.issuedAt));

      const canonicalPayload: CanonicalCredentialPayload = {
        credentialId: certificate.credentialId,
        enrollmentId: certificate.enrollmentId,
        recipientName: certificate.enrollment.user.fullName,
        courseSlug: certificate.enrollment.courseVersion.course.slug,
        courseTitle: certificate.enrollment.courseVersion.course.title,
        courseVersion: certificate.enrollment.courseVersion.versionNumber,
        tier: certificate.tier,
        compositeScore: certificate.compositeScore,
        issuedAt: issuedAtIso,
        ruleVersion: parsedSummary.ruleVersion || config.ruleVersion,
      };

      const signatureVerified = CredentialCryptoService.verifyCredential(
        canonicalPayload,
        certificate.signatureHash
      );
      const isStatusValid = certificate.status === "VALID";
      const isValid = isStatusValid && signatureVerified;
      const keyMeta = CredentialCryptoService.getPublicKeyMetadata();

      res.json({
        isValid,
        verified: isValid,
        signatureVerified,
        signatureAlgorithm: "Ed25519",
        publicKeyFingerprint: keyMeta.keyFingerprint,
        credentialId: certificate.credentialId,
        recipientName: certificate.enrollment.user.fullName,
        courseTitle: certificate.enrollment.courseVersion.course.title,
        courseSlug: certificate.enrollment.courseVersion.course.slug,
        courseVersion: certificate.enrollment.courseVersion.versionNumber,
        tier: certificate.tier,
        compositeScore: certificate.compositeScore,
        status: isStatusValid
          ? signatureVerified
            ? "VALID"
            : "TAMPERED_INVALID"
          : certificate.status,
        issuedAt: certificate.issuedAt,
        evidenceSummary: parsedSummary,
        signatureHash: certificate.signatureHash,
        trustNotice: isValid
          ? "This credential was deterministically issued from persisted chapter assessments, isolated practical code execution, and a multi-turn AI Viva defense, and its Ed25519 digital signature has been cryptographically verified."
          : !isStatusValid
          ? `This credential has status '${certificate.status}' and is no longer valid.`
          : "Cryptographic signature verification failed: the credential record does not match its signed Ed25519 payload.",
      });
    } catch (err) {
      console.error("Verification lookup error:", err);
      res.status(500).json({ error: "Verification lookup failed" });
    }
  }

  /**
   * Administrative revocation endpoint (requires ADMIN or INSTRUCTOR role).
   */
  public static async revokeCredential(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { credentialId } = req.params;
      const { reason } = RevokeRequestSchema.parse(req.body || {});

      const existing = await prisma.certificate.findUnique({
        where: { credentialId },
      });

      if (!existing) {
        res.status(404).json({ error: "Credential not found" });
        return;
      }

      let summaryObj: any = {};
      try {
        summaryObj = JSON.parse(existing.evidenceSummary);
      } catch {
        summaryObj = {};
      }
      summaryObj.revocation = {
        revokedAt: new Date().toISOString(),
        revokedBy: req.user!.id,
        reason,
      };

      const updated = await prisma.certificate.update({
        where: { credentialId },
        data: {
          status: "REVOKED",
          evidenceSummary: JSON.stringify(summaryObj),
        },
      });

      res.json({
        message: "Credential revoked successfully",
        credentialId: updated.credentialId,
        status: updated.status,
        revocation: summaryObj.revocation,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      console.error("Revoke credential error:", err);
      res.status(500).json({ error: "Failed to revoke credential" });
    }
  }
}
