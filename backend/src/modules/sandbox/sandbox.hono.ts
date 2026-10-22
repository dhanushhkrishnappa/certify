import { Hono } from "hono";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";

export const sandboxHonoRouter = new Hono();

/**
 * Mandatory Security Gate:
 * Direct unconstrained arbitrary code execution remains disabled to prevent hostile RCE attacks
 * until full Cloudflare Container / microVM isolation is deployed and verified.
 * Learners must execute code through authorized course practical assessment tasks (/assessments/practical/submit).
 */
sandboxHonoRouter.post("/execute", honoAuthMiddleware, async (c) => {
  return c.json(
    {
      error:
        "Service Unavailable: Direct arbitrary code execution is disabled for security isolation. Please submit code via authorized course practical assessment tasks (/api/v1/assessments/practical/submit).",
      status: "DISABLED",
      isolationGate: "CLOUDFLARE_SANDBOX_PENDING",
    },
    503
  );
});
