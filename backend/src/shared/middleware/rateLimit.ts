import { Request, Response, NextFunction } from "express";

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup of expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (now >= entry.resetAt) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, keyPrefix = "rl" } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const actor =
      (req as any).user?.id ||
      (req.headers["x-forwarded-for"] as string) ||
      req.ip ||
      "anonymous";
    const key = `${keyPrefix}:${actor}`;
    const entry = buckets.get(key);

    if (!entry || now >= entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      res.status(429).json({
        error: "Rate limit exceeded. Please wait before retrying.",
        retryAfterSeconds: retryAfterSec,
      });
      return;
    }

    next();
  };
}

export function rateLimitMiddleware(maxRequests: number, windowSeconds: number = 60, keyPrefix: string = "rl") {
  return createRateLimiter({
    maxRequests,
    windowMs: windowSeconds * 1000,
    keyPrefix,
  });
}
