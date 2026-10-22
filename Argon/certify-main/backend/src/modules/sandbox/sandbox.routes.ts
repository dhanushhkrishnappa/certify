import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.js";
import { createRateLimiter } from "../../shared/middleware/rateLimit.js";
import { SandboxService } from "./sandbox.service.js";

export const sandboxRouter = Router();

const executeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  keyPrefix: "sandbox-exec",
});

const ExecuteSchema = z.object({
  code: z.string().min(1).max(20000),
  language: z.enum(["python"]).optional().default("python"),
});

sandboxRouter.post(
  "/execute",
  requireAuth,
  executeLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = ExecuteSchema.parse(req.body);
      const result = await SandboxService.executePython(parsed.code);
      res.status(200).json({
        output: result.output || result.stdout || "(No stdout output)",
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        status: result.status,
        executionTimeMs: result.durationMs,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid code execution payload", details: err.errors });
        return;
      }
      res.status(500).json({ error: "Sandbox execution failed" });
    }
  }
);
