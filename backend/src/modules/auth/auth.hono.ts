import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../../shared/prisma.js";
import { config } from "../../config/index.js";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";
import { honoRateLimiter } from "../../shared/middleware/honoRateLimit.js";

export const authHonoRouter = new Hono();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Stricter rate limiting on authentication routes (10 req/min)
authHonoRouter.use("/login", honoRateLimiter({ maxRequests: 10, windowSeconds: 60, keyPrefix: "auth-login" }));
authHonoRouter.use("/register", honoRateLimiter({ maxRequests: 5, windowSeconds: 60, keyPrefix: "auth-reg" }));

// Register
authHonoRouter.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName } = RegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ error: "Email is already registered" }, 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: "STUDENT",
        sessions: {
          create: {
            token: sessionToken,
            expiresAt,
            ipAddress: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "127.0.0.1",
            userAgent: c.req.header("user-agent") || null,
          },
        },
      },
    });

    // Set secure HttpOnly session cookie
    setCookie(c, "certify_session", sessionToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return c.json(
      {
        message: "Registration successful",
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
        token: sessionToken,
      },
      201
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: err.errors }, 400);
    }
    return c.json({ error: "Registration failed", details: err?.message }, 500);
  }
});

// Login
authHonoRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
        ipAddress: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "127.0.0.1",
        userAgent: c.req.header("user-agent") || null,
      },
    });

    // Set secure HttpOnly session cookie
    setCookie(c, "certify_session", sessionToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return c.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      token: sessionToken,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: err.errors }, 400);
    }
    return c.json({ error: "Login failed", details: err?.message }, 500);
  }
});

// Logout
authHonoRouter.post("/logout", async (c) => {
  const cookieToken = getCookie(c, "certify_session");
  const authHeader = c.req.header("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const token = cookieToken || bearerToken;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  deleteCookie(c, "certify_session", { path: "/" });
  return c.json({ message: "Logged out successfully" });
});

// Me (Authenticated)
authHonoRouter.get("/me", honoAuthMiddleware, async (c) => {
  const authUser = c.get("user");
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
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

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user });
});
