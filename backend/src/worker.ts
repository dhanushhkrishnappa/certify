import { app } from "./app.js";
export { RateLimiterDO } from "./shared/middleware/honoRateLimit.js";

/**
 * Authoritative Cloudflare Workers Entrypoint.
 * Cloudflare invokes the exported fetch handler directly with Web Standards Request/Response.
 * Also exports RateLimiterDO for coordinated Durable Object global rate limiting.
 */
export default {
  fetch: app.fetch,
};
