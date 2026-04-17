// /admin 경로 인증용 공용 모듈 (Edge runtime 호환)
// - 쿠키명 통일
// - ADMIN_PASSWORD 해시 계산 (middleware / API route / 브라우저 어디서든 동일)

export const ADMIN_COOKIE = "sinhon_admin_session";
export const ADMIN_LOGIN_PATH = "/admin/login";
// 7일 세션
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** SHA-256(hex) — Edge / Node / 브라우저 모두 crypto.subtle로 동작 */
export async function hashAdminToken(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
