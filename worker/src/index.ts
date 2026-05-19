/**
 * sinhon-life-api — Cloudflare Worker 엔트리.
 *
 * 라우팅:
 *   GET  /api/media            ?tag=&limit=&offset=     공개 미디어 리스트
 *   GET  /api/media/:id                                  공개 단건
 *   GET  /api/tags             ?limit=                   인기 태그
 *   GET  /api/health                                     sync_state 노출
 *   GET  /_admin/poll          ?key=ADMIN_KEY            수동 폴링 (옵션)
 *
 * Cron:
 *   "* /10 * * * *"  -> pollAndUpsert()
 *   "0 3 * * 0"      -> refreshAccessToken()  (매주 일요일 03:00 UTC)
 *
 * 보안: 모든 IG 호출은 여기에서만. 토큰은 Worker secret 으로만 주입.
 *       프론트엔드는 /api/* 만 호출하고 토큰은 절대 보지 못한다.
 */

import { fetchMyMedia, refreshLongLivedToken } from "./instagram";
import {
  upsertMediaBatch,
  listMedia,
  getMediaById,
  listTags,
  updateSyncState,
  updateTokenMeta,
  getSyncState,
  type MediaRow,
} from "./db";

export interface Env {
  DB: D1Database;
  // Secrets
  IG_ACCESS_TOKEN: string;
  IG_USER_ID: string;
  ADMIN_KEY?: string; // 수동 폴링 보호용. 미설정 시 /_admin/* 비활성.
  // Vars
  ALLOWED_ORIGIN: string;
  INSTAGRAM_GRAPH_VERSION: string;
  POLL_LIMIT: string;
}

// ─────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────

function corsHeaders(env: Env, extra: HeadersInit = {}): HeadersInit {
  const origin = env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    ...extra,
  };
}

function json(env: Env, body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // 브라우저는 30초 캐시, CDN(Cloudflare 자체)은 60초 캐시.
      // SWR 패턴이라 짧게 잡아도 체감은 즉시.
      "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
      ...corsHeaders(env),
      ...(init.headers ?? {}),
    },
  });
}

function notFound(env: Env): Response {
  return json(env, { error: "not_found" }, { status: 404 });
}

function badRequest(env: Env, message: string): Response {
  return json(env, { error: "bad_request", message }, { status: 400 });
}

function serverError(env: Env, message: string): Response {
  return json(env, { error: "internal_error", message }, { status: 500 });
}

// MediaRow → API DTO (tags_json 을 배열로 풀어서)
function toDTO(row: MediaRow) {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags_json) as unknown;
    if (Array.isArray(parsed)) tags = parsed.filter((x): x is string => typeof x === "string");
  } catch { /* ignore */ }
  return {
    id: row.id,
    media_type: row.media_type,
    media_url: row.media_url,
    thumbnail_url: row.thumbnail_url,
    permalink: row.permalink,
    caption: row.caption,
    timestamp: row.timestamp,
    tags,
    first_seen_at: row.first_seen_at,
  };
}

// ─────────────────────────────────────────────────────────────
// 폴링 본체 — cron 과 /_admin/poll 양쪽에서 호출
// ─────────────────────────────────────────────────────────────

async function pollAndUpsert(env: Env): Promise<{ inserted: number; updated: number }> {
  const now = new Date().toISOString();
  await updateSyncState(env.DB, { last_run_at: now });
  try {
    const limit = Math.max(1, Math.min(100, parseInt(env.POLL_LIMIT || "25", 10) || 25));
    const items = await fetchMyMedia({
      graphVersion: env.INSTAGRAM_GRAPH_VERSION,
      igUserId: env.IG_USER_ID,
      accessToken: env.IG_ACCESS_TOKEN,
      limit,
    });
    const r = await upsertMediaBatch(env.DB, items);
    await updateSyncState(env.DB, {
      last_success_at: new Date().toISOString(),
      last_error: null,
      inserted_delta: r.inserted,
      updated_delta: r.updated,
    });
    return r;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await updateSyncState(env.DB, { last_error: msg });
    throw e;
  }
}

