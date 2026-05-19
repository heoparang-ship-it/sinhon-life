/**
 * D1 헬퍼 — 미디어 upsert / 조회 / 태그 카운트.
 *
 * D1 은 SQLite 인터페이스라 UPSERT(ON CONFLICT DO UPDATE) 사용 가능.
 * 트랜잭션은 .batch() 로 묶어서 한 번에 보낸다 — 인스타 폴링은 보통
 * 25개 미만이라 한 번의 batch 로 충분하고, 부분 실패 가능성을 줄일 수 있다.
 */

import type { IGMedia } from "./instagram";
import { parseHashtags } from "./tags";

export interface MediaRow {
  id: string;
  media_type: string;
  media_url: string | null;
  thumbnail_url: string | null;
  permalink: string;
  caption: string | null;
  timestamp: string;
  tags_json: string;
  first_seen_at: string;
  last_synced_at: string;
  is_hidden: number;
}

export interface UpsertResult {
  inserted: number;
  updated: number;
}

/** 인스타 응답 → DB upsert. 정상 종료 시 inserted/updated 카운트 반환. */
export async function upsertMediaBatch(
  db: D1Database,
  items: IGMedia[]
): Promise<UpsertResult> {
  if (items.length === 0) return { inserted: 0, updated: 0 };
  const now = new Date().toISOString();

  // 기존 id 들 한 번에 조회 (어떤 게 신규인지 정확히 카운트하기 위함)
  const placeholders = items.map(() => "?").join(",");
  const existing = await db
    .prepare(`SELECT id FROM media WHERE id IN (${placeholders})`)
    .bind(...items.map((x) => x.id))
    .all<{ id: string }>();
  const existingIds = new Set(existing.results?.map((r) => r.id) ?? []);

  const stmts: D1PreparedStatement[] = [];
  for (const m of items) {
    const tags = parseHashtags(m.caption);
    const tagsJson = JSON.stringify(tags);

    // media UPSERT
    stmts.push(
      db
        .prepare(
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
             last_synced_at= excluded.last_synced_at`
        )
        .bind(
          m.id,
          m.media_type,
          m.media_url ?? null,
          m.thumbnail_url ?? null,
          m.permalink,
          m.caption ?? null,
          m.timestamp,
          tagsJson,
          now,
          now
        )
    );

    // media_tags 재구성: 일단 다 지우고 새로 넣기 (단순함 > 성능)
    stmts.push(db.prepare(`DELETE FROM media_tags WHERE media_id = ?`).bind(m.id));
    for (const t of tags) {
      stmts.push(
        db
          .prepare(`INSERT OR IGNORE INTO media_tags (media_id, tag) VALUES (?, ?)`)
          .bind(m.id, t)
      );
    }
  }

  await db.batch(stmts);

  let inserted = 0;
  let updated = 0;
  for (const m of items) {
    if (existingIds.has(m.id)) updated++;
    else inserted++;
  }
  return { inserted, updated };
}

export async function listMedia(
  db: D1Database,
  opts: { tag?: string | null; limit: number; offset: number }
): Promise<MediaRow[]> {
  const limit = Math.max(1, Math.min(50, opts.limit));
  const offset = Math.max(0, opts.offset);

  if (opts.tag) {
    const tag = opts.tag.toLowerCase();
    const r = await db
      .prepare(
        `SELECT m.* FROM media m
           INNER JOIN media_tags t ON t.media_id = m.id
          WHERE t.tag = ? AND m.is_hidden = 0
          ORDER BY m.timestamp DESC
          LIMIT ? OFFSET ?`
      )
      .bind(tag, limit, offset)
      .all<MediaRow>();
    return r.results ?? [];
  }

  const r = await db
    .prepare(
      `SELECT * FROM media WHERE is_hidden = 0
        ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    )
    .bind(limit, offset)
    .all<MediaRow>();
  return r.results ?? [];
}

export async function getMediaById(db: D1Database, id: string): Promise<MediaRow | null> {
  const r = await db
    .prepare(`SELECT * FROM media WHERE id = ? AND is_hidden = 0 LIMIT 1`)
    .bind(id)
    .first<MediaRow>();
  return r ?? null;
}

export async function listTags(
  db: D1Database,
  limit: number = 30
): Promise<{ tag: string; count: number }[]> {
  const r = await db
    .prepare(
      `SELECT t.tag AS tag, COUNT(*) AS count
         FROM media_tags t INNER JOIN media m ON m.id = t.media_id
        WHERE m.is_hidden = 0
        GROUP BY t.tag
        ORDER BY count DESC, t.tag ASC
        LIMIT ?`
    )
    .bind(Math.max(1, Math.min(200, limit)))
    .all<{ tag: string; count: number }>();
  return r.results ?? [];
}

export async function updateSyncState(
  db: D1Database,
  patch: Partial<{
    last_run_at: string;
    last_success_at: string;
    last_error: string | null;
    inserted_delta: number;
    updated_delta: number;
  }>
): Promise<void> {
  const sets: string[] = [];
  const values: unknown[] = [];
  if (patch.last_run_at !== undefined)   { sets.push("last_run_at = ?");     values.push(patch.last_run_at); }
  if (patch.last_success_at !== undefined){sets.push("last_success_at = ?"); values.push(patch.last_success_at); }
  if (patch.last_error !== undefined)    { sets.push("last_error = ?");      values.push(patch.last_error); }
  if (patch.inserted_delta !== undefined) sets.push(`inserted_total = inserted_total + ${patch.inserted_delta | 0}`);
  if (patch.updated_delta !== undefined)  sets.push(`updated_total  = updated_total  + ${patch.updated_delta  | 0}`);
  if (sets.length === 0) return;
  await db
    .prepare(`UPDATE sync_state SET ${sets.join(", ")} WHERE id = 1`)
    .bind(...values)
    .run();
}

export async function updateTokenMeta(
  db: D1Database,
  refreshedAt: string,
  expiresAt: string
): Promise<void> {
  await db
    .prepare(`UPDATE sync_state SET token_refreshed_at = ?, token_expires_at = ? WHERE id = 1`)
    .bind(refreshedAt, expiresAt)
    .run();
}

export async function getSyncState(db: D1Database): Promise<Record<string, unknown> | null> {
  const r = await db
    .prepare(`SELECT * FROM sync_state WHERE id = 1`)
    .first<Record<string, unknown>>();
  return r ?? null;
}
