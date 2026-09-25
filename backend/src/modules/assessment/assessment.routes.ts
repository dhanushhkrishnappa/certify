import { Router } from "express";
import { AssessmentController } from "./assessment.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";

export const assessmentRouter = Router();

assessmentRouter.get("/chapters/:chapterId", requireAuth, AssessmentController.getChapterQuestions);
assessmentRouter.post("/chapters/:chapterId/submit", requireAuth, AssessmentController.submitChapterAssessment);
assessmentRouter.post("/final/viva", requireAuth, AssessmentController.conductVivaTurn);
