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
  database: prismaAdapter(prisma, {
    provider: isPostgres ? "postgresql" : "sqlite",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    // Auto-sign-in after registration (matches existing UX)
    autoSignIn: true,
  },

  plugins: [bearer()],

  // Trusted origins — CORS + CSRF protection
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "https://certify.pages.dev",
    process.env.CORS_ORIGIN || "",
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
    },
  },

  advanced: {
    cookiePrefix: "certify",
  },
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = typeof auth.$Infer.Session.user;

