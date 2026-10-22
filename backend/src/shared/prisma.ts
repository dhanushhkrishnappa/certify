import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";

function createPrismaClient(): PrismaClient {
  const isPostgres =
    config.databaseUrl.startsWith("postgres://") ||
    config.databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    try {
      const { Pool } = require("@neondatabase/serverless");
      const { PrismaNeon } = require("@prisma/adapter-neon");
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
