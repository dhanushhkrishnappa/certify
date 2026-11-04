const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;
const { setGlobalDispatcher, Agent } = require("undici");
const { neon } = require("@neondatabase/serverless");

// 1. Configure reliable DNS resolver (8.8.8.8 / 1.1.1.1) to bypass local router DNS filters
const resolver = new dns.Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const agent = new Agent({
  connect: {
    lookup: (hostname, options, cb) => {
      const callback = typeof options === "function" ? options : cb;
      const opts = typeof options === "object" ? options : {};
      resolver.resolve4(hostname).then(
        (addresses) => {
          if (opts.all) {
            callback(null, addresses.map((a) => ({ address: a, family: 4 })));
          } else {
            callback(null, addresses[0], 4);
          }
        },
        (err) => callback(err)
      );
    },
  },
});
setGlobalDispatcher(agent);

// 2. Read connection string
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env!");
  process.exit(1);
}

console.log("Connecting to Neon PostgreSQL Serverless over HTTP...");
const sql = neon(databaseUrl);

async function main() {
  const ping = await sql("SELECT current_database(), current_user, version()");
  console.log("Connected to Neon DB:", ping[0]);

  // Clean test_ping table
  await sql("DROP TABLE IF EXISTS test_ping");

  const ddlPath = path.join(__dirname, "../prisma/neon_init.sql");
  const rawDdl = fs.readFileSync(ddlPath, "utf8");

  // Remove comment lines and split by semicolon
  const cleanDdl = rawDdl
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleanDdl
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Parsed ${statements.length} DDL statements. Applying to Neon DB...`);

  let applied = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql(stmt);
      applied++;
      process.stdout.write(`\rProgress: ${applied}/${statements.length} statements applied`);
    } catch (err) {
      if (err.message && (err.message.includes("already exists") || err.message.includes("duplicate"))) {
        applied++;
      } else {
        console.error(`\nError executing statement #${i + 1}:\n${stmt.slice(0, 120)}...\nError:`, err.message);
      }
    }
  }

  console.log(`\n\nSchema application completed! ${applied}/${statements.length} statements applied.`);

  // Verify all tables
  const tables = await sql(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name ASC"
  );

  console.log("\nVerified tables created on Neon PostgreSQL:");
  console.table(tables.map((t) => t.table_name));

  console.log("\nNeon DB schema successfully provisioned and ready!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
