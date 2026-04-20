// Prisma 클라이언트 싱글톤 — dev 핫리로드 시 연결 과다 방지
// Prisma 7.x: 연결 URL은 prisma.config.ts에서 관리,
// 클라이언트 인스턴스화 시에는 driver adapter(@prisma/adapter-pg) 필수.
// 참고: https://www.prisma.io/docs/orm/overview/databases/database-drivers
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
