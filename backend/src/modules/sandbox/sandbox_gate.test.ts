import { describe, it, expect, vi } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../shared/prisma.js";

describe("Python Sandbox Security Gate", () => {
  const testSessionToken = "sess-sandbox-gate-token-1";

  it("fails closed on public POST /api/v1/execute returning HTTP 503 Service Unavailable", async () => {
    vi.spyOn(prisma.session, "findUnique").mockResolvedValue({
      id: "sess-1",
      token: testSessionToken,
      userId: "test-user-1",
      expiresAt: new Date(Date.now() + 3600000),
      user: { id: "test-user-1", email: "test@certify.edu", role: "STUDENT", fullName: "Test User" },
    } as any);

    const res = await app.request("/api/v1/execute", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${testSessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: 'import os; print("hello")' }),
    });

    expect(res.status).toBe(503);
    const body = (await res.json()) as any;
    expect(body.error).toContain("Direct arbitrary code execution is disabled for security isolation");
    expect(body.status).toBe("DISABLED");
    expect(body.isolationGate).toBe("CLOUDFLARE_SANDBOX_PENDING");

    vi.restoreAllMocks();
  });
});
