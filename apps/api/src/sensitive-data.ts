import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const encryptedPrefix = "aesgcm:v1:";
const localPrefix = "local:v1:";
const developmentSecret = "local-dev-pii-key-change-me";

function deriveKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

function getExplicitSecret(
  env: Partial<Record<"NODE_ENV" | "PII_ENCRYPTION_KEY", string | undefined>>
) {
  return env.PII_ENCRYPTION_KEY?.trim() || undefined;
}

function getSecret(env: Partial<Record<"NODE_ENV" | "PII_ENCRYPTION_KEY", string | undefined>>) {
  return getExplicitSecret(env) ?? (env.NODE_ENV === "production" ? undefined : developmentSecret);
}

export function assertPiiEncryptionConfigured(
  env: Partial<Record<"NODE_ENV" | "PII_ENCRYPTION_KEY", string | undefined>> = process.env
) {
  if (env.NODE_ENV === "production" && !getExplicitSecret(env)) {
    throw new Error("PII_ENCRYPTION_KEY is required in production.");
  }
}

export function sealSensitive(
  value: string | null | undefined,
  env: Partial<Record<"NODE_ENV" | "PII_ENCRYPTION_KEY", string | undefined>> = process.env
) {
  if (!value) return null;

  const secret = getSecret(env);

  if (!secret) {
    throw new Error("PII_ENCRYPTION_KEY is required to seal sensitive data.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${encryptedPrefix}${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function unsealSensitive(
  value: string | null | undefined,
  env: Partial<Record<"NODE_ENV" | "PII_ENCRYPTION_KEY", string | undefined>> = process.env
) {
  if (!value) return null;

  if (value.startsWith(localPrefix)) {
    try {
      return Buffer.from(value.slice(localPrefix.length), "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  if (!value.startsWith(encryptedPrefix)) {
    return null;
  }

  const secret = getSecret(env);
  if (!secret) return null;

  const [ivText, tagText, ciphertextText] = value.slice(encryptedPrefix.length).split(".");
  if (!ivText || !tagText || !ciphertextText) return null;

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveKey(secret),
      Buffer.from(ivText, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextText, "base64url")),
      decipher.final()
    ]).toString("utf8");
  } catch {
    return null;
  }
}
