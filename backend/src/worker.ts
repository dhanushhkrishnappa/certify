import { app } from "./app.js";
export { RateLimiterDO } from "./shared/middleware/honoRateLimit.js";

/**
 * Authoritative Cloudflare Workers Entrypoint.
 * Hydrates process.env from Cloudflare runtime bindings on each request
 * so all downstream modules (Prisma, Better Auth, Config) have access to secrets.
 */
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    if (env && typeof env === "object") {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
    }
    return app.fetch(request, env, ctx);
  },
};
