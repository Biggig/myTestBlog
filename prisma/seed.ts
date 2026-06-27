import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Status } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("ADMIN_PASSWORD environment variable is required");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists, skipping.`);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { username, password: hashed } });
    console.log(`Created admin user: ${username}`);
  }

  const tagNames = ["React", "TypeScript", "Node.js", "DevOps", "API", "前端", "后端"];
  for (const name of tagNames) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/\./g, "-") },
    });
  }
  console.log("Seed tags created.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
