import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "../shared/prisma.js";
import { config } from "../config/index.js";

const isPostgres =
  config.databaseUrl.startsWith("postgres://") ||
  config.databaseUrl.startsWith("postgresql://");

/**
 * Better Auth configuration for Certify.
 * Automatically adapts between SQLite (local dev) and PostgreSQL (Neon production).
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "https://api.certify.studio",
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "certify_super_secure_jwt_secret_dev_key_2026",

  database: prismaAdapter(prisma, {
    provider: isPostgres ? "postgresql" : "sqlite",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    // Auto-sign-in after registration (matches existing UX)
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      get clientId() {
        return process.env.GOOGLE_CLIENT_ID || "";
      },
      get clientSecret() {
        return process.env.GOOGLE_CLIENT_SECRET || "";
      },
    },
  },

  plugins: [bearer()],

  // Trusted origins — CORS + CSRF protection
  trustedOrigins: [
    "https://certify.studio",
    "https://www.certify.studio",
    "https://certify.pages.dev",
    "https://certify-8fh.pages.dev",
    "https://certify-ashy-sigma.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    ...(process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean),
  ].filter(Boolean),

  // Session configuration (7-day rolling expiry, matches existing behaviour)
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24,      // Refresh if used within 24 hours of expiry
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5-minute cache to reduce DB hits
    },
  },

  // User model field mapping (our schema uses `fullName` not `name`)
  user: {
    additionalFields: {
      fullName: {
        type: "string",
        required: true,
        defaultValue: "",
        input: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        input: false, // role is never set by the client
      },
      dob: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      persona: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      primaryGoal: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
    },
  },

  advanced: {
    cookiePrefix: "certify",
  },
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = typeof auth.$Infer.Session.user;

