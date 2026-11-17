import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { prisma } from "../../shared/prisma.js";
import { honoAuthMiddleware, verifyEnrollmentOwnership } from "../../shared/middleware/honoAuth.js";
import { honoRateLimiter } from "../../shared/middleware/honoRateLimit.js";
import { AiProviderService } from "../ai/ai.provider.js";
import { RAGService } from "../ai/rag.service.js";
import { DriftService } from "../ai/drift.service.js";
import { RubricEvaluatorService } from "../ai/rubric.evaluator.js";
import {
  ProgressionService,
  ProgressionLockedError,
} from "../progression/progression.service.js";
import { AnalyticsService } from "../analytics/analytics.service.js";
import { config } from "../../config/index.js";

export const sessionsHonoRouter = new Hono();

// ─── GET /api/v1/courses/:slug/session ───────────────────────────────────────
// Strictly Read-Only Session Context Query (Zero Database Mutations)
sessionsHonoRouter.get("/courses/:slug/session", honoAuthMiddleware, async (c) => {
  try {
    const slug = c.req.param("slug");
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

    if (!course || !course.versions[0]) {
      return c.json({ error: "Course not found" }, 404);
    }

    const activeVersion = course.versions[0];

    // Query Enrollment (Strictly Read-Only)
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseVersionId: {
          userId: user.id,
          courseVersionId: activeVersion.id,
        },
      },
    });

    if (!enrollment) {
      return c.json(
        {
          error: "Learner is not enrolled in this course version. Please enroll first.",
          enrolled: false,
          course: { id: course.id, slug: course.slug, title: course.title },
        },
        404
      );
    }

    // Query Active Session (Strictly Read-Only)
    const session = await prisma.learningSession.findFirst({
      where: {
        enrollmentId: enrollment.id,
        isActive: true,
      },
      include: {
        chapter: {
          include: {
            module: true,
            sections: { orderBy: { sequenceOrder: "asc" } },
            concepts: {
              include: { rubrics: { include: { criteria: true } } },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          take: 50,
        },
      },
    });

    const [conceptMasteries, sectionProgresses] = await Promise.all([
      prisma.conceptMastery.findMany({
        where: { enrollmentId: enrollment.id },
        include: { concept: true },
      }),
      prisma.sectionProgress.findMany({
        where: { enrollmentId: enrollment.id },
      }),
    ]);

    const secProgMap = new Map(sectionProgresses.map((sp) => [sp.sectionId, sp]));
    const activeSection = session
      ? session.chapter.sections.find((s) => s.id === session.currentSectionId) ||
        session.chapter.sections[0] ||
        null
      : null;

    return c.json({
      course: { id: course.id, slug: course.slug, title: course.title },
      enrollment: {
        id: enrollment.id,
        currentTier: enrollment.currentTier,
        status: enrollment.status,
      },
      session: session
        ? {
            id: session.id,
            phase: session.phase,
            currentSectionId: activeSection?.id || null,
            activeSection: activeSection
              ? {
                  id: activeSection.id,
                  sectionType: activeSection.sectionType,
                  title: activeSection.title,
                  objective: activeSection.objective,
                  sequenceOrder: activeSection.sequenceOrder,
                  minTurns: activeSection.minTurns,
                  status: secProgMap.get(activeSection.id)?.status || "UNLOCKED",
                  turnsCompleted: secProgMap.get(activeSection.id)?.turnsCompleted || 0,
                }
              : null,
            chapter: session.chapter,
            messages: session.messages,
          }
        : null,
      conceptMasteries,
      curriculum: activeVersion.modules,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to load session context", details: err?.message }, 500);
  }
});

// ─── GET /api/v1/courses/:slug/progression ───────────────────────────────────
// Returns backend-authoritative lock tree (Modules -> Chapters -> Sections -> Criteria)
sessionsHonoRouter.get("/courses/:slug/progression", honoAuthMiddleware, async (c) => {
  try {
    const slug = c.req.param("slug");
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
      return c.json({ error: "Learner is not enrolled in this course.", enrolled: false }, 404);
    }

    const tree = await ProgressionService.getProgressionTree(enrollment.id);
    return c.json({ progression: tree });
  } catch (err: any) {
    return c.json({ error: "Failed to load progression tree", details: err?.message }, 500);
  }
});

