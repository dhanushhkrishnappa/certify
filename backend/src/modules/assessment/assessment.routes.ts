import { Router } from "express";
import { AssessmentController } from "./assessment.controller.js";
import { requireAuth } from "../../shared/middleware/auth.js";
import { createRateLimiter } from "../../shared/middleware/rateLimit.js";

export const assessmentRouter = Router();

const assessmentLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  keyPrefix: "assessment",
});

assessmentRouter.get("/diagnostic/:slug", requireAuth, AssessmentController.getDiagnosticQuestions);
assessmentRouter.post("/diagnostic/submit", requireAuth, assessmentLimiter, AssessmentController.submitDiagnostic);
assessmentRouter.get("/chapters/:chapterId", requireAuth, AssessmentController.getChapterQuestions);
assessmentRouter.post(
  "/chapters/:chapterId/submit",
  requireAuth,
  assessmentLimiter,
  AssessmentController.submitChapterAssessment
);
assessmentRouter.post(
  "/remediation/submit",
  requireAuth,
  assessmentLimiter,
  AssessmentController.submitRemediationCheck
);
assessmentRouter.post(
  "/practical/submit",
  requireAuth,
  assessmentLimiter,
  AssessmentController.submitPracticalAssessment
);
assessmentRouter.post("/final/viva", requireAuth, assessmentLimiter, AssessmentController.conductVivaTurn);
