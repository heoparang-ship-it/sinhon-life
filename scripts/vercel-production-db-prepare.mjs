import { spawnSync } from "node:child_process";

const shouldPrepareDatabase = process.env.VERCEL_ENV === "production";

if (!shouldPrepareDatabase) {
  console.log("Skipping production DB preparation outside Vercel production.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for production DB preparation.");
}

if (!process.env.DIRECT_URL) {
  throw new Error("DIRECT_URL is required for production DB preparation.");
}

const directDatabaseEnv = {
  ...process.env,
  DATABASE_URL: process.env.DIRECT_URL
};

function runCommand(command, { allowFailure = false } = {}) {
  const result = spawnSync(command, {
    encoding: "utf8",
    env: directDatabaseEnv,
    shell: true,
    stdio: "pipe"
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    if (allowFailure) {
      return result;
    }

    process.exit(result.status ?? 1);
  }

  return result;
}

function isNonEmptyUnbaselinedSchema(result) {
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`.includes("P3005");
}

function baselineCompatibleSchema() {
  runCommand("pnpm --filter @sinhon-os/database exec tsx scripts/baseline-if-compatible.ts");
}

baselineCompatibleSchema();

const migrationResult = runCommand("pnpm db:migrate:deploy", { allowFailure: true });

if (migrationResult.status !== 0) {
  if (!isNonEmptyUnbaselinedSchema(migrationResult)) {
    process.exit(migrationResult.status ?? 1);
  }

  console.log("Bootstrapping non-empty production schema before migration baseline.");
  runCommand("pnpm --filter @sinhon-os/database exec prisma db push --config prisma.config.ts");
  baselineCompatibleSchema();
  runCommand("pnpm db:migrate:deploy");
}

runCommand("pnpm db:seed");