// ─── GET /api/v1/enrollments/:enrollmentId/skills-report ─────────────────────
// Returns deterministic Strengths, Weakpoints, Cognitive Breakdown & Rubric Matrix
sessionsHonoRouter.get("/enrollments/:enrollmentId/skills-report", honoAuthMiddleware, async (c) => {
  try {
    const enrollmentId = c.req.param("enrollmentId") || "";
    const user = c.get("user");

    const ownership = await verifyEnrollmentOwnership(enrollmentId, user.id);
    if (ownership.status === "forbidden") {
      return c.json({ error: "Forbidden: You do not own this enrollment" }, 403);
    }
    if (ownership.status === "not_found") {
      return c.json({ error: "Enrollment not found" }, 404);
    }

    const report = await AnalyticsService.getSkillsReport(enrollmentId);
    return c.json({ report });
  } catch (err: any) {
    return c.json({ error: "Failed to compute skills report", details: err?.message }, 500);
  }
});

// ─── GET /api/v1/courses/:slug/skills-report ─────────────────────────────────
sessionsHonoRouter.get("/courses/:slug/skills-report", honoAuthMiddleware, async (c) => {
  try {
    const slug = c.req.param("slug");
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
      return c.json({ error: "Not enrolled in this course" }, 404);
    }

    const report = await AnalyticsService.getSkillsReport(enrollment.id);
    return c.json({ report });
  } catch (err: any) {
    return c.json({ error: "Failed to compute skills report", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/courses/:slug/sessions ─────────────────────────────────────
// Explicit POST to Start/Switch Learning Session (STRICTLY GATED BY LOCK STATE)
sessionsHonoRouter.post("/courses/:slug/sessions", honoAuthMiddleware, async (c) => {
  try {
    const slug = c.req.param("slug");
    const body = await c.req.json().catch(() => ({}));
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
                chapters: { orderBy: { sequenceOrder: "asc" } },
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
    });

    if (!enrollment) {
      return c.json({ error: "You must enroll in this course before starting a session." }, 400);
    }

    await ProgressionService.ensureInitialized(enrollment.id);

    let targetChapterId = body.chapterId || enrollment.currentChapterId;
    if (!targetChapterId) {
      const firstChapter = activeVersion.modules[0]?.chapters[0];
      if (!firstChapter) {
        return c.json({ error: "No chapters available in this course." }, 400);
      }
      targetChapterId = firstChapter.id;
    }

    // HARD BACKEND GATE: Prevent jumping into any locked module or chapter!
    try {
      await ProgressionService.assertChapterUnlocked(enrollment.id, targetChapterId);
    } catch (lockErr: any) {
      if (lockErr instanceof ProgressionLockedError) {
        return c.json(lockErr.toJSON(), 403);
      }
      throw lockErr;
    }

    const activeSection = await ProgressionService.resolveActiveSection(
      enrollment.id,
      targetChapterId,
      body.sectionId || null
    );

    // Deactivate previous active sessions
    await prisma.learningSession.updateMany({
      where: { enrollmentId: enrollment.id, isActive: true },
      data: { isActive: false },
    });

    // Reuse or create session for this chapter
    const session = await prisma.learningSession.create({
      data: {
        enrollmentId: enrollment.id,
        chapterId: targetChapterId,
        currentSectionId: activeSection?.id || null,
        phase:
          activeSection?.sectionType === "CHAPTER_CHECKPOINT"
            ? "CHECKING"
            : activeSection?.sectionType === "MODULE_PRACTICAL"
            ? "ASSESSING"
            : "TEACHING",
        isActive: true,
      },
      include: {
        chapter: {
          include: {
            module: true,
            sections: { orderBy: { sequenceOrder: "asc" } },
            concepts: {
              include: { rubrics: { include: { criteria: true } } },
            },
          },
        },
      },
    });

    const cleanChapterTitle = session.chapter.title.replace(/^\*+\s*/, "").trim();
    const sectionIntro = activeSection
      ? `\n\n**Active Section:** ${activeSection.title}\n**Objective:** ${activeSection.objective}`
      : "";

    const initialMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI_TUTOR",
        role: "assistant",
        content:
          `Welcome to **${session.chapter.module.title} → ${cleanChapterTitle}**!${sectionIntro}\n\n` +
          `Let's build your intuition step by step. In your own words, what do you already know about **${session.chapter.concepts[0]?.name || cleanChapterTitle}**?`,
      },
    });

    return c.json(
      {
        message: "Session started successfully",
        session: {
          id: session.id,
          phase: session.phase,
          currentSectionId: activeSection?.id || null,
          activeSection: activeSection
            ? {
                id: activeSection.id,
                sectionType: activeSection.sectionType,
                title: activeSection.title,
                objective: activeSection.objective,
                sequenceOrder: activeSection.sequenceOrder,
                minTurns: activeSection.minTurns,
              }
            : null,
          chapter: session.chapter,
          messages: [initialMessage],
        },
      },
      201
    );
  } catch (err: any) {
    return c.json({ error: "Failed to create session", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/sessions/:sessionId/sections/advance ───────────────────────
// Deterministically advances Section S_k -> S_{k+1} ONLY if backend gate is satisfied
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
      if (!session) {
        return c.json({ error: "Session not found" }, 404);
      }
      if (session.enrollment.userId !== user.id) {
        return c.json({ error: "Forbidden: You do not own this session" }, 403);
      }

      const result = await ProgressionService.advanceSection(session.enrollmentId, sessionId);

      // Post a concise backend transition message in the chat log
      if (result.nextSection) {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            sender: "AI_TUTOR",
            role: "assistant",
            content:
              `Section completed: **${result.completedSection.title}**.\n\n` +
              `Now starting **${result.nextSection.title}**.\n**Objective:** ${result.nextSection.objective}`,
          },
        });
      }

      return c.json({
        message: "Advanced to next section",
        ...result,
      });
    } catch (err: any) {
      if (err instanceof ProgressionLockedError) {
        return c.json(err.toJSON(), 403);
      }
      return c.json({ error: "Failed to advance section", details: err?.message }, 500);
    }
  }
);

