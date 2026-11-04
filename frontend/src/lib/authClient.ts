/**
 * Better Auth client for Certify frontend.
 *
 * Uses the `createAuthClient` factory from better-auth/client.
 * The base URL points to the backend server where Better Auth is mounted.
 *
 * Better Auth natively uses HttpOnly cookies for sessions, but also supports
 * Bearer tokens via the `bearer` plugin (enabled on backend).
 */
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000",
});

export type AuthSession = typeof authClient.$Infer.Session;

