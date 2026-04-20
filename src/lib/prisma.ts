// Prisma 클라이언트 싱글톤 — dev 핫리로드 시 연결 과다 방지
// Prisma 7.x: 연결 URL은 prisma.config.ts에서 관리, 생성자 옵션 불필요
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
