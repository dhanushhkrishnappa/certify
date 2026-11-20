import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config } from "../config/index.js";

// Detect Cloudflare Workers environment reliably even when nodejs_compat is enabled
const isCloudflareWorker =
  (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers") ||
  typeof (globalThis as any).WebSocketPair !== "undefined";

// Ensure resilient DNS resolution for local Node dev against router DNS blocks
if (!isCloudflareWorker && typeof process !== "undefined" && process.release?.name === "node") {
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

let _clientInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (_clientInstance) return _clientInstance;

  const envUrl = typeof process !== "undefined" ? process.env?.DATABASE_URL : undefined;
  const configUrl =
    config.databaseUrl && config.databaseUrl.startsWith("postgres")
      ? config.databaseUrl
      : undefined;
  const rawUrl = envUrl || configUrl;
  if (!rawUrl) {
    throw new Error(
      "[Prisma] CRITICAL: DATABASE_URL environment variable must be explicitly configured to a PostgreSQL connection string. Hardcoded fallback URLs are forbidden."
    );
  }

  // Clean connection string (remove channel_binding if present to prevent handshake rejections)
  let dbUrl = rawUrl.replace(/([?&])channel_binding=[^&]+(&|$)/g, "$1").replace(/[?&]$/, "");
  if (!dbUrl.includes("sslmode=")) {
    dbUrl += (dbUrl.includes("?") ? "&" : "?") + "sslmode=require";
  }

  // Configure Neon transport
  if (isCloudflareWorker) {
    // Cloudflare Workers edge environment: use HTTP fetch transport
    neonConfig.poolQueryViaFetch = true;
  } else if (typeof process !== "undefined" && process.release?.name === "node") {
    try {
      const ws = require("ws");
      neonConfig.webSocketConstructor = ws;
    } catch {}
  }

  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaNeon(pool);
  _clientInstance = new PrismaClient({ adapter } as any);
  return _clientInstance;
}

// Lazy Proxy: Prevents initialization errors during Cloudflare Workers script validation
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient() as any;
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
