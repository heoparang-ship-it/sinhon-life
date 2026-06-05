import { Client } from "pg";
import { getProductionDatabaseSchema, withProductionDatabaseSchema } from "../src/database-url";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to ensure the production schema.");
}

const schemaName = getProductionDatabaseSchema();
const client = new Client({
  connectionString: withProductionDatabaseSchema(databaseUrl)
});

try {
  await client.connect();
  await client.query(`create schema if not exists "${schemaName}"`);
  const result = await client.query<{ has_history: boolean; has_users: boolean }>(
    `
      select
        to_regclass($1) is not null as has_history,
        to_regclass($2) is not null as has_users
    `,
    [`${schemaName}._prisma_migrations`, `${schemaName}.users`]
  );
  const schemaHasOnlyMigrationHistory = result.rows[0]?.has_history && !result.rows[0]?.has_users;

  if (schemaHasOnlyMigrationHistory) {
    await client.query(`drop schema "${schemaName}" cascade`);
    await client.query(`create schema "${schemaName}"`);
    console.log(`Reset incomplete production database schema: ${schemaName}`);
  }

  console.log(`Ensured production database schema: ${schemaName}`);
} finally {
  await client.end();
}
