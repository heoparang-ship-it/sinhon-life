import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type AccessTokenPayload = {
  exp: number;
  iat: number;
  sub: string;
  typ: "access";
};

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlJson(value: unknown) {
  return base64UrlEncode(JSON.stringify(value));
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAccessToken(userId: string, secret: string, ttlSeconds: number): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlJson({
    exp: issuedAt + ttlSeconds,
    iat: issuedAt,
    sub: userId,
    typ: "access"
  } satisfies AccessTokenPayload);
  const unsigned = `${header}.${payload}`;

  return `${unsigned}.${sign(unsigned, secret)}`;
}

export function verifyAccessToken(token: string, secret: string): AccessTokenPayload | null {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  const expected = sign(`${header}.${payload}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AccessTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    return decoded.typ === "access" && decoded.sub && decoded.exp > now ? decoded : null;
  } catch {
    return null;
  }
}

export function getBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim() || null;
}

export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function hashIdentifier(value: string): string {
  return createHash("sha256").update(normalizeIdentifier(value)).digest("hex");
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function maskEmail(email: string | null | undefined): string | undefined {
  if (!email) return undefined;
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return undefined;
  return `${localPart.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "***";
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}

export function getAuthProviderUserId(input: {
  authProviderUserId?: string;
  email?: string;
  phone?: string;
}): string {
  if (input.authProviderUserId) {
    return normalizeIdentifier(input.authProviderUserId);
  }

  if (input.email) {
    return `email:${hashIdentifier(input.email)}`;
  }

  if (input.phone) {
    return `phone:${hashIdentifier(input.phone)}`;
  }

  return `local:${createOpaqueToken()}`;
}
