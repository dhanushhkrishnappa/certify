import dotenv from "dotenv";
dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const rawJwtSecret = process.env.JWT_SECRET;

// Fail-fast security assertions for production
if (
  nodeEnv === "production" &&
  (!rawJwtSecret ||
    rawJwtSecret === "certify_super_secure_jwt_secret_dev_key_2026" ||
    rawJwtSecret === "certify_jwt_secret_dev_change_in_production")
) {
  throw new Error(
    "CRITICAL SECURITY ERROR: JWT_SECRET must be explicitly set to a strong secret in production."
  );
}

// In production, development AI fallback is strictly forbidden
const allowDevAiFallback =
  nodeEnv === "production"
    ? false
    : process.env.ALLOW_DEV_AI_FALLBACK === "true" ||
      process.env.ALLOW_DEV_AI_FALLBACK !== "false";

// Whitelist & Retired Model Validation
export const RETIRED_MODELS = new Set([
  "claude-3-7-sonnet",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-sonnet-20240229",
  "claude-3-opus-20240229",
  "claude-2.1",
  "claude-2.0",
  "claude-instant-1.2",
]);

export function validateModelIdentifier(modelId: string, role: "tutor" | "evaluator"): string {
  if (RETIRED_MODELS.has(modelId)) {
    throw new Error(
      `CRITICAL CONFIGURATION ERROR: Model '${modelId}' is retired and cannot be used for ${role} workloads. Please configure a supported model such as 'claude-sonnet-4-6' or 'claude-haiku-4-5-20251001'.`
    );
  }
  return modelId;
}

const rawTutorModel = process.env.ANTHROPIC_TUTOR_MODEL || "claude-sonnet-4-6";
const rawEvaluatorModel = process.env.ANTHROPIC_EVALUATOR_MODEL || "claude-haiku-4-5-20251001";

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  jwtSecret: rawJwtSecret || "certify_super_secure_jwt_secret_dev_key_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN || "https://certify.pages.dev",
  aiProvider: (process.env.AI_PROVIDER || "anthropic") as "anthropic" | "openai",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  anthropicTutorModel: validateModelIdentifier(rawTutorModel, "tutor"),
  anthropicEvaluatorModel: validateModelIdentifier(rawEvaluatorModel, "evaluator"),
  openaiTutorModel: process.env.OPENAI_TUTOR_MODEL || "gpt-4o",
  openaiEvaluatorModel: process.env.OPENAI_EVALUATOR_MODEL || "gpt-4o-mini",
  allowDevAiFallback,
  ed25519PrivateKeyPem: process.env.ED25519_PRIVATE_KEY_PEM || "",
  ed25519PublicKeyPem: process.env.ED25519_PUBLIC_KEY_PEM || "",
  ed25519KeyId: process.env.ED25519_KEY_ID || "certify-2026-key-1",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "security@certify.edu",
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  ruleVersion: "2026.1",
  promptVersion: "2026-10-v1",
};
