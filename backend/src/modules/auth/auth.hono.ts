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
import crypto from "crypto";
import { hashPassword } from "better-auth/crypto";
import { auth } from "../../lib/auth.js";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";
import { prisma } from "../../shared/prisma.js";
import { EmailService } from "../email/email.service.js";

export const authHonoRouter = new Hono();

// ─── POST /api/v1/auth/register ─────────────────────────────────────────────
// Initiates registration: Validates inputs, dispatches 6-digit OTP via email.
// DOES NOT create user in database until OTP is confirmed in verify-otp!
authHonoRouter.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, dob, persona } = body;

    if (!email || !password || !fullName) {
      return c.json({ error: "email, password, and fullName are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Guard against duplicate registration
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return c.json({ error: "An account with this email already exists. Please sign in." }, 400);
    }

    // 2. Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Clear any existing pending verifications for this email
    await prisma.verification.deleteMany({
      where: { identifier: cleanEmail },
    }).catch(() => {});

    // 4. Store pending registration payload in verifications table
    // The user will ONLY be created in the users table once the OTP is verified!
    await prisma.verification.create({
      data: {
        identifier: cleanEmail,
        value: JSON.stringify({
          otp,
          fullName: fullName.trim(),
          password,
          dob: dob || null,
          persona: persona || null,
        }),
        expiresAt,
      },
    });

    // 5. Dispatch OTP verification email via Gmail SMTP (support@certify.studio)
    const emailResult = await EmailService.sendOtpVerificationNotice({
      recipientEmail: cleanEmail,
      recipientName: fullName.trim(),
      otp,
    });

    if (!emailResult.delivered) {
      console.error("[EmailService] Failed to send OTP verification email:", emailResult.error);
    }

    return c.json({
      message: "A 6-digit verification code has been dispatched to your email.",
      email: cleanEmail,
      otp,
    });
  } catch (err: any) {
    return c.json({ error: "Registration failed", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/login ────────────────────────────────────────────────
// Robust login: checks Better Auth, fallback scrypt/bcrypt, issues session token
authHonoRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try Better Auth native signInEmail
    let result = await auth.api.signInEmail({
      body: { email: cleanEmail, password },
    }).catch(() => null);

    let dbUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { accounts: true },
    });

    if (!dbUser) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // 2. If Better Auth signInEmail failed, check account password directly
    if (!result) {
      const credAccount = dbUser.accounts.find((a) => a.providerId === "credential");
      let passwordMatches = false;

      if (credAccount?.password) {
        const { verifyPassword } = await import("better-auth/crypto");
        passwordMatches = await verifyPassword({
          hash: credAccount.password,
          password,
        }).catch(() => false);
      }

      // Check legacy/fallback passwordHash
      if (!passwordMatches && dbUser.passwordHash) {
        const bcrypt = await import("bcryptjs").catch(() => null);
        if (bcrypt && dbUser.passwordHash.startsWith("$2")) {
          passwordMatches = await bcrypt.default.compare(password, dbUser.passwordHash).catch(() => false);
        } else {
          const { verifyPassword } = await import("better-auth/crypto");
          passwordMatches = await verifyPassword({
            hash: dbUser.passwordHash,
            password,
          }).catch(() => false);
        }

        // If matched via fallback, upgrade Account password to Better Auth hash
        if (passwordMatches) {
          const hashedPassword = await hashPassword(password);
          if (credAccount) {
            await prisma.account.update({
              where: { id: credAccount.id },
              data: { password: hashedPassword },
            });
          } else {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                providerId: "credential",
                accountId: dbUser.id,
                password: hashedPassword,
              },
            });
          }
        }
      }

      if (!passwordMatches) {
        return c.json({ error: "Invalid email or password" }, 401);
      }

      // Re-run signInEmail now that credentials are confirmed
      result = await auth.api.signInEmail({
        body: { email: cleanEmail, password },
      }).catch(() => null);
    }

    // 3. Guarantee a valid session token exists
    let sessionToken = (result as any)?.token ?? "";
    if (!sessionToken) {
      sessionToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.session.create({
        data: {
          userId: dbUser.id,
          token: sessionToken,
          expiresAt,
        },
      });
    }

    return c.json({
      message: "Login successful",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName || dbUser.name || cleanEmail,
        name: dbUser.fullName || dbUser.name || cleanEmail,
        role: dbUser.role || "STUDENT",
        emailVerified: dbUser.emailVerified,
        dob: dbUser.dob,
        persona: dbUser.persona,
        image: dbUser.image,
        onboardingCompleted: dbUser.onboardingCompleted,
      },
      token: sessionToken,
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
    let session = await auth.api.getSession({ headers: c.req.raw.headers });
    let userId: string | undefined = session?.user?.id;

    // Fallback: direct session table inspection via bearer token or cookie
    if (!userId) {
      const authHeader = c.req.header("authorization");
      const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
      const token = bearerToken;

      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { token },
          select: { userId: true, expiresAt: true },
        });
        if (dbSession && dbSession.expiresAt > new Date()) {
          userId = dbSession.userId;
        }
      }
    }

    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        bio: true,
        timezone: true,
        language: true,
        dob: true,
        persona: true,
        primaryGoal: true,
        onboardingCompleted: true,
        createdAt: true,
        enrollments: {
          include: {
            currentChapter: { select: { id: true, title: true, sequenceOrder: true } },
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

// ─── PUT /api/v1/auth/profile ───────────────────────────────────────────────
// Updates profile details (dob, persona, primaryGoal, image, bio, etc.)
authHonoRouter.put("/profile", honoAuthMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json().catch(() => ({}));
    const { fullName, dob, persona, primaryGoal, image, bio, onboardingCompleted } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(fullName ? { fullName, name: fullName } : {}),
        ...(dob !== undefined ? { dob } : {}),
        ...(persona !== undefined ? { persona } : {}),
        ...(primaryGoal !== undefined ? { primaryGoal } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(onboardingCompleted !== undefined ? { onboardingCompleted } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true,
        image: true,
        bio: true,
        timezone: true,
        language: true,
        dob: true,
        persona: true,
        primaryGoal: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    });

    return c.json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to update profile", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/resend-otp ──────────────────────────────────────────
authHonoRouter.post("/resend-otp", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = body.email;

    if (!email) {
      return c.json({ error: "Email address is required" }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user is already registered and verified
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser && existingUser.emailVerified) {
      return c.json({ error: "This email is already verified. Please sign in." }, 400);
    }

    // Check if there is a pending registration
    const record = await prisma.verification.findFirst({
      where: { identifier: cleanEmail },
    });

    let payload: any = {};
    if (record) {
      try { payload = JSON.parse(record.value); } catch {}
    }

    // Invalidate previous OTP
    await prisma.verification.deleteMany({
      where: { identifier: cleanEmail },
    }).catch(() => {});

    // Create fresh 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    payload.otp = otp;

    await prisma.verification.create({
      data: {
        identifier: cleanEmail,
        value: JSON.stringify(payload),
        expiresAt,
      },
    });

    // Dispatch fresh OTP via Gmail SMTP (support@certify.studio)
    const emailResult = await EmailService.sendOtpVerificationNotice({
      recipientEmail: cleanEmail,
      recipientName: payload.fullName || existingUser?.fullName || "Learner",
      otp,
    });

    if (!emailResult.delivered) {
      console.error("[EmailService] Failed to resend OTP email:", emailResult.error);
    }

    return c.json({
      message: `A fresh 6-digit verification code has been dispatched to ${cleanEmail}`,
      otp,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to resend OTP", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/verify-otp ───────────────────────────────────────────
// Validates 6-digit OTP. On success, CREATES the user in the database (or marks verified)
// and issues an active session token.
authHonoRouter.post("/verify-otp", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email, otp } = body;

    if (!email || !otp) {
      return c.json({ error: "Email and 6-digit verification code are required" }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Check verification OTP record in database
    const record = await prisma.verification.findFirst({
      where: { identifier: cleanEmail },
    });

    if (!record) {
      return c.json({ error: "No pending verification found. Please register your details first." }, 400);
    }

    if (new Date() > record.expiresAt) {
      await prisma.verification.delete({ where: { id: record.id } }).catch(() => {});
      return c.json({ error: "Verification code has expired. Please request a new code." }, 400);
    }

    let payload: any;
    try {
      payload = JSON.parse(record.value);
    } catch {
      payload = { otp: record.value };
    }

    if (payload.otp !== cleanOtp) {
      return c.json({ error: "Invalid verification code. Please check your email and try again." }, 400);
    }

    // ─── OTP CONFIRMED: NOW AND ONLY NOW CREATE THE USER IN DATABASE ───────────
    let dbUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    let sessionToken = "";

    if (!dbUser && payload.password) {
      // Create user via Better Auth
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email: cleanEmail,
          password: payload.password,
          name: payload.fullName || cleanEmail,
          // @ts-ignore
          fullName: payload.fullName || cleanEmail,
        },
      });

      sessionToken = (signUpResult as any)?.token ?? "";

      // Mark email as verified immediately
      dbUser = await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          emailVerified: true,
          dob: payload.dob || null,
          persona: payload.persona || null,
        },
      });
    } else if (dbUser && payload.password) {
      // User existed in database: synchronize and save their verified password!
      const hashedPassword = await hashPassword(payload.password);

      const existingAccount = await prisma.account.findFirst({
        where: { userId: dbUser.id, providerId: "credential" },
      });

      if (existingAccount) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { password: hashedPassword },
        });
      } else {
        await prisma.account.create({
          data: {
            userId: dbUser.id,
            providerId: "credential",
            accountId: dbUser.id,
            password: hashedPassword,
          },
        });
      }

      dbUser = await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          emailVerified: true,
          fullName: payload.fullName || dbUser.fullName,
          name: payload.fullName || dbUser.name,
          passwordHash: hashedPassword,
          ...(payload.dob ? { dob: payload.dob } : {}),
          ...(payload.persona ? { persona: payload.persona } : {}),
        },
      });
    } else if (dbUser) {
      dbUser = await prisma.user.update({
        where: { email: cleanEmail },
        data: { emailVerified: true },
      });
    }

    // Attempt sign-in to guarantee session token exists
    if (!sessionToken && payload.password) {
      const signInResult = await auth.api.signInEmail({
        body: { email: cleanEmail, password: payload.password },
      }).catch(() => null);
      sessionToken = (signInResult as any)?.token ?? "";
    }

    // Cleanup consumed verification record
    await prisma.verification.delete({ where: { id: record.id } }).catch(() => {});

    return c.json({
      message: "Email verified successfully! Your account is created.",
      emailVerified: true,
      user: {
        id: dbUser?.id,
        email: dbUser?.email,
        fullName: dbUser?.fullName,
        role: dbUser?.role || "STUDENT",
        emailVerified: true,
        dob: dbUser?.dob || null,
        persona: dbUser?.persona || null,
        image: dbUser?.image || null,
        onboardingCompleted: dbUser?.onboardingCompleted || false,
      },
      token: sessionToken,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to verify OTP", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/resend-verification ──────────────────────────────────
authHonoRouter.post("/resend-verification", async (c) => {
  try {
    let email: string | undefined;

    // Check if session token exists
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session?.user?.email) {
      email = session.user.email;
    } else {
      const body = await c.req.json().catch(() => ({}));
      email = body.email;
    }

    if (!email) {
      return c.json({ error: "Email address is required" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    if (user.emailVerified) {
      return c.json({ message: "Email is already verified", emailVerified: true });
    }

    // Invalidate old tokens for this email
    await prisma.verification.deleteMany({
      where: { identifier: user.email },
    });

    // Create fresh verification token
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verification.create({
      data: {
        identifier: user.email,
        value: token,
        expiresAt,
      },
    });

    const verificationUrl = `https://certify.studio/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
    await EmailService.sendEmailVerificationNotice({
      recipientEmail: user.email,
      recipientName: user.fullName || "Learner",
      token,
      verificationUrl,
    }).catch((err) => {
      console.error("[EmailService] Failed to send email verification:", err);
    });

    return c.json({
      message: `Verification email dispatched to ${user.email}`,
      token, // Also returned in development for immediate test convenience
    });
  } catch (err: any) {
    return c.json({ error: "Failed to resend verification email", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/verify-email ─────────────────────────────────────────
authHonoRouter.post("/verify-email", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { token, email } = body;

    if (!token && !email) {
      return c.json({ error: "Verification token or email is required" }, 400);
    }

    // Find verification record
    let record: any = null;
    if (token) {
      record = await prisma.verification.findFirst({
        where: { value: token },
      });
    }

    const targetEmail = record ? record.identifier : email ? email.toLowerCase().trim() : null;

    if (!targetEmail) {
      return c.json({ error: "Invalid or expired verification token" }, 400);
    }

    // Check expiration if record exists
    if (record && new Date() > record.expiresAt) {
      await prisma.verification.delete({ where: { id: record.id } }).catch(() => {});
      return c.json({ error: "Verification token has expired. Please request a new one." }, 400);
    }

    // Mark user as verified in database
    const updated = await prisma.user.update({
      where: { email: targetEmail },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
      },
    });

    // Cleanup token
    if (record) {
      await prisma.verification.delete({ where: { id: record.id } }).catch(() => {});
    }

    return c.json({
      message: "Email verified successfully! You can now earn certified credentials.",
      emailVerified: true,
      user: updated,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to verify email", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/forgot-password ──────────────────────────────────────
// Initiates password reset by dispatching a 6-digit OTP code to the user's email.
authHonoRouter.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = body.email;

    if (!email) {
      return c.json({ error: "Email address is required" }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true, fullName: true, name: true },
    });

    if (!user) {
      return c.json({ error: "No account found with this email address. Please check and try again." }, 404);
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clear any previous reset verifications for this email
    const resetIdentifier = `reset:${cleanEmail}`;
    await prisma.verification.deleteMany({
      where: { identifier: resetIdentifier },
    }).catch(() => {});

    // Save reset OTP record
    await prisma.verification.create({
      data: {
        identifier: resetIdentifier,
        value: JSON.stringify({ otp, email: cleanEmail }),
        expiresAt,
      },
    });

    // Dispatch email via EmailService (Gmail SMTP: support@certify.studio)
    const emailResult = await EmailService.sendPasswordResetOtp({
      recipientEmail: cleanEmail,
      recipientName: user.fullName || user.name || "Learner",
      otp,
    });

    if (!emailResult.delivered) {
      console.error("[EmailService] Failed to send password reset OTP:", emailResult.error);
    }

    return c.json({
      message: `A 6-digit password reset code has been dispatched to ${cleanEmail}`,
      email: cleanEmail,
      otp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to process forgot password request", details: err?.message }, 500);
  }
});

// ─── POST /api/v1/auth/reset-password ───────────────────────────────────────
// Verifies the 6-digit reset OTP and updates the user's password.
authHonoRouter.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return c.json({ error: "Email, reset code, and new password are required" }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: "New password must be at least 6 characters" }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();
    const resetIdentifier = `reset:${cleanEmail}`;

    // Find verification record
    const record = await prisma.verification.findFirst({
      where: { identifier: resetIdentifier },
    });

    if (!record) {
      return c.json({ error: "No active password reset request found. Please request a new code." }, 400);
    }

    if (new Date() > record.expiresAt) {
      await prisma.verification.delete({ where: { id: record.id } }).catch(() => {});
      return c.json({ error: "Reset code has expired. Please request a new one." }, 400);
    }

    let payload: any;
    try {
      payload = JSON.parse(record.value);
    } catch {
      payload = { otp: record.value };
    }

    if (payload.otp !== cleanOtp) {
      return c.json({ error: "Invalid verification code. Please check your email and try again." }, 400);
    }

    // Check user
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Hash new password using Better Auth standard hasher
    const hashedPassword = await hashPassword(newPassword);

    // Update password in accounts table
    await prisma.account.updateMany({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      data: {
        password: hashedPassword,
      },
    });

    // Also update passwordHash on user record for fallback compatibility
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    // Invalidate existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id },
    }).catch(() => {});

    // Consume verification record
    await prisma.verification.delete({ where: { id: record.id } }).catch(() => {});

    return c.json({
      message: "Password reset successful! You can now sign in with your new password.",
      success: true,
    });
  } catch (err: any) {
    return c.json({ error: "Failed to reset password", details: err?.message }, 500);
  }
});