// ─── POST /api/v1/sessions/:sessionId/messages ───────────────────────────────
// Hard-Fenced Scoped RAG + Drift Guardrail + Hybrid Rubric Evaluation + SSE Stream
sessionsHonoRouter.post(
  "/sessions/:sessionId/messages",
  honoAuthMiddleware,
  honoRateLimiter({ maxRequests: 20, windowSeconds: 60, keyPrefix: "tutor-stream" }),
  async (c) => {
    const sessionId = c.req.param("sessionId");
    const user = c.get("user");
    const body = await c.req.json().catch(() => ({}));
    const content = (body.content || body.message || "").trim();

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        chapter: {
          include: {
            module: true,
            sections: { orderBy: { sequenceOrder: "asc" } },
            concepts: {
              orderBy: { sequenceOrder: "asc" },
              include: { rubrics: { include: { criteria: true } } },
            },
          },
        },
        enrollment: true,
        messages: {
          orderBy: { createdAt: "asc" },
          take: 20,
        },
      },
    });

    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (session.enrollment.userId !== user.id) {
      return c.json({ error: "Forbidden: You do not own this learning session" }, 403);
    }

    // HARD BACKEND GATE: Verify chapter is unlocked
    try {
      await ProgressionService.assertChapterUnlocked(session.enrollmentId, session.chapterId);
    } catch (lockErr: any) {
      if (lockErr instanceof ProgressionLockedError) {
        return c.json(lockErr.toJSON(), 403);
      }
      throw lockErr;
    }

    // Resolve active section
    const activeSection =
      session.chapter.sections.find((s) => s.id === session.currentSectionId) ||
      session.chapter.sections[0] ||
      null;

    // Persist User Message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "USER",
        role: "user",
        content,
      },
    });

    const chatHistory = session.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));
    chatHistory.push({ role: "user", content });

    const currentChapter = session.chapter;
    const currentModule = currentChapter.module;
    const activeConcept = currentChapter.concepts[0];
    const allChapterCriteria = currentChapter.concepts.flatMap((cn) =>
      cn.rubrics.flatMap((r) => r.criteria)
    );

    // Load unmet rubric criteria & known misconceptions for targeted Socratic probing
    const existingCriterionMasteries = await prisma.rubricCriterionMastery.findMany({
      where: {
        enrollmentId: session.enrollmentId,
        rubricCriterionId: { in: allChapterCriteria.map((cr) => cr.id) },
      },
    });
    const critMasteryMap = new Map(
      existingCriterionMasteries.map((m) => [m.rubricCriterionId, m])
    );

    const unmetCriteria = allChapterCriteria
      .filter((cr) => {
        const st = critMasteryMap.get(cr.id)?.status;
        return st !== "DEMONSTRATED" && st !== "MASTERED";
      })
      .map((cr) => cr.criterionStatement);

    const knownMisconceptions = existingCriterionMasteries
      .filter((m) => Boolean(m.lastMisconception))
      .map((m) => m.lastMisconception as string);

    // Layer 1 & 2 Anti-Topic-Drift & Skip-Attempt Guardrail
    const driftResult = DriftService.classifyMessage({
      message: content,
      activeModuleOrder: currentModule.sequenceOrder,
      activeModuleTitle: currentModule.title,
      activeChapterTitle: currentChapter.title,
      activeSectionTitle: activeSection?.title || currentChapter.title,
      activeSectionObjective:
        activeSection?.objective || `Master ${activeConcept?.name || currentChapter.title}`,
      activeConceptName: activeConcept?.name || currentChapter.title,
    });

    if (driftResult.isDrifting) {
      await DriftService.logDriftEvent({
        sessionId: session.id,
        enrollmentId: session.enrollmentId,
        activeChapterId: currentChapter.id,
        activeSectionId: activeSection?.id || null,
        driftResult,
        learnerMessage: content,
      });
    }

    return streamSSE(c, async (stream) => {
      let fullAssistantReply = "";

      if (driftResult.isDrifting) {
        await stream.writeSSE({
          event: "drift_redirect",
          data: JSON.stringify({
            classification: driftResult.classification,
            targetModuleTitle: driftResult.detectedTargetModuleTitle || null,
            activeModuleTitle: currentModule.title,
            activeSectionTitle: activeSection?.title || currentChapter.title,
          }),
        });
      }

      // Deterministic immediate redirect on explicit SKIP_ATTEMPT (zero LLM cost, zero state change)
      if (driftResult.classification === "SKIP_ATTEMPT" && driftResult.deterministicReply) {
        fullAssistantReply = driftResult.deterministicReply;
        await stream.writeSSE({
          event: "token",
          data: JSON.stringify({ chunk: fullAssistantReply }),
        });

        const savedMsg = await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            sender: "AI_TUTOR",
            role: "assistant",
            content: fullAssistantReply,
            metadata: JSON.stringify({ guardrail: "SKIP_ATTEMPT_BLOCKED" }),
          },
        });

        await stream.writeSSE({
          event: "done",
          data: JSON.stringify({ messageId: savedMsg.id }),
        });
        return;
      }

      // Hard-Fenced Scoped RAG Retrieval (strictly <= activeModuleOrder, section-boosted)
      let ragChunks: string[] = [];
      try {
        const cleanModSlug =
          currentModule.slug ||
          currentModule.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^module-\d+-/, "");

        const ragResults = await RAGService.retrieveContext({
          chapterId: currentChapter.id,
          sectionId: activeSection?.id,
          moduleSlug: cleanModSlug,
          moduleOrder: currentModule.sequenceOrder,
          allowPrerequisites: true,
          query: content,
          topK: 3,
        });
        ragChunks = ragResults.map((r) => r.content);
      } catch (ragErr) {
        console.warn("[Sessions] Hard-fenced RAG error:", ragErr);
      }

      // Stream grounded Socratic Tutor reply with strict Section-Scoped Prompt Contract
      const streamRes = await AiProviderService.generateSocraticStream({
        courseTitle: "CERTIFY – Python Fundamentals",
        moduleTitle: currentModule.title,
        chapterTitle: currentChapter.title,
        sectionTitle: activeSection?.title,
        sectionObjective: activeSection?.objective,
        teachingContent: activeSection?.content || currentChapter.teachingContent,
        conceptName: activeConcept?.name || currentChapter.title,
        unmetCriteria,
        knownMisconceptions,
        guardrailDirective: driftResult.guardrailDirective,
        history: chatHistory,
        ragContextChunks: ragChunks,
        onChunk: async (chunk: string) => {
          fullAssistantReply += chunk;
          await stream.writeSSE({
            event: "token",
            data: JSON.stringify({ chunk }),
          });
        },
        signal: c.req.raw.signal,
      });

      const savedAssistantMsg = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "AI_TUTOR",
          role: "assistant",
          content: fullAssistantReply,
          metadata: JSON.stringify({
            model: streamRes.modelUsed || config.geminiTutorModel,
            sectionId: activeSection?.id || null,
            drift: driftResult.classification,
            streamed: true,
          }),
        },
      });

      // Deterministic Progression + Hybrid Rubric Evaluation (ONLY when on-topic / non-drifting)
      if (!driftResult.isDrifting) {
        let bestRubricPassRatio = 0;
        let anyCriteriaUpdated = false;

        // Evaluate learner dialogue against ALL concepts & rubric criteria in this chapter
        for (const concept of currentChapter.concepts) {
          const criteria = concept.rubrics.flatMap((r) => r.criteria);
          if (criteria.length === 0) continue;

          const evalResult = await RubricEvaluatorService.evaluateResponse({
            conceptName: concept.name,
            learnerText: content,
            criteria,
            mode: "DIALOGUE",
          });

          const persisted = await RubricEvaluatorService.persistEvaluationResults({
            enrollmentId: session.enrollmentId,
            conceptId: concept.id,
            sectionId: activeSection?.id || null,
            evidenceType: "DIALOGUE_PROBE",
            evaluation: evalResult,
            criteria,
            capDialogueMastery: true, // Checkpoint required for MASTERED (>= 0.85)
          });

          bestRubricPassRatio = Math.max(bestRubricPassRatio, evalResult.weightedScore);

          if (persisted.updatedCriteria.length > 0) {
            anyCriteriaUpdated = true;
            await stream.writeSSE({
              event: "rubric_update",
              data: JSON.stringify({
                conceptId: concept.id,
                conceptName: concept.name,
                pMastery: persisted.conceptPMastery,
                state: persisted.conceptState,
                weightedScore: evalResult.weightedScore,
                updatedCriteria: persisted.updatedCriteria,
              }),
            });

            // Legacy compatibility event for existing clients/tests
            await stream.writeSSE({
              event: "state_update",
              data: JSON.stringify({
                conceptId: concept.id,
                conceptName: concept.name,
                pMastery: persisted.conceptPMastery,
                state: persisted.conceptState,
                evidenceQuote: content.slice(0, 180),
              }),
            });
          }
        }

        const isSubstantiveTurn = content.trim().length >= 12;
        let autoAdvanced = false;
        if (activeSection && isSubstantiveTurn) {
          const sectionTurnState = await ProgressionService.recordSectionTurn({
            enrollmentId: session.enrollmentId,
            chapterId: currentChapter.id,
            moduleId: currentModule.id,
            sectionId: activeSection.id,
            sessionId: session.id,
            rubricPassRatio: bestRubricPassRatio,
          });
          autoAdvanced = Boolean(sectionTurnState.autoAdvanced);

          await stream.writeSSE({
            event: "section_status",
            data: JSON.stringify({
              sectionId: activeSection.id,
              sectionType: activeSection.sectionType,
              ...sectionTurnState,
            }),
          });
        }

        if (anyCriteriaUpdated || autoAdvanced) {
          await AnalyticsService.recomputeSkillProfile(session.enrollmentId).catch((e) =>
            console.warn("[Analytics] Recompute warning:", e?.message || e)
          );
        }
      }

      await stream.writeSSE({
        event: "done",
        data: JSON.stringify({ messageId: savedAssistantMsg.id }),
      });
    });
  }
);

