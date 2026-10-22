import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../shared/prisma.js";
import { AuthenticatedRequest, verifyEnrollmentOwnership } from "../../shared/middleware/auth.js";
import { BayesianKnowledgeTracer } from "../mastery/bkt.js";
import { AIProvider } from "../ai/ai.provider.js";
import { SandboxService } from "../sandbox/sandbox.service.js";

const ChapterSubmitSchema = z.object({
  enrollmentId: z.string().min(1),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        studentAnswer: z.string(),
      })
    )
    .min(1),
});

const DiagnosticSubmitSchema = z.object({
  enrollmentId: z.string().min(1),
  answers: z
    .array(
      z.object({
        conceptSlug: z.string().min(1),
        selectedOption: z.string().min(1),
        isCorrect: z.boolean().optional(),
        studentAnswer: z.string().optional(),
      })
    )
    .min(1),
});

const RemediationSubmitSchema = z.object({
  enrollmentId: z.string().min(1),
  conceptId: z.string().min(1),
  studentAnswer: z.string().min(1),
});

const PracticalSubmitSchema = z.object({
  enrollmentId: z.string().min(1),
  code: z.string().min(1).max(32000),
  taskId: z.string().optional().default("practical-summarize-scores"),
});

const VivaTurnSchema = z.object({
  enrollmentId: z.string().min(1),
  questionId: z.string().optional(),
  studentAnswer: z.string().min(1),
  turnNumber: z.number().int().min(1).max(5),
});

