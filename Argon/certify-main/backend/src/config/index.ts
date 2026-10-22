import dotenv from "dotenv";
dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const rawJwtSecret = process.env.JWT_SECRET;

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

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  jwtSecret: rawJwtSecret || "certify_super_secure_jwt_secret_dev_key_2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  aiProvider: (process.env.AI_PROVIDER || "anthropic") as "anthropic" | "openai",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  anthropicTutorModel: process.env.ANTHROPIC_TUTOR_MODEL || "claude-3-5-sonnet-20241022",
  anthropicEvaluatorModel: process.env.ANTHROPIC_EVALUATOR_MODEL || "claude-3-5-haiku-20241022",
  openaiTutorModel: process.env.OPENAI_TUTOR_MODEL || "gpt-4o",
  openaiEvaluatorModel: process.env.OPENAI_EVALUATOR_MODEL || "gpt-4o-mini",
  allowDevAiFallback:
    process.env.ALLOW_DEV_AI_FALLBACK === "true" ||
    (nodeEnv !== "production" && process.env.ALLOW_DEV_AI_FALLBACK !== "false"),
  ed25519PrivateKeyPem: process.env.ED25519_PRIVATE_KEY_PEM || "",
  ed25519PublicKeyPem: process.env.ED25519_PUBLIC_KEY_PEM || "",
  ruleVersion: "2026.1",
  promptVersion: "2026-10-v1",
};
