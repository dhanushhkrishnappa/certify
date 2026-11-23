import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { prisma } from "../../shared/prisma.js";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";
import { honoRateLimiter } from "../../shared/middleware/honoRateLimit.js";
import { RAGService } from "../ai/rag.service.js";
import {
  AiProviderService,
  extractPreviousTutorQuestions,
  type ProgressionTransitionNotice,
} from "../ai/ai.provider.js";
import { DriftDetectionService } from "../ai/drift.service.js";
import { RubricEvaluatorService } from "../ai/rubric.evaluator.js";
import {
  ProgressionService,
  ProgressionLockedError,
} from "../progression/progression.service.js";
import { AnalyticsService } from "../analytics/analytics.service.js";

export const sessionsHonoRouter = new Hono();

const cleanTitle = (t?: string | null) => (t ? t.replace(/^\*+\s*/, "").trim() : "");

/**
 * Helper: Builds a rich live progression snapshot for the active chapter & module
 * so LearningStudio can render the live section stepper, rubric mastery bar,
 * Checkpoint CTA, Practical CTA, and Next Chapter / Next Module transitions.
 */
async function buildSessionProgressionSnapshot(params: {
  enrollmentId: string;
  chapterId: string;
  currentSectionId?: string | null;
}) {
  const { enrollmentId, chapterId, currentSectionId } = params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      module: {
        include: {
          chapters: {
            orderBy: { sequenceOrder: "asc" },
            select: { id: true, title: true, sequenceOrder: true },
          },
        },
      },
      sections: { orderBy: { sequenceOrder: "asc" } },
      concepts: {
        orderBy: { sequenceOrder: "asc" },
        include: { rubrics: { include: { criteria: true } } },
      },
    },
  });

  if (!chapter) return null;

  const [sectionProgRows, chapterProg, moduleProg, allModules, allChapterProgs] =
    await Promise.all([
      prisma.sectionProgress.findMany({
        where: {
          enrollmentId,
          sectionId: { in: chapter.sections.map((s) => s.id) },
        },
      }),
      prisma.chapterProgress.findUnique({
        where: {
          enrollmentId_chapterId: { enrollmentId, chapterId },
        },
      }),
      prisma.moduleProgress.findUnique({
        where: {
          enrollmentId_moduleId: { enrollmentId, moduleId: chapter.module.id },
        },
      }),
      prisma.module.findMany({
        where: { courseVersionId: chapter.module.courseVersionId },
        orderBy: { sequenceOrder: "asc" },
        include: {
          chapters: {
            orderBy: { sequenceOrder: "asc" },
            select: { id: true, title: true, sequenceOrder: true },
          },
        },
      }),
      prisma.chapterProgress.findMany({
        where: { enrollmentId },
      }),
    ]);

  const secProgMap = new Map(sectionProgRows.map((sp) => [sp.sectionId, sp]));
  const chapProgMap = new Map(allChapterProgs.map((cp) => [cp.chapterId, cp]));

  const allCriteria = chapter.concepts.flatMap((c) =>
    c.rubrics.flatMap((r) => r.criteria)
  );
  const critMasteries = await prisma.rubricCriterionMastery.findMany({
    where: {
      enrollmentId,
      rubricCriterionId: { in: allCriteria.map((c) => c.id) },
    },
  });
  const critMasteryMap = new Map(
    critMasteries.map((cm) => [cm.rubricCriterionId, cm])
  );

  const demonstratedCriteriaCount = allCriteria.filter((c) => {
    const m = critMasteryMap.get(c.id);
    return m && (m.status === "DEMONSTRATED" || m.status === "MASTERED" || m.bestScore >= 0.7);
  }).length;

  const sections = chapter.sections.map((s) => {
    const sp = secProgMap.get(s.id);
    return {
      id: s.id,
      sectionType: s.sectionType,
      title: s.title,
      objective: s.objective,
      sequenceOrder: s.sequenceOrder,
      minTurns: s.minTurns,
      status: sp?.status || (s.sequenceOrder === 1 ? "IN_PROGRESS" : "LOCKED"),
      turnsCompleted: sp?.turnsCompleted || 0,
      rubricPassRatio: sp?.rubricPassRatio || 0,
      readyToAdvance:
        sp?.status === "COMPLETED" ||
        ((sp?.turnsCompleted || 0) >= s.minTurns &&
          (sp?.rubricPassRatio || 0) >= 0.35),
    };
  });

  const activeSec =
    sections.find((s) => s.id === currentSectionId) ||
    sections.find((s) => s.status === "IN_PROGRESS" || s.status === "UNLOCKED") ||
    sections[0];

  const checkpointSec = sections.find((s) => s.sectionType === "CHAPTER_CHECKPOINT");
  const practicalSec = sections.find((s) => s.sectionType === "MODULE_PRACTICAL");
  const s3Sec = sections.find((s) => s.sequenceOrder === 3);

  const checkpointUnlocked = Boolean(
    checkpointSec &&
      (checkpointSec.status !== "LOCKED" ||
        chapterProg?.status === "AWAITING_CHECKPOINT" ||
        chapterProg?.status === "COMPLETED" ||
        s3Sec?.status === "COMPLETED")
  );

  const practicalUnlocked = Boolean(
    practicalSec &&
      (practicalSec.status !== "LOCKED" ||
        (chapterProg?.status === "COMPLETED" && !moduleProg?.practicalPassed))
  );

  // Determine next chapter in current module or first chapter of next module
  let nextChapter: {
    id: string;
    title: string;
    moduleOrder: number;
    moduleTitle: string;
    isUnlocked: boolean;
    isNextModule: boolean;
  } | null = null;

  const nextInModule = chapter.module.chapters.find(
    (ch) => ch.sequenceOrder === chapter.sequenceOrder + 1
  );
  if (nextInModule) {
    const np = chapProgMap.get(nextInModule.id);
    nextChapter = {
      id: nextInModule.id,
      title: cleanTitle(nextInModule.title),
      moduleOrder: chapter.module.sequenceOrder,
      moduleTitle: chapter.module.title,
      isUnlocked: Boolean(np && np.status !== "LOCKED"),
      isNextModule: false,
    };
  } else {
    const nextMod = allModules.find(
      (m) => m.sequenceOrder === chapter.module.sequenceOrder + 1
    );
    if (nextMod && nextMod.chapters[0]) {
      const np = chapProgMap.get(nextMod.chapters[0].id);
      nextChapter = {
        id: nextMod.chapters[0].id,
        title: cleanTitle(nextMod.chapters[0].title),
        moduleOrder: nextMod.sequenceOrder,
        moduleTitle: nextMod.title,
        isUnlocked: Boolean(np && np.status !== "LOCKED"),
        isNextModule: true,
      };
    }
  }

  return {
    enrollmentId,
    moduleId: chapter.module.id,
    moduleOrder: chapter.module.sequenceOrder,
    moduleTitle: chapter.module.title,
    moduleStatus: moduleProg?.status || "IN_PROGRESS",
    practicalTaskId: chapter.module.practicalTaskId || null,
    practicalPassed: moduleProg?.practicalPassed || false,
    practicalScore: moduleProg?.practicalScore ?? null,
    chapterId: chapter.id,
    chapterOrder: chapter.sequenceOrder,
    chapterTitle: cleanTitle(chapter.title),
    chapterStatus: chapterProg?.status || "IN_PROGRESS",
    checkpointScore: chapterProg?.checkpointScore ?? null,
    activeSection: activeSec || null,
    sections,
    checkpointUnlocked,
    practicalUnlocked,
    demonstratedCriteriaCount,
    totalCriteriaCount: allCriteria.length,
    nextChapter,
  };
}

