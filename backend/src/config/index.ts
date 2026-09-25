import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  jwtSecret: process.env.JWT_SECRET || "certify_super_secure_jwt_secret_dev_key_2026",
  nodeEnv: process.env.NODE_ENV || "development",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
};
