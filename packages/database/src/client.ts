import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { withProductionDatabaseSchema } from "./database-url";

export type SinhonPrismaClient = PrismaClient;
export type { Prisma };

export type CreatePrismaClientOptions = {
  databaseUrl?: string;
  log?: Array<"query" | "info" | "warn" | "error">;
};

let prismaClient: SinhonPrismaClient | undefined;

export function getDatabaseUrl(
  env: Partial<Record<"DATABASE_URL" | "VERCEL_ENV", string | undefined>> = process.env
): string {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to create a Prisma client.");
  }

  return withProductionDatabaseSchema(env.DATABASE_URL, env);
}

export function createPrismaClient(options: CreatePrismaClientOptions = {}): SinhonPrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg(options.databaseUrl ?? getDatabaseUrl()),
    log: options.log
  });
}

export function getPrismaClient(): SinhonPrismaClient {
  prismaClient ??= createPrismaClient();
  return prismaClient;
}

export async function disconnectPrismaClient(): Promise<void> {
  if (!prismaClient) {
    return;
  }

  await prismaClient.$disconnect();
  prismaClient = undefined;
}
