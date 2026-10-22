import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.js";

export const sandboxRouter = Router();

/**
 * Mandatory Security Gate:
 * Direct unconstrained code execution is disabled to prevent hostile RCE attacks
 * until full Cloudflare Sandboxes / microVM isolation is deployed.
 * Learners must execute code through authorized course practical tasks (/assessments/practical/submit).
 */
sandboxRouter.post(
  "/execute",
  requireAuth,
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(503).json({
      error: "Service Unavailable: Direct arbitrary code execution is disabled for security isolation. Please submit code via authorized course practical assessment tasks (/api/v1/assessments/practical/submit).",
      status: "DISABLED",
    });
  }
);
