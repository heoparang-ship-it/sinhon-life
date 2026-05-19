-- ============================================================
-- sinhon-life-api — D1 초기 스키마 v1
-- 2026-05-19
--
-- 인스타그램 비즈 계정에서 가져온 미디어를 캐싱한다.
-- 인스타 CDN(media_url, thumbnail_url)은 직접 호스팅하지 않고
-- URL만 저장 — 만료(약 24h) 시 cron 폴링이 새 URL로 upsert.
-- ============================================================

CREATE TABLE IF NOT EXISTS media (
  id              TEXT PRIMARY KEY,           -- IG media id
  media_type      TEXT NOT NULL,              -- IMAGE | VIDEO | CAROUSEL_ALBUM | REELS
  media_url       TEXT,                       -- 영상/이미지 원본 URL (CDN, 만료됨)
  thumbnail_url   TEXT,                       -- 영상 썸네일 (VIDEO/REELS 만)
  permalink       TEXT NOT NULL,              -- https://www.instagram.com/p/...
  caption         TEXT,                       -- 본문(해시태그 포함)
  timestamp       TEXT NOT NULL,              -- ISO8601 (인스타 응답 그대로)
  tags_json       TEXT NOT NULL DEFAULT '[]', -- ["신혼집","혼수"] JSON 배열
  first_seen_at   TEXT NOT NULL,              -- 우리가 처음 본 시각 (ISO8601)
  last_synced_at  TEXT NOT NULL,              -- 마지막 폴링으로 갱신된 시각
  is_hidden       INTEGER NOT NULL DEFAULT 0  -- 1이면 API 응답에서 제외
);

CREATE INDEX IF NOT EXISTS idx_media_timestamp     ON media(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_media_type          ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_first_seen    ON media(first_seen_at DESC);

-- 태그별 빠른 카운트 — POST(/api/tags)에서 사용.
-- 정규화하지 않은 비정규 테이블이지만 D1 무료 티어에선 단순함이 이김.
CREATE TABLE IF NOT EXISTS media_tags (
  media_id   TEXT NOT NULL,
  tag        TEXT NOT NULL,
  PRIMARY KEY (media_id, tag),
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_tags_tag      ON media_tags(tag);

-- 폴링 메타 (마지막 성공 시각, 마지막 에러 등)
CREATE TABLE IF NOT EXISTS sync_state (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  last_run_at     TEXT,
  last_success_at TEXT,
  last_error      TEXT,
  inserted_total  INTEGER NOT NULL DEFAULT 0,
  updated_total   INTEGER NOT NULL DEFAULT 0,
  -- 토큰 자동 갱신 트래킹
  token_refreshed_at TEXT,
  token_expires_at   TEXT
);

INSERT OR IGNORE INTO sync_state (id) VALUES (1);
