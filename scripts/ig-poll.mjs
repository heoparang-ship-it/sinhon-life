#!/usr/bin/env node
/**
 * Instagram → Cloudflare D1 미러링 폴링 스크립트
 *
 * 무제한 갱신 흐름:
 *   1. D1 auth 테이블에서 현재 토큰 읽기 (없으면 IG_LONG_LIVED_TOKEN env 사용)
 *   2. fb_exchange_token 으로 갱신 (24h 이상 지났으면 새 토큰, 아니면 동일)
 *   3. 새 토큰을 D1 auth 에 저장
 *   4. /me/media 호출 → media 테이블 INSERT/UPDATE
 *
 * GH Actions 가 10분마다 실행.
 * Cloudflare Workers IP 가 Meta 에서 거부당하는 이슈 우회 (GH IP는 통과).
 */

const REQ = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
};

const IG_APP_ID = REQ("IG_APP_ID");
const IG_APP_SECRET = REQ("IG_APP_SECRET");
const IG_USER_ID = REQ("IG_USER_ID");
const IG_LONG_LIVED_TOKEN_BOOTSTRAP = process.env.IG_LONG_LIVED_TOKEN || "";
const CF_API_TOKEN = REQ("CLOUDFLARE_API_TOKEN");
const CF_ACCOUNT_ID = REQ("CLOUDFLARE_ACCOUNT_ID");
const D1_DB_ID = REQ("D1_DATABASE_ID");
const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v21.0";
const POLL_LIMIT = parseInt(process.env.POLL_LIMIT || "25", 10);

async function d1(sql, params = []) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DB_ID}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    }
  );
  const body = await r.json();
  if (!body.success) throw new Error(`D1 error: ${JSON.stringify(body.errors)}`);
  return body.result?.[0];
}

async function getToken() {
  // 1) D1 auth 테이블에서 저장된 토큰 시도
  const r = await d1("SELECT access_token, updated_at FROM auth WHERE id = 1");
  const row = r?.results?.[0];
  if (row?.access_token) return { token: row.access_token, fromD1: true };
  // 2) bootstrap 토큰 (GH Secrets)
  if (!IG_LONG_LIVED_TOKEN_BOOTSTRAP) throw new Error("D1 auth empty AND IG_LONG_LIVED_TOKEN not set");
  return { token: IG_LONG_LIVED_TOKEN_BOOTSTRAP, fromD1: false };
}

async function refreshLongLived(token) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", IG_APP_ID);
  url.searchParams.set("client_secret", IG_APP_SECRET);
  url.searchParams.set("fb_exchange_token", token);
  const r = await fetch(url.toString());
  const body = await r.json();
  if (!r.ok) throw new Error(`fb_exchange_token ${r.status}: ${JSON.stringify(body)}`);
  return { access_token: body.access_token, expires_in: body.expires_in || 5184000 };
}

async function saveToken(newToken, expiresInSec) {
  const now = new Date();
  const expiresAt = new Date(Date.now() + expiresInSec * 1000);
  await d1(
    `INSERT INTO auth (id, access_token, app_id, ig_user_id, updated_at, expires_at)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       access_token = excluded.access_token,
       app_id       = excluded.app_id,
       ig_user_id   = excluded.ig_user_id,
       updated_at   = excluded.updated_at,
       expires_at   = excluded.expires_at`,
    [newToken, IG_APP_ID, IG_USER_ID, now.toISOString(), expiresAt.toISOString()]
  );
}

async function fetchMedia(token) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(IG_USER_ID)}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", String(POLL_LIMIT));
  url.searchParams.set("access_token", token);
  const r = await fetch(url.toString());
  const body = await r.json();
  if (!r.ok) throw new Error(`IG /media ${r.status}: ${JSON.stringify(body)}`);
  return body.data || [];
}

const TAG_RE = /(?<![\p{L}\p{N}_/?&=])#([\p{L}\p{N}_]{1,50})/gu;
function parseTags(c) {
  if (!c) return [];
  const seen = new Set(), out = [];
  for (const m of c.matchAll(TAG_RE)) {
    const t = m[1].toLowerCase();
    if (!seen.has(t)) { seen.add(t); out.push(t); }
  }
  return out;
}

async function upsertMedia(items) {
  const now = new Date().toISOString();
  let inserted = 0, updated = 0;

  // 기존 id 들 확인 (insert vs update 카운트)
  if (items.length > 0) {
    const placeholders = items.map(() => "?").join(",");
    const existing = await d1(
      `SELECT id FROM media WHERE id IN (${placeholders})`,
      items.map((x) => x.id)
    );
    const existingIds = new Set((existing?.results || []).map((r) => r.id));

    for (const m of items) {
      const tags = parseTags(m.caption);
      await d1(
        `INSERT INTO media (id, media_type, media_url, thumbnail_url, permalink, caption, timestamp, tags_json, first_seen_at, last_synced_at, is_hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON CONFLICT(id) DO UPDATE SET
           media_type    = excluded.media_type,
           media_url     = excluded.media_url,
           thumbnail_url = excluded.thumbnail_url,
           permalink     = excluded.permalink,
           caption       = excluded.caption,
           timestamp     = excluded.timestamp,
           tags_json     = excluded.tags_json,
           last_synced_at= excluded.last_synced_at`,
        [m.id, m.media_type, m.media_url || null, m.thumbnail_url || null, m.permalink,
         m.caption || null, m.timestamp, JSON.stringify(tags), now, now]
      );
      await d1(`DELETE FROM media_tags WHERE media_id = ?`, [m.id]);
      for (const t of tags) {
        await d1(`INSERT OR IGNORE INTO media_tags (media_id, tag) VALUES (?, ?)`, [m.id, t]);
      }
      if (existingIds.has(m.id)) updated++; else inserted++;
    }
  }

  await d1(
    `UPDATE sync_state SET last_run_at = ?, last_success_at = ?, last_error = NULL,
       inserted_total = inserted_total + ?, updated_total = updated_total + ? WHERE id = 1`,
    [now, now, inserted, updated]
  );
  return { inserted, updated };
}

async function setLastError(msg) {
  try {
    await d1(`UPDATE sync_state SET last_run_at = ?, last_error = ? WHERE id = 1`,
      [new Date().toISOString(), msg.slice(0, 1000)]);
  } catch { /* ignore */ }
}

(async () => {
  try {
    console.log("[ig-poll] start");
    const { token, fromD1 } = await getToken();
    console.log(`[ig-poll] token source: ${fromD1 ? "D1" : "bootstrap"}`);

    // 토큰 갱신 (Meta 는 24h 이내면 동일 토큰 반환)
    const refreshed = await refreshLongLived(token);
    await saveToken(refreshed.access_token, refreshed.expires_in);
    console.log(`[ig-poll] token refreshed, expires_in=${refreshed.expires_in}s`);

    const media = await fetchMedia(refreshed.access_token);
    console.log(`[ig-poll] fetched ${media.length} items`);

    const r = await upsertMedia(media);
    console.log(`[ig-poll] D1 inserted=${r.inserted}, updated=${r.updated}`);
  } catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    console.error("[ig-poll] ERROR:", msg);
    await setLastError(msg);
    process.exit(1);
  }
})();
