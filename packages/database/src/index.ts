export type DatabaseProvider = "postgresql";

export type DatabaseReadiness = {
  configured: boolean;
  missingKeys: string[];
  provider: DatabaseProvider;
};

export const databaseEnvKeys = ["DATABASE_URL"] as const;

export function getDatabaseReadiness(
  env: Partial<Record<(typeof databaseEnvKeys)[number], string | undefined>> = process.env
): DatabaseReadiness {
  const missingKeys = databaseEnvKeys.filter((key) => !env[key]);

  return {
    configured: missingKeys.length === 0,
    missingKeys,
    provider: "postgresql"
  };
}

export * from "./client.js";
export * from "./repositories/couples.js";
export * from "./repositories/offers.js";
export * from "./repositories/policy-programs.js";
export * from "./services/couple-workspace-service.js";
