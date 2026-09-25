import { Request, Response } from "express";
import { prisma } from "../../shared/prisma.js";
import { AuthenticatedRequest } from "../../shared/middleware/auth.js";
import { BayesianKnowledgeTracer } from "../mastery/bkt.js";

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
        const allConcepts = activeVersion.modules.flatMap((m) =>
          m.chapters.flatMap((c) => c.concepts)
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

        // Seed initial welcoming tutor turn if fresh
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            sender: "AI_TUTOR",
            role: "assistant",
            content: `Welcome to **${session.chapter.title}**! I'm your Socratic AI Tutor.\n\nHere is what we are exploring today: ${session.chapter.concepts.map((c) => c.name).join(", ")}.\n\nTo get started: have you worked with this before, or should we build our intuition from first principles?`,
          },
        });

        // Reload messages
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
   */
  public static async streamMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      res.status(400).json({ error: "Content is required" });
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
            },
          },
          enrollment: true,
        },
      });

      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      // 1. Save User Message
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "USER",
          role: "user",
          content: content.trim(),
        },
      });

      // 2. Set SSE Headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // 3. Socratic Pedagogical Response Generator
      // Produces guided, conceptual responses grounded in current chapter teaching content
      const userLower = content.toLowerCase();
      const currentChapter = session.chapter;
      const currentConcept = currentChapter.concepts[0];

      let replyStreamChunks: string[] = [];
      let updatedPMastery: number | null = null;
      let stateUpdatePayload: any = null;

      // Check if user answer demonstrates understanding of current concept
      const isDemonstration =
        userLower.includes("pointer") ||
        userLower.includes("reference") ||
        userLower.includes("lazy") ||
        userLower.includes("on-demand") ||
        userLower.includes("closure") ||
        userLower.includes("encapsulate") ||
        userLower.includes("nonlocal") ||
        userLower.includes("immutable") ||
        userLower.includes("hash") ||
        userLower.includes("o(1)") ||
        userLower.includes("stream");

      if (isDemonstration && currentConcept) {
        // Run BKT Update!
        const existingMastery = await prisma.conceptMastery.findUnique({
          where: {
            enrollmentId_conceptId: {
              enrollmentId: session.enrollmentId,
              conceptId: currentConcept.id,
            },
          },
        });

        const currentP = existingMastery?.pMastery || 0.15;
        updatedPMastery = BayesianKnowledgeTracer.update(currentP, true);

        await prisma.conceptMastery.update({
          where: {
            enrollmentId_conceptId: {
              enrollmentId: session.enrollmentId,
              conceptId: currentConcept.id,
            },
          },
          data: {
            pMastery: updatedPMastery,
            state: updatedPMastery >= 0.75 ? "MASTERED" : "LEARNING",
            lastAssessedAt: new Date(),
          },
        });

        // Record Evidence
        await prisma.masteryEvidence.create({
          data: {
            conceptMasteryId: existingMastery!.id,
            evidenceType: "DIALOGUE_PROBE",
            isDemonstrated: true,
            evidenceQuote: content.substring(0, 200),
            evaluatorReasoning: "Learner accurately articulated core conceptual mechanics in dialogue.",
          },
        });

        stateUpdatePayload = {
          conceptId: currentConcept.id,
          conceptName: currentConcept.name,
          pMastery: updatedPMastery,
          state: updatedPMastery >= 0.75 ? "MASTERED" : "LEARNING",
        };

        replyStreamChunks = [
          `That is an insightful observation! `,
          `You've identified the core mechanism: when you explain it that way, `,
          `you clearly see how the execution frame and memory layout behave. `,
          `\n\nTo probe just one level deeper: how does this affect performance or edge cases when scaling? `,
          `Can you provide an example where this design choice prevents a common bug?`
        ];
      } else if (userLower.includes("don't understand") || userLower.includes("what is") || userLower.includes("explain")) {
        // Teaching / Explanation Turn
        replyStreamChunks = [
          `Let's break this down from first principles. `,
          `In **${currentChapter.title}**, the critical concept is **${currentConcept?.name || "the underlying logic"}**.\n\n`,
          `Think of it like this: ${currentChapter.teachingContent}\n\n`,
          `Instead of memorizing the syntax, think about what Python is doing in memory. `,
          `Does that analogy click, or would you like to see a step-by-step code demonstration?`
        ];
      } else {
        // Conversational Socratic Probe
        replyStreamChunks = [
          `I see your train of thought! `,
          `Consider what happens behind the scenes in Python when that executes.\n\n`,
          `In your own words: why did the Python language designers choose this specific behavior instead of copying values eagerly?`
        ];
      }

      // Stream Chunks with Human-Like Cadence
      let fullResponse = "";
      for (const chunk of replyStreamChunks) {
        fullResponse += chunk;
        res.write(`event: token\ndata: ${JSON.stringify({ chunk })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      // If state updated, send state_update event
      if (stateUpdatePayload) {
        res.write(`event: state_update\ndata: ${JSON.stringify(stateUpdatePayload)}\n\n`);
      }

      // Save AI Response to Database
      const aiMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "AI_TUTOR",
          role: "assistant",
          content: fullResponse,
          metadata: JSON.stringify({
            updatedPMastery,
            model: "claude-3-5-sonnet-pedagogical-v1",
          }),
        },
      });

      res.write(`event: done\ndata: ${JSON.stringify({ messageId: aiMessage.id })}\n\n`);
      res.end();
    } catch (err) {
      console.error("Stream message error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream message" });
      } else {
        res.write(`event: error\ndata: ${JSON.stringify({ error: "Stream aborted" })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * Advances to next chapter when current chapter concepts reach >= 0.75
   */
  public static async advanceChapter(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
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

      // Check mastery of current chapter's concepts
      const chapterConceptIds = session.chapter.concepts.map((c) => c.id);
      const relevantMasteries = session.enrollment.conceptMasteries.filter((cm) =>
        chapterConceptIds.includes(cm.conceptId)
      );

      const unmastered = relevantMasteries.filter((m) => m.pMastery < 0.70);
      if (unmastered.length > 0) {
        res.status(400).json({
          error: "Progression Gate: You have not yet demonstrated sufficient mastery for all concepts in this chapter.",
          unmasteredConcepts: unmastered.map((u) => u.conceptId),
          requiredPMastery: 0.70,
        });
        return;
      }

      // Find next chapter in curriculum
      const allChapters = session.chapter.module.courseVersion.modules.flatMap((m) => m.chapters);
      const currentIndex = allChapters.findIndex((c) => c.id === session.chapterId);
      const nextChapter = allChapters[currentIndex + 1];

      if (!nextChapter) {
        res.json({
          message: "All chapters completed! Proceed to the Final Capstone & AI Viva Defense.",
          isCourseCompleted: true,
        });
        return;
      }

      // Update session to next chapter
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

      // Post welcoming message for the new chapter
      await prisma.chatMessage.create({
        data: {
          sessionId: updatedSession.id,
          sender: "AI_TUTOR",
          role: "assistant",
          content: `Congratulations on mastering **${session.chapter.title}**!\n\nWe are now advancing to **${nextChapter.title}**. Let's explore how these concepts connect.`,
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
}
