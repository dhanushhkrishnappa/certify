import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { requestContextMiddleware } from "./shared/logger.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { coursesRouter } from "./modules/courses/courses.routes.js";
import { sessionsRouter } from "./modules/sessions/sessions.routes.js";
import { assessmentRouter } from "./modules/assessment/assessment.routes.js";
import { certificatesRouter } from "./modules/certificates/certificates.routes.js";
import { sandboxRouter } from "./modules/sandbox/sandbox.routes.js";
import { AIProvider } from "./modules/ai/ai.provider.js";

export const app = express();

app.disable("x-powered-by");
app.use(requestContextMiddleware);
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "64kb" }));

// Health & Operational Readiness Check
app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "certify-backend",
    version: "1.0.0",
    ruleVersion: config.ruleVersion,
    aiMode: AIProvider.isRealProviderConfigured()
      ? `live:${config.aiProvider}`
      : config.allowDevAiFallback
      ? "development-fallback"
      : "unconfigured",
    timestamp: new Date().toISOString(),
  });
});

// Register Domain Modules
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1", sessionsRouter);
app.use("/api/v1/assessments", assessmentRouter);
app.use("/api/v1/certificates", certificatesRouter);
app.use("/api/v1", sandboxRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});