// ─── GET /api/v1/courses/:slug/progression ──────────────────────────────────
sessionsHonoRouter.get(
  "/courses/:slug/progression",
  honoAuthMiddleware,
  async (c) => {
    try {
      const slug = c.req.param("slug") || "";
      const user = c.get("user");

      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          versions: { where: { isActive: true }, take: 1 },
        },
      });

      if (!course || !course.versions[0]) {
        return c.json({ error: "Course not found" }, 404);
      }

      const activeVersion = course.versions[0];
      let enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId: user.id,
            courseVersionId: activeVersion.id,
          },
        },
      });

      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseVersionId: activeVersion.id,
            currentTier: "EASY",
            status: "ACTIVE",
          },
        });
      }

      const progression = await ProgressionService.getProgressionTree(
        enrollment.id
      );
      return c.json({ progression });
    } catch (err: any) {
      return c.json(
        { error: "Failed to fetch course progression", details: err?.message },
        500
      );
    }
  }
);

// ─── GET /api/v1/courses/:slug/skills-report ────────────────────────────────
sessionsHonoRouter.get(
  "/courses/:slug/skills-report",
  honoAuthMiddleware,
  async (c) => {
    try {
      const slug = c.req.param("slug") || "";
      const user = c.get("user");

      const course = await prisma.course.findUnique({
        where: { slug },
        include: { versions: { where: { isActive: true }, take: 1 } },
      });

      if (!course || !course.versions[0]) {
        return c.json({ error: "Course not found" }, 404);
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId: user.id,
            courseVersionId: course.versions[0].id,
          },
        },
      });

      if (!enrollment) {
        return c.json({ error: "Not enrolled in this course", enrolled: false }, 404);
      }

      const report = await AnalyticsService.getLearnerSkillsReport(
        enrollment.id
      );
      return c.json({ report });
    } catch (err: any) {
      return c.json(
        { error: "Failed to generate skills report", details: err?.message },
        500
      );
    }
  }
);

