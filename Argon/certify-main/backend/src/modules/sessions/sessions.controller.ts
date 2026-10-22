import { Response } from "express";
import { z } from "zod";
import { prisma } from "../../shared/prisma.js";
import { AuthenticatedRequest } from "../../shared/middleware/auth.js";
import { AIProvider, AIProviderError } from "../ai/ai.provider.js";
import { config } from "../../config/index.js";

const MessageInputSchema = z.object({
  content: z.string().trim().min(1, "Message content is required").max(4000, "Message exceeds 4000 chars"),
});

export class SessionsController {
  public static async getSessionContext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const userId = req.user!.id;

      // 1. Find Course & Active Version
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
        res.status(404).json({ error: "Course not found" });
        return;
      }

      const activeVersion = course.versions[0];

      // 2. Find or Auto-Enroll User
      let enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId,
            courseVersionId: activeVersion.id,
          },
        },
      });

      if (!enrollment) {
        enrollment = await prisma.enrollment.create({
          data: {
            userId,
            courseVersionId: activeVersion.id,
            status: "ACTIVE",
            currentTier: "EASY",
          },
        });

        // Initialize ConceptMastery
        const allConcepts = activeVersion.modules.flatMap((m: any) =>
          m.chapters.flatMap((c: any) => c.concepts)
        );
        for (const concept of allConcepts) {
          await prisma.conceptMastery.create({
            data: {
              enrollmentId: enrollment.id,
              conceptId: concept.id,
              pMastery: 0.15,
              confidence: 0.20,
              state: "UNENCOUNTERED",
            },
          });
        }
      }

      // 3. Find or Create Active Session
      const firstChapter = activeVersion.modules[0]?.chapters[0];
      let session = await prisma.learningSession.findFirst({
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
            take: 30,
          },
        },
      });

      if (!session && firstChapter) {
        session = await prisma.learningSession.create({
          data: {
            enrollmentId: enrollment.id,
            chapterId: firstChapter.id,
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
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        });

        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            sender: "AI_TUTOR",
            role: "assistant",
            content: `Welcome to **${session.chapter.title}**! I'm your Socratic AI Tutor.\n\nHere is what we are exploring in this chapter: ${session.chapter.concepts.map((c: any) => c.name).join(", ")}.\n\nTo get started: have you worked with this before, or should we build our intuition from first principles?`,
            metadata: JSON.stringify({ promptVersion: config.promptVersion }),
          },
        });

        session.messages = await prisma.chatMessage.findMany({
          where: { sessionId: session.id },
          orderBy: { createdAt: "asc" },
        });
      }

      // 4. Fetch concept masteries for current enrollment
      const conceptMasteries = await prisma.conceptMastery.findMany({
        where: { enrollmentId: enrollment.id },
        include: { concept: true },
      });

      res.json({
        course: { id: course.id, slug: course.slug, title: course.title },
        enrollment: { id: enrollment.id, currentTier: enrollment.currentTier, status: enrollment.status },
        session: {
          id: session!.id,
          phase: session!.phase,
          chapter: session!.chapter,
          messages: session!.messages,
        },
        conceptMasteries,
        curriculum: activeVersion.modules,
      });
    } catch (err) {
      console.error("Session context error:", err);
      res.status(500).json({ error: "Failed to load session context" });
    }
  }

  /**
   * SSE Streaming Socratic Tutor dialogue endpoint.
   * Enforces strict session ownership (IDOR protection) and Non-Negotiable Principle B:
   * Tutor dialogue teaches and probes, but NEVER directly grants mastery or certification credit.
   */
  public static async streamMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    let parsedBody: { content: string };
    try {
      parsedBody = MessageInputSchema.parse(req.body);
    } catch (err: any) {
      res.status(400).json({ error: "Content is required and must be 1-4000 characters" });
      return;
    }

    try {
      const session = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: {
          chapter: {
            include: {
              concepts: {
                include: { rubrics: { include: { criteria: true } } },
              },
              module: {
                include: {
                  courseVersion: {
                    include: { course: true },
                  },
                },
              },
            },
          },
          enrollment: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 12,
          },
        },
      });

      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      // P0 IDOR / Resource Ownership Enforcement
      if (session.enrollment.userId !== userId) {
        res.status(403).json({ error: "Forbidden: You do not own this learning session" });
        return;
      }

      // Verify AI Provider availability before opening SSE stream
      AIProvider.assertConfiguredOrFallbackAllowed();

      // 1. Save User Message
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "USER",
          role: "user",
          content: parsedBody.content,
        },
      });

      // 2. Set SSE Headers & Abort Handling
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const abortController = new AbortController();
      req.on("close", () => {
        if (!res.writableEnded) {
          abortController.abort();
        }
      });

      const streamResult = await AIProvider.streamTutorReply(
        {
          courseTitle: session.chapter.module.courseVersion.course.title,
          chapterTitle: session.chapter.title,
          teachingContent: session.chapter.teachingContent,
          concepts: session.chapter.concepts.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description,
          })),
          history: session.messages.map((m: any) => ({
            role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
            content: m.content,
          })),
          learnerMessage: parsedBody.content,
        },
        (chunk: string) => {
          if (!res.writableEnded) {
            res.write(`event: token\ndata: ${JSON.stringify({ chunk })}\n\n`);
          }
        },
        abortController.signal
      );

      // Save AI Response to Database with truthful provider/model metadata
      const aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "AI_TUTOR",
          role: "assistant",
          content: streamResult.fullText,
          metadata: JSON.stringify({
            provider: streamResult.provider,
            model: streamResult.model,
            promptVersion: config.promptVersion,
          }),
        },
      });

      if (!res.writableEnded) {
        res.write(`event: done\ndata: ${JSON.stringify({ messageId: aiMessage.id })}\n\n`);
        res.end();
      }
    } catch (err: any) {
      if (err instanceof AIProviderError && !res.headersSent) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream message" });
      } else if (!res.writableEnded) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: "Stream aborted" })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * Advances to next chapter when all current chapter concepts have pMastery >= 0.70
   * and zero concepts are in NEEDS_REMEDIATION state.
   */
  public static async advanceChapter(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;

      const session = await prisma.learningSession.findUnique({
        where: { id: sessionId },
        include: {
          chapter: {
            include: {
              concepts: true,
              module: {
                include: {
                  courseVersion: {
                    include: {
                      modules: {
                        orderBy: { sequenceOrder: "asc" },
                        include: { chapters: { orderBy: { sequenceOrder: "asc" } } },
                      },
                    },
                  },
                },
              },
            },
          },
          enrollment: {
            include: { conceptMasteries: true },
          },
        },
      });

      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      // P0 IDOR / Resource Ownership Enforcement
      if (session.enrollment.userId !== userId) {
        res.status(403).json({ error: "Forbidden: You do not own this learning session" });
        return;
      }

      const chapterConceptIds = session.chapter.concepts.map((c: any) => c.id);
      const relevantMasteries = session.enrollment.conceptMasteries.filter((cm: any) =>
        chapterConceptIds.includes(cm.conceptId)
      );

      const unmastered = relevantMasteries.filter(
        (m: any) => m.pMastery < 0.70 || m.state === "NEEDS_REMEDIATION"
      );
      if (unmastered.length > 0 || relevantMasteries.length < chapterConceptIds.length) {
        res.status(400).json({
          error:
            "Progression Gate: You have not yet demonstrated sufficient mastery (>= 0.70 with no pending remediation) for all concepts in this chapter.",
          unmasteredConcepts: unmastered.map((u: any) => u.conceptId),
          requiredPMastery: 0.70,
        });
        return;
      }

      const allChapters = session.chapter.module.courseVersion.modules.flatMap(
        (m: any) => m.chapters
      );
      const currentIndex = allChapters.findIndex((c: any) => c.id === session.chapterId);
      const nextChapter = allChapters[currentIndex + 1];

      if (!nextChapter) {
        res.json({
          message: "All chapters completed! Proceed to the Final Capstone & AI Viva Defense.",
          isCourseCompleted: true,
        });
        return;
      }

      const updatedSession = await prisma.learningSession.update({
        where: { id: session.id },
        data: {
          chapterId: nextChapter.id,
          phase: "TEACHING",
        },
        include: {
          chapter: {
            include: { concepts: true },
          },
        },
      });

      await prisma.chatMessage.create({
        data: {
          sessionId: updatedSession.id,
          sender: "AI_TUTOR",
          role: "assistant",
          content: `Congratulations on mastering **${session.chapter.title}**!\n\nWe are now advancing to **${nextChapter.title}**. Let's explore how these concepts connect.`,
          metadata: JSON.stringify({ promptVersion: config.promptVersion }),
        },
      });

      res.json({
        message: "Advanced to next chapter successfully",
        nextChapter: {
          id: nextChapter.id,
          title: nextChapter.title,
        },
      });
    } catch (err) {
      console.error("Advance chapter error:", err);
      res.status(500).json({ error: "Failed to advance chapter" });
    }
  }

  /**
   * Returns targeted remediation plan for weak concepts in the active session's chapter.
   */
  public static async getRemediationPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;

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
          enrollment: {
            include: {
              conceptMasteries: {
                include: { concept: true },
              },
            },
          },
        },
      });

      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      if (session.enrollment.userId !== userId) {
        res.status(403).json({ error: "Forbidden: You do not own this learning session" });
        return;
      }

      const chapterConceptIds = new Set(session.chapter.concepts.map((c: any) => c.id));
      const chapterMasteries = session.enrollment.conceptMasteries.filter((cm: any) =>
        chapterConceptIds.has(cm.conceptId)
      );

      const weakMasteries = chapterMasteries.filter(
        (cm: any) => cm.state === "NEEDS_REMEDIATION" || cm.pMastery < 0.70
      );
      const targetConcept =
        session.chapter.concepts.find((c: any) =>
          weakMasteries.some((wm: any) => wm.conceptId === c.id)
        ) || session.chapter.concepts[0];

      res.json({
        sessionId: session.id,
        enrollmentId: session.enrollmentId,
        chapterId: session.chapter.id,
        chapterTitle: session.chapter.title,
        targetConcept: targetConcept
          ? {
              id: targetConcept.id,
              slug: targetConcept.slug,
              name: targetConcept.name,
              description: targetConcept.description,
              alternativeExplanation: `First-Principles Remediation for ${targetConcept.name}: ${session.chapter.teachingContent}`,
              recoveryPrompt: `In your own words, explain the core mechanism of ${targetConcept.name} and how it prevents common Python bugs.`,
              criteria: targetConcept.rubrics.flatMap((r: any) => r.criteria),
            }
          : null,
        weakConceptsCount: weakMasteries.length,
      });
    } catch (err) {
      console.error("Get remediation plan error:", err);
      res.status(500).json({ error: "Failed to load remediation plan" });
    }
  }
}