async function refreshTokenJob(env: Env): Promise<{ expires_at: string }> {
  // 토큰을 재발급 받아 Worker 가 알 수 있도록 메타만 저장.
  // 실제 IG_ACCESS_TOKEN secret 자체를 Worker 가 자동 교체하지는 못한다
  // (Cloudflare secret 변경은 wrangler 권한 필요). 대신 만료 임박을 health 로 노출하고
  // README 에 "필요시 wrangler secret put 으로 갱신" 흐름을 명시.
  const r = await refreshLongLivedToken({
    graphVersion: env.INSTAGRAM_GRAPH_VERSION,
    accessToken: env.IG_ACCESS_TOKEN,
  });
  const refreshedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + r.expires_in * 1000).toISOString();
  await updateTokenMeta(env.DB, refreshedAt, expiresAt);
  // 같은 토큰이 그대로 더 길게 유효해진다 (인스타가 만료 시각만 갱신해 줌).
  // 만약 인스타가 새 토큰 문자열을 돌려주면 그것을 health 에 노출 → 사용자가 수동 교체.
  return { expires_at: expiresAt };
}

// ─────────────────────────────────────────────────────────────
// HTTP 핸들러
// ─────────────────────────────────────────────────────────────

async function handleHttp(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(env) });
  }

  // GET /api/health — 운영 디버깅용
  if (path === "/api/health" && req.method === "GET") {
    const state = await getSyncState(env.DB);
    return json(env, {
      ok: true,
      service: "sinhon-life-api",
      now: new Date().toISOString(),
      sync: state,
    });
  }

  // GET /api/tags
  if (path === "/api/tags" && req.method === "GET") {
    const limit = parseInt(url.searchParams.get("limit") || "30", 10) || 30;
    const tags = await listTags(env.DB, limit);
    return json(env, { tags });
  }

  // GET /api/media/:id
  const mDetail = path.match(/^\/api\/media\/([^/]+)$/);
  if (mDetail && req.method === "GET") {
    const id = decodeURIComponent(mDetail[1]);
    const row = await getMediaById(env.DB, id);
    if (!row) return notFound(env);
    return json(env, { item: toDTO(row) });
  }

  // GET /api/media
  if (path === "/api/media" && req.method === "GET") {
    const tag = url.searchParams.get("tag");
    const limit = parseInt(url.searchParams.get("limit") || "20", 10) || 20;
    const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;
    const rows = await listMedia(env.DB, { tag, limit, offset });
    return json(env, {
      items: rows.map(toDTO),
      limit,
      offset,
      tag: tag ?? null,
    });
  }

  // GET /_admin/poll?key=ADMIN_KEY  — 수동 폴링 트리거 (옵션)
  if (path === "/_admin/poll" && req.method === "GET") {
    if (!env.ADMIN_KEY) return notFound(env);
    if (url.searchParams.get("key") !== env.ADMIN_KEY) return notFound(env);
    try {
      const r = await pollAndUpsert(env);
      return json(env, { ok: true, ...r });
    } catch (e: unknown) {
      return serverError(env, e instanceof Error ? e.message : String(e));
    }
  }

  // GET /_admin/refresh-token?key=ADMIN_KEY — 수동 토큰 갱신
  if (path === "/_admin/refresh-token" && req.method === "GET") {
    if (!env.ADMIN_KEY) return notFound(env);
    if (url.searchParams.get("key") !== env.ADMIN_KEY) return notFound(env);
    try {
      const r = await refreshTokenJob(env);
      return json(env, { ok: true, ...r });
    } catch (e: unknown) {
      return serverError(env, e instanceof Error ? e.message : String(e));
    }
  }

  // 루트는 간단 상태
  if (path === "/" && req.method === "GET") {
    return json(env, {
      service: "sinhon-life-api",
      docs: "https://github.com/heoparang-ship-it/sinhon-life/tree/main/worker",
    });
  }

  return notFound(env);
}

// ─────────────────────────────────────────────────────────────
// Worker export
// ─────────────────────────────────────────────────────────────

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await handleHttp(req, env);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return serverError(env, msg);
    }
  },

  /**
   * Cron 트리거.
   *   "* /10 * * * *"  → 폴링
   *   "0 3 * * 0"      → 토큰 갱신
   * event.cron 문자열로 분기.
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const cron = event.cron;
    if (cron === "0 3 * * 0") {
      ctx.waitUntil(
        refreshTokenJob(env).catch(async (e: unknown) => {
          const msg = e instanceof Error ? e.message : String(e);
          await updateSyncState(env.DB, { last_error: `token_refresh: ${msg}` });
        })
      );
      return;
    }
    // 기본: 미디어 폴링 (* /10 * * * *)
    ctx.waitUntil(
      pollAndUpsert(env).catch(() => {
        // 에러는 updateSyncState 안에서 이미 기록됨
      })
    );
  },
};
