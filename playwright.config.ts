import { defineConfig, devices } from "@playwright/test";

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
const webBaseUrl = process.env.E2E_WEB_BASE_URL ?? "http://localhost:3002";
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://sinhon_os:sinhon_os@localhost:5433/sinhon_os?schema=public";
const authTokenSecret = process.env.AUTH_TOKEN_SECRET ?? "dev-only-change-me";
const piiEncryptionKey = process.env.PII_ENCRYPTION_KEY ?? "local-dev-pii-key-change-me";

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export default defineConfig({
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  testDir: "./tests/e2e",
  timeout: 90_000,
  use: {
    baseURL: webBaseUrl,
    trace: "retain-on-failure",
    viewport: {
      height: 844,
      width: 390
    }
  },
  webServer: [
    {
      command: `AUTH_TOKEN_SECRET=${shellQuote(authTokenSecret)} PII_ENCRYPTION_KEY=${shellQuote(piiEncryptionKey)} DATABASE_URL=${shellQuote(databaseUrl)} PORT=4000 pnpm --filter @sinhon-os/api dev`,
      reuseExistingServer: true,
      timeout: 120_000,
      url: apiBaseUrl.replace(/\/api\/v1$/, "/health")
    },
    {
      command: `NEXT_PUBLIC_API_BASE_URL=${shellQuote(apiBaseUrl)} NEXT_PUBLIC_WEB_BASE_URL=${shellQuote(webBaseUrl)} pnpm --filter @sinhon-os/web exec next dev --port 3002`,
      reuseExistingServer: true,
      timeout: 120_000,
      url: webBaseUrl
    }
  ],
  projects: [
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"]
      }
    }
  ]
});
