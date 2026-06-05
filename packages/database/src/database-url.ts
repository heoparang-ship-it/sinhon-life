const productionDatabaseSchema = "sinhon_os";

type DatabaseUrlEnv = Partial<Record<"VERCEL_ENV", string | undefined>>;

export function withProductionDatabaseSchema(
  databaseUrl: string,
  env: DatabaseUrlEnv = process.env
) {
  if (env.VERCEL_ENV !== "production") {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  url.searchParams.set("schema", productionDatabaseSchema);

  return url.toString();
}

export function getProductionDatabaseSchema() {
  return productionDatabaseSchema;
}
