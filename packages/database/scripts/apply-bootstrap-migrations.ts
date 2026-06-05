import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const schemaName = "public";

const initialMigrationName = "20260604221104_init";
const onboardingMigrationName = "20260605090000_onboarding";

const initialTables = [
  "users",
  "couples",
  "couple_members",
  "couple_invitations",
  "scenarios",
  "scenario_items",
  "policy_programs",
  "policy_rule_versions",
  "eligibility_results",
  "vendors",
  "vendor_branches",
  "offers",
  "offer_price_versions",
  "compare_rooms",
  "compare_cards",
  "approvals",
  "compare_comments",
  "lead_requests",
  "lead_status_histories",
  "decision_logs",
  "documents",
  "tasks",
  "notifications",
  "articles",
  "event_logs"
];

const onboardingColumns = [
  { column: "preferred_wedding_style", table: "couples" },
  { column: "move_in_plan_at", table: "couples" },
  { column: "phone_verified", table: "couple_members" },
  { column: "work_region", table: "couple_members" },
  { column: "income_range", table: "couple_members" },
  { column: "asset_range", table: "couple_members" },
  { column: "onboarding_status", table: "couple_members" },
  { column: "onboarding_completed_at", table: "couple_members" }
];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to bootstrap production migrations.");
}

const scriptsDir = dirname(fileURLToPath(import.meta.url));

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

async function readMigrationSql(migrationName: string) {
  return readFile(
    resolve(scriptsDir, "..", "prisma", "migrations", migrationName, "migration.sql"),
    "utf8"
  );
}

async function applyMigrationSql(client: Client, migrationName: string) {
  const sql = await readMigrationSql(migrationName);

  console.log(`Applying production bootstrap migration SQL: ${migrationName}`);

  for (const statement of splitMigrationSql(sql)) {
    await client.query(statement);
  }
}

function splitMigrationSql(sql: string) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function getExistingInitialTables(client: Client) {
  const checks: Array<{ exists: boolean; tableName: string }> = [];

  for (const tableName of initialTables) {
    checks.push({
      exists: await tableExists(client, tableName),
      tableName
    });
  }

  return checks.filter((check) => check.exists).map((check) => check.tableName);
}

async function getMissingOnboardingColumns(client: Client) {
  const checks: Array<(typeof onboardingColumns)[number] & { exists: boolean }> = [];

  for (const check of onboardingColumns) {
    checks.push({
      ...check,
      exists: await columnExists(client, check.table, check.column)
    });
  }

  return checks.filter((check) => !check.exists);
}

const client = new Client({
  connectionString: databaseUrl
});

try {
  await client.connect();
  await client.query("begin");

  const existingInitialTables = await getExistingInitialTables(client);

  if (existingInitialTables.length === 0) {
    await applyMigrationSql(client, initialMigrationName);
  } else if (existingInitialTables.length !== initialTables.length) {
    throw new Error(
      `Production schema has a partial or conflicting Sinhon OS table set: ${existingInitialTables.join(", ")}. Manual review is required before bootstrapping.`
    );
  } else {
    console.log("Initial production migration is already reflected in public schema.");
  }

  const missingOnboardingColumns = await getMissingOnboardingColumns(client);

  if (missingOnboardingColumns.length > 0) {
    await applyMigrationSql(client, onboardingMigrationName);
  } else {
    console.log("Onboarding production migration is already reflected in public schema.");
  }

  await client.query("commit");
} catch (error) {
  await client.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
