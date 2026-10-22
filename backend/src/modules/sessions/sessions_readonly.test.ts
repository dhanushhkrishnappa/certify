import { describe, it, expect, vi } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../shared/prisma.js";

describe("Sessions Read-Only GET Integrity", () => {
  const testSessionToken = "sess-readonly-test-token-1";

  it("does NOT create an enrollment or session when learner queries a course session", async () => {
    // Spy on prisma write methods
    const createEnrollmentSpy = vi.spyOn(prisma.enrollment, "create");
    const createSessionSpy = vi.spyOn(prisma.learningSession, "create");
    const createMasterySpy = vi.spyOn(prisma.conceptMastery, "create");

    // Mock session lookup
    vi.spyOn(prisma.session, "findUnique").mockResolvedValue({
      id: "sess-ro-1",
      token: testSessionToken,
      userId: "user-new-learner",
      expiresAt: new Date(Date.now() + 3600000),
      user: {
        id: "user-new-learner",
        email: "new@certify.edu",
        fullName: "New Learner",
        role: "STUDENT",
      },
    } as any);

    // Mock course lookup returning an active course
    vi.spyOn(prisma.course, "findUnique").mockResolvedValue({
      id: "course-py",
      slug: "python-fundamentals",
      title: "Python Fundamentals",
      summary: "Core Python",
      description: "Description",
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: [
        {
          id: "cv-1",
          courseId: "course-py",
          versionNumber: "1.0.0",
          changelog: null,
          isActive: true,
          createdAt: new Date(),
          modules: [],
        },
      ],
    } as any);

    // Mock enrollment lookup returning null (learner not yet enrolled)
    vi.spyOn(prisma.enrollment, "findUnique").mockResolvedValue(null);

    const res = await app.request("/api/v1/courses/python-fundamentals/session", {
      headers: {
        Authorization: `Bearer ${testSessionToken}`,
      },
    });

    // Assert that GET request returned 404 with enrolled: false
    expect(res.status).toBe(404);
    const jsonBody = (await res.json()) as any;
    expect(jsonBody.enrolled).toBe(false);

    // CRITICAL: Assert that ZERO database writes were attempted
    expect(createEnrollmentSpy).not.toHaveBeenCalled();
    expect(createSessionSpy).not.toHaveBeenCalled();
    expect(createMasterySpy).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
