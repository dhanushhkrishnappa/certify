import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes.js";
import { coursesRouter } from "./modules/courses/courses.routes.js";
import { sessionsRouter } from "./modules/sessions/sessions.routes.js";
import { assessmentRouter } from "./modules/assessment/assessment.routes.js";
import { certificatesRouter } from "./modules/certificates/certificates.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "certify-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Register Domain Modules
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1", sessionsRouter);
app.use("/api/v1/assessments", assessmentRouter);
app.use("/api/v1/certificates", certificatesRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});
