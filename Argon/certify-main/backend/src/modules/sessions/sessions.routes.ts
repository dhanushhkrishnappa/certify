import { Router } from "express";
import { SessionsController } from "./sessions.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";
import { createRateLimiter } from "../../shared/middleware/rateLimit.js";

export const sessionsRouter = Router();

const tutorStreamLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40,
  keyPrefix: "tutor-stream",
});

sessionsRouter.get("/courses/:slug/session", requireAuth, SessionsController.getSessionContext);
sessionsRouter.post(
  "/sessions/:sessionId/messages",
  requireAuth,
  tutorStreamLimiter,
  SessionsController.streamMessage
);
sessionsRouter.post("/sessions/:sessionId/advance", requireAuth, SessionsController.advanceChapter);
sessionsRouter.get(
  "/sessions/:sessionId/remediation",
  requireAuth,
  SessionsController.getRemediationPlan
);
