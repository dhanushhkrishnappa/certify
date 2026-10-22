import { prisma } from "../../shared/prisma.js";
import { logger } from "../../shared/logger.js";

export const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "text/x-python",
  "application/json",
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit

export class R2StorageService {
  /**
   * Generates a controlled, authorized storage key.
   * Format: artifacts/{courseSlug}/{enrollmentId}/{taskId}/{sanitizedFilename}
   */
  public static buildStorageKey(params: {
    courseSlug: string;
    enrollmentId: string;
    taskId: string;
    filename: string;
  }): string {
    const cleanFilename = params.filename
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/^\.+/, "");
    return `artifacts/${params.courseSlug}/${params.enrollmentId}/${params.taskId}/${cleanFilename}`;
  }

  /**
   * Authorizes and records a private artifact upload.
   */
  public static async registerArtifactUpload(params: {
    userId: string;
    enrollmentId: string;
    courseSlug: string;
    taskId: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    checksum?: string;
    r2Bucket?: any; // Cloudflare R2Bucket binding
  }): Promise<{
    storageKey: string;
    authorized: boolean;
    uploadUrl?: string;
    error?: string;
  }> {
    // 1. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(params.mimeType)) {
      return {
        storageKey: "",
        authorized: false,
        error: `MIME type '${params.mimeType}' is not allowed for private artifacts.`,
      };
    }

    // 2. Validate Size Limit
    if (params.fileSize > MAX_UPLOAD_SIZE_BYTES) {
      return {
        storageKey: "",
        authorized: false,
        error: `File size exceeds the 5MB maximum allowed limit.`,
      };
    }

    // 3. Ownership Verification
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: params.enrollmentId },
      include: { courseVersion: { include: { course: true } } },
    });

    if (!enrollment || enrollment.userId !== params.userId) {
      return {
        storageKey: "",
        authorized: false,
        error: "Forbidden: You do not have authorization to upload artifacts for this enrollment.",
      };
    }

    const storageKey = this.buildStorageKey({
      courseSlug: params.courseSlug,
      enrollmentId: params.enrollmentId,
      taskId: params.taskId,
      filename: params.filename,
    });

    // 4. Record metadata in PostgreSQL
    await prisma.storageArtifact.upsert({
      where: { storageKey },
      create: {
        storageKey,
        enrollmentId: params.enrollmentId,
        userId: params.userId,
        fileSize: params.fileSize,
        mimeType: params.mimeType,
        checksum: params.checksum,
      },
      update: {
        fileSize: params.fileSize,
        mimeType: params.mimeType,
        checksum: params.checksum,
        uploadedAt: new Date(),
      },
    });

    logger.info("Private artifact authorized and recorded", { storageKey, userId: params.userId });

    return {
      storageKey,
      authorized: true,
      uploadUrl: `/api/v1/storage/upload/${encodeURIComponent(storageKey)}`,
    };
  }

  /**
   * Verifies authorization to read/download a private artifact.
   */
  public static async authorizeArtifactAccess(
    storageKey: string,
    requesterUserId: string,
    requesterRole: string
  ): Promise<{ authorized: boolean; artifact?: any; error?: string }> {
    const artifact = await prisma.storageArtifact.findUnique({
      where: { storageKey },
    });

    if (!artifact) {
      return { authorized: false, error: "Artifact not found" };
    }

    // Owner, Instructors, and Admins are permitted
    const isOwner = artifact.userId === requesterUserId;
    const isStaff = requesterRole === "INSTRUCTOR" || requesterRole === "ADMIN";

    if (!isOwner && !isStaff) {
      return {
        authorized: false,
        error: "Forbidden: You do not have permission to access this private artifact.",
      };
    }

    return { authorized: true, artifact };
  }
}
