import { describe, expect, it } from "vitest";
import { getDatabaseReadiness } from "./index.js";

describe("getDatabaseReadiness", () => {
  it("reports missing database configuration", () => {
    expect(getDatabaseReadiness({ DATABASE_URL: undefined })).toEqual({
      configured: false,
      missingKeys: ["DATABASE_URL"],
      provider: "postgresql"
    });
  });
});
