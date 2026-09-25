import { Router } from "express";
import { SessionsController } from "./sessions.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";

export const sessionsRouter = Router();

sessionsRouter.get("/courses/:slug/session", requireAuth, SessionsController.getSessionContext);
sessionsRouter.post("/sessions/:sessionId/messages", requireAuth, SessionsController.streamMessage);
sessionsRouter.post("/sessions/:sessionId/advance", requireAuth, SessionsController.advanceChapter);