export class AssessmentController {
  public static async getDiagnosticQuestions(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          versions: {
            where: { isActive: true },
            include: {
              modules: {
                orderBy: { sequenceOrder: "asc" },
                include: {
                  chapters: {
                    orderBy: { sequenceOrder: "asc" },
                    include: { concepts: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!course || !course.versions[0]) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      const diagnosticItems = [
        {
          id: "diag-py-01",
          conceptSlug: "variables-and-memory",
          conceptTitle: "Object References & Mutability",
          prompt: "In Python, if `a = [1, 2]` and `b = a`, what happens when `b.append(3)` is executed?",
          options: [
            {
              key: "A",
              text: "Both `a` and `b` evaluate to `[1, 2, 3]` because both names reference the same mutable list object on the heap.",
              isCorrect: true,
            },
            {
              key: "B",
              text: "`a` remains `[1, 2]` because assignment creates a deep copy.",
              isCorrect: false,
            },
            {
              key: "C",
              text: "Python raises a TypeError because lists are immutable.",
              isCorrect: false,
            },
            {
              key: "D",
              text: "I haven't worked with Python object references yet (honest calibration).",
              isCorrect: false,
              isHonestCalibration: true,
            },
          ],
        },
        {
          id: "diag-py-02",
          conceptSlug: "mutability-and-collections",
          conceptTitle: "Collections & In-Place Mutation",
          prompt: "What is the key difference between modifying a list and modifying a tuple?",
          options: [
            {
              key: "A",
              text: "Lists can be modified in-place on the heap; tuples are immutable and reassigning creates a new object.",
              isCorrect: true,
            },
            {
              key: "B",
              text: "Tuples are mutable while lists are immutable.",
              isCorrect: false,
            },
            {
              key: "C",
              text: "Both lists and tuples allocate fresh memory on every element access.",
              isCorrect: false,
            },
            {
              key: "D",
              text: "I haven't learned collection mutability yet (honest calibration).",
              isCorrect: false,
              isHonestCalibration: true,
            },
          ],
        },
      ];

      res.json({
        courseSlug: course.slug,
        courseTitle: course.title,
        questions: diagnosticItems,
      });
    } catch (err) {
      console.error("Diagnostic error:", err);
      res.status(500).json({ error: "Failed to fetch diagnostic questions" });
    }
  }

  public static async submitDiagnostic(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = DiagnosticSubmitSchema.parse(req.body);
      const ownership = await verifyEnrollmentOwnership(parsed.enrollmentId, req.user!.id);

      if (ownership.status === "not_found") {
        res.status(404).json({ error: "Enrollment not found" });
        return;
      }
      if (ownership.status === "forbidden") {
        res.status(403).json({ error: "Forbidden: You do not own this enrollment" });
        return;
      }

      let correctCount = 0;
      const calibratedConcepts: Array<{ conceptSlug: string; calibratedPrior: number }> = [];

      const masteries = await prisma.conceptMastery.findMany({
        where: { enrollmentId: parsed.enrollmentId },
        include: { concept: true },
      });

      await prisma.$transaction(async (tx: any) => {
        for (const ans of parsed.answers) {
          const isCorrect = ans.isCorrect ?? ans.selectedOption === "A";
          if (isCorrect) correctCount++;

          const matchingMastery = masteries.find(
            (m: any) => m.concept.slug === ans.conceptSlug
          );
          if (matchingMastery) {
            // Non-punitive calibration: correct diagnostic answer sets prior to 0.40 (requires formal assessment to reach >=0.70);
            // honest skip or incorrect keeps baseline prior at 0.15 without penalty.
            const calibratedPrior = isCorrect ? 0.40 : 0.15;
            await tx.conceptMastery.update({
              where: { id: matchingMastery.id },
              data: {
                pMastery: Math.max(matchingMastery.pMastery, calibratedPrior),
                state: isCorrect ? "LEARNING" : matchingMastery.state,
                lastAssessedAt: new Date(),
              },
            });
            calibratedConcepts.push({
              conceptSlug: ans.conceptSlug,
              calibratedPrior,
            });
          }
        }

        const score = Number((correctCount / parsed.answers.length).toFixed(4));
        await tx.assessmentAttempt.create({
          data: {
            enrollmentId: parsed.enrollmentId,
            assessmentType: "DIAGNOSTIC",
            targetId: "baseline-diagnostic",
            status: "EVALUATED",
            score,
            completedAt: new Date(),
          },
        });
      });

      const score = Number((correctCount / parsed.answers.length).toFixed(4));
      res.status(200).json({
        message: "Baseline diagnostic completed and priors calibrated",
        score,
        correctCount,
        totalQuestions: parsed.answers.length,
        calibratedConcepts,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Failed to submit baseline diagnostic" });
    }
  }

  public static async getChapterQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { chapterId } = req.params;
      const questions = await prisma.question.findMany({
        where: { chapterId },
        select: {
          id: true,
          questionType: true,
          prompt: true,
          tier: true,
        },
      });

      res.json({ questions });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch chapter questions" });
    }
  }

  public static async submitChapterAssessment(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { chapterId } = req.params;
      const parsed = ChapterSubmitSchema.parse(req.body);
      const { enrollmentId, answers } = parsed;

      // P0 IDOR / BOLA Ownership Check
      const ownership = await verifyEnrollmentOwnership(enrollmentId, req.user!.id);
      if (ownership.status === "not_found") {
        res.status(404).json({ error: "Enrollment not found" });
        return;
      }
      if (ownership.status === "forbidden") {
        res.status(403).json({ error: "Forbidden: You do not own this enrollment" });
        return;
      }

      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          questions: true,
          concepts: {
            orderBy: { sequenceOrder: "asc" },
            include: {
              rubrics: {
                include: { criteria: true },
              },
            },
          },
        },
      });

      if (!chapter) {
        res.status(404).json({ error: "Chapter not found" });
        return;
      }

      // Map each concept in the chapter to the corresponding submitted answer
      const conceptEvaluations: Array<{
        concept: any;
        evalResult: Awaited<ReturnType<typeof AIProvider.evaluateRubricCriteria>>;
        conceptDemonstrated: boolean;
        primaryAnswerIndex: number;
      }> = [];

      for (let cIdx = 0; cIdx < chapter.concepts.length; cIdx++) {
        const concept = chapter.concepts[cIdx];
        const allCriteria = concept.rubrics.flatMap((r: any) =>
          r.criteria.map((cr: any) => ({
            id: cr.id,
            criterionStatement: cr.criterionStatement,
            weight: cr.weight,
            tierRequired: cr.tierRequired,
          }))
        );

        const primaryAnswerIndex = Math.min(cIdx, answers.length - 1);
        const answerForConcept =
          answers.length === 1
            ? answers[0].studentAnswer
            : answers[primaryAnswerIndex].studentAnswer;

        const evalResult = await AIProvider.evaluateRubricCriteria({
          questionPrompt: chapter.questions[primaryAnswerIndex]?.prompt || chapter.title,
          studentAnswer: answerForConcept,
          conceptSlug: concept.slug,
          conceptName: concept.name,
          criteria: allCriteria,
        });

        const demonstratedCount = evalResult.evaluations.filter((e) => e.isDemonstrated).length;
        const conceptDemonstrated =
          evalResult.evaluations.length > 0 &&
          demonstratedCount / evalResult.evaluations.length >= 0.5;

        conceptEvaluations.push({
          concept,
          evalResult,
          conceptDemonstrated,
          primaryAnswerIndex,
        });
      }

      let totalCriteriaChecked = 0;
      let totalCriteriaDemonstrated = 0;

      const attemptResult = await prisma.$transaction(async (tx: any) => {
        const attempt = await tx.assessmentAttempt.create({
          data: {
            enrollmentId,
            assessmentType: "CHAPTER",
            targetId: chapterId,
            status: "IN_PROGRESS",
          },
        });

        const savedAnswers: any[] = [];
        for (const item of answers) {
          const saved = await tx.assessmentAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: item.questionId,
              studentAnswer: item.studentAnswer,
            },
          });
          savedAnswers.push(saved);
        }

