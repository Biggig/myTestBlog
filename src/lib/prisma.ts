import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// @ts-expect-error — Prisma 7 with custom output path requires adapter config in production
export const prisma = globalForPrisma.prisma ?? new PrismaClient({});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
