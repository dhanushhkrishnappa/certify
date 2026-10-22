import { describe, it, expect } from "vitest";
import { app } from "./app.js";

describe("Hono Web Standards API Endpoints", () => {
  it("returns 200 OK on health check with Ed25519 crypto metadata and supported models", async () => {
    const res = await app.request("/api/v1/health");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.status).toBe("ok");
    expect(body.service).toBe("certify-backend");
    expect(body.runtime).toContain("Cloudflare Workers");
    expect(body.crypto.algorithm).toContain("Ed25519");
    expect(body.crypto.keyId).toBeDefined();
    expect(body.models.tutorModel).toBe("claude-sonnet-4-6");
    expect(body.models.evaluatorModel).toBe("claude-haiku-4-5-20251001");
    expect(body.models.tutorModel).not.toContain("claude-3-5");
    expect(body.models.tutorModel).not.toContain("claude-3-7");
  });

  it("returns 404 on non-existent endpoints", async () => {
    const res = await app.request("/api/v1/non-existent-route");
    expect(res.status).toBe(404);
  });
});