        for (const ce of conceptEvaluations) {
          const targetSavedAnswer = savedAnswers[ce.primaryAnswerIndex] || savedAnswers[0];

          for (const critEval of ce.evalResult.evaluations) {
            totalCriteriaChecked++;
            if (critEval.isDemonstrated) totalCriteriaDemonstrated++;

            await tx.rubricEvaluation.create({
              data: {
                answerId: targetSavedAnswer.id,
                rubricCriterionId: critEval.criterionId,
                isDemonstrated: critEval.isDemonstrated,
                evidenceQuote: critEval.evidenceQuote,
                reasoning: critEval.reasoning,
              },
            });
          }

          // Single BKT update per concept per assessment attempt
          const existingMastery = await tx.conceptMastery.findUnique({
            where: {
              enrollmentId_conceptId: {
                enrollmentId,
                conceptId: ce.concept.id,
              },
            },
          });

          if (existingMastery) {
            const updatedP = BayesianKnowledgeTracer.update(
              existingMastery.pMastery,
              ce.conceptDemonstrated
            );
            const nextState =
              updatedP >= 0.70
                ? "MASTERED"
                : !ce.conceptDemonstrated || updatedP < 0.70
                ? "NEEDS_REMEDIATION"
                : "LEARNING";

            await tx.conceptMastery.update({
              where: { id: existingMastery.id },
              data: {
                pMastery: updatedP,
                state: nextState,
                remediationCycles:
                  nextState === "NEEDS_REMEDIATION"
                    ? existingMastery.remediationCycles + 1
                    : existingMastery.remediationCycles,
                lastAssessedAt: new Date(),
              },
            });

            for (const critEval of ce.evalResult.evaluations) {
              await tx.masteryEvidence.create({
                data: {
                  conceptMasteryId: existingMastery.id,
                  rubricCriterionId: critEval.criterionId,
                  evidenceType: "CHAPTER_ASSESSMENT",
                  isDemonstrated: critEval.isDemonstrated,
                  evidenceQuote: critEval.evidenceQuote,
                  evaluatorReasoning: critEval.reasoning,
                },
              });
            }
          }
        }

        const score =
          totalCriteriaChecked > 0
            ? Number((totalCriteriaDemonstrated / totalCriteriaChecked).toFixed(4))
            : 0;