// ─── GET /api/v1/courses/:slug/session ───────────────────────────────────────
sessionsHonoRouter.get("/courses/:slug/session", honoAuthMiddleware, async (c) => {
  try {
    const slug = c.req.param("slug") || "";
    const user = c.get("user");

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
                  include: {
                    sections: { orderBy: { sequenceOrder: "asc" } },
                    concepts: {
                      orderBy: { sequenceOrder: "asc" },
                      include: {
                        rubrics: { include: { criteria: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course || !course.versions[0]) {
      return c.json({ error: "Course not found" }, 404);
    }

    const activeVersion = course.versions[0];

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseVersionId: {
          userId: user.id,
          courseVersionId: activeVersion.id,
        },
      },
      include: {
        conceptMasteries: {
          include: {
            concept: { select: { id: true, slug: true, name: true } },
          },
        },
        sessions: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            chapter: {
              include: {
                sections: { orderBy: { sequenceOrder: "asc" } },
                concepts: true,
              },
            },
            messages: {
              orderBy: { createdAt: "asc" },
              take: 50,
            },
          },
        },
      },
    });

    if (!enrollment) {
      return c.json({ error: "Not enrolled in this course", enrolled: false }, 404);
    }

    await ProgressionService.ensureInitialized(enrollment.id);

    const activeSession = enrollment.sessions[0] || null;

    if (activeSession && !activeSession.currentSectionId) {
      const firstSec = activeSession.chapter.sections[0];
      if (firstSec) {
        activeSession.currentSectionId = firstSec.id;
        await prisma.learningSession.update({
          where: { id: activeSession.id },
          data: { currentSectionId: firstSec.id },
        });
      }
    }

    const progressionSnapshot = activeSession
      ? await buildSessionProgressionSnapshot({
          enrollmentId: enrollment.id,
          chapterId: activeSession.chapterId,
          currentSectionId: activeSession.currentSectionId,
        })
      : null;

    return c.json({
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
      },
      enrollment: {
        id: enrollment.id,
        currentTier: enrollment.currentTier,
        status: enrollment.status,
      },
      session: activeSession
        ? {
            id: activeSession.id,
            phase: activeSession.phase,
            currentSectionId: activeSession.currentSectionId,
            chapter: {
              ...activeSession.chapter,
              title: cleanTitle(activeSession.chapter.title),
            },
            messages: activeSession.messages.map((m: any) => ({
              id: m.id,
              role: m.sender === "LEARNER" ? "user" : "assistant",
              sender: m.sender,
              content: m.content,
              createdAt: m.createdAt,
            })),
          }
        : null,
      progressionSnapshot,
      conceptMasteries: enrollment.conceptMasteries.map((cm: any) => ({
        conceptId: cm.conceptId,
        conceptSlug: cm.concept.slug,
        conceptName: cm.concept.name,
        pMastery: cm.pMastery,
        state: cm.state,
        attemptCount: cm.remediationCycles || 0,
      })),
      curriculum: activeVersion.modules,
    });
  } catch (err: any) {
    return c.json(
      { error: "Failed to load learning session", details: err?.message },
      500
    );
  }
});

// ─── POST /api/v1/courses/:slug/sessions ─────────────────────────────────────
sessionsHonoRouter.post(
  "/courses/:slug/sessions",
  honoAuthMiddleware,
  async (c) => {
    try {
      const slug = c.req.param("slug") || "";
      const user = c.get("user");
      const body = await c.req.json().catch(() => ({}));
      const { chapterId } = body;

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
                    include: {
                      sections: { orderBy: { sequenceOrder: "asc" } },
                      concepts: { orderBy: { sequenceOrder: "asc" } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!course || !course.versions[0]) {
        return c.json({ error: "Course not found" }, 404);
      }

      const activeVersion = course.versions[0];
      const allChapters = activeVersion.modules.flatMap((m) => m.chapters);

      if (allChapters.length === 0) {
        return c.json({ error: "Course has no chapters configured" }, 400);
      }

      let enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId: user.id,
            courseVersionId: activeVersion.id,
          },
        },
      });

      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseVersionId: activeVersion.id,
            currentTier: "EASY",
            status: "ACTIVE",
          },
        });
      }

      await ProgressionService.ensureInitialized(enrollment.id);

      let targetChapter = chapterId
        ? allChapters.find((ch) => ch.id === chapterId)
        : undefined;

      if (!targetChapter) {
        const currentChapProg = await prisma.chapterProgress.findFirst({
          where: {
            enrollmentId: enrollment.id,
            status: { in: ["IN_PROGRESS", "UNLOCKED", "AWAITING_CHECKPOINT", "REMEDIATING"] },
          },
          include: { chapter: { include: { module: true } } },
          orderBy: [
            { chapter: { module: { sequenceOrder: "asc" } } },
            { chapter: { sequenceOrder: "asc" } },
          ],
        });
        targetChapter =
          allChapters.find((ch) => ch.id === currentChapProg?.chapterId) ||
          allChapters[0];
      }

      try {
        await ProgressionService.assertChapterUnlocked(
          enrollment.id,
          targetChapter.id
        );
      } catch (lockErr: any) {
        if (lockErr instanceof ProgressionLockedError) {
          return c.json(lockErr.toJSON(), 403);
        }
        throw lockErr;
      }

      const allConcepts = allChapters.flatMap((ch) => ch.concepts);
      for (const concept of allConcepts) {
        await prisma.conceptMastery.upsert({
          where: {
            enrollmentId_conceptId: {
              enrollmentId: enrollment.id,
              conceptId: concept.id,
            },
          },
          update: {},
          create: {
            enrollmentId: enrollment.id,
            conceptId: concept.id,
            pMastery: concept.defaultP0,
            state: "INITIAL",
          },
        });
      }

      await prisma.learningSession.updateMany({
        where: { enrollmentId: enrollment.id, isActive: true },
        data: { isActive: false },
      });

      const activeSecProgress = await prisma.sectionProgress.findFirst({
        where: {
          enrollmentId: enrollment.id,
          section: { chapterId: targetChapter.id },
          status: { in: ["IN_PROGRESS", "UNLOCKED"] },
        },
        include: { section: true },
        orderBy: { section: { sequenceOrder: "asc" } },
      });

      const targetSection =
        activeSecProgress?.section || targetChapter.sections[0] || null;

      const newSession = await prisma.learningSession.create({
        data: {
          enrollmentId: enrollment.id,
          chapterId: targetChapter.id,
          currentSectionId: targetSection?.id || null,
          phase: "DIAGNOSTIC",
          isActive: true,
        },
        include: {
          chapter: {
            include: {
              sections: { orderBy: { sequenceOrder: "asc" } },
              concepts: true,
            },
          },
        },
      });

      const cleanChapTitle = cleanTitle(targetChapter.title);
      const conceptList = targetChapter.concepts.map((c) => c.name).join(", ");
      const secTitle = targetSection
        ? targetSection.title
        : "1. Core Intuition & Mental Model";
      const secObjective = targetSection
        ? targetSection.objective
        : `Build an accurate mental model of ${conceptList || cleanChapTitle}.`;

      const welcomeText = `Welcome to **${cleanChapTitle}**!\n\nWe are starting in **${secTitle}**.\n- **Section Objective:** ${secObjective}\n- **Core Concept:** ${
        conceptList || cleanChapTitle
      }\n\n**Your Turn:** Have you worked with **${
        conceptList || cleanChapTitle
      }** in Python before, or would you like to build intuition from first principles with a quick code trace?`;

      const initialMsg = await prisma.chatMessage.create({
        data: {
          sessionId: newSession.id,
          sender: "AI_TUTOR",
          content: welcomeText,
        },
      });

      const progressionSnapshot = await buildSessionProgressionSnapshot({
        enrollmentId: enrollment.id,
        chapterId: newSession.chapterId,
        currentSectionId: newSession.currentSectionId,
      });

      return c.json(
        {
          message: "Learning session started",
          enrollmentId: enrollment.id,
          session: {
            id: newSession.id,
            phase: newSession.phase,
            currentSectionId: newSession.currentSectionId,
            chapter: {
              ...newSession.chapter,
              title: cleanChapTitle,
            },
            activeSection: targetSection,
            messages: [
              {
                id: initialMsg.id,
                role: "assistant",
                sender: initialMsg.sender,
                content: initialMsg.content,
                createdAt: initialMsg.createdAt,
              },
            ],
          },
          progressionSnapshot,
        },
        201
      );
    } catch (err: any) {
      return c.json(
        { error: "Failed to start session", details: err?.message },
        500
      );
    }
  }
);

