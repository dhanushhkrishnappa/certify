/**
 * Auth compatibility router mounted at /api/v1/auth/*
 *
 * Better Auth handles ALL real auth operations at /api/auth/*.
 * This router provides thin shims for the existing frontend API client
 * so callers of /api/v1/auth/login, /register, /logout, /me continue
 * to work without any frontend routing changes.
 *
 * The shims simply proxy to Better Auth's API, ensuring a single code path.
 */
import { Hono } from "hono";
import { auth } from "../../lib/auth.js";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";
import { prisma } from "../../shared/prisma.js";

export const authHonoRouter = new Hono();

// ─── POST /api/v1/auth/register ─────────────────────────────────────────────
// Shim: delegates to Better Auth signUp.email
authHonoRouter.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return c.json({ error: "email, password, and fullName are required" }, 400);
    }

    // Call Better Auth's sign-up handler directly via the API
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName,
        // @ts-ignore — additional field in auth config
        fullName,
      },
    });

    if (!result) {
      return c.json({ error: "Registration failed" }, 500);
    }

    // Ensure role is set (Better Auth doesn't set custom fields by default)
    await prisma.user.update({
      where: { email },
      data: { role: "STUDENT", fullName },
    }).catch(() => {});

    const user = result.user as any;
    const token = (result as any).token ?? "";

    return c.json(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName ?? fullName,
          role: user.role ?? "STUDENT",
        },
        token,
      },
      201
    );
  } catch (err: any) {
    if (err?.status === 422 || err?.message?.includes("already")) {
      return c.json({ error: "Email is already registered" }, 400);
    }
    return c.json({ error: "Registration failed", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/login ────────────────────────────────────────────────
// Shim: delegates to Better Auth signIn.email
authHonoRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "email and password are required" }, 400);
    }

    const result = await auth.api.signInEmail({
      body: { email, password },
    });

    if (!result) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const user = result.user as any;
    const token = (result as any).token ?? "";

    return c.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName ?? user.name ?? email,
        role: user.role ?? "STUDENT",
      },
      token,
    });
  } catch (err: any) {
    if (err?.status === 401 || err?.message?.includes("credentials")) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    return c.json({ error: "Login failed", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/logout ───────────────────────────────────────────────
authHonoRouter.post("/logout", async (c) => {
  try {
    await auth.api.signOut({ headers: c.req.raw.headers });
    return c.json({ message: "Logged out successfully" });
  } catch {
    return c.json({ message: "Logged out successfully" });
  }
});

// ─── GET /api/v1/auth/me ────────────────────────────────────────────────────
authHonoRouter.get("/me", async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const baUser = session.user as any;

    // Optionally fetch enriched user data with enrollments from Prisma
    const dbUser = await prisma.user.findUnique({
      where: { id: baUser.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        enrollments: {
          include: {
            courseVersion: { include: { course: true } },
            certificate: true,
          },
        },
      },
    });

    if (!dbUser) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user: dbUser });
  } catch (err: any) {
    return c.json({ error: "Failed to get user", details: err?.message }, 500);
  }
});
