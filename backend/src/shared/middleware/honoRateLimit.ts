import { Context, Next } from "hono";

export interface HonoRateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
  strictGlobal?: boolean; // When true, coordinates with Durable Object for exact global quotas
}

// Durable Object class exportable for Cloudflare Workers deployment
export class RateLimiterDO {
  private store = new Map<string, { count: number; resetAt: number }>();

  async fetch(request: Request): Promise<Response> {
    try {
      const data = (await request.json()) as { key: string; maxRequests: number; windowMs: number };
      const { key, maxRequests, windowMs } = data;
      const now = Date.now();
      const entry = this.store.get(key);

      if (!entry || now >= entry.resetAt) {
        this.store.set(key, { count: 1, resetAt: now + windowMs });
        return new Response(
          JSON.stringify({ allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      entry.count += 1;
      if (entry.count > maxRequests) {
        const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
        return new Response(
          JSON.stringify({ allowed: false, remaining: 0, retryAfterSeconds }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfterSeconds),
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          remaining: maxRequests - entry.count,
          retryAfterSeconds: 0,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message }), { status: 500 });
    }
  }
}

// Local coordinated memory store for dev/testing with automatic cleanup
const localMemoryStore = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of localMemoryStore.entries()) {
    if (now >= entry.resetAt) {
      localMemoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function honoRateLimiter(options: HonoRateLimitOptions) {
  const { windowSeconds, maxRequests, keyPrefix = "rl", strictGlobal = false } = options;
  const windowMs = windowSeconds * 1000;

  return async (c: Context, next: Next): Promise<Response | void> => {
    // 1. Determine Actor Key: Prioritize authenticated user ID over IP address
    const user = c.get("user");
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
      "127.0.0.1";
    const actorKey = user ? `user:${user.id}` : `ip:${ip}`;
    const rateLimitKey = `${keyPrefix}:${actorKey}`;

    // 2. Coordinated Durable Object Rate Limiting (Strict Global Upstream Quota Protection)
    const doNamespace = (c.env as any)?.RATE_LIMITER_DO;
    if (strictGlobal && doNamespace && typeof doNamespace.idFromName === "function") {
      try {
        const id = doNamespace.idFromName(rateLimitKey);
        const obj = doNamespace.get(id);
        const doRes = await obj.fetch("http://rate-limiter/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: rateLimitKey, maxRequests, windowMs }),
        });

        if (doRes.status === 429) {
          const result = (await doRes.json()) as any;
          c.header("Retry-After", String(result.retryAfterSeconds || windowSeconds));
          return c.json(
            {
              error: "Too Many Requests: Strict global rate limit exceeded. Please wait before retrying.",
              retryAfterSeconds: result.retryAfterSeconds || windowSeconds,
              limitType: "DURABLE_OBJECT_GLOBAL",
            },
            429
          );
        }
        return await next();
      } catch {
        // Fallback to local store if DO call encounters an issue
      }
    }

    // 3. Cloudflare Rate Limiter Binding Check (Coarse Location-Specific Edge Protection)
    const cfRateLimiter = (c.env as any)?.RATE_LIMITER;
    if (cfRateLimiter && typeof cfRateLimiter.limit === "function") {
      try {
        const { success } = await cfRateLimiter.limit({ key: rateLimitKey });
        if (!success) {
          c.header("Retry-After", String(windowSeconds));
          return c.json(
            {
              error: "Too Many Requests: Edge rate limit exceeded. Please wait before retrying.",
              retryAfterSeconds: windowSeconds,
              limitType: "CLOUDFLARE_EDGE_BINDING",
            },
            429
          );
        }
        return await next();
      } catch {
        // Fallback to local store
      }
    }

    // 4. Coordinated Local Store Fallback (Development & Vitest Environments)
    const now = Date.now();
    const entry = localMemoryStore.get(rateLimitKey);

    if (!entry || now >= entry.resetAt) {
      localMemoryStore.set(rateLimitKey, { count: 1, resetAt: now + windowMs });
      return await next();
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      c.header("Retry-After", String(retryAfterSec));
      return c.json(
        {
          error: "Too Many Requests: Rate limit exceeded. Please wait before retrying.",
          retryAfterSeconds: retryAfterSec,
          limitType: "COORDINATED_LOCAL_FALLBACK",
        },
        429
      );
    }

    return await next();
  };
}
