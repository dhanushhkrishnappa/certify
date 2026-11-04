import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { config } from "../../config/index.js";
import { prisma } from "../prisma.js";
import { auth } from "../../lib/auth.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthenticatedUser;
    sessionToken: string;
    requestId: string;
  }
}

/**
 * Validates Origin/Referer for CSRF protection on cookie-authenticated state-changing operations.
 */
function isAllowedOrigin(originHeader: string | undefined): boolean {
  if (!originHeader) return false;
  if (
    originHeader.startsWith("http://localhost:") ||
    originHeader.startsWith("http://127.0.0.1:") ||
    originHeader.endsWith(".pages.dev") ||
    originHeader === config.corsOrigin
  ) {
    return true;
  }
  return false;
}

/**
 * Authoritative Authentication Middleware:
 * Uses Better Auth sessions as the single source of truth.
 * - Extracts session token from HttpOnly cookie 'certify_session' (or 'certify.session_token')
 *   or Authorization: Bearer <sessionToken>.
 * - Validates session against database Session table (token, expiration).
 * - Enforces CSRF origin checks on cookie-authenticated mutations.
 * - Attaches authenticated user and sessionToken to Hono context.
 */
export async function honoAuthMiddleware(c: Context, next: Next): Promise<Response | void> {
  const cookieToken =
    getCookie(c, "certify_session") ||
    getCookie(c, "certify.session_token") ||
    getCookie(c, "better-auth.session_token");
  const authHeader = c.req.header("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  const sessionToken = cookieToken || bearerToken;

  if (!sessionToken) {
    return c.json(
      { error: "Authentication required: No session cookie or authorization token provided" },
      401
    );
  }

  // Enforce CSRF protection on cookie-authenticated state-changing mutations
  if (cookieToken && ["POST", "PUT", "PATCH", "DELETE"].includes(c.req.method)) {
    const origin = c.req.header("origin") || c.req.header("referer");
    if (!isAllowedOrigin(origin)) {
      return c.json({ error: "Forbidden: CSRF origin validation failed" }, 403);
    }
  }

  try {
    // 1. Authoritative Database Session Validation
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (session) {
      if (session.expiresAt < new Date()) {
        // Invalidate expired session in database
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        return c.json({ error: "Session expired. Please log in again." }, 401);
      }

      c.set("user", {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        fullName: session.user.fullName || (session.user as any).name || session.user.email,
      });
      c.set("sessionToken", session.token);

      return await next();
    }

    // 2. Fallback to Better Auth API session resolution if token is signed/cached
    try {
      const baSession = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (baSession && baSession.user) {
        const u = baSession.user as any;
        c.set("user", {
          id: u.id,
          email: u.email,
          role: u.role ?? "STUDENT",
          fullName: u.fullName ?? u.name ?? u.email,
        });
        c.set("sessionToken", baSession.session.token);
        return await next();
      }
    } catch {
      // Better Auth session lookup error fallback
    }

    return c.json({ error: "Invalid or revoked session. Please log in again." }, 401);
  } catch (err: any) {
    return c.json({ error: "Session validation failed", details: err?.message }, 401);
  }
}

/**
 * Server-side Role-Based Access Control middleware for Hono.
 */
export function honoRequireRole(allowedRoles: string[]) {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          error: "Forbidden: Insufficient role permissions",
          requiredRoles: allowedRoles,
          currentRole: user.role,
        },
        403
      );
    }
    return await next();
  };
}

/**
 * Verifies that the specified enrollment belongs to the authenticated user.
 */
export async function verifyEnrollmentOwnership(
  enrollmentId: string,
  userId: string
): Promise<{ status: "ok"; enrollment: any } | { status: "not_found" | "forbidden" }> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  if (!enrollment) {
    return { status: "not_found" };
  }
  if (enrollment.userId !== userId) {
    return { status: "forbidden" };
  }
  return { status: "ok", enrollment };
}
