import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { honoRateLimiter, RateLimiterDO } from "./honoRateLimit.js";

describe("Hono Rate Limiter Middleware & Durable Object", () => {
  it("enforces rate limits per unauthenticated IP and returns HTTP 429 with Retry-After header", async () => {
    const testApp = new Hono();
    testApp.get(
      "/limited-ip",
      honoRateLimiter({ maxRequests: 2, windowSeconds: 60, keyPrefix: "test-ip" }),
      (c) => c.json({ ok: true })
    );

    const res1 = await testApp.request("/limited-ip", {
      headers: { "cf-connecting-ip": "198.51.100.1" },
    });
    expect(res1.status).toBe(200);

    const res2 = await testApp.request("/limited-ip", {
      headers: { "cf-connecting-ip": "198.51.100.1" },
    });
    expect(res2.status).toBe(200);

    // 3rd request should exceed limit
    const res3 = await testApp.request("/limited-ip", {
      headers: { "cf-connecting-ip": "198.51.100.1" },
    });
    expect(res3.status).toBe(429);
    expect(res3.headers.get("retry-after")).toBeDefined();

    const body = (await res3.json()) as any;
    expect(body.error).toContain("Rate limit exceeded");
    expect(body.retryAfterSeconds).toBeGreaterThan(0);

    // Different IP should still be allowed (isolated quota)
    const resDifferentIp = await testApp.request("/limited-ip", {
      headers: { "cf-connecting-ip": "198.51.100.2" },
    });
    expect(resDifferentIp.status).toBe(200);
  });

  it("prioritizes authenticated user ID over IP address preventing evasion via IP rotation", async () => {
    const testApp = new Hono();

    // Middleware simulating authentication context
    testApp.use("*", async (c, next) => {
      const userHeader = c.req.header("x-test-user-id");
      if (userHeader) {
        c.set("user" as any, { id: userHeader, email: "user@certify.edu", role: "STUDENT" });
      }
      return await next();
    });

    testApp.get(
      "/limited-user",
      honoRateLimiter({ maxRequests: 2, windowSeconds: 60, keyPrefix: "test-user" }),
      (c) => c.json({ ok: true })
    );

    // User "user-123" requests from IP A
    const res1 = await testApp.request("/limited-user", {
      headers: { "x-test-user-id": "user-123", "cf-connecting-ip": "1.1.1.1" },
    });
    expect(res1.status).toBe(200);

    // User "user-123" requests from IP B (attempted rotation)
    const res2 = await testApp.request("/limited-user", {
      headers: { "x-test-user-id": "user-123", "cf-connecting-ip": "2.2.2.2" },
    });
    expect(res2.status).toBe(200);

    // User "user-123" requests from IP C (quota exhausted despite IP change)
    const res3 = await testApp.request("/limited-user", {
      headers: { "x-test-user-id": "user-123", "cf-connecting-ip": "3.3.3.3" },
    });
    expect(res3.status).toBe(429);

    // A different user "user-456" from IP A is NOT blocked
    const resDifferentUser = await testApp.request("/limited-user", {
      headers: { "x-test-user-id": "user-456", "cf-connecting-ip": "1.1.1.1" },
    });
    expect(resDifferentUser.status).toBe(200);
  });

  it("verifies RateLimiterDO evaluates strict global quotas accurately", async () => {
    const doInstance = new RateLimiterDO();

    const req1 = new Request("http://rate-limiter/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "global:quota:user-1", maxRequests: 2, windowMs: 60000 }),
    });

    const res1 = await doInstance.fetch(req1);
    expect(res1.status).toBe(200);
    const body1 = (await res1.json()) as any;
    expect(body1.allowed).toBe(true);
    expect(body1.remaining).toBe(1);

    const req2 = new Request("http://rate-limiter/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "global:quota:user-1", maxRequests: 2, windowMs: 60000 }),
    });
    const res2 = await doInstance.fetch(req2);
    expect(res2.status).toBe(200);

    // 3rd invocation hits limit
    const req3 = new Request("http://rate-limiter/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "global:quota:user-1", maxRequests: 2, windowMs: 60000 }),
    });
    const res3 = await doInstance.fetch(req3);
    expect(res3.status).toBe(429);
    const body3 = (await res3.json()) as any;
    expect(body3.allowed).toBe(false);
    expect(body3.retryAfterSeconds).toBeGreaterThan(0);
    expect(res3.headers.get("retry-after")).toBeDefined();
  });
});
