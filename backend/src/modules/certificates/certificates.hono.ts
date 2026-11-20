import { Hono } from "hono";
import crypto from "crypto";
import { prisma } from "../../shared/prisma.js";
import { honoAuthMiddleware, honoRequireRole } from "../../shared/middleware/honoAuth.js";
import { honoRateLimiter } from "../../shared/middleware/honoRateLimit.js";
import { CertificationEvaluator, EvidenceComponents } from "../mastery/bkt.js";
import { CredentialCryptoService } from "./crypto.service.js";
import { EmailService } from "../email/email.service.js";
import { ProgressionService } from "../progression/progression.service.js";
import { config } from "../../config/index.js";

export const certificatesHonoRouter = new Hono();

/**
 * Privacy-preserving pseudonymization of recipient name.
 * Note: Masked name is still identifying info; disclosed under deliberate public credential policy.
 */
function maskRecipientName(fullName: string): string {
  if (!fullName || typeof fullName !== "string") return "Anonymous Learner";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    const name = parts[0];
    if (name.length <= 2) return `${name[0]}*`;
    return `${name[0]}${"*".repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}`;
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  const maskedFirst =
    first.length <= 2
      ? `${first[0]}*`
      : `${first[0]}${"*".repeat(Math.max(first.length - 2, 1))}${first[first.length - 1]}`;
  const maskedLast = `${last[0]}.`;
  return `${maskedFirst} ${maskedLast}`;
}

// Authenticated Learner Certificates Listing (Strictly Scoped to Logged-In User)
certificatesHonoRouter.get("/mine", honoAuthMiddleware, async (c) => {
  try {
    const user = c.get("user");

    const certificates = await prisma.certificate.findMany({
      where: {
        enrollment: { userId: user.id },
      },
      orderBy: { issuedAt: "desc" },
      include: {
        enrollment: {
          include: {
            user: { select: { fullName: true, email: true } },
            courseVersion: {
              include: {
                course: { select: { id: true, slug: true, title: true } },
              },
            },
          },
        },
      },
    });

    return c.json({
      certificates: certificates.map((cert) => ({
        id: cert.id,
        credentialId: cert.credentialId,
        tier: cert.tier,
        compositeScore: cert.compositeScore,
        status: cert.status,
        issuedAt: cert.issuedAt,
        evidenceSummary: cert.evidenceSummary,
        signatureHash: cert.signatureHash,
        recipientName: cert.enrollment.user.fullName,
        courseSlug: cert.enrollment.courseVersion.course.slug,
        courseTitle: cert.enrollment.courseVersion.course.title,
        courseVersion: cert.enrollment.courseVersion.versionNumber,
      })),
    });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch learner certificates", details: err?.message }, 500);
  }
});

// Public Key Registry Endpoint
certificatesHonoRouter.get("/keys", async (c) => {
  try {
    const activeKey = CredentialCryptoService.getPublicKeyMetadata();
    const trustedKeysRegistry = CredentialCryptoService.getAllPublicKeys();
    return c.json({
      activeKey,
      trustedKeysRegistry,
      supportedAlgorithms: ["Ed25519"],
      trustPolicy: "Deterministic evidence-based issuance with persistent RFC 8032 keypair and historical key retention",
    });
  } catch (err: any) {
    return c.json({ error: "Failed to retrieve public key metadata", details: err?.message }, 500);
  }
});

