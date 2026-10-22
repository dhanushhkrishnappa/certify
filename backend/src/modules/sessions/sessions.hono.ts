import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { prisma } from "../../shared/prisma.js";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";
import { honoRateLimiter } from "../../shared/middleware/honoRateLimit.js";
import { BayesianKnowledgeTracer } from "../mastery/bkt.js";
import { AiProviderService } from "../ai/ai.provider.js";
import { config } from "../../config/index.js";

export const sessionsHonoRouter = new Hono();

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

    const conceptMasteries = await prisma.conceptMastery.findMany({
      where: { enrollmentId: enrollment.id },
      include: { concept: true },
    });

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

// Explicit POST to Start a Learning Session for a Chapter
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
              include: { chapters: true },
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

    let targetChapterId = body.chapterId;
    if (!targetChapterId) {
      const firstChapter = activeVersion.modules[0]?.chapters[0];
      if (!firstChapter) {
        return c.json({ error: "No chapters available in this course." }, 400);
      }
      targetChapterId = firstChapter.id;
    }

    // Deactivate previous active sessions
    await prisma.learningSession.updateMany({
      where: { enrollmentId: enrollment.id, isActive: true },
      data: { isActive: false },
    });

    // Create session and welcoming message
    const session = await prisma.learningSession.create({
      data: {
        enrollmentId: enrollment.id,
        chapterId: targetChapterId,
        phase: "TEACHING",
        isActive: true,
      },
      include: {
        chapter: {
          include: {
            concepts: {
              include: { rubrics: { include: { criteria: true } } },
            },
          },
        },
      },
    });

    const initialMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI_TUTOR",
        role: "assistant",
        content: `Welcome to **${session.chapter.title}**! I'm your Socratic AI Tutor.\n\nHere is what we are exploring: ${session.chapter.concepts.map((c) => c.name).join(", ")}.\n\nTo begin: have you worked with this concept before, or would you like to build intuition from first principles?`,
      },
    });

    return c.json(
      {
        message: "Session started successfully",
        session: {
          id: session.id,
          phase: session.phase,
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

// SSE Streaming Socratic Tutor Dialogue Endpoint
sessionsHonoRouter.post(
  "/sessions/:sessionId/messages",
  honoAuthMiddleware,
  honoRateLimiter({ maxRequests: 20, windowSeconds: 60, keyPrefix: "tutor-stream" }),
  async (c) => {
    const sessionId = c.req.param("sessionId");
    const user = c.get("user");
    const body = await c.req.json().catch(() => ({}));
    const content = (body.content || "").trim();

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        chapter: {
          include: {
            concepts: {
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

    // Enforce ownership: learner A cannot message on learner B's session
    if (session.enrollment.userId !== user.id) {
      return c.json({ error: "Forbidden: You do not own this learning session" }, 403);
    }

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
    const currentConcept = currentChapter.concepts[0];

    return streamSSE(c, async (stream) => {
      let fullAssistantReply = "";

      // Stream chunks from AI Provider with client disconnect check
      await AiProviderService.generateSocraticStream({
        teachingContent: currentChapter.teachingContent,
        conceptName: currentConcept?.name || currentChapter.title,
        history: chatHistory,
        onChunk: async (chunk: string) => {
          fullAssistantReply += chunk;
          await stream.writeSSE({
            event: "token",
            data: JSON.stringify({ chunk }),
          });
        },
        signal: c.req.raw.signal,
      });

      // Save complete assistant message
      const savedAssistantMsg = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "AI_TUTOR",
          role: "assistant",
          content: fullAssistantReply,
          metadata: JSON.stringify({ model: config.anthropicTutorModel, streamed: true }),
        },
      });

      // Perform Qualitative Rubric Evaluation (Anti-gaming check)
      if (currentConcept) {
        const rubricStatements = currentConcept.rubrics.flatMap((r) =>
          r.criteria.map((cr) => cr.criterionStatement)
        );

        const evalResult = await AiProviderService.evaluateSocraticDemonstration({
          teachingContent: currentChapter.teachingContent,
          conceptName: currentConcept.name,
          userDialogue: content,
          rubricStatements,
        });

        if (evalResult.isDemonstrated && evalResult.confidence >= 0.7) {
          const existingMastery = await prisma.conceptMastery.findUnique({
            where: {
              enrollmentId_conceptId: {
                enrollmentId: session.enrollmentId,
                conceptId: currentConcept.id,
              },
            },
          });

          const currentP = existingMastery?.pMastery || 0.15;
          const updatedPMastery = BayesianKnowledgeTracer.update(currentP, true);
          const nextState = updatedPMastery >= 0.85 ? "MASTERED" : "LEARNING";

          await prisma.$transaction([
            prisma.conceptMastery.update({
              where: {
                enrollmentId_conceptId: {
                  enrollmentId: session.enrollmentId,
                  conceptId: currentConcept.id,
                },
              },
              data: {
                pMastery: updatedPMastery,
                confidence: Math.min((existingMastery?.confidence || 0.2) + 0.15, 0.95),
                state: nextState,
                lastAssessedAt: new Date(),
              },
            }),
            prisma.masteryEvidence.create({
              data: {
                conceptMasteryId: existingMastery?.id || "",
                evidenceType: "DIALOGUE_PROBE",
                isDemonstrated: true,
                evidenceQuote: evalResult.evidenceQuote || content.slice(0, 200),
                evaluatorReasoning: evalResult.reasoning,
              },
            }),
          ]);

          await stream.writeSSE({
            event: "state_update",
            data: JSON.stringify({
              conceptId: currentConcept.id,
              conceptName: currentConcept.name,
              pMastery: updatedPMastery,
              state: nextState,
              evidenceQuote: evalResult.evidenceQuote,
            }),
          });
        }
      }

      await stream.writeSSE({
        event: "done",
        data: JSON.stringify({ messageId: savedAssistantMsg.id }),
      });
    });
  }
);

// Advance Chapter
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

    await prisma.learningSession.update({
      where: { id: sessionId },
      data: { isActive: false, phase: "ASSESSING" },
    });

    const allChapters = currentSession.enrollment.courseVersion.modules.flatMap((m) => m.chapters);
    const currentIndex = allChapters.findIndex((ch) => ch.id === currentSession.chapterId);
    const nextChapter = allChapters[currentIndex + 1];

    if (!nextChapter) {
      return c.json({
        completedCourse: true,
        message: "All chapters completed! You are ready for final assessment.",
      });
    }

    const newSession = await prisma.learningSession.create({
      data: {
        enrollmentId: currentSession.enrollmentId,
        chapterId: nextChapter.id,
        phase: "TEACHING",
        isActive: true,
      },
      include: {
        chapter: {
          include: {
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
        content: `Welcome to **${nextChapter.title}**!\n\nHere are the core concepts: ${nextChapter.concepts.map((cn) => cn.name).join(", ")}.\n\nReady to dive in?`,
      },
    });

    return c.json({
      completedCourse: false,
      session: {
        id: newSession.id,
        phase: newSession.phase,
        chapter: newSession.chapter,
        messages: [initialMessage],
      },
    });
  } catch (err: any) {
    return c.json({ error: "Failed to advance chapter", details: err?.message }, 500);
  }
});
