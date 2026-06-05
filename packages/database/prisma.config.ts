import { defineConfig, env } from "prisma/config";
import { withProductionDatabaseSchema } from "./src/database-url";

export default defineConfig({
  datasource: {
    url: withProductionDatabaseSchema(env("DATABASE_URL"))
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  schema: "prisma/schema.prisma"
});
