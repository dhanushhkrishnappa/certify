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
import { API_ORIGIN } from "../constants/api.js";

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
});

export type AuthSession = typeof authClient.$Infer.Session;

