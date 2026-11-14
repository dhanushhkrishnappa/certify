const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Use the shared prisma client which has resilient DNS overrides
const { prisma } = require("../dist/shared/prisma.js");

async function main() {
  const command = process.argv[2] || "list";
  const target = process.argv[3];

  try {
    if (command === "list") {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          emailVerified: true,
          dob: true,
          persona: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (users.length === 0) {
        console.log("\nNo users found in the database.\n");
      } else {
        console.log(`\nFound ${users.length} user(s) in Neon PostgreSQL:\n`);
        console.table(
          users.map((u) => ({
            ID: u.id.slice(0, 8) + "...",
            Email: u.email,
            Name: u.fullName || u.email,
            Verified: u.emailVerified ? "YES" : "NO",
            DOB: u.dob || "-",
            Persona: u.persona || "-",
            Created: u.createdAt ? new Date(u.createdAt).toLocaleString() : "-",
          }))
        );
        console.log("\nTo delete a user: node backend/scripts/manage_users.cjs delete <email>\n");
      }
    } else if (command === "delete") {
      if (!target) {
        console.error("Error: Please specify the email or ID to delete.");
        console.error("Usage: node backend/scripts/manage_users.cjs delete <email>");
        process.exit(1);
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: target.toLowerCase().trim() }, { id: target.trim() }],
        },
      });

      if (!user) {
        console.log(`\nUser '${target}' was not found in the database.\n`);
        return;
      }

      console.log(`\nDeleting user: ${user.fullName || user.email} (${user.email})...`);

      // Cascading cleanups
      await prisma.verification.deleteMany({ where: { identifier: user.email } }).catch(() => {});
      await prisma.session.deleteMany({ where: { userId: user.id } }).catch(() => {});
      await prisma.account.deleteMany({ where: { userId: user.id } }).catch(() => {});
      await prisma.dailyActivity.deleteMany({ where: { userId: user.id } }).catch(() => {});
      await prisma.storageArtifact.deleteMany({ where: { userId: user.id } }).catch(() => {});
      await prisma.enrollment.deleteMany({ where: { userId: user.id } }).catch(() => {});

      await prisma.user.delete({ where: { id: user.id } });

      console.log(`Successfully deleted user '${user.email}' from Neon PostgreSQL.\n`);
    } else if (command === "delete-all") {
      const count = await prisma.user.count();
      if (count === 0) {
        console.log("\nDatabase is already empty.\n");
        return;
      }

      console.log(`\nDeleting all ${count} user(s) from database...`);
      await prisma.verification.deleteMany({}).catch(() => {});
      await prisma.session.deleteMany({}).catch(() => {});
      await prisma.account.deleteMany({}).catch(() => {});
      await prisma.dailyActivity.deleteMany({}).catch(() => {});
      await prisma.storageArtifact.deleteMany({}).catch(() => {});
      await prisma.enrollment.deleteMany({}).catch(() => {});
      await prisma.user.deleteMany({});

      console.log(`Successfully deleted all ${count} users.\n`);
    } else {
      console.log("\nUnknown command. Available commands:");
      console.log("  node backend/scripts/manage_users.cjs list");
      console.log("  node backend/scripts/manage_users.cjs delete <email>");
      console.log("  node backend/scripts/manage_users.cjs delete-all\n");
    }
  } catch (err) {
    console.error("Error managing users:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

