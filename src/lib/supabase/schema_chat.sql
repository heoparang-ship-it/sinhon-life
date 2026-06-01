-- ─── AI톡 대화 로그 + 피드백 ───────────────────────────────────────
-- POC 데이터 수집: 사용자 질문/AI 답변을 모아 분석·프롬프트 개선·
-- (장기) 파인튜닝에 활용.
--
-- 적용:
--   Supabase SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
--
-- 비고:
--   - user_id 는 null 허용 (비로그인 사용자도 로깅)
--   - 본인 데이터는 본인만 SELECT/UPDATE/DELETE
--   - 비로그인 행은 anyone 이 UPDATE 가능(피드백용) — POC 한정
--   - 운영 트래픽 확보 후엔 user_id NOT NULL + 동의 모달로 강화 권장

create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  model text,
  latency_ms integer,
  feedback smallint check (feedback in (-1, 0, 1)) default 0,
  created_at timestamptz default now()
);

create index if not exists idx_chat_logs_session
  on public.chat_logs(session_id, created_at);

create index if not exists idx_chat_logs_user
  on public.chat_logs(user_id, created_at desc);

alter table public.chat_logs enable row level security;

-- INSERT: 로그인이면 본인 행, 비로그인이면 user_id null 만 허용
drop policy if exists "대화로그 INSERT" on public.chat_logs;
create policy "대화로그 INSERT"
  on public.chat_logs for insert
  with check (user_id is null OR auth.uid() = user_id);

-- SELECT: 본인 행만 조회 (비로그인 행은 어드민 직접 조회용)
drop policy if exists "대화로그 SELECT" on public.chat_logs;
create policy "대화로그 SELECT"
  on public.chat_logs for select
  using (auth.uid() = user_id);

-- UPDATE: 본인 행 OR 비로그인 행(피드백) 허용
drop policy if exists "대화로그 UPDATE" on public.chat_logs;
create policy "대화로그 UPDATE"
  on public.chat_logs for update
  using (user_id is null OR auth.uid() = user_id)
  with check (user_id is null OR auth.uid() = user_id);

-- DELETE: 본인 행만
drop policy if exists "대화로그 DELETE" on public.chat_logs;
create policy "대화로그 DELETE"
  on public.chat_logs for delete
  using (auth.uid() = user_id);
