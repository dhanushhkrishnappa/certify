import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import { honoAuthMiddleware, honoRequireRole, verifyEnrollmentOwnership } from "./honoAuth.js";
import { prisma } from "../prisma.js";

describe("Better Auth Session Authority & Security Middleware", () => {
  const testApp = new Hono();

  testApp.get("/protected", honoAuthMiddleware, (c) => {
    return c.json({ user: c.get("user") });
  });

  testApp.post("/mutate", honoAuthMiddleware, (c) => {
    return c.json({ status: "mutated" });
  });

  testApp.post(
    "/admin-only",
    honoAuthMiddleware,
    honoRequireRole(["ADMIN", "INSTRUCTOR"]),
    (c) => c.json({ status: "admin_ok" })
  );

  it("rejects unauthenticated requests with HTTP 401", async () => {
    const res = await testApp.request("/protected");
    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.error).toContain("No session cookie or authorization token provided");
  });

  it("restores session via HttpOnly certify_session cookie from database Session table", async () => {
    const validSessionToken = "sess-token-valid-12345";
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    vi.spyOn(prisma.session, "findUnique").mockResolvedValue({
      id: "sess-db-1",
      token: validSessionToken,
      userId: "user-alice-123",
      expiresAt: futureDate,
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: "user-alice-123",
        email: "alice@certify.edu",
        fullName: "Alice Learner",
        role: "STUDENT",
      },
    } as any);

    const res = await testApp.request("/protected", {
      headers: {
        Cookie: `certify_session=${validSessionToken}`,
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.user.id).toBe("user-alice-123");
    expect(body.user.email).toBe("alice@certify.edu");
    expect(body.user.role).toBe("STUDENT");

    vi.restoreAllMocks();
  });

  it("rejects expired database sessions with HTTP 401 and deletes them", async () => {
    const expiredSessionToken = "sess-token-expired";
    const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago

    vi.spyOn(prisma.session, "findUnique").mockResolvedValue({
      id: "sess-db-expired",
      token: expiredSessionToken,
      userId: "user-bob-456",
      expiresAt: pastDate,
      user: {
        id: "user-bob-456",
        email: "bob@certify.edu",
        fullName: "Bob",
        role: "STUDENT",
      },
    } as any);

    const deleteSpy = vi.spyOn(prisma.session, "delete").mockResolvedValue({} as any);

    const res = await testApp.request("/protected", {
      headers: {
        Cookie: `certify_session=${expiredSessionToken}`,
      },
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.error).toContain("Session expired");
    expect(deleteSpy).toHaveBeenCalledWith({ where: { id: "sess-db-expired" } });

    vi.restoreAllMocks();
  });

  it("blocks CSRF attacks on cookie-authenticated mutations from unauthorized origins", async () => {
    const validSessionToken = "sess-token-valid-csrf";

    vi.spyOn(prisma.session, "findUnique").mockResolvedValue({
      id: "sess-csrf-1",
      token: validSessionToken,
      userId: "user-alice",
      expiresAt: new Date(Date.now() + 3600000),
      user: { id: "user-alice", email: "a@certify.edu", fullName: "Alice", role: "STUDENT" },
    } as any);

    // Attacker site triggers POST request with legitimate user's cookie
    const res = await testApp.request("/mutate", {
      method: "POST",
      headers: {
        Cookie: `certify_session=${validSessionToken}`,
        Origin: "https://evil-phishing-site.com",
      },
    });

    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.error).toContain("Forbidden: CSRF origin validation failed");

    vi.restoreAllMocks();
  });

  it("allows cookie-authenticated mutations from trusted origins (pages.dev / localhost)", async () => {
    const validSessionToken = "sess-token-valid-csrf-allowed";

    vi.spyOn(prisma.session, "findUnique").mockResolvedValue({
      id: "sess-csrf-2",
      token: validSessionToken,
      userId: "user-alice",
      expiresAt: new Date(Date.now() + 3600000),
      user: { id: "user-alice", email: "a@certify.edu", fullName: "Alice", role: "STUDENT" },
    } as any);

    const res = await testApp.request("/mutate", {
      method: "POST",
      headers: {
        Cookie: `certify_session=${validSessionToken}`,
        Origin: "https://certify.pages.dev",
      },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.status).toBe("mutated");

    vi.restoreAllMocks();
  });

  it("blocks privilege escalation: student cannot perform instructor/admin actions", async () => {
    const validSessionToken = "sess-student-token";

    vi.spyOn(prisma.session, "findUnique").mockResolvedValue({
      id: "sess-stud-1",
      token: validSessionToken,
      userId: "user-student",
      expiresAt: new Date(Date.now() + 3600000),
      user: { id: "user-student", email: "s@certify.edu", fullName: "Student", role: "STUDENT" },
    } as any);

    const res = await testApp.request("/admin-only", {
      method: "POST",
      headers: {
        Cookie: `certify_session=${validSessionToken}`,
        Origin: "https://certify.pages.dev",
      },
    });

    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.error).toContain("Forbidden: Insufficient role permissions");

    vi.restoreAllMocks();
  });

  it("blocks IDOR attacks: verifyEnrollmentOwnership detects cross-tenant ownership violation", async () => {
    const findUniqueSpy = vi.spyOn(prisma.enrollment, "findUnique").mockResolvedValue({
      id: "enrollment-victim",
      userId: "user-victim-456",
      courseVersionId: "cv-1",
      status: "ACTIVE",
      currentTier: "EASY",
      enrolledAt: new Date(),
      completedAt: null,
    } as any);

    // Attacker tries to access victim's enrollment
    const result = await verifyEnrollmentOwnership("enrollment-victim", "user-attacker-123");
    expect(result.status).toBe("forbidden");

    // Legitimate owner accesses their own enrollment
    const legitimateResult = await verifyEnrollmentOwnership("enrollment-victim", "user-victim-456");
    expect(legitimateResult.status).toBe("ok");

    findUniqueSpy.mockRestore();
  });
});
