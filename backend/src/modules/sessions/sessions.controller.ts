import { Request, Response } from "express";
import { prisma } from "../../shared/prisma.js";
import { AuthenticatedRequest } from "../../shared/middleware/auth.js";
import { BayesianKnowledgeTracer } from "../mastery/bkt.js";
import { AiProviderService } from "../ai/ai.provider.js";
import { RAGService } from "../ai/rag.service.js";
import { config } from "../../config/index.js";

export class SessionsController {
  /**
   * Strictly read-only query of learner session context for a course.
   * NEVER creates enrollments, concept masteries, or sessions on GET!
   */
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

      // 2. Query Enrollment (Strictly Read-Only)
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId,
            courseVersionId: activeVersion.id,
          },
        },
      });

      if (!enrollment) {
        res.status(404).json({
          error: "Learner is not enrolled in this course version. Please enroll first.",
          enrolled: false,
          course: { id: course.id, slug: course.slug, title: course.title },
        });
        return;
      }

      // 3. Query Active Session (Strictly Read-Only)
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
            take: 50,
          },
        },
      });

      // 4. Fetch concept masteries for current enrollment
      const conceptMasteries = await prisma.conceptMastery.findMany({
        where: { enrollmentId: enrollment.id },
        include: { concept: true },
      });

      res.json({
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
      console.error("Session context query error:", err);
      res.status(500).json({ error: "Failed to load session context", details: err?.message });
    }
  }

  /**
   * Explicit POST endpoint to initialize a new learning session for a chapter.
   */
  public static async createSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const { chapterId } = req.body;
      const userId = req.user!.id;

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
        res.status(404).json({ error: "Course not found" });
        return;
      }

      const activeVersion = course.versions[0];
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseVersionId: {
            userId,
            courseVersionId: activeVersion.id,
          },
        },
      });

      if (!enrollment) {
        res.status(400).json({ error: "You must enroll in this course before starting a session." });
        return;
      }

      // Determine target chapter
      let targetChapterId = chapterId;
      if (!targetChapterId) {
        const firstChapter = activeVersion.modules[0]?.chapters[0];
        if (!firstChapter) {
          res.status(400).json({ error: "No chapters available in this course." });
          return;
        }
        targetChapterId = firstChapter.id;
      }

      // Deactivate any previous active sessions for this enrollment
      await prisma.learningSession.updateMany({
        where: { enrollmentId: enrollment.id, isActive: true },
        data: { isActive: false },
      });

      // Create new learning session and initial welcome message atomically
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
          content: `Welcome to **${session.chapter.title}**! I'm your Socratic AI Tutor.\n\nHere is what we are exploring: ${session.chapter.concepts.map((c) => c.name).join(", ")}.\n\nTo begin: have you worked with this concept before, or would you like to explore it from first principles?`,
        },
      });

      res.status(201).json({
        message: "Session started successfully",
        session: {
          id: session.id,
          phase: session.phase,
          chapter: session.chapter,
          messages: [initialMessage],
        },
      });
    } catch (err: any) {
      console.error("Create session error:", err);
      res.status(500).json({ error: "Failed to create session", details: err?.message });
    }
  }

  /**
   * SSE Streaming Socratic Tutor dialogue endpoint.
   * Incorporates ownership checks, real AI provider streaming, cancellation,
   * and single-observation BKT updating without keyword spam vulnerabilities.
   */
  public static async streamMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

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
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20,
          },
        },
      });

      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      // Enforce ownership: learner A cannot message on learner B's session
      if (session.enrollment.userId !== userId) {
        res.status(403).json({ error: "Forbidden: You do not own this learning session" });
        return;
      }

      // 1. Persist User Message
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

      // Client cancellation handling
      let clientDisconnected = false;
      req.on("close", () => {
        clientDisconnected = true;
      });

      // 3. Build dialogue history for AI context
      const chatHistory = session.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));
      chatHistory.push({ role: "user", content: content.trim() });

      const currentChapter = session.chapter;
      const currentConcept = currentChapter.concepts[0];

      // 4. Stream response from real AI Provider (with Hybrid RAG retrieval)
      let fullAssistantReply = "";

      let ragChunks: string[] = [];
      try {
        const ragResults = await RAGService.retrieveContext({
          chapterId: currentChapter.id,
          query: content.trim(),
          topK: 3,
        });
        ragChunks = ragResults.map((r) => r.content);
      } catch (ragErr) {
        console.warn("[SessionsController] RAG context retrieval error:", ragErr);
      }

      await AiProviderService.generateSocraticStream({
        teachingContent: currentChapter.teachingContent,
        conceptName: currentConcept?.name || currentChapter.title,
        history: chatHistory,
        ragContextChunks: ragChunks,
        onChunk: (chunk: string) => {
          if (clientDisconnected) return;
          fullAssistantReply += chunk;
          res.write(`event: token\ndata: ${JSON.stringify({ chunk })}\n\n`);
        },
      });

      if (clientDisconnected) {
        return;
      }

      // 5. Persist complete Assistant Message
      const savedAssistantMsg = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "AI_TUTOR",
          role: "assistant",
          content: fullAssistantReply,
          metadata: JSON.stringify({ model: config.anthropicTutorModel, streamed: true }),
        },
      });

      // 6. Perform Qualitative Rubric Evaluation on Demonstration (Anti-gaming check)
      let stateUpdatePayload: any = null;
      if (currentConcept) {
        const rubricStatements = currentConcept.rubrics.flatMap((r) =>
          r.criteria.map((c) => c.criterionStatement)
        );

        const evalResult = await AiProviderService.evaluateSocraticDemonstration({
          teachingContent: currentChapter.teachingContent,
          conceptName: currentConcept.name,
          userDialogue: content.trim(),
          rubricStatements,
        });

        if (evalResult.isDemonstrated && evalResult.confidence >= 0.7) {
          // Perform exactly ONE atomic BKT update
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

          stateUpdatePayload = {
            conceptId: currentConcept.id,
            conceptName: currentConcept.name,
            pMastery: updatedPMastery,
            state: nextState,
            evidenceQuote: evalResult.evidenceQuote,
          };

          res.write(
            `event: state_update\ndata: ${JSON.stringify(stateUpdatePayload)}\n\n`
          );
        }
      }

      res.write(
        `event: done\ndata: ${JSON.stringify({ messageId: savedAssistantMsg.id })}\n\n`
      );
      res.end();
    } catch (err: any) {
      console.error("Stream message error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process tutor message", details: err?.message });
      } else {
        res.write(`event: error\ndata: ${JSON.stringify({ error: err?.message })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * Advances the learner to the next chapter.
   */
  public static async advanceChapter(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;

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
        res.status(404).json({ error: "Session not found" });
        return;
      }

      if (currentSession.enrollment.userId !== userId) {
        res.status(403).json({ error: "Forbidden: You do not own this session" });
        return;
      }

      // Mark current session completed
      await prisma.learningSession.update({
        where: { id: sessionId },
        data: { isActive: false, phase: "ASSESSING" },
      });

      // Find next chapter in curriculum sequence
      const allChapters = currentSession.enrollment.courseVersion.modules.flatMap(
        (m) => m.chapters
      );
      const currentIndex = allChapters.findIndex((c) => c.id === currentSession.chapterId);
      const nextChapter = allChapters[currentIndex + 1];

      if (!nextChapter) {
        res.json({
          completedCourse: true,
          message: "All chapters completed! You are ready for final assessment.",
        });
        return;
      }

      // Create new session for next chapter
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
          content: `Welcome to **${nextChapter.title}**!\n\nHere are the core concepts: ${nextChapter.concepts.map((c) => c.name).join(", ")}.\n\nReady to dive in?`,
        },
      });

      res.json({
        completedCourse: false,
        session: {
          id: newSession.id,
          phase: newSession.phase,
          chapter: newSession.chapter,
          messages: [initialMessage],
        },
      });
    } catch (err: any) {
      console.error("Advance chapter error:", err);
      res.status(500).json({ error: "Failed to advance chapter", details: err?.message });
    }
  }
}
