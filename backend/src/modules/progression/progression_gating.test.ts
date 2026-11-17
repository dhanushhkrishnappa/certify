import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../shared/prisma.js";
import { auth } from "../../lib/auth.js";

describe("Backend-Authoritative Progression Gating & Lock Enforcement", () => {
  const testEmail = `prog_test_${Date.now()}@certify.edu`;
  const testPassword = "Password123!";
  let token = "";
  let userId = "";
  let enrollmentId = "";
  let mod1Ch1Id = "";
  let mod1Ch2Id = "";
  let mod2Ch1Id = "";
  let sessionId = "";

  beforeAll(async () => {
    await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: "Progression Tester",
        // @ts-ignore
        fullName: "Progression Tester",
      },
    });

    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    userId = user!.id;

    const loginRes = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const loginData: any = await loginRes.json();
    token = loginData.token;

    // Enroll in python-fundamentals
    const enrollRes = await app.request("/api/v1/courses/python-fundamentals/enroll", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const enrollData: any = await enrollRes.json();
    enrollmentId = enrollData.enrollmentId;

    const progRes = await app.request("/api/v1/courses/python-fundamentals/progression", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const progData: any = await progRes.json();
    const modules = progData.progression.modules;
    mod1Ch1Id = modules[0].chapters[0].id;
    mod1Ch2Id = modules[0].chapters[1].id;
    mod2Ch1Id = modules[1].chapters[0].id;

    const sessRes = await app.request("/api/v1/courses/python-fundamentals/session", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessData: any = await sessRes.json();
    sessionId = sessData.session.id;
  }, 20000);

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
  });

  it("initializes ONLY Module 01 -> Chapter 1 -> Section 1 as UNLOCKED and locks all later modules/chapters", async () => {
    const res = await app.request("/api/v1/courses/python-fundamentals/progression", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    const mods = data.progression.modules;

    expect(mods.length).toBe(10);
    expect(mods[0].status).toBe("UNLOCKED");
    expect(mods[1].status).toBe("LOCKED");
    expect(mods[9].status).toBe("LOCKED");

    expect(mods[0].chapters[0].status).toBe("UNLOCKED");
    expect(mods[0].chapters[1].status).toBe("LOCKED");
    expect(mods[0].chapters[0].sections[0].status).toBe("UNLOCKED");
    expect(mods[0].chapters[0].sections[1].status).toBe("LOCKED");
  });

  it("rejects jumping directly into a LOCKED future module chapter with HTTP 403 PROGRESSION_LOCKED", async () => {
    const res = await app.request("/api/v1/courses/python-fundamentals/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chapterId: mod2Ch1Id }),
    });

    expect(res.status).toBe(403);
    const data: any = await res.json();
    expect(data.error).toBe("PROGRESSION_LOCKED");
    expect(data.lockedEntity.type).toBe("MODULE");
    expect(Array.isArray(data.prerequisites)).toBe(true);
    expect(data.prerequisites.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects jumping into a LOCKED sibling chapter within Module 01 with HTTP 403 PROGRESSION_LOCKED", async () => {
    const res = await app.request("/api/v1/courses/python-fundamentals/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ chapterId: mod1Ch2Id }),
    });

    expect(res.status).toBe(403);
    const data: any = await res.json();
    expect(data.error).toBe("PROGRESSION_LOCKED");
    expect(data.lockedEntity.type).toBe("CHAPTER");
  });

  it("blocks premature /sections/advance before completing required section turns (HTTP 403 SECTION_INCOMPLETE)", async () => {
    const res = await app.request(`/api/v1/sessions/${sessionId}/sections/advance`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(403);
    const data: any = await res.json();
    expect(data.error).toBe("SECTION_INCOMPLETE");
  });

  it("blocks unconditional /sessions/:id/advance before chapter completion (HTTP 403 PROGRESSION_LOCKED)", async () => {
    const res = await app.request(`/api/v1/sessions/${sessionId}/advance`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(403);
    const data: any = await res.json();
    expect(data.error).toBe("PROGRESSION_LOCKED");
  });

  it("blocks accessing checkpoint questions or practical tasks for locked chapters/modules (HTTP 403)", async () => {
    const qRes = await app.request(
      `/api/v1/assessments/chapters/${mod2Ch1Id}?enrollmentId=${enrollmentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(qRes.status).toBe(403);

    const pracRes = await app.request("/api/v1/assessments/practical/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        enrollmentId,
        taskId: "practical-m02-classify-ticket",
        code: "def classify_ticket(age, is_student):\n    return 'adult'\n",
      }),
    });
    expect(pracRes.status).toBe(403);
  });
});