// Public Verification Endpoint (Privacy-Preserving Pseudonymization)
certificatesHonoRouter.get(
  "/:credentialId/verify",
  honoRateLimiter({ maxRequests: 60, windowSeconds: 60, keyPrefix: "cert-verify" }),
  async (c) => {
    try {
      const credentialId = c.req.param("credentialId");

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
        return c.json(
          {
            isValid: false,
            error: "Credential record not found in the public verification registry",
          },
          404
        );
      }

      let keyId = certificate.keyId || config.ed25519KeyId || "certify-2026-key-1";
      let ruleVersion = config.ruleVersion || "2026.1";
      try {
        const summary = JSON.parse(certificate.evidenceSummary);
        if (summary.keyId) keyId = summary.keyId;
        if (summary.ruleVersion) ruleVersion = summary.ruleVersion;
      } catch {
        // Fallback default
      }

      // If keyId is not in active in-memory cache, look up DB signing_key_registry
      let publicKeyPemOverride: string | undefined;
      const knownKeys = CredentialCryptoService.getAllPublicKeys();
      if (!knownKeys.some((k) => k.keyId === keyId)) {
        const regEntry = await prisma.signingKeyRegistry.findUnique({
          where: { keyId },
        });
        if (regEntry?.publicKeyPem) {
          publicKeyPemOverride = regEntry.publicKeyPem;
        }
      }

      const canonicalPayload = {
        compositeScore: certificate.compositeScore,
        courseSlug: certificate.enrollment.courseVersion.course.slug,
        courseTitle: certificate.enrollment.courseVersion.course.title,
        courseVersion: certificate.enrollment.courseVersion.versionNumber,
        credentialId: certificate.credentialId,
        enrollmentId: certificate.enrollment.id,
        issuedAt: certificate.issuedAt.toISOString(),
        recipientName: certificate.enrollment.user.fullName,
        ruleVersion,
        tier: certificate.tier,
      };

      const isSignatureValid = CredentialCryptoService.verifyCredential(
        canonicalPayload,
        certificate.signatureHash,
        keyId,
        publicKeyPemOverride
      );

      const isOverallValid = certificate.status === "VALID" && isSignatureValid;
      const maskedRecipient = maskRecipientName(certificate.enrollment.user.fullName);

      // Return public fields strictly: NO internal database IDs, NO raw answers, NO session IDs
      return c.json({
        isValid: isOverallValid,
        credentialId: certificate.credentialId,
        recipientName: maskedRecipient,
        courseTitle: certificate.enrollment.courseVersion.course.title,
        tier: certificate.tier,
        compositeScore: certificate.compositeScore,
        status: certificate.status,
        issuedAt: certificate.issuedAt,
        cryptographicProof: {
          algorithm: "Ed25519",
          keyId,
          signatureValid: isSignatureValid,
          signatureHash: certificate.signatureHash,
        },
        trustNotice:
          "This credential was deterministically issued based on continuous chapter-level evidence, practical unit-tested execution, and verified AI Viva oral defense.",
      });
    } catch (err: any) {
      return c.json({ error: "Verification lookup failed", details: err?.message }, 500);
    }
  }
);

