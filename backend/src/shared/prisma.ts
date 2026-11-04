import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

// Ensure resilient DNS resolution for local Node dev against router DNS blocks
if (typeof process !== "undefined" && process.release?.name === "node") {
  try {
    const dns = require("node:dns");
    const resolver = new dns.promises.Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);

    // Override dns.lookup for neon.tech so WebSockets and tls sockets resolve properly
    const origLookup = dns.lookup;
    dns.lookup = function (hostname: string, options: any, callback: any) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (hostname && typeof hostname === "string" && hostname.includes("neon.tech")) {
        resolver.resolve4(hostname).then(
          (addrs: string[]) => {
            if (options && options.all) {
              callback(null, addrs.map((a) => ({ address: a, family: 4 })));
            } else {
              callback(null, addrs[0], 4);
            }
          },
          () => origLookup(hostname, options, callback)
        );
      } else {
        origLookup(hostname, options, callback);
      }
    };

    const { setGlobalDispatcher, Agent } = require("undici");
    const agent = new Agent({
      connect: {
        lookup: (hostname: string, options: any, cb: any) => {
          const callback = typeof options === "function" ? options : cb;
          const opts = typeof options === "object" ? options : {};
          resolver.resolve4(hostname).then(
            (addresses: string[]) => {
              if (opts.all) {
                callback(null, addresses.map((a) => ({ address: a, family: 4 })));
              } else {
                callback(null, addresses[0], 4);
              }
            },
            (err: any) => callback(err)
          );
        },
      },
    });
    setGlobalDispatcher(agent);
  } catch {
    // Edge environments (Cloudflare Workers) do not use Node undici dispatcher
  }
}

function createPrismaClient(): PrismaClient {
  const isPostgres =
    config.databaseUrl.startsWith("postgres://") ||
    config.databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    try {
      const { Pool, neonConfig } = require("@neondatabase/serverless");
      const { PrismaNeon } = require("@prisma/adapter-neon");

      // Attach WebSocket constructor if in Node.js environment
      if (typeof process !== "undefined" && !process.env.WORKERS) {
        try {
          const ws = require("ws");
          neonConfig.webSocketConstructor = ws;
        } catch {}
      }

      const pool = new Pool({ connectionString: config.databaseUrl });
      const adapter = new PrismaNeon(pool);
      return new PrismaClient({ adapter } as any);
    } catch {
      return new PrismaClient();
    }
  }

  return new PrismaClient();
}

export const prisma = createPrismaClient();
