import { describe, expect, it } from "vitest";
import { assertPiiEncryptionConfigured, sealSensitive, unsealSensitive } from "./sensitive-data.js";

describe("sensitive data sealing", () => {
  it("encrypts and decrypts values when a PII key is configured", () => {
    const env = {
      PII_ENCRYPTION_KEY: "test-secret-key"
    };
    const sealed = sealSensitive("01012345678", env);

    expect(sealed).toMatch(/^aesgcm:v1:/);
    expect(sealed).not.toContain("01012345678");
    expect(unsealSensitive(sealed, env)).toBe("01012345678");
  });

  it("encrypts new local test values with the development key when no PII key is configured", () => {
    const sealed = sealSensitive("홍길동", {});

    expect(sealed).toMatch(/^aesgcm:v1:/);
    expect(sealed).not.toContain("홍길동");
    expect(unsealSensitive(sealed, {})).toBe("홍길동");
  });

  it("keeps local v1 values readable for MVP data compatibility", () => {
    const sealed = "local:v1:MDEwMTIzNDU2Nzg=";

    expect(unsealSensitive(sealed)).toBe("01012345678");
  });

  it("requires a PII key in production", () => {
    expect(() => assertPiiEncryptionConfigured({ NODE_ENV: "production" })).toThrow(
      "PII_ENCRYPTION_KEY"
    );
  });
});
