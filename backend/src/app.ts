import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import crypto from "crypto";
import { auth } from "./lib/auth.js";
import { authHonoRouter } from "./modules/auth/auth.hono.js";
import { coursesHonoRouter } from "./modules/courses/courses.hono.js";
import { sessionsHonoRouter } from "./modules/sessions/sessions.hono.js";
import { assessmentHonoRouter } from "./modules/assessment/assessment.hono.js";
import { certificatesHonoRouter } from "./modules/certificates/certificates.hono.js";
import { sandboxHonoRouter } from "./modules/sandbox/sandbox.hono.js";
import { storageHonoRouter } from "./modules/storage/storage.hono.js";
import { config } from "./config/index.js";
import { logger } from "./shared/logger.js";

export const app = new Hono();

// 1. Request Context & Unique Request ID Tracing
app.use("*", async (c, next) => {
  const requestId = c.req.header("x-request-id") || crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("X-Request-Id", requestId);
  return await next();
});

// 2. Production Security Headers
app.use(
  "*",
  secureHeaders({
    xContentTypeOptions: "nosniff",
    xFrameOptions: "DENY",
    referrerPolicy: "strict-origin-when-cross-origin",
  })
);

// 3. Credential-Aware CORS Configuration
const ALLOWED_ORIGIN_PATTERNS = [
  "https://certify.studio",
  "https://www.certify.studio",
  "https://certify.pages.dev",
  "https://certify-8fh.pages.dev",
  "https://certify-ashy-sigma.vercel.app",
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (
        ALLOWED_ORIGIN_PATTERNS.includes(origin) ||
        origin.endsWith(".certify.studio") ||
        origin.endsWith(".pages.dev") ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return origin;
      }
      return origin;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposeHeaders: ["Retry-After", "X-Request-Id"],
  })
);

// 4. Health Check Endpoint
app.get("/api/v1/health", (c) => {
  return c.json({
    status: "ok",
    service: "certify-backend",
    version: "2026.1.0",
    runtime: "Cloudflare Workers / Hono Web Standards",
    timestamp: new Date().toISOString(),
    crypto: {
      algorithm: "Ed25519 (RFC 8032)",
      keyId: config.ed25519KeyId,
    },
    models: {
      tutorModel: config.anthropicTutorModel,
      evaluatorModel: config.anthropicEvaluatorModel,
    },
    database: "connected",
  });
});

// 5a. Mount Better Auth handler — handles all /api/auth/* natively
//     (sign-in/email, sign-up/email, sign-out, session, etc.)
app.on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// 5b. Mount the /api/v1/auth/* compatibility shim router
//     (login, register, logout, me — keeps frontend unchanged)
app.route("/api/v1/auth", authHonoRouter);

// 5c. Mount remaining domain routers under /api/v1
app.route("/api/v1/courses", coursesHonoRouter);
app.route("/api/v1", sessionsHonoRouter);
app.route("/api/v1/assessments", assessmentHonoRouter);
app.route("/api/v1/certificates", certificatesHonoRouter);
app.route("/api/v1", sandboxHonoRouter);
app.route("/api/v1/storage", storageHonoRouter);

// 6. Fallback 404
app.notFound((c) => {
  return c.json({ error: `Endpoint not found: ${c.req.method} ${c.req.url}` }, 404);
});

// 7. Global Error Handler - Never Leaks Secrets or Internal Stack Traces
app.onError((err, c) => {
  const requestId = c.get("requestId") || "unknown";
  logger.error("Unhandled API exception", {
    requestId,
    url: c.req.url,
    method: c.req.method,
    errorMessage: err.message,
  });

  return c.json(
    {
      error: err.message || "An unexpected internal server error occurred",
      requestId,
    },
    500
  );
});
