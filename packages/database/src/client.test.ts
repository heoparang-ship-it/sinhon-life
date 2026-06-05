import { describe, expect, it } from "vitest";
import { getDatabaseUrl } from "./client";

describe("getDatabaseUrl", () => {
  it("returns DATABASE_URL when configured", () => {
    expect(getDatabaseUrl({ DATABASE_URL: "postgresql://example" })).toBe("postgresql://example");
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => getDatabaseUrl({ DATABASE_URL: undefined })).toThrow("DATABASE_URL is required");
  });
});
