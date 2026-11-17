import { Hono } from "hono";
import { prisma } from "../../shared/prisma.js";
import { honoAuthMiddleware, verifyEnrollmentOwnership } from "../../shared/middleware/honoAuth.js";
import { honoRateLimiter } from "../../shared/middleware/honoRateLimit.js";
import { AiProviderService } from "../ai/ai.provider.js";
import { RubricEvaluatorService } from "../ai/rubric.evaluator.js";
import { SandboxService } from "../sandbox/sandbox.service.js";
import {
  ProgressionService,
  ProgressionLockedError,
} from "../progression/progression.service.js";
import { AnalyticsService } from "../analytics/analytics.service.js";

export const assessmentHonoRouter = new Hono();

// Rate limiting for assessment submissions (15 req/min)
assessmentHonoRouter.use(
  "/*",
  honoRateLimiter({ maxRequests: 15, windowSeconds: 60, keyPrefix: "assess" })
);

// ─── GET /api/v1/assessments/chapters/:chapterId ─────────────────────────────
// Returns checkpoint questions for a chapter (strictly lock-checked when enrolled).
// Auto-provisions rubric-aligned conceptual questions if a chapter has 0 bank entries.
assessmentHonoRouter.get("/chapters/:chapterId", honoAuthMiddleware, async (c) => {
  try {
    const chapterId = c.req.param("chapterId") || "";
    const user = c.get("user");
    const queryEnrollmentId = c.req.query("enrollmentId");

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        module: { select: { id: true, title: true, courseVersionId: true } },
        concepts: {
          orderBy: { sequenceOrder: "asc" },
          include: { rubrics: { include: { criteria: true } } },
        },
      },
    });

    if (!chapter) {
      return c.json({ error: "Chapter not found" }, 404);
    }

    // Lock check for learner's enrollment
    let enrollmentId = queryEnrollmentId;
    if (!enrollmentId) {
      const enr = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId: user.id,
            courseVersionId: chapter.module.courseVersionId,
          },
        },
        select: { id: true },
      });
      enrollmentId = enr?.id;
    }

    if (enrollmentId) {
      const ownership = await verifyEnrollmentOwnership(enrollmentId, user.id);
      if (ownership.status === "forbidden") {
        return c.json({ error: "Forbidden: You do not own this enrollment" }, 403);
      }
      try {
        await ProgressionService.assertChapterUnlocked(enrollmentId, chapterId);
      } catch (lockErr: any) {
        if (lockErr instanceof ProgressionLockedError) {
          return c.json(lockErr.toJSON(), 403);
        }
        throw lockErr;
      }
    }

    let questions = await prisma.question.findMany({
      where: { chapterId },
      select: {
        id: true,
        chapterId: true,
        conceptId: true,
        questionType: true,
        prompt: true,
        tier: true,
        parameters: true,
        options: true,
      },
    });

    // Guarantee every single chapter (all 29) has rubric-aligned conceptual checkpoint questions
    if (questions.length === 0 && chapter.concepts.length > 0) {
      const created: typeof questions = [];
      for (const concept of chapter.concepts) {
        const criteria = concept.rubrics.flatMap((r) => r.criteria);
        const prompt =
          criteria.length > 0
            ? `In your own words (with a short Python example if helpful), explain **${concept.name}**. Make sure your explanation clearly addresses:\n` +
              criteria.map((cr, idx) => `${idx + 1}. ${cr.criterionStatement}`).join("\n")
            : `Explain the core mechanics, edge cases, and practical usage of **${concept.name}** in Python.`;

        const q = await prisma.question.create({
          data: {
            chapterId: chapter.id,
            conceptId: concept.id,
            questionType: "EXPLAIN",
            prompt,
            tier: criteria[0]?.tierRequired || "EASY",
          },
          select: {
            id: true,
            chapterId: true,
            conceptId: true,
            questionType: true,
            prompt: true,
            tier: true,
            parameters: true,
            options: true,
          },
        });
        created.push(q);
      }
      questions = created;
    }

    return c.json({
      chapter: {
        id: chapter.id,
        title: chapter.title,
        moduleTitle: chapter.module.title,
      },
      questions,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch questions", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/assessments/chapters/:chapterId/submit ─────────────────────
// Hybrid Rubric Grading + Per-Criterion Mastery + Positive/Negative BKT + Unlock Gate
assessmentHonoRouter.post("/chapters/:chapterId/submit", honoAuthMiddleware, async (c) => {
  try {
    const chapterId = c.req.param("chapterId") || "";
    const body = await c.req.json().catch(() => ({}));
    const { enrollmentId, answers } = body;
    const user = c.get("user");

    if (!enrollmentId || !Array.isArray(answers) || answers.length === 0) {
      return c.json({ error: "enrollmentId and non-empty answers array are required" }, 400);
    }

    // IDOR Check
    const ownership = await verifyEnrollmentOwnership(enrollmentId, user.id);
    if (ownership.status === "forbidden") {
      return c.json({ error: "Forbidden: You do not own this enrollment record" }, 403);
    }
    if (ownership.status === "not_found") {
      return c.json({ error: "Enrollment not found" }, 404);
    }

    // HARD BACKEND PROGRESSION GATE
    try {
      await ProgressionService.assertChapterUnlocked(enrollmentId, chapterId);
    } catch (lockErr: any) {
      if (lockErr instanceof ProgressionLockedError) {
        return c.json(lockErr.toJSON(), 403);
      }
      throw lockErr;
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        sections: { orderBy: { sequenceOrder: "asc" } },
        concepts: {
          orderBy: { sequenceOrder: "asc" },
          include: { rubrics: { include: { criteria: true } } },
        },
      },
    });

    if (!chapter) {
      return c.json({ error: "Chapter not found" }, 404);
    }

    const conceptById = new Map(chapter.concepts.map((cn) => [cn.id, cn]));
    const checkpointSection = chapter.sections.find((s) => s.sectionType === "CHAPTER_CHECKPOINT");

    let scoreSum = 0;
    let evaluatedCount = 0;
    let anyCriticalMisconception = false;

    const evaluatedAnswers: Array<{
      questionId: string;
      conceptId: string | null;
      studentAnswer: string;
      score: number;
      overallSummary: string;
      hasCriticalMisconception: boolean;
      criteriaResults: Array<{
        criterionId: string;
        verdict: string;
        score: number;
        confidence: number;
        evidenceQuote: string;
        misconceptionTag: string | null;
        reasoning: string;
      }>;
    }> = [];

    // Track per-concept evaluations so each concept receives ONE clean BKT update (no double-update!)
    const conceptAggregates = new Map<
      string,
      {
        concept: (typeof chapter.concepts)[0];
        criteria: Array<(typeof chapter.concepts)[0]["rubrics"][0]["criteria"][0]>;
        bestEval: Awaited<ReturnType<typeof RubricEvaluatorService.evaluateResponse>>;
      }
    >();

    for (const ans of answers) {
      const question = await prisma.question.findUnique({
        where: { id: ans.questionId },
      });
      if (!question) continue;

      const targetConcept =
        (question.conceptId ? conceptById.get(question.conceptId) : undefined) ||
        chapter.concepts[0];
      if (!targetConcept) continue;

      const criteria = targetConcept.rubrics.flatMap((r) => r.criteria);
      const studentText = (ans.studentAnswer || "").trim();

      const evalRes = await RubricEvaluatorService.evaluateResponse({
        conceptName: targetConcept.name,
        questionPrompt: question.prompt,
        learnerText: studentText,
        criteria,
        mode: "CHECKPOINT",
      });

      scoreSum += evalRes.weightedScore;
      evaluatedCount++;
      if (evalRes.hasCriticalMisconception) {
        anyCriticalMisconception = true;
      }

      evaluatedAnswers.push({
        questionId: question.id,
        conceptId: targetConcept.id,
        studentAnswer: studentText,
        score: evalRes.weightedScore,
        overallSummary: evalRes.overallSummary,
        hasCriticalMisconception: evalRes.hasCriticalMisconception,
        criteriaResults: evalRes.criteriaResults,
      });

      const prevAgg = conceptAggregates.get(targetConcept.id);
      if (!prevAgg || evalRes.weightedScore > prevAgg.bestEval.weightedScore) {
        conceptAggregates.set(targetConcept.id, {
          concept: targetConcept,
          criteria,
          bestEval: evalRes,
        });
      }
    }

    const meanScore =
      evaluatedCount > 0 ? Number((scoreSum / evaluatedCount).toFixed(4)) : 0;
    const isPassed = meanScore >= 0.70 && !anyCriticalMisconception;

    // 1. Persist AssessmentAttempt, AssessmentAnswer, and RubricEvaluation rows atomically
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.assessmentAttempt.create({
        data: {
          enrollmentId,
          assessmentType: "CHAPTER",
          targetId: chapterId,
          status: "EVALUATED",
          score: meanScore,
          completedAt: new Date(),
        },
      });

      for (const ea of evaluatedAnswers) {
        const savedAnswer = await tx.assessmentAnswer.create({
          data: {
            attemptId: newAttempt.id,
            questionId: ea.questionId,
            studentAnswer: ea.studentAnswer,
            score: ea.score,
          },
        });

        for (const cr of ea.criteriaResults) {
          if (cr.criterionId) {
            await tx.rubricEvaluation.create({
              data: {
                answerId: savedAnswer.id,
                rubricCriterionId: cr.criterionId,
                isDemonstrated: cr.verdict === "DEMONSTRATED",
                confidence: cr.confidence,
                evidenceQuote: cr.evidenceQuote,
                reasoning: cr.reasoning,
              },
            });
          }
        }
      }

      return newAttempt;
    });

    // 2. Single Atomic BKT + RubricCriterionMastery Update per Evaluated Concept
    const conceptUpdates: Array<{
      conceptId: string;
      conceptName: string;
      pMastery: number;
      state: string;
    }> = [];

    for (const [conceptId, agg] of conceptAggregates.entries()) {
      const persisted = await RubricEvaluatorService.persistEvaluationResults({
        enrollmentId,
        conceptId,
        sectionId: checkpointSection?.id || null,
        evidenceType: "CHAPTER_ASSESSMENT",
        evaluation: agg.bestEval,
        criteria: agg.criteria,
        capDialogueMastery: false,
      });

      conceptUpdates.push({
        conceptId,
        conceptName: agg.concept.name,
        pMastery: persisted.conceptPMastery,
        state: persisted.conceptState,
      });
    }

    // 3. Deterministic Progression Unlock Gate (Unlock S5 Practical OR Complete Chapter & Unlock C+1)
    const progressionOutcome = await ProgressionService.evaluateChapterCheckpointOutcome({
      enrollmentId,
      chapterId,
      score: meanScore,
      hasCriticalMisconception: anyCriticalMisconception,
    });

    // 4. Recompute Deterministic Learner Skill Profile (Strengths & Weakpoints)
    await AnalyticsService.recomputeSkillProfile(enrollmentId).catch((e) =>
      console.warn("[Analytics] Skill recompute warning:", e?.message || e)
    );

    const totalCriteriaChecked = evaluatedAnswers.reduce(
      (acc, a) => acc + a.criteriaResults.length,
      0
    );
    const totalCriteriaDemonstrated = evaluatedAnswers.reduce(
      (acc, a) => acc + a.criteriaResults.filter((e) => e.verdict === "DEMONSTRATED").length,
      0
    );

    return c.json({
      message: isPassed
        ? progressionOutcome.unlockedPractical
          ? "Checkpoint passed! Module Practical Coding Task is now unlocked."
          : "Checkpoint passed! Next chapter unlocked."
        : anyCriticalMisconception
        ? "Conceptual misconception detected. Review the flagged rubric feedback and retry."
        : "Score below 70% mastery threshold. Review unmet rubric criteria and retry.",
      attemptId: attempt.id,
      score: meanScore,
      isPassed,
      hasCriticalMisconception: anyCriticalMisconception,
      totalCriteriaChecked,
      totalCriteriaDemonstrated,
      answerFeedback: evaluatedAnswers.map((a) => ({
        questionId: a.questionId,
        score: a.score,
        summary: a.overallSummary,
        criteriaResults: a.criteriaResults,
      })),
      conceptUpdates,
      progressionOutcome,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to submit assessment", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/assessments/final/viva ─────────────────────────────────────
// Final AI Viva Defense Probe Turn (3-turn conversational oral defense)
assessmentHonoRouter.post("/final/viva", honoAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { enrollmentId, studentAnswer, turnNumber } = body;
    const user = c.get("user");

    if (!enrollmentId || !studentAnswer) {
      return c.json({ error: "enrollmentId and studentAnswer are required" }, 400);
    }

    const ownership = await verifyEnrollmentOwnership(enrollmentId, user.id);
    if (ownership.status !== "ok") {
      return c.json({ error: "Forbidden: You do not own this enrollment" }, 403);
    }

    const currentTurn = turnNumber || 1;
    const evalResult = await AiProviderService.evaluateVivaTurn({
      turnNumber: currentTurn,
      studentAnswer,
    });

    const vivaScore = evalResult.turnScore;
    await prisma.$transaction(async (tx) => {
      const attempt = await tx.assessmentAttempt.create({
        data: {
          enrollmentId,
          assessmentType: "VIVA",
          targetId: `turn-${currentTurn}`,
          status: "EVALUATED",
          score: vivaScore,
          completedAt: new Date(),
        },
      });

      await tx.vivaDefenseTurn.create({
        data: {
          attemptId: attempt.id,
          turnNumber: currentTurn,
          questionPrompt: body.questionPrompt || `Viva Oral Defense Question #${currentTurn}`,
          studentAnswer,
          turnScore: vivaScore,
          isDemonstrated: evalResult.isDemonstrated,
          feedback: evalResult.feedback,
          followUpProbe: evalResult.followUpQuestion,
          modelUsed: evalResult.modelUsed,
        },
      });
    });

    return c.json({
      turnNumber: currentTurn,
      isDemonstrated: evalResult.isDemonstrated,
      turnScore: evalResult.turnScore,
      feedback: evalResult.feedback,
      followUpQuestion: evalResult.followUpQuestion,
      isCompleted: currentTurn >= 3,
    });
  } catch (err: any) {
    return c.json({ error: "Viva defense evaluation failed", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/assessments/practical/submit ───────────────────────────────
// Wired directly to Real SandboxService 10-Module Harnesses + Module Unlock Gate
assessmentHonoRouter.post("/practical/submit", honoAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { enrollmentId, taskId, moduleId, code } = body;
    const user = c.get("user");

    if (!enrollmentId || !code) {
      return c.json({ error: "enrollmentId and code are required" }, 400);
    }

    const ownership = await verifyEnrollmentOwnership(enrollmentId, user.id);
    if (ownership.status !== "ok") {
      return c.json({ error: "Forbidden: You do not own this enrollment" }, 403);
    }

    const resolvedTaskId = taskId || "practical-m01-normalize-inventory";

    // Resolve linked module & verify practical task is unlocked!
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { courseVersionId: true },
    });

    const targetModule = enrollment
      ? await prisma.module.findFirst({
          where: {
            courseVersionId: enrollment.courseVersionId,
            ...(moduleId ? { id: moduleId } : { practicalTaskId: resolvedTaskId }),
          },
        })
      : null;

    if (targetModule) {
      try {
        await ProgressionService.assertPracticalUnlocked(enrollmentId, targetModule.id);
      } catch (lockErr: any) {
        if (lockErr instanceof ProgressionLockedError) {
          return c.json(lockErr.toJSON(), 403);
        }
        throw lockErr;
      }
    }

    // Run real SandboxService harness (Python subprocess in Node, structural verifier in CF Workers)
    const evalRes = await SandboxService.evaluatePracticalSubmission(code, resolvedTaskId);

    await prisma.$transaction(async (tx) => {
      const attempt = await tx.assessmentAttempt.create({
        data: {
          enrollmentId,
          assessmentType: "PRACTICAL",
          targetId: resolvedTaskId,
          status: "EVALUATED",
          score: evalRes.score,
          completedAt: new Date(),
        },
      });

      await tx.practicalSubmission.create({
        data: {
          attemptId: attempt.id,
          taskId: resolvedTaskId,
          submittedCode: code,
          language: "python",
          testsRun: evalRes.testsRun,
          testsPassed: evalRes.testsPassed,
          testResults: JSON.stringify(evalRes.testResults),
          score: evalRes.score,
          passed: evalRes.passed,
          executionTimeMs: evalRes.executionTimeMs,
          outputLog: evalRes.output,
        },
      });
    });

    // Deterministic Module Completion & Next-Module Unlock Gate
    let moduleOutcome = null;
    if (targetModule) {
      moduleOutcome = await ProgressionService.evaluatePracticalOutcomeAndUnlockModule({
        enrollmentId,
        moduleId: targetModule.id,
        score: evalRes.score,
        passed: evalRes.passed,
      });

      await AnalyticsService.recomputeSkillProfile(enrollmentId).catch((e) =>
        console.warn("[Analytics] Recompute warning after practical:", e?.message || e)
      );
    }

    return c.json({
      taskId: resolvedTaskId,
      passed: evalRes.passed,
      score: evalRes.score,
      testsRun: evalRes.testsRun,
      testsPassed: evalRes.testsPassed,
      testResults: evalRes.testResults,
      output: evalRes.output,
      moduleOutcome,
    });
  } catch (err: any) {
    return c.json({ error: "Practical task evaluation failed", details: err?.message }, 500);
  }
});
