import { spawnSync } from "node:child_process";
import { Client } from "pg";
import { getProductionDatabaseSchema, withProductionDatabaseSchema } from "../src/database-url";

type MigrationBaseline = {
  checks: Array<{ column?: string; table: string }>;
  name: string;
};

const migrations: MigrationBaseline[] = [
  {
    checks: [
      { table: "users" },
      { table: "couples" },
      { table: "couple_members" },
      { table: "policy_programs" },
      { table: "offers" },
      { table: "compare_rooms" },
      { table: "articles" },
      { table: "event_logs" }
    ],
    name: "20260604221104_init"
  },
  {
    checks: [
      { column: "preferred_wedding_style", table: "couples" },
      { column: "move_in_plan_at", table: "couples" },
      { column: "phone_verified", table: "couple_members" },
      { column: "onboarding_status", table: "couple_members" }
    ],
    name: "20260605090000_onboarding"
  }
];

const databaseUrl = process.env.DATABASE_URL;
const schemaName =
  process.env.VERCEL_ENV === "production" ? getProductionDatabaseSchema() : "public";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to baseline production migrations.");
}

async function tableExists(client: Client, tableName: string) {
  const result = await client.query<{ exists: boolean }>(
    "select to_regclass($1) is not null as exists",
    [`${schemaName}.${tableName}`]
  );

  return result.rows[0]?.exists ?? false;
}

async function columnExists(client: Client, tableName: string, columnName: string) {
  const result = await client.query<{ exists: boolean }>(
    `
      select exists (
        select 1
        from information_schema.columns
        where table_schema = $1
          and table_name = $2
          and column_name = $3
      ) as exists
    `,
    [schemaName, tableName, columnName]
  );

  return result.rows[0]?.exists ?? false;
}

async function getAppliedMigrations(client: Client) {
  const hasMigrationTable = await tableExists(client, "_prisma_migrations");

  if (!hasMigrationTable) {
    return new Set<string>();
  }

  const result = await client.query<{ migration_name: string }>(
    `
      select migration_name
      from "${schemaName}"."_prisma_migrations"
      where rolled_back_at is null
    `
  );

  return new Set(result.rows.map((row) => row.migration_name));
}

async function migrationLooksApplied(client: Client, migration: MigrationBaseline) {
  for (const check of migration.checks) {
    const exists = check.column
      ? await columnExists(client, check.table, check.column)
      : await tableExists(client, check.table);

    if (!exists) {
      return false;
    }
  }

  return true;
}

function resolveAppliedMigration(migrationName: string) {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "prisma",
      "migrate",
      "resolve",
      "--applied",
      migrationName,
      "--config",
      "prisma.config.ts"
    ],
    {
      env: process.env,
      shell: false,
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const client = new Client({
  connectionString: withProductionDatabaseSchema(databaseUrl)
});

try {
  await client.connect();
  const appliedMigrations = await getAppliedMigrations(client);

  for (const migration of migrations) {
    if (appliedMigrations.has(migration.name)) {
      continue;
    }

    if (await migrationLooksApplied(client, migration)) {
      console.log(`Baselining existing production schema migration: ${migration.name}`);
      resolveAppliedMigration(migration.name);
      appliedMigrations.add(migration.name);
    }
  }
} finally {
  await client.end();
}
