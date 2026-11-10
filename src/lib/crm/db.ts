import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

loadEnv();

const globalForPrisma = globalThis as unknown as { crmPrisma?: PrismaClient };

export const prisma = globalForPrisma.crmPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.crmPrisma = prisma;
}
