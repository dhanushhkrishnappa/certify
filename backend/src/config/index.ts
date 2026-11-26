import dotenv from "dotenv";
dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
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

export function normalizeGeminiModel(modelId?: string, fallback = "gemini-2.5-flash"): string {
  if (!modelId || !modelId.trim()) return fallback;
  const trimmed = modelId.trim();
  if (trimmed.startsWith("gemini-3.5") || trimmed.includes("flash-lite")) {
    return fallback;
  }
  return trimmed;
}

let customNodeEnv: string | null = null;
let customPrivateKeyPem: string | null = null;
let customPublicKeyPem: string | null = null;

export const config = {
  get port() { return parseInt(process.env.PORT || "5000", 10); },
  get jwtSecret() { return process.env.JWT_SECRET || "certify_super_secure_jwt_secret_dev_key_2026"; },
  get jwtExpiresIn() { return process.env.JWT_EXPIRES_IN || "2h"; },
  get nodeEnv() { return customNodeEnv || process.env.NODE_ENV || "development"; },
  set nodeEnv(v: string) { customNodeEnv = v; },
  get corsOrigin() { return process.env.CORS_ORIGIN || "https://certify.pages.dev"; },
  get aiProvider() { return (process.env.AI_PROVIDER || "groq") as "anthropic" | "openai" | "gemini" | "groq"; },
  set aiProvider(v: "anthropic" | "openai" | "gemini" | "groq") { process.env.AI_PROVIDER = v; },
  get anthropicApiKey() { return process.env.ANTHROPIC_API_KEY || ""; },
  set anthropicApiKey(v: string) { process.env.ANTHROPIC_API_KEY = v; },
  get groqApiKey() { return process.env.GROQ_API_KEY || ""; },
  set groqApiKey(v: string) { process.env.GROQ_API_KEY = v; },
  get groqTutorModel() { return process.env.GROQ_TUTOR_MODEL || "llama-3.3-70b-versatile"; },
  get groqEvaluatorModel() { return process.env.GROQ_EVALUATOR_MODEL || "llama-3.3-70b-versatile"; },
  get groqModel() { return this.groqEvaluatorModel; },
  set groqModel(v: string) { process.env.GROQ_EVALUATOR_MODEL = v; },
  get openaiApiKey() { return process.env.OPENAI_API_KEY || ""; },
  set openaiApiKey(v: string) { process.env.OPENAI_API_KEY = v; },
  get geminiApiKey() { return process.env.GEMINI_API_KEY || ""; },
  set geminiApiKey(v: string) { process.env.GEMINI_API_KEY = v; },
  get geminiTutorModel() { return normalizeGeminiModel(process.env.GEMINI_TUTOR_MODEL || "gemini-2.5-flash"); },
  get geminiEvaluatorModel() { return normalizeGeminiModel(process.env.GEMINI_EVALUATOR_MODEL || "gemini-2.5-flash"); },
  get geminiAutoFallback() { return process.env.GEMINI_AUTO_FALLBACK !== "false"; },
  set geminiAutoFallback(v: boolean) { process.env.GEMINI_AUTO_FALLBACK = String(v); },
  get anthropicTutorModel() { return validateModelIdentifier(process.env.ANTHROPIC_TUTOR_MODEL || "claude-sonnet-4-6", "tutor"); },
  get anthropicEvaluatorModel() { return validateModelIdentifier(process.env.ANTHROPIC_EVALUATOR_MODEL || "claude-haiku-4-5-20251001", "evaluator"); },
  get openaiTutorModel() { return process.env.OPENAI_TUTOR_MODEL || "gpt-4o"; },
  get openaiEvaluatorModel() { return process.env.OPENAI_EVALUATOR_MODEL || "gpt-4o-mini"; },
  get allowDevAiFallback() {
    return (process.env.NODE_ENV || "development") === "production"
      ? false
      : process.env.ALLOW_DEV_AI_FALLBACK === "true" || process.env.ALLOW_DEV_AI_FALLBACK !== "false";
  },
  get ed25519PrivateKeyPem() {
    if (customPrivateKeyPem !== null) return customPrivateKeyPem;
    if (process.env.ED25519_PRIVATE_KEY_PEM !== undefined) return process.env.ED25519_PRIVATE_KEY_PEM;
    if ((customNodeEnv || process.env.NODE_ENV) === "production") return "";
    return "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEII5Bts2fGCIU376Pxt8BvNOypcn4gtrpuswa5MTCMVPx\n-----END PRIVATE KEY-----\n";
  },
  set ed25519PrivateKeyPem(v: string) { customPrivateKeyPem = v; },
  get ed25519PublicKeyPem() {
    if (customPublicKeyPem !== null) return customPublicKeyPem;
    if (process.env.ED25519_PUBLIC_KEY_PEM !== undefined) return process.env.ED25519_PUBLIC_KEY_PEM;
    if ((customNodeEnv || process.env.NODE_ENV) === "production") return "";
    return "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAKIpTvF6ZBX5TAByQUviQkwMCLRaZ/TR1IIur21HPK4A=\n-----END PUBLIC KEY-----\n";
  },
  set ed25519PublicKeyPem(v: string) { customPublicKeyPem = v; },
  get ed25519KeyId() { return process.env.ED25519_KEY_ID || "certify-2026-key-1"; },
  get resendApiKey() { return process.env.RESEND_API_KEY || ""; },
  get emailFrom() { return process.env.EMAIL_FROM || "security@certify.edu"; },
  get smtpUser() { return process.env.SMTP_USER || ""; },
  get smtpPass() { return process.env.SMTP_PASS || ""; },
  get databaseUrl() { return process.env.DATABASE_URL || "file:./dev.db"; },
  ruleVersion: "2026.1",
  promptVersion: "2026-10-v1",
};
