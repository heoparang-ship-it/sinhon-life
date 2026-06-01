-- ─── AI톡 의사결정 리드 (Decision Leads) ───────────────────────────
-- 5대 결정점(스드메·예식장·인테리어·혼수·신혼여행)에서 사용자가 상담
-- 신청을 제출하면 적재되는 테이블. AI톡이 슬롯을 채운 뒤 카드를 띄우고,
-- 사용자가 연락처를 넣어 동의 후 제출 → 운영진이 파트너에게 송객.
--
-- 적용:
--   Supabase SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
--
-- 비고:
--   - user_id 는 null 허용 (비로그인 사용자도 리드 제출 가능)
--   - 본인 세션이 만든 행만 SELECT 가능 (개인정보 보호)
--   - 운영진은 service_role 키로 별도 조회 (이 RLS 우회)

-- ENUM은 IF NOT EXISTS 미지원 → DO 블록으로 멱등 처리
do $$ begin
  create type public.lead_category as enum (
    'sdm',        -- 스튜디오·드레스·메이크업
    'venue',      -- 예식장
    'interior',   -- 신혼집 인테리어
    'goods',      -- 혼수 가전·가구
    'honeymoon'   -- 신혼여행
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum (
    'new',        -- 접수
    'contacted',  -- 운영진 컨택
    'matched',    -- 파트너 매칭
    'closed',     -- 종결
    'rejected'    -- 반려(스팸·중복 등)
  );
exception when duplicate_object then null; end $$;

create table if not exists public.decision_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id uuid not null,
  category public.lead_category not null,

  -- 슬롯 (AI가 대화에서 추출한 추천 컨텍스트)
  budget_manwon integer,                  -- 예산(만원)
  region text,                            -- 'incheon-bupyeong' | 'incheon-songdo' | 'incheon-etc' | 'etc'
  wedding_date date,                      -- 예식 예정일
  style_tags text[] default '{}',         -- ['모던','내추럴',...]
  priority_tag text,                      -- 가격|품질|위치|기타

  -- 연락처 (PIPA 동의 후 수집)
  contact_name text not null,
  contact_phone text not null,
  contact_kakao text,                     -- 카카오톡 ID(선택)

  -- 동의 (PIPA)
  consent_at timestamptz not null,        -- 동의 일시(필수)

  -- 메타
  note text,
  source_message_id uuid references public.chat_logs(id) on delete set null,
  status public.lead_status not null default 'new',
  created_at timestamptz default now()
);

create index if not exists idx_decision_leads_category_created
  on public.decision_leads(category, created_at desc);

create index if not exists idx_decision_leads_status_created
  on public.decision_leads(status, created_at desc);

create index if not exists idx_decision_leads_session
  on public.decision_leads(session_id, created_at desc);

alter table public.decision_leads enable row level security;

-- INSERT: 누구나 가능(비로그인 포함). 로그인이면 user_id=auth.uid() 강제.
drop policy if exists "리드 INSERT" on public.decision_leads;
create policy "리드 INSERT"
  on public.decision_leads for insert
  with check (user_id is null OR auth.uid() = user_id);

-- SELECT: 본인 행만 (운영진은 service_role 로 우회)
drop policy if exists "리드 SELECT" on public.decision_leads;
create policy "리드 SELECT"
  on public.decision_leads for select
  using (auth.uid() = user_id);

-- UPDATE/DELETE: 본인 행만
drop policy if exists "리드 UPDATE" on public.decision_leads;
create policy "리드 UPDATE"
  on public.decision_leads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "리드 DELETE" on public.decision_leads;
create policy "리드 DELETE"
  on public.decision_leads for delete
  using (auth.uid() = user_id);
