import { Router } from "express";
import { SessionsController } from "./sessions.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";
import { rateLimitMiddleware } from "../../shared/middleware/rateLimit.js";

export const sessionsRouter = Router();

// Strictly read-only query of session state
sessionsRouter.get(
  "/courses/:slug/session",
  requireAuth,
  SessionsController.getSessionContext
);

// Explicit POST to start a new learning session for a chapter
sessionsRouter.post(
  "/courses/:slug/sessions",
  requireAuth,
  SessionsController.createSession
);

// SSE Streaming Socratic Tutor dialogue with rate limiting
sessionsRouter.post(
  "/sessions/:sessionId/messages",
  requireAuth,
  rateLimitMiddleware(30, 60), // 30 AI tutor messages per minute per IP
  SessionsController.streamMessage
);

// Advance chapter sequence
sessionsRouter.post(
  "/sessions/:sessionId/advance",
  requireAuth,
  SessionsController.advanceChapter
);