// ─── POST /api/v1/sessions/:sessionId/sections/advance ───────────────────────
sessionsHonoRouter.post(
  "/sessions/:sessionId/sections/advance",
  honoAuthMiddleware,
  async (c) => {
    try {
      const sessionId = c.req.param("sessionId") || "";
      const user = c.get("user");
      const session = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: { enrollment: true },
      });
      if (!session || session.enrollment.userId !== user.id) {
        return c.json({ error: "Session not found" }, 404);
      }
      const result = await ProgressionService.advanceSection(
        session.enrollmentId,
        sessionId
      );
      return c.json(result);
    } catch (err: any) {
      if (err instanceof ProgressionLockedError) {
        return c.json(err.toJSON(), 403);
      }
      return c.json(
        { error: "Failed to advance section", details: err?.message },
        400
      );
    }
  }
);

// ─── POST /api/v1/sessions/:sessionId/advance ────────────────────────────────
sessionsHonoRouter.post(
  "/sessions/:sessionId/advance",
  honoAuthMiddleware,
  async (c) => {
    try {
      const sessionId = c.req.param("sessionId") || "";
      const user = c.get("user");

      const currentSession = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: {
          enrollment: {
            include: {
              courseVersion: {
                include: {
                  modules: {
                    orderBy: { sequenceOrder: "asc" },
                    include: {
                      chapters: {
                        orderBy: { sequenceOrder: "asc" },
                        include: {
                          sections: { orderBy: { sequenceOrder: "asc" } },
                          concepts: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          chapter: true,
        },
      });

      if (!currentSession || currentSession.enrollment.userId !== user.id) {
        return c.json({ error: "Session not found or unauthorized" }, 404);
      }

      const currentChapProg = await prisma.chapterProgress.findUnique({
        where: {
          enrollmentId_chapterId: {
            enrollmentId: currentSession.enrollmentId,
            chapterId: currentSession.chapterId,
          },
        },
      });

      if (!currentChapProg || currentChapProg.status !== "COMPLETED") {
        return c.json(
          {
            error: "PROGRESSION_LOCKED",
            code: "CHAPTER_CHECKPOINT_REQUIRED",
            message: `You must complete all sections and pass the Conceptual Checkpoint (score >= 70%) for "${cleanTitle(currentSession.chapter.title)}" before advancing to the next chapter.`,
          },
          403
        );
      }

      const allChapters =
        currentSession.enrollment.courseVersion.modules.flatMap(
          (m) => m.chapters
        );
      const currentIdx = allChapters.findIndex(
        (ch) => ch.id === currentSession.chapterId
      );

      if (currentIdx === -1 || currentIdx + 1 >= allChapters.length) {
        return c.json({
          message: "You have reached the final chapter of this course!",
          isCourseComplete: true,
        });
      }

      const nextChapter = allChapters[currentIdx + 1];

      try {
        await ProgressionService.assertChapterUnlocked(
          currentSession.enrollmentId,
          nextChapter.id
        );
      } catch (lockErr: any) {
        if (lockErr instanceof ProgressionLockedError) {
          return c.json(lockErr.toJSON(), 403);
        }
        throw lockErr;
      }

      await prisma.learningSession.update({
        where: { id: sessionId },
        data: { isActive: false, phase: "COMPLETED" },
      });

      const firstSection = nextChapter.sections[0] || null;

      const nextSession = await prisma.learningSession.create({
        data: {
          enrollmentId: currentSession.enrollmentId,
          chapterId: nextChapter.id,
          currentSectionId: firstSection?.id || null,
          phase: "DIAGNOSTIC",
          isActive: true,
        },
        include: {
          chapter: {
            include: {
              sections: { orderBy: { sequenceOrder: "asc" } },
              concepts: true,
            },
          },
        },
      });

      const cleanNextTitle = cleanTitle(nextChapter.title);
      const conceptList = nextChapter.concepts.map((c) => c.name).join(", ");
      const welcomeText = `Welcome to **${cleanNextTitle}**!\n\nWe are beginning in **${
        firstSection?.title || "1. Core Intuition & Mental Model"
      }**.\n- **Section Objective:** ${
        firstSection?.objective || `Master ${conceptList}`
      }\n\n**Your Turn:** How does **${conceptList}** connect to what you just proved in the previous chapter?`;

      const initialMsg = await prisma.chatMessage.create({
        data: {
          sessionId: nextSession.id,
          sender: "AI_TUTOR",
          content: welcomeText,
        },
      });

      const progressionSnapshot = await buildSessionProgressionSnapshot({
        enrollmentId: currentSession.enrollmentId,
        chapterId: nextSession.chapterId,
        currentSectionId: nextSession.currentSectionId,
      });

      return c.json({
        message: "Advanced to next chapter",
        isCourseComplete: false,
        session: {
          id: nextSession.id,
          phase: nextSession.phase,
          currentSectionId: nextSession.currentSectionId,
          chapter: {
            ...nextSession.chapter,
            title: cleanNextTitle,
          },
          activeSection: firstSection,
          messages: [
            {
              id: initialMsg.id,
              role: "assistant",
              sender: initialMsg.sender,
              content: initialMsg.content,
              createdAt: initialMsg.createdAt,
            },
          ],
        },
        progressionSnapshot,
      });
    } catch (err: any) {
      return c.json(
        { error: "Failed to advance chapter", details: err?.message },
        500
      );
    }
  }
);

// ─── POST /api/v1/sessions/:sessionId/messages ───────────────────────────────
// Stateful Pedagogical Director Pipeline:
// 1. Drift & Boundary Gate
// 2. Pre-Generation Hybrid Rubric Evaluation (evaluates learner's reply in context of tutor's last question!)
// 3. Pre-Generation Section Progression Advance (S1 -> S2 -> S3 -> S4 Checkpoint Unlock)
// 4. Hard-Fenced Section-Aware RAG Retrieval (for the newly active section!)
// 5. Anti-Repetition Structured Socratic Tutor Streaming (acknowledges mastery & announces transitions inline!)
sessionsHonoRouter.post(
  "/sessions/:sessionId/messages",
  honoAuthMiddleware,
  honoRateLimiter({ maxRequests: 25, windowSeconds: 60, keyPrefix: "ai-session-msg" }),
  async (c) => {
    try {
      const sessionId = c.req.param("sessionId") || "";
      const body = await c.req.json().catch(() => ({}));
      const { content } = body;
      const user = c.get("user");

      if (!content || typeof content !== "string" || !content.trim()) {
        return c.json({ error: "Message content is required" }, 400);
      }

      const trimmedContent = content.trim();

      const learningSession = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: {
          enrollment: {
            include: {
              courseVersion: { include: { course: true } },
              conceptMasteries: true,
            },
          },
          chapter: {
            include: {
              module: true,
              sections: { orderBy: { sequenceOrder: "asc" } },
              concepts: {
                orderBy: { sequenceOrder: "asc" },
                include: {
                  rubrics: { include: { criteria: true } },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!learningSession) {
        return c.json({ error: "Learning session not found" }, 404);
      }

      if (learningSession.enrollment.userId !== user.id) {
        return c.json(
          { error: "Forbidden: You do not own this learning session" },
          403
        );
      }

      await ProgressionService.ensureInitialized(learningSession.enrollmentId);
      const historyChronological = [...learningSession.messages].reverse();

      // Extract the tutor's most recent question so concise learner answers are evaluated in context!
      const lastAssistantMsg = [...historyChronological]
        .reverse()
        .find((m) => m.sender === "AI_TUTOR");
      const lastTutorQuestions = lastAssistantMsg
        ? lastAssistantMsg.content.match(/[^.!?\n]{10,}\?/g)
        : null;
      const lastTutorQuestion =
        lastTutorQuestions && lastTutorQuestions.length > 0
          ? lastTutorQuestions[lastTutorQuestions.length - 1].trim()
          : null;

      const previousTutorQuestions = extractPreviousTutorQuestions(
        historyChronological.map((m) => ({
          role: m.sender === "LEARNER" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }))
      );

      // 1. Save Learner Message
      await prisma.chatMessage.create({
        data: {
          sessionId: learningSession.id,
          sender: "LEARNER",
          content: trimmedContent,
        },
      });

      // 2. Resolve Active Section & Target Concept
      let activeSection =
        learningSession.chapter.sections.find(
          (s) => s.id === learningSession.currentSectionId
        ) ||
        learningSession.chapter.sections[0] ||
        null;

      const targetConcept = learningSession.chapter.concepts[0];
      const existingMastery = learningSession.enrollment.conceptMasteries.find(
        (cm) => cm.conceptId === targetConcept?.id
      );
      let currentPMastery = existingMastery?.pMastery ?? 0.15;
      const currentModuleOrder = learningSession.chapter.module.sequenceOrder;

      // 3. Curriculum Boundary & Drift Detection
      const driftResult = await DriftDetectionService.detectAndLogDrift({
        enrollmentId: learningSession.enrollmentId,
        sessionId: learningSession.id,
        currentModuleOrder,
        currentModuleTitle: learningSession.chapter.module.title,
        currentChapterTitle: cleanTitle(learningSession.chapter.title),
        currentSectionId: activeSection?.id || null,
        currentSectionTitle: activeSection?.title || "Current Section",
        userMessage: trimmedContent,
      });

      // 4. PRE-GENERATION Rubric Evaluation & Section Progression Advance
      // Evaluating BEFORE generating the tutor reply allows the tutor to immediately validate
      // newly demonstrated criteria and smoothly announce S1->S2->S3->S4 transitions on the same turn!
      const allCriteria =
        targetConcept?.rubrics.flatMap((r) => r.criteria) || [];

      let evaluation: Awaited<ReturnType<typeof RubricEvaluatorService.evaluateResponse>> | null =
        null;
      let persistedRubric: Awaited<
        ReturnType<typeof RubricEvaluatorService.persistEvaluationResults>
      > | null = null;
      let sectionTurnStatus: Awaited<
        ReturnType<typeof ProgressionService.recordSectionTurn>
      > | null = null;
      let progressionTransition: ProgressionTransitionNotice | null = null;
      let detectedMisconception: string | null = null;

      if (targetConcept && !driftResult.isDrift) {
        evaluation = await RubricEvaluatorService.evaluateResponse({
          conceptName: targetConcept.name,
          questionPrompt:
            activeSection?.objective ||
            `Demonstrate mastery of ${targetConcept.name}`,
          lastTutorQuestion,
          learnerText: trimmedContent,
          criteria: allCriteria,
          mode: "DIALOGUE",
        });

        const miscItem = evaluation.criteriaResults.find(
          (r) => r.verdict === "MISCONCEPTION"
        );
        if (miscItem) {
          detectedMisconception = miscItem.reasoning;
        }

        persistedRubric = await RubricEvaluatorService.persistEvaluationResults({
          enrollmentId: learningSession.enrollmentId,
          conceptId: targetConcept.id,
          sectionId: activeSection?.id || null,
          evidenceType: "DIALOGUE_PROBE",
          evaluation,
          criteria: allCriteria,
          capDialogueMastery: true,
        });

        currentPMastery = persistedRubric.conceptPMastery;

        if (activeSection) {
          const previousSectionTitle = activeSection.title;
          const previousSectionId = activeSection.id;

          sectionTurnStatus = await ProgressionService.recordSectionTurn({
            enrollmentId: learningSession.enrollmentId,
            sessionId: learningSession.id,
            sectionId: activeSection.id,
            chapterId: learningSession.chapterId,
            moduleId: learningSession.chapter.moduleId,
            rubricPassRatio: evaluation.weightedScore,
          });

          const nextSecId = sectionTurnStatus.nextSection?.id;
          if (
            sectionTurnStatus.autoAdvanced &&
            nextSecId &&
            nextSecId !== previousSectionId
          ) {
            const newlyActiveSection =
              learningSession.chapter.sections.find(
                (s) => s.id === nextSecId
              ) || activeSection;
            activeSection = newlyActiveSection;

            progressionTransition = {
              type: "SECTION_ADVANCED",
              fromSectionTitle: previousSectionTitle,
              toSectionTitle: newlyActiveSection.title,
              toSectionObjective: newlyActiveSection.objective,
              message: `Completed "${previousSectionTitle}" and unlocked "${newlyActiveSection.title}".`,
            };
          } else if (
            sectionTurnStatus.nextSection?.sectionType === "CHAPTER_CHECKPOINT" ||
            sectionTurnStatus.sectionStatus === "CHECKPOINT_UNLOCKED"
          ) {
            const checkpointSec = learningSession.chapter.sections.find(
              (s) => s.sectionType === "CHAPTER_CHECKPOINT"
            );
            progressionTransition = {
              type: "CHECKPOINT_UNLOCKED",
              fromSectionTitle: previousSectionTitle,
              toSectionTitle: checkpointSec?.title || "4. Conceptual Checkpoint",
              toSectionObjective:
                checkpointSec?.objective ||
                "Pass the Chapter Conceptual Checkpoint to unlock the next chapter.",
              message: `All guided learning sections for "${cleanTitle(
                learningSession.chapter.title
              )}" are complete! The Conceptual Checkpoint (Section 4) is now unlocked.`,
            };
          }
        }

        // Update LearnerSkillProfile asynchronously
        AnalyticsService.recomputeSkillProfile(
          learningSession.enrollmentId
        ).catch((e) =>
          console.warn("[Analytics] Background recompute error:", e?.message)
        );
      }

      // 5. Refresh Criterion Mastery Ledger after this turn's update
      const criterionMasteries = await prisma.rubricCriterionMastery.findMany({
        where: {
          enrollmentId: learningSession.enrollmentId,
          rubricCriterionId: { in: allCriteria.map((c) => c.id) },
        },
      });
      const masteryByCritId = new Map(
        criterionMasteries.map((cm) => [cm.rubricCriterionId, cm])
      );

      const demonstratedCriteria: string[] = [];
      const unmetCriteria: string[] = [];
      let targetCriterion: {
        code: string | null;
        statement: string;
        cognitiveLevel: string;
      } | null = null;

      for (const crit of allCriteria) {
        const cm = masteryByCritId.get(crit.id);
        if (
          cm &&
          (cm.status === "DEMONSTRATED" ||
            cm.status === "MASTERED" ||
            cm.bestScore >= 0.7)
        ) {
          demonstratedCriteria.push(crit.criterionStatement);
        } else {
          unmetCriteria.push(crit.criterionStatement);
          if (!targetCriterion) {
            targetCriterion = {
              code: crit.criterionCode || null,
              statement: crit.criterionStatement,
              cognitiveLevel: crit.cognitiveLevel || "EXPLAIN",
            };
          }
        }
      }

      // 6. Retrieve Hard-Fenced Section-Aware RAG Chunks for the (possibly newly advanced) activeSection
      const ragChunks = await RAGService.retrieveScopedContext({
        chapterId: learningSession.chapterId,
        sectionId: activeSection?.id || null,
        conceptId: targetConcept?.id || null,
        activeConceptName: targetConcept?.name || learningSession.chapter.title,
        maxModuleOrder: currentModuleOrder,
        userQuery: trimmedContent,
        limit: 4,
      });

      const sectionTeachingContent =
        activeSection?.content && activeSection.content.length > 40
          ? activeSection.content
          : learningSession.chapter.teachingContent;

      // 7. Stream Structured Socratic Tutor Response + Live Progression Snapshot via SSE
      return streamSSE(c, async (stream) => {
        let fullAiResponse = "";

        if (driftResult.isDrift) {
          await stream.writeSSE({
            event: "drift_redirect",
            data: JSON.stringify({
              driftType: driftResult.driftType,
              targetModuleTitle: driftResult.targetModuleTitle,
              message: driftResult.redirectMessage,
            }),
          });
        }

        const aiResult = await AiProviderService.streamTutorReply(
          {
            courseTitle:
              learningSession.enrollment.courseVersion.course.title,
            moduleTitle: learningSession.chapter.module.title,
            moduleOrder: currentModuleOrder,
            chapterTitle: cleanTitle(learningSession.chapter.title),
            sectionTitle: activeSection?.title || "1. Core Intuition",
            sectionType: activeSection?.sectionType || "CONCEPT_INTUITION",
            sectionObjective:
              activeSection?.objective ||
              "Build first-principles conceptual mastery.",
            sectionOrder: activeSection?.sequenceOrder || 1,
            totalSections: learningSession.chapter.sections.length || 4,
            conceptName: targetConcept?.name ?? learningSession.chapter.title,
            teachingContent: sectionTeachingContent,
            ragContextChunks: ragChunks,
            currentMastery: currentPMastery,
            tier: learningSession.enrollment.currentTier,
            turnNumber: historyChronological.length + 1,
            lastTutorQuestion,
            previousTutorQuestions,
            targetCriterion,
            justDemonstratedCriteria:
              persistedRubric?.newlyDemonstratedStatements || [],
            unmetCriteria,
            demonstratedCriteria,
            detectedMisconception,
            progressionTransition,
            driftWarning: driftResult.isDrift
              ? {
                  driftType: driftResult.driftType || "OFF_TOPIC",
                  targetModuleTitle: driftResult.targetModuleTitle,
                  message: driftResult.redirectMessage || "",
                }
              : null,
            userMessage: trimmedContent,
            history: historyChronological.map((m) => ({
              role: m.sender === "LEARNER" ? "user" : "assistant",
              content: m.content,
            })),
          },
          async (tokenChunk) => {
            fullAiResponse += tokenChunk;
            await stream.writeSSE({
              event: "token",
              data: JSON.stringify({ chunk: tokenChunk }),
            });
          }
        );

        // Save complete Tutor response to database
        const aiMessage = await prisma.chatMessage.create({
          data: {
            sessionId: learningSession.id,
            sender: "AI_TUTOR",
            content: aiResult.fullText || fullAiResponse,
          },
        });

        // Emit rubric & BKT mastery telemetry
        if (targetConcept && evaluation && persistedRubric) {
          await stream.writeSSE({
            event: "rubric_update",
            data: JSON.stringify({
              conceptId: targetConcept.id,
              conceptName: targetConcept.name,
              weightedScore: evaluation.weightedScore,
              hasCriticalMisconception: evaluation.hasCriticalMisconception,
              overallSummary: evaluation.overallSummary,
              criteriaResults: evaluation.criteriaResults,
              demonstratedCriteriaCount:
                persistedRubric.demonstratedCriteriaCount,
              totalCriteriaCount: persistedRubric.totalCriteriaCount,
              newlyDemonstratedStatements:
                persistedRubric.newlyDemonstratedStatements,
            }),
          });

          await stream.writeSSE({
            event: "state_update",
            data: JSON.stringify({
              conceptId: targetConcept.id,
              conceptName: targetConcept.name,
              previousMastery: existingMastery?.pMastery ?? 0.15,
              newMastery: persistedRubric.conceptPMastery,
              state: persistedRubric.conceptState,
              isDemonstrated:
                evaluation.weightedScore >= 0.7 &&
                !evaluation.hasCriticalMisconception,
              confidence: evaluation.weightedScore,
              reasoning: evaluation.overallSummary,
            }),
          });
        }

        // Build complete progression snapshot so frontend studio updates its stepper & CTAs immediately
        const progressionSnapshot = await buildSessionProgressionSnapshot({
          enrollmentId: learningSession.enrollmentId,
          chapterId: learningSession.chapterId,
          currentSectionId: activeSection?.id || learningSession.currentSectionId,
        });

        await stream.writeSSE({
          event: "section_status",
          data: JSON.stringify({
            ...(sectionTurnStatus || {}),
            progressionTransition,
            progressionSnapshot,
          }),
        });

        await stream.writeSSE({
          event: "done",
          data: JSON.stringify({
            messageId: aiMessage.id,
            provider: aiResult.provider,
            model: aiResult.model,
            progressionSnapshot,
          }),
        });
      });
    } catch (err: any) {
      return c.json(
        { error: "Failed to process message", details: err?.message },
        500
      );
    }
  }
);

// ─── POST /api/v1/courses/:slug/chat ─────────────────────────────────────────
// Public/Guest Course Socratic Streaming Endpoint (Scoped RAG + Curriculum Director)
sessionsHonoRouter.post(
  "/courses/:slug/chat",
  honoRateLimiter({ maxRequests: 15, windowSeconds: 60, keyPrefix: "ai-public-chat" }),
  async (c) => {
    try {
      const slug = c.req.param("slug") || "";
      const body = await c.req.json().catch(() => ({}));
      const message = typeof body.message === "string" ? body.message : typeof body.content === "string" ? body.content : "";
      const history = Array.isArray(body.history) ? body.history : [];

      if (!message || !message.trim()) {
        return c.json({ error: "message is required" }, 400);
      }

      const course = await prisma.course.findUnique({
        where: { slug },
        include: {
          versions: {
            where: { isActive: true },
            include: {
              modules: {
                orderBy: { sequenceOrder: "asc" },
                take: 1,
                include: {
                  chapters: {
                    orderBy: { sequenceOrder: "asc" },
                    take: 1,
                    include: {
                      sections: { orderBy: { sequenceOrder: "asc" } },
                      concepts: {
                        include: { rubrics: { include: { criteria: true } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const firstModule = course?.versions?.[0]?.modules?.[0];
      const firstChapter = firstModule?.chapters?.[0];
      const firstSection = firstChapter?.sections?.[0];
      const firstConcept = firstChapter?.concepts?.[0];
      const allCriteria =
        firstConcept?.rubrics?.flatMap((r) => r.criteria) || [];

      const ragChunks = firstChapter
        ? await RAGService.retrieveScopedContext({
            chapterId: firstChapter.id,
            sectionId: firstSection?.id || null,
            conceptId: firstConcept?.id || null,
            activeConceptName: firstConcept?.name || firstChapter.title,
            maxModuleOrder: 1,
            userQuery: message.trim(),
            limit: 4,
          })
        : [];

      const sanitizedHistory = Array.isArray(history)
        ? history.slice(-10).map((m: any) => ({
            role: (m.role === "assistant" ? "assistant" : "user") as
              | "user"
              | "assistant",
            content: String(m.content || ""),
          }))
        : [];

      return streamSSE(c, async (stream) => {
        const aiResult = await AiProviderService.streamTutorReply(
          {
            courseTitle: course?.title || "Python Fundamentals",
            moduleTitle: firstModule?.title || "Module 01: Python Foundations",
            moduleOrder: 1,
            chapterTitle:
              cleanTitle(firstChapter?.title) ||
              "Python Execution Model, REPL, Scripts & Indentation",
            sectionTitle:
              firstSection?.title || "1. Core Intuition & Mental Model",
            sectionType: firstSection?.sectionType || "CONCEPT_INTUITION",
            sectionObjective:
              firstSection?.objective ||
              "Build an accurate first-principles mental model.",
            sectionOrder: firstSection?.sequenceOrder || 1,
            totalSections: firstChapter?.sections?.length || 4,
            conceptName:
              firstConcept?.name ||
              "Python Execution Model, REPL, Scripts & Indentation",
            teachingContent:
              firstSection?.content ||
              firstChapter?.teachingContent ||
              "Focus on first-principles software engineering concepts, runtime mechanics, and clean syntax.",
            ragContextChunks: ragChunks,
            currentMastery: 0.25,
            tier: "EASY",
            turnNumber: sanitizedHistory.length + 1,
            previousTutorQuestions:
              extractPreviousTutorQuestions(sanitizedHistory),
            targetCriterion: allCriteria[0]
              ? {
                  code: allCriteria[0].criterionCode || null,
                  statement: allCriteria[0].criterionStatement,
                  cognitiveLevel: allCriteria[0].cognitiveLevel || "EXPLAIN",
                }
              : null,
            unmetCriteria: allCriteria.map((cr) => cr.criterionStatement),
            userMessage: message.trim(),
            history: sanitizedHistory,
          },
          async (tokenChunk) => {
            await stream.writeSSE({
              event: "token",
              data: JSON.stringify({ chunk: tokenChunk }),
            });
          }
        );

        await stream.writeSSE({
          event: "done",
          data: JSON.stringify({
            provider: aiResult.provider,
            model: aiResult.model,
          }),
        });
      });
    } catch (err: any) {
      return c.json(
        { error: "Failed to stream tutor response", details: err?.message },
        500
      );
    }
  }
);
