import { spawnSync } from "node:child_process";

const shouldPrepareDatabase = process.env.VERCEL_ENV === "production";

if (!shouldPrepareDatabase) {
  console.log("Skipping production DB preparation outside Vercel production.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for production DB preparation.");
}

for (const command of ["pnpm db:migrate:deploy", "pnpm db:seed"]) {
  const result = spawnSync(command, {
    shell: true,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
