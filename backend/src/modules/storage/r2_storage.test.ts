import { describe, it, expect, vi } from "vitest";
import { R2StorageService, ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "./r2.service.js";
import { prisma } from "../../shared/prisma.js";

describe("Cloudflare R2 Storage Security & Authorization", () => {
  it("rejects unauthorized MIME types", async () => {
    const result = await R2StorageService.registerArtifactUpload({
      userId: "user-1",
      enrollmentId: "enr-1",
      courseSlug: "python-fundamentals",
      taskId: "task-1",
      filename: "exploit.exe",
      fileSize: 1024,
      mimeType: "application/x-msdownload",
    });

    expect(result.authorized).toBe(false);
    expect(result.error).toContain("MIME type 'application/x-msdownload' is not allowed");
  });

  it("rejects uploads exceeding the 5MB size limit", async () => {
    const result = await R2StorageService.registerArtifactUpload({
      userId: "user-1",
      enrollmentId: "enr-1",
      courseSlug: "python-fundamentals",
      taskId: "task-1",
      filename: "large_file.pdf",
      fileSize: MAX_UPLOAD_SIZE_BYTES + 100,
      mimeType: "application/pdf",
    });

    expect(result.authorized).toBe(false);
    expect(result.error).toContain("exceeds the 5MB maximum allowed limit");
  });

  it("enforces enrollment ownership: learner A cannot upload artifacts for learner B's enrollment", async () => {
    vi.spyOn(prisma.enrollment, "findUnique").mockResolvedValue({
      id: "enr-victim",
      userId: "user-victim",
      courseVersionId: "cv-1",
      status: "ACTIVE",
      currentTier: "EASY",
      enrolledAt: new Date(),
      completedAt: null,
    } as any);

    const result = await R2StorageService.registerArtifactUpload({
      userId: "user-attacker",
      enrollmentId: "enr-victim",
      courseSlug: "python-fundamentals",
      taskId: "task-1",
      filename: "submission.py",
      fileSize: 2048,
      mimeType: "text/x-python",
    });

    expect(result.authorized).toBe(false);
    expect(result.error).toContain("Forbidden: You do not have authorization");

    vi.restoreAllMocks();
  });

  it("generates controlled storage keys preventing arbitrary path traversal", () => {
    const key = R2StorageService.buildStorageKey({
      courseSlug: "python-fundamentals",
      enrollmentId: "enr-123",
      taskId: "task-456",
      filename: "../../etc/passwd",
    });

    expect(key).not.toContain("..");
    expect(key).toBe("artifacts/python-fundamentals/enr-123/task-456/__etc_passwd");
  });
});