// Authenticated Issue Certificate Endpoint (Idempotent)
certificatesHonoRouter.post(
  "/issue",
  honoAuthMiddleware,
  honoRateLimiter({ maxRequests: 5, windowSeconds: 60, keyPrefix: "cert-issue" }),
  async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { enrollmentId } = body;
      const user = c.get("user");

      if (!enrollmentId) {
        return c.json({ error: "enrollmentId is required" }, 400);
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          courseVersion: { include: { course: true } },
          user: true,
          conceptMasteries: { include: { evidences: true } },
          assessments: true,
          certificate: true,
        },
      });

      if (!enrollment || enrollment.userId !== user.id) {
        return c.json({ error: "Enrollment not found or unauthorized" }, 404);
      }

      // Idempotent: return existing credential if already issued
      if (enrollment.certificate) {
        return c.json({
          message: "Certificate already issued",
          certificate: enrollment.certificate,
          verificationUrl: `/verify/${enrollment.certificate.credentialId}`,
        });
      }

      // 1. Enforce Module and Practical Completion Gates
      await ProgressionService.ensureInitialized(enrollment.id);
      const moduleProgresses = await prisma.moduleProgress.findMany({
        where: { enrollmentId: enrollment.id },
      });

      const totalModules = moduleProgresses.length || 10;
      const completedModules = moduleProgresses.filter(
        (m) => m.status === "COMPLETED" && m.practicalPassed
      ).length;

      if (completedModules < totalModules) {
        return c.json(
          {
            error: "Certificate Requirements Not Met",
            reasons: [
              `Completed ${completedModules} of ${totalModules} required modules and practical tasks.`,
            ],
            completedModules,
            totalModules,
          },
          400
        );
      }

      // 2. Deterministic Evidence Signals (Zero Defaults - No Artificial Gifts)
      const masteries = enrollment.conceptMasteries;
      const totalConcepts = masteries.length;
      const sumP = masteries.reduce((acc, m) => acc + m.pMastery, 0);
      const meanMastery = totalConcepts > 0 ? Number((sumP / totalConcepts).toFixed(4)) : 0;

      const practicalAttempts = enrollment.assessments.filter(
        (a) => a.assessmentType === "PRACTICAL" && a.status === "EVALUATED" && typeof a.score === "number"
      );
      const practicalScore =
        practicalAttempts.length > 0
          ? Number((practicalAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / practicalAttempts.length).toFixed(4))
          : 0;

      const vivaAttempts = enrollment.assessments.filter(
        (a) => a.assessmentType === "VIVA" && a.status === "EVALUATED" && typeof a.score === "number"
      );
      const vivaScore =
        vivaAttempts.length >= 3
          ? Number(
              (
                vivaAttempts.slice(-3).reduce((acc, a) => acc + (a.score || 0), 0) / 3
              ).toFixed(4)
            )
          : 0;

      if (vivaAttempts.length < 3 || vivaScore < 0.70) {
        return c.json(
          {
            error: "Certificate Requirements Not Met",
            reasons: [
              `Oral Viva Defense incomplete or below 70% threshold (${vivaAttempts.length}/3 turns completed, score: ${(vivaScore * 100).toFixed(1)}%).`,
            ],
            vivaAttempts: vivaAttempts.length,
            vivaScore,
          },
          400
        );
      }

      const masteredCount = masteries.filter((m) => m.pMastery >= 0.70).length;
      const consistency = totalConcepts > 0 ? Number((masteredCount / totalConcepts).toFixed(4)) : 0;

      // Interaction depth calculated strictly from verified qualitative dialogue rubrics (NO message counts!)
      const dialogueEvidences = masteries.flatMap((m) =>
        m.evidences.filter((e) => e.evidenceType === "DIALOGUE_PROBE")
      );
      const demonstratedDialogue = dialogueEvidences.filter((e) => e.isDemonstrated).length;
      const interactionDepth =
        dialogueEvidences.length > 0
          ? Number((demonstratedDialogue / dialogueEvidences.length).toFixed(4))
          : 0;

      const evidence: EvidenceComponents = {
        chapterMasteryScore: meanMastery,
        practicalPerformance: practicalScore,
        vivaDefenseScore: vivaScore,
        consistencyIndex: consistency,
        interactionDepthScore: interactionDepth,
      };

      const evaluation = CertificationEvaluator.evaluateCredential(evidence);

      if (!evaluation.isCertified || evaluation.tier === "NONE") {
        return c.json(
          {
            error: "Certificate Requirements Not Met",
            reasons: evaluation.reasons,
            compositeScore: evaluation.compositeScore,
            currentMeanMastery: meanMastery,
          },
          400
        );
      }

      const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
      const year = new Date().getFullYear();
      const credentialId = `CERT-${year}-PY-${randomSuffix}`;
      const issuedAt = new Date().toISOString();

      const canonicalPayload = {
        compositeScore: evaluation.compositeScore,
        courseSlug: enrollment.courseVersion.course.slug,
        courseTitle: enrollment.courseVersion.course.title,
        courseVersion: enrollment.courseVersion.versionNumber,
        credentialId,
        enrollmentId: enrollment.id,
        issuedAt,
        recipientName: enrollment.user.fullName,
        ruleVersion: "2026.1",
        tier: evaluation.tier,
      };

      const { signature, keyId } = CredentialCryptoService.signCredential(canonicalPayload);

      // Upsert active signing key into SigningKeyRegistry
      const activeKeyMeta = CredentialCryptoService.getPublicKeyMetadata();
      await prisma.signingKeyRegistry.upsert({
        where: { keyId: activeKeyMeta.keyId },
        update: {
          publicKeyPem: activeKeyMeta.publicKeyPem,
          keyFingerprint: activeKeyMeta.keyFingerprint,
          status: "ACTIVE",
        },
        create: {
          keyId: activeKeyMeta.keyId,
          algorithm: "Ed25519",
          publicKeyPem: activeKeyMeta.publicKeyPem,
          keyFingerprint: activeKeyMeta.keyFingerprint,
          status: "ACTIVE",
        },
      }).catch((e) => console.warn("[Certificates] Key registry upsert warning:", e?.message || e));

      const evidenceSummary = JSON.stringify({
        ruleVersion: "2026.1",
        courseTitle: enrollment.courseVersion.course.title,
        version: enrollment.courseVersion.versionNumber,
        chapterMastery: meanMastery,
        practicalPerformance: practicalScore,
        vivaDefenseScore: vivaScore,
        consistencyIndex: consistency,
        interactionDepthScore: interactionDepth,
        compositeScore: evaluation.compositeScore,
        evaluatedAt: issuedAt,
        keyId,
      });

      const [certificate] = await prisma.$transaction([
        prisma.certificate.create({
          data: {
            credentialId,
            enrollmentId: enrollment.id,
            tier: evaluation.tier,
            compositeScore: evaluation.compositeScore,
            evidenceSummary,
            signatureHash: signature,
            keyId,
            status: "VALID",
          },
        }),
        prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            status: "COMPLETED",
            currentTier: evaluation.tier,
            completedAt: new Date(issuedAt),
          },
        }),
      ]);

      // Fire email notification asynchronously
      EmailService.sendCertificateIssuedNotice({
        recipientEmail: enrollment.user.email,
        recipientName: enrollment.user.fullName,
        courseTitle: enrollment.courseVersion.course.title,
        credentialId: certificate.credentialId,
        tier: certificate.tier,
      }).catch(() => {});

      return c.json(
        {
          message: "Certificate issued successfully",
          certificate: {
            id: certificate.id,
            credentialId: certificate.credentialId,
            tier: certificate.tier,
            compositeScore: certificate.compositeScore,
            status: certificate.status,
            issuedAt: certificate.issuedAt,
            keyId,
          },
          verificationUrl: `/verify/${certificate.credentialId}`,
        },
        201
      );
    } catch (err: any) {
      return c.json({ error: "Failed to issue certificate", details: err?.message }, 500);
    }
  }
);

// Scoped Revocation (ADMIN or INSTRUCTOR only)
certificatesHonoRouter.post(
  "/:credentialId/revoke",
  honoAuthMiddleware,
  honoRequireRole(["ADMIN", "INSTRUCTOR"]),
  async (c) => {
    try {
      const credentialId = c.req.param("credentialId");
      const body = await c.req.json().catch(() => ({}));
      const { reason } = body;

      const certificate = await prisma.certificate.findUnique({
        where: { credentialId },
      });

      if (!certificate) {
        return c.json({ error: "Certificate not found" }, 404);
      }

      const updated = await prisma.certificate.update({
        where: { credentialId },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          revocationReason: reason || "Administrative revocation",
        },
      });

      return c.json({
        message: "Credential successfully revoked",
        credentialId: updated.credentialId,
        status: updated.status,
        revokedAt: updated.revokedAt,
        reason: updated.revocationReason,
      });
    } catch (err: any) {
      return c.json({ error: "Failed to revoke certificate", details: err?.message }, 500);
    }
  }
);
