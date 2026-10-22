import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "authorization",
  "jwtSecret",
  "anthropicApiKey",
  "openaiApiKey",
  "ed25519PrivateKeyPem",
]);

function redactObject(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(redactObject);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k)) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = redactObject(v);
    }
  }
  return out;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        message,
        ...(meta ? (redactObject(meta) as object) : {}),
      })
    );
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(
      JSON.stringify({
        level: "warn",
        timestamp: new Date().toISOString(),
        message,
        ...(meta ? (redactObject(meta) as object) : {}),
      })
    );
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(
      JSON.stringify({
        level: "error",
        timestamp: new Date().toISOString(),
        message,
        ...(meta ? (redactObject(meta) as object) : {}),
      })
    );
  },
};

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId =
    (req.headers["x-request-id"] as string) || crypto.randomUUID();
  (req as any).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}
