import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logConfig: Prisma.LogLevel[] = ["error", "warn"];
if (process.env.PRISMA_LOG_QUERIES === "true") logConfig.unshift("query");

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
