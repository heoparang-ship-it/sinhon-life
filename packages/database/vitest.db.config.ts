import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/.git/**", "**/.next/**", "**/dist/**", "**/node_modules/**"],
    include: ["src/**/*.db.test.ts"],
    testTimeout: 30_000
  }
});