        await tx.assessmentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "EVALUATED",
            score,
            completedAt: new Date(),
          },
        });

        return { attemptId: attempt.id, score };
      });

      const updatedMasteries = await prisma.conceptMastery.findMany({
        where: { enrollmentId },
        include: { concept: true },
      });

      const needsRemediationConcepts = updatedMasteries
        .filter((m: any) => m.state === "NEEDS_REMEDIATION")
        .map((m: any) => ({
          conceptId: m.conceptId,
          conceptSlug: m.concept.slug,
          conceptName: m.concept.name,
          pMastery: m.pMastery,
        }));

      res.json({
        attemptId: attemptResult.attemptId,
        score: attemptResult.score,
        totalCriteriaChecked,
        totalCriteriaDemonstrated,
        isPassed: attemptResult.score >= 0.70 && needsRemediationConcepts.length === 0,
        needsRemediation: needsRemediationConcepts.length > 0,
        needsRemediationConcepts,
        updatedMasteries,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Failed to evaluate chapter assessment" });
    }
  }

  /**
   * Evaluates remediation recovery check.
   * FIX: Single-Observation Update. Removes the artificial double-update hack!
   */
  public static async submitRemediationCheck(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const parsed = RemediationSubmitSchema.parse(req.body);
      const ownership = await verifyEnrollmentOwnership(parsed.enrollmentId, req.user!.id);

      if (ownership.status === "not_found") {
        res.status(404).json({ error: "Enrollment not found" });
        return;
      }
      if (ownership.status === "forbidden") {
        res.status(403).json({ error: "Forbidden: You do not own this enrollment" });
        return;
      }

      const concept = await prisma.concept.findUnique({
        where: { id: parsed.conceptId },
        include: { rubrics: { include: { criteria: true } } },
      });

      if (!concept) {
        res.status(404).json({ error: "Concept not found" });
        return;
      }

      const criteria = concept.rubrics.flatMap((r: any) =>
        r.criteria.map((c: any) => ({
          id: c.id,
          criterionStatement: c.criterionStatement,
          weight: c.weight,
          tierRequired: c.tierRequired,
        }))
      );

      const evalResult = await AIProvider.evaluateRubricCriteria({
        questionPrompt: `Remediation recovery check for ${concept.name}`,
        studentAnswer: parsed.studentAnswer,
        conceptSlug: concept.slug,
        conceptName: concept.name,
        criteria,
      });

      const demonstratedCount = evalResult.evaluations.filter((e) => e.isDemonstrated).length;
      const isResolved =
        evalResult.evaluations.length > 0 &&
        demonstratedCount / evalResult.evaluations.length >= 0.5;

      const existingMastery = await prisma.conceptMastery.findUnique({
        where: {
          enrollmentId_conceptId: {
            enrollmentId: parsed.enrollmentId,
            conceptId: concept.id,
          },
        },
      });

      if (!existingMastery) {
        res.status(404).json({ error: "Concept mastery record not found" });
        return;
      }

      // Mathematical Integrity Fix: Exactly ONE Bayesian update for this single observation
      let updatedP = existingMastery.pMastery;
      if (isResolved) {
        updatedP = BayesianKnowledgeTracer.update(existingMastery.pMastery, true);
      } else {
        updatedP = BayesianKnowledgeTracer.update(existingMastery.pMastery, false);
      }

      const newState = isResolved
        ? updatedP >= 0.70
          ? "MASTERED"
          : "LEARNING"
        : "NEEDS_REMEDIATION";

      await prisma.$transaction(async (tx: any) => {
        await tx.conceptMastery.update({
          where: { id: existingMastery.id },
          data: {
            pMastery: updatedP,
            state: newState,
            lastAssessedAt: new Date(),
          },
        });

        await tx.masteryEvidence.create({
          data: {
            conceptMasteryId: existingMastery.id,
            rubricCriterionId: criteria[0]?.id || null,
            evidenceType: "REMEDIATION_CHECK",
            isDemonstrated: isResolved,
            evidenceQuote: parsed.studentAnswer.substring(0, 150),
            evaluatorReasoning:
              evalResult.evaluations[0]?.reasoning ||
              (isResolved ? "Remediation recovery check demonstrated." : "Remediation check incomplete."),
          },
        });
      });

      res.json({
        conceptId: concept.id,
        conceptName: concept.name,
        isResolved,
        pMastery: updatedP,
        state: newState,
        evaluations: evalResult.evaluations,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Failed to evaluate remediation check" });
    }
  }

  public static async submitPracticalAssessment(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const parsed = PracticalSubmitSchema.parse(req.body);
      const ownership = await verifyEnrollmentOwnership(parsed.enrollmentId, req.user!.id);

      if (ownership.status === "not_found") {
        res.status(404).json({ error: "Enrollment not found" });
        return;
      }
      if (ownership.status === "forbidden") {
        res.status(403).json({ error: "Forbidden: You do not own this enrollment" });
        return;
      }

      const verification = await SandboxService.evaluatePracticalSubmission(parsed.code, parsed.taskId);

      const attempt = await prisma.assessmentAttempt.create({
        data: {
          enrollmentId: parsed.enrollmentId,
          assessmentType: "PRACTICAL",
          targetId: parsed.taskId,
          status: "EVALUATED",
          score: verification.score,
          completedAt: new Date(),
        },
      });

      res.status(200).json({
        attemptId: attempt.id,
        status: verification.status,
        score: verification.score,
        isPassed: verification.passed,
        testsRun: verification.testsRun,
        testsPassed: verification.testsPassed,
        testResults: verification.testResults,
        output: verification.output,
        durationMs: verification.durationMs,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Failed to evaluate practical code submission" });
    }
  }

  public static async conductVivaTurn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = VivaTurnSchema.parse(req.body);
      const { enrollmentId, questionId, studentAnswer, turnNumber } = parsed;

      const ownership = await verifyEnrollmentOwnership(enrollmentId, req.user!.id);
      if (ownership.status === "not_found") {
        res.status(404).json({ error: "Enrollment not found" });
        return;
      }
      if (ownership.status === "forbidden") {
        res.status(403).json({ error: "Forbidden: You do not own this enrollment" });
        return;
      }

      const evalTurn = await AIProvider.evaluateVivaTurn({
        turnNumber,
        studentAnswer,
      });

      let vivaAttempt = await prisma.assessmentAttempt.findFirst({
        where: {
          enrollmentId,
          assessmentType: "VIVA",
          status: "IN_PROGRESS",
        },
        include: { answers: true },
      });

      if (!vivaAttempt) {
        vivaAttempt = await prisma.assessmentAttempt.create({
          data: {
            enrollmentId,
            assessmentType: "VIVA",
            targetId: "final-viva-defense",
            status: "IN_PROGRESS",
          },
          include: { answers: true },
        });
      }

      let resolvedQuestionId = questionId;
      if (resolvedQuestionId) {
        const qExists = await prisma.question.findUnique({ where: { id: resolvedQuestionId } });
        if (!qExists) resolvedQuestionId = undefined;
      }
      if (!resolvedQuestionId) {
        const vivaQuestion =
          (await prisma.question.findFirst({ where: { questionType: "VIVA" } })) ||
          (await prisma.question.findFirst());
        resolvedQuestionId = vivaQuestion?.id;
      }

      if (resolvedQuestionId) {
        await prisma.assessmentAnswer.create({
          data: {
            attemptId: vivaAttempt.id,
            questionId: resolvedQuestionId,
            studentAnswer,
            score: evalTurn.turnScore,
          },
        });
      }

      const allAnswers = await prisma.assessmentAnswer.findMany({
        where: { attemptId: vivaAttempt.id },
      });

      const isDefenseSatisfied = turnNumber >= 3 && allAnswers.length >= 3;

      const meanScore =
        allAnswers.length > 0
          ? Number(
              (
                allAnswers.reduce((acc: number, a: any) => acc + (a.score ?? evalTurn.turnScore), 0) /
                allAnswers.length
              ).toFixed(4)
            )
          : evalTurn.turnScore;

      if (isDefenseSatisfied) {
        await prisma.assessmentAttempt.update({
          where: { id: vivaAttempt.id },
          data: {
            status: "EVALUATED",
            score: meanScore,
            completedAt: new Date(),
          },
        });
      }

      res.json({
        attemptId: vivaAttempt.id,
        turnNumber,
        turnsRecorded: allAnswers.length,
        isDefenseSatisfied,
        vivaScore: isDefenseSatisfied ? meanScore : evalTurn.turnScore,
        evaluatorFeedback: evalTurn.feedback,
        followUpProbe: isDefenseSatisfied ? null : evalTurn.followUpQuestion,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Failed to process viva defense turn" });
    }
  }
}
