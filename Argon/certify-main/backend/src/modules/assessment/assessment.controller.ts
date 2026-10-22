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
  taskId: z.string().optional().default("python-lru-capstone"),
});

const VivaTurnSchema = z.object({
  enrollmentId: z.string().min(1),
  questionId: z.string().optional(),
  studentAnswer: z.string().min(1),
  turnNumber: z.number().int().min(1).max(5),
});

export class AssessmentController {
  /**
   * Returns baseline diagnostic questions grounded in the selected course's concepts.
   */
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
          conceptSlug: "variable-binding",
          conceptTitle: "Object References & Mutability",
          prompt:
            "In Python, if `a = [1, 2]` and `b = a`, what happens when `b.append(3)` is executed?",
          options: [
            {
              key: "A",
              text: "Both `a` and `b` evaluate to `[1, 2, 3]` because both names reference the same mutable list object in heap memory.",
              isCorrect: true,
            },
            {
              key: "B",
              text: "`a` remains `[1, 2]` because assignment copies the list into a new memory slot.",
              isCorrect: false,
            },
            {
              key: "C",
              text: "Python raises a TypeError because lists are immutable.",
              isCorrect: false,
            },
            {
              key: "D",
              text: "I haven't worked with Python object references yet (calibrate starting baseline).",
              isCorrect: false,
              isHonestCalibration: true,
            },
          ],
        },
        {
          id: "diag-py-02",
          conceptSlug: "hash-table-mechanics",
          conceptTitle: "Hash Tables & Membership Complexity",
          prompt:
            "Why does checking `x in my_set` run in O(1) average time compared to O(n) for `x in my_list`?",
          options: [
            {
              key: "A",
              text: "Sets compute a hash of `x` to jump directly to a hash-table bucket instead of scanning elements sequentially.",
              isCorrect: true,
            },
            {
              key: "B",
              text: "Sets automatically sort elements and run binary search.",
              isCorrect: false,
            },
            {
              key: "C",
              text: "Lists compress elements on disk while sets stay in CPU registers.",
              isCorrect: false,
            },
            {
              key: "D",
              text: "I haven't studied hash table complexity yet (calibrate starting baseline).",
              isCorrect: false,
              isHonestCalibration: true,
            },
          ],
        },
        {
          id: "diag-py-03",
          conceptSlug: "lazy-evaluation",
          conceptTitle: "Generators & Lazy Evaluation",
          prompt:
            "What is the primary memory difference between a generator function using `yield` and a function returning a list?",
          options: [
            {
              key: "A",
              text: "A generator suspends its execution frame and produces values lazily one at a time in O(1) auxiliary memory.",
              isCorrect: true,
            },
            {
              key: "B",
              text: "A generator pre-allocates twice as much RAM to cache future iterations.",
              isCorrect: false,
            },
            {
              key: "C",
              text: "`yield` and `return` have identical memory footprints.",
              isCorrect: false,
            },
            {
              key: "D",
              text: "I haven't worked with Python generators yet (calibrate starting baseline).",
              isCorrect: false,
              isHonestCalibration: true,
            },
          ],
        },
        {
          id: "diag-py-04",
          conceptSlug: "context-management-protocol",
          conceptTitle: "Context Managers (`with` statement)",
          prompt:
            "What guarantee does Python's `with` statement provide via `__enter__` and `__exit__`?",
          options: [
            {
              key: "A",
              text: "Deterministic resource cleanup (`__exit__` is invoked even if an uncaught exception is raised inside the block).",
              isCorrect: true,
            },
            {
              key: "B",
              text: "Automatic parallelization of I/O operations across CPU cores.",
              isCorrect: false,
            },
            {
              key: "C",
              text: "Suppression of all syntax errors inside the file.",
              isCorrect: false,
            },
            {
              key: "D",
              text: "I haven't used context managers yet (calibrate starting baseline).",
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
      console.error("Error fetching diagnostic questions:", err);
      res.status(500).json({ error: "Failed to fetch diagnostic questions" });
    }
  }

  /**
   * Grades the non-punitive baseline diagnostic and calibrates initial BKT priors
   * without directly awarding mastery or certification credit.
   */
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
            // Non-punitive calibration: correct diagnostic answer sets prior to 0.40 (still requires formal assessment to reach >=0.70 mastery);
            // unfamiliar/incorrect keeps prior at 0.15 without penalty.
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
      console.error("Diagnostic submit error:", err);
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
      console.error("Error fetching questions:", err);
      res.status(500).json({ error: "Failed to fetch chapter questions" });
    }
  }

  /**
   * Evaluates formal chapter assessment submissions against the chapter's atomic rubric criteria.
   * Enforces strict enrollment ownership (IDOR fix), negation-aware evaluation,
   * one-to-one concept evaluation (fixing the nested-loop multiplication bug), and transactional writes.
   */
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

      // Combine answers and map each concept in the chapter to the most relevant answer(s)
      // so each concept and criterion is evaluated exactly once per attempt.
      const combinedAnswerText = answers
        .map((a) => a.studentAnswer.trim())
        .filter(Boolean)
        .join("\n\n");

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
          questionPrompt:
            chapter.questions[primaryAnswerIndex]?.prompt || chapter.title,
          studentAnswer: answerForConcept,
          conceptSlug: concept.slug,
          conceptName: concept.name,
          criteria: allCriteria,
        });

        const demonstratedCount = evalResult.evaluations.filter(
          (e) => e.isDemonstrated
        ).length;
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
          const targetSavedAnswer =
            savedAnswers[ce.primaryAnswerIndex] || savedAnswers[0];

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

          // Update BKT exactly ONCE per concept per assessment attempt
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
              updatedP >= 0.75
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
      console.error("Error in submitChapterAssessment:", err);
      res.status(500).json({ error: "Failed to evaluate chapter assessment" });
    }
  }

  /**
   * Evaluates a learner's remediation recovery check for a specific concept.
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

      let updatedP = existingMastery.pMastery;
      if (isResolved) {
        updatedP = BayesianKnowledgeTracer.update(existingMastery.pMastery, true);
        // Ensure a successful remediation recovery brings a low prior into at least LEARNING/MASTERED
        if (updatedP < 0.75) {
          updatedP = BayesianKnowledgeTracer.update(updatedP, true);
        }
      }

      const newState = isResolved
        ? updatedP >= 0.75
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
              (isResolved ? "Remediation recovery check passed." : "Remediation check incomplete."),
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
      console.error("Remediation submit error:", err);
      res.status(500).json({ error: "Failed to evaluate remediation check" });
    }
  }

  /**
   * Executes a learner's practical Python submission in the isolated sandbox against
   * deterministic unit tests and persists an AssessmentAttempt (PRACTICAL).
   */
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

      const verification = await SandboxService.evaluatePracticalSubmission(parsed.code);

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
        isPassed: verification.score >= 0.70,
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
      console.error("Practical submission error:", err);
      res.status(500).json({ error: "Failed to evaluate practical code submission" });
    }
  }

  /**
   * Multi-turn persisted AI Viva / Defense state machine.
   * Enforces ownership (IDOR fix), evaluates each turn with negation-aware rubric logic,
   * persists AssessmentAttempt (VIVA) and AssessmentAnswer records, and requires 3 turns
   * before completing the viva defense.
   */
  public static async conductVivaTurn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = VivaTurnSchema.parse(req.body);
      const { enrollmentId, questionId, studentAnswer, turnNumber } = parsed;

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

      const evalTurn = await AIProvider.evaluateVivaTurn({
        turnNumber,
        studentAnswer,
      });

      // Find or create an active VIVA attempt for this enrollment
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

      // Resolve a valid questionId for FK integrity
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

      const completedTurnsCount = Math.max(allAnswers.length, turnNumber >= 3 ? allAnswers.length : 0);
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
        evaluatorFeedback: evalTurn.evaluatorFeedback,
        followUpProbe: isDefenseSatisfied ? null : evalTurn.followUpProbe,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.errors });
        return;
      }
      console.error("Viva turn error:", err);
      res.status(500).json({ error: "Failed to process viva defense turn" });
    }
  }
}
