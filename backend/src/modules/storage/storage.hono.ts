import { Hono } from "hono";
import { honoAuthMiddleware } from "../../shared/middleware/honoAuth.js";
import { honoRateLimiter } from "../../shared/middleware/honoRateLimit.js";
import { R2StorageService } from "./r2.service.js";

export const storageHonoRouter = new Hono();

// Authorize and register a private artifact upload
storageHonoRouter.post(
  "/upload-url",
  honoAuthMiddleware,
  honoRateLimiter({ maxRequests: 10, windowSeconds: 60, keyPrefix: "upload" }),
  async (c) => {
    try {
      const user = c.get("user");
      const body = await c.req.json().catch(() => ({}));
      const { enrollmentId, courseSlug, taskId, filename, fileSize, mimeType, checksum } = body;

      if (!enrollmentId || !courseSlug || !taskId || !filename || !fileSize || !mimeType) {
        return c.json({ error: "Missing required artifact metadata fields" }, 400);
      }

      const result = await R2StorageService.registerArtifactUpload({
        userId: user.id,
        enrollmentId,
        courseSlug,
        taskId,
        filename,
        fileSize: Number(fileSize),
        mimeType,
        checksum,
      });

      if (!result.authorized) {
        return c.json({ error: result.error }, 403);
      }

      return c.json({
        authorized: true,
        storageKey: result.storageKey,
        uploadUrl: result.uploadUrl,
      });
    } catch (err: any) {
      return c.json({ error: "Storage authorization failed", details: err?.message }, 500);
    }
  }
);

// Upload binary artifact payload directly to storage (R2 bucket or local dev simulation)
storageHonoRouter.put(
  "/upload/:key{.*}",
  honoAuthMiddleware,
  honoRateLimiter({ maxRequests: 20, windowSeconds: 60, keyPrefix: "upload-bin" }),
  async (c) => {
    try {
      const key = c.req.param("key") || "";
      const user = c.get("user");

      const access = await R2StorageService.authorizeArtifactAccess(key, user.id, user.role);
      if (!access.authorized || !access.artifact) {
        return c.json({ error: access.error || "Forbidden" }, 403);
      }

      const r2Bucket = (c.env as any)?.R2_BUCKET;
      if (r2Bucket && typeof r2Bucket.put === "function") {
        const bodyBuffer = await c.req.arrayBuffer();
        await r2Bucket.put(key, bodyBuffer, {
          httpMetadata: { contentType: access.artifact.mimeType },
        });
      }

      return c.json({
        uploaded: true,
        storageKey: key,
        mimeType: access.artifact.mimeType,
      });
    } catch (err: any) {
      return c.json({ error: "Upload failed", details: err?.message }, 500);
    }
  }
);

// Verify access and metadata of a private artifact (handles multi-segment paths cleanly)
storageHonoRouter.get("/:key{.*}", honoAuthMiddleware, async (c) => {
  try {
    const key = c.req.param("key") || "";
    const user = c.get("user");

    const access = await R2StorageService.authorizeArtifactAccess(key, user.id, user.role);
    if (!access.authorized) {
      return c.json({ error: access.error }, 403);
    }

    return c.json({
      authorized: true,
      artifact: access.artifact,
    });
  } catch (err: any) {
    return c.json({ error: "Artifact access failed", details: err?.message }, 500);
  }
});