// ─── POST /api/v1/courses/:slug/chat ─────────────────────────────────────────
// Public Guest Preview (Strictly locked to Module 01 -> Lesson 01 -> Section 1)
sessionsHonoRouter.post(
  "/courses/:slug/chat",
  honoRateLimiter({ maxRequests: 30, windowSeconds: 60, keyPrefix: "public-chat" }),
  async (c) => {
    const slug = c.req.param("slug") || "";
    const body = await c.req.json().catch(() => ({}));
    const content = (body.content || body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        versions: {
          where: { isActive: true },
          include: {
            modules: {
              take: 1,
              orderBy: { sequenceOrder: "asc" },
              include: {
                chapters: {
                  take: 1,
                  orderBy: { sequenceOrder: "asc" },
                  include: {
                    sections: { take: 1, orderBy: { sequenceOrder: "asc" } },
                    concepts: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const activeVersion = course?.versions[0];
    const firstMod = activeVersion?.modules[0];
    const firstChapter = firstMod?.chapters[0];
    const firstSection = firstChapter?.sections[0];
    const firstConcept = firstChapter?.concepts[0];

    const driftResult = DriftService.classifyMessage({
      message: content,
      activeModuleOrder: 1,
      activeModuleTitle: firstMod?.title || "Module 01 – Python Foundations",
      activeChapterTitle: firstChapter?.title || "Python Execution & Indentation",
      activeSectionTitle: firstSection?.title || "1. Core Intuition & Mental Model",
      activeSectionObjective:
        firstSection?.objective || "Build intuition for Python execution and indentation.",
      activeConceptName: firstConcept?.name || "Python Foundations",
    });

    return streamSSE(c, async (stream) => {
      if (driftResult.classification === "SKIP_ATTEMPT" && driftResult.deterministicReply) {
        await stream.writeSSE({
          event: "token",
          data: JSON.stringify({
            chunk:
              driftResult.deterministicReply +
              "\n\n*(Sign in & enroll to track verified mastery and unlock Modules 02–10.)*",
          }),
        });
        await stream.writeSSE({
          event: "done",
          data: JSON.stringify({ messageId: "public-" + Date.now() }),
        });
        return;
      }

      let ragChunks: string[] = [];
      try {
        const ragResults = await RAGService.retrieveContext({
          chapterId: firstChapter?.id,
          sectionId: firstSection?.id,
          moduleSlug: firstMod?.slug || "python-foundations",
          moduleOrder: 1,
          allowPrerequisites: false,
          query: content,
          topK: 3,
        });
        ragChunks = ragResults.map((r) => r.content);
      } catch (ragErr) {
        console.warn("[PublicChat] RAG retrieval error:", ragErr);
      }

      const chatHistory = history.map((h: any) => ({
        role: h.role as "user" | "assistant" | "system",
        content: h.content,
      }));
      chatHistory.push({ role: "user", content });

      await AiProviderService.generateSocraticStream({
        courseTitle: course?.title || "CERTIFY – Python Fundamentals",
        moduleTitle: firstMod?.title || "Module 01 – Python Foundations (Guest Preview)",
        chapterTitle: firstChapter?.title || "Python Execution & Indentation",
        sectionTitle: firstSection?.title,
        sectionObjective: firstSection?.objective,
        teachingContent:
          firstSection?.content ||
          firstChapter?.teachingContent ||
          "First-principles Python semantics.",
        conceptName: firstConcept?.name || "Python Fundamentals",
        guardrailDirective: driftResult.guardrailDirective,
        history: chatHistory,
        ragContextChunks: ragChunks,
        onChunk: async (chunk: string) => {
          await stream.writeSSE({
            event: "token",
            data: JSON.stringify({ chunk }),
          });
        },
        signal: c.req.raw.signal,
      });

      await stream.writeSSE({
        event: "done",
        data: JSON.stringify({ messageId: "public-" + Date.now() }),
      });
    });
  }
);

// ─── POST /api/v1/sessions/:sessionId/advance ────────────────────────────────
// Strictly Gated Chapter Advancement (Requires Current Chapter COMPLETED & Next UNLOCKED!)
sessionsHonoRouter.post("/sessions/:sessionId/advance", honoAuthMiddleware, async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const user = c.get("user");

    const currentSession = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        chapter: { include: { module: true } },
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
        },
      },
    });

    if (!currentSession) {
      return c.json({ error: "Session not found" }, 404);
    }

    if (currentSession.enrollment.userId !== user.id) {
      return c.json({ error: "Forbidden: You do not own this session" }, 403);
    }

    await ProgressionService.ensureInitialized(currentSession.enrollmentId);

    // HARD GATE: Current chapter MUST be COMPLETED before advancing!
    const currentChProg = await prisma.chapterProgress.findUnique({
      where: {
        enrollmentId_chapterId: {
          enrollmentId: currentSession.enrollmentId,
          chapterId: currentSession.chapterId,
        },
      },
    });

    if (!currentChProg || currentChProg.status !== "COMPLETED") {
      return c.json(
        new ProgressionLockedError({
          message: `Cannot advance past "${currentSession.chapter.title}". Complete all sections, pass the Chapter Checkpoint (>= 70%), and pass the Module Practical Task (if final chapter) first.`,
          lockedEntity: {
            type: "CHAPTER",
            id: currentSession.chapterId,
            title: currentSession.chapter.title,
          },
          prerequisites: [
            {
              type: "CHAPTER",
              id: currentSession.chapterId,
              title: currentSession.chapter.title,
              status: currentChProg?.status || "IN_PROGRESS",
              missingCriteria: [
                "Complete all lesson sections",
                "Pass Chapter Conceptual Checkpoint (>= 70%)",
              ],
            },
          ],
        }).toJSON(),
        403
      );
    }

    const allChapters = currentSession.enrollment.courseVersion.modules.flatMap((m) => m.chapters);
    const currentIndex = allChapters.findIndex((ch) => ch.id === currentSession.chapterId);
    const nextChapter = allChapters[currentIndex + 1];

    if (!nextChapter) {
      return c.json({
        completedCourse: true,
        message: "All modules and chapters completed! You are ready for final certification.",
      });
    }

    // Also verify next chapter & its module are officially UNLOCKED
    try {
      await ProgressionService.assertChapterUnlocked(currentSession.enrollmentId, nextChapter.id);
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

    await prisma.enrollment.update({
      where: { id: currentSession.enrollmentId },
      data: { currentChapterId: nextChapter.id },
    });

    const firstSection = nextChapter.sections[0] || null;
    const newSession = await prisma.learningSession.create({
      data: {
        enrollmentId: currentSession.enrollmentId,
        chapterId: nextChapter.id,
        currentSectionId: firstSection?.id || null,
        phase: "TEACHING",
        isActive: true,
      },
      include: {
        chapter: {
          include: {
            module: true,
            sections: { orderBy: { sequenceOrder: "asc" } },
            concepts: {
              include: { rubrics: { include: { criteria: true } } },
            },
          },
        },
      },
    });

    const initialMessage = await prisma.chatMessage.create({
      data: {
        sessionId: newSession.id,
        sender: "AI_TUTOR",
        role: "assistant",
        content:
          `Welcome to **${newSession.chapter.module.title} → ${nextChapter.title}**!\n\n` +
          (firstSection ? `**Active Section:** ${firstSection.title}\n**Objective:** ${firstSection.objective}\n\n` : "") +
          `Ready to build intuition for **${nextChapter.concepts[0]?.name || nextChapter.title}**?`,
      },
    });

    return c.json({
      completedCourse: false,
      session: {
        id: newSession.id,
        phase: newSession.phase,
        currentSectionId: firstSection?.id || null,
        activeSection: firstSection,
        chapter: newSession.chapter,
        messages: [initialMessage],
      },
    });
  } catch (err: any) {
    return c.json({ error: "Failed to advance chapter", details: err?.message }, 500);
  }
});
