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
  console.log(`Ensured production database schema: ${schemaName}`);
} finally {
  await client.end();
}
