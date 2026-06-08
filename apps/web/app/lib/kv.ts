/* ============================================================
   초경량 KV 클라이언트 — Upstash Redis REST
   env: KV_REST_API_URL, KV_REST_API_TOKEN (Vercel KV 호환)
   미설정 시 isConfigured=false → 호출부가 synthetic 폴백.
   ============================================================ */

const URL = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;

export const kvConfigured = Boolean(URL && TOKEN);

type Command = (string | number)[];

async function pipeline(commands: Command[]): Promise<unknown[]> {
  if (!kvConfigured) return [];
  const res = await fetch(`${URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(commands),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  const json = (await res.json()) as { result: unknown }[];
  return json.map((r) => r.result);
}

export async function kvIncr(keys: string[]): Promise<void> {
  if (!kvConfigured || keys.length === 0) return;
  await pipeline(keys.map((k) => ["INCR", k]));
}

export async function kvMGet(keys: string[]): Promise<(number | null)[]> {
  if (!kvConfigured || keys.length === 0) return keys.map(() => null);
  const out = (await pipeline([["MGET", ...keys]]))[0] as (string | null)[] | undefined;
  if (!Array.isArray(out)) return keys.map(() => null);
  return out.map((v) => (v == null ? null : Number(v)));
}
