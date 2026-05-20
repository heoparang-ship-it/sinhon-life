-- 토큰 self-managing 용 테이블
-- GH Actions 가 매 폴링마다 fb_exchange_token 으로 갱신해서 여기에 저장
CREATE TABLE IF NOT EXISTS auth (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  access_token    TEXT,
  app_id          TEXT,
  ig_user_id      TEXT,
  updated_at      TEXT,
  expires_at      TEXT
);
INSERT OR IGNORE INTO auth (id) VALUES (1);
