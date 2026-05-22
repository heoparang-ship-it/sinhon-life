-- ════════════════════════════════════════════════════════════════════════
-- 신혼생활 (sinhon.life) Supabase 스키마 v2 — 결혼 가계부 전용
--
-- ⚠ schema.sql(v1) 위에 추가로 적용한다 (DROP/REPLACE 아님, 순수 ADDITIVE).
-- 사용법: Supabase 대시보드 → SQL Editor → 이 파일 전체 붙여넣고 실행
--
-- v1 테이블(profiles, budgets, ledger_entries, checklist_state)은 그대로 두고
-- 결혼 누적 비용 + 축의금 트래커 전용 테이블 3개를 새로 만든다.
-- ════════════════════════════════════════════════════════════════════════

-- ─── 0. 프로필 확장: 결혼식 날짜 (없으면 추가) ──────────────────────────
-- v1 profiles 에 wedding_date 가 이미 있으므로 NOOP. 명시 차원에서 한 번 더.
alter table public.profiles
  add column if not exists wedding_date date;

-- ─── 1. 결혼 카테고리별 계획·지출 ────────────────────────────────────────
-- 9개 카테고리 고정(venue/studio/hanbok/gift/appliance/newhome/travel/cash/etc).
-- 사용자당 (user_id, category_id) 유일.
create table if not exists public.wedding_expenses (
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  planned integer not null default 0 check (planned >= 0),
  spent integer not null default 0 check (spent >= 0),
  updated_at timestamptz default now(),
  primary key (user_id, category_id)
);

alter table public.wedding_expenses enable row level security;

drop policy if exists "본인 결혼지출 전체 권한" on public.wedding_expenses;
create policy "본인 결혼지출 전체 권한"
  on public.wedding_expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── 2. 축의금 트래커 (사용자당 1행) ─────────────────────────────────────
-- 3-tier:
--   tier=1 → tier1_headcount × tier1_avg_amount
--   tier=2 → wedding_gift_groups 합계
--   tier=3 → actual (실제 받은 총액 수동 입력)
create table if not exists public.wedding_gifts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier smallint not null default 1 check (tier in (1,2,3)),
  tier1_headcount integer not null default 150 check (tier1_headcount >= 0),
  tier1_avg_amount integer not null default 80000 check (tier1_avg_amount >= 0),
  actual integer not null default 0 check (actual >= 0),
  side_split boolean not null default false,
  side_groom numeric(4,3) not null default 0.42 check (side_groom >= 0 and side_groom <= 1),
  side_bride numeric(4,3) not null default 0.58 check (side_bride >= 0 and side_bride <= 1),
  updated_at timestamptz default now()
);

alter table public.wedding_gifts enable row level security;

drop policy if exists "본인 축의금 전체 권한" on public.wedding_gifts;
create policy "본인 축의금 전체 권한"
  on public.wedding_gifts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── 3. 축의금 그룹별 (tier=2 용) ────────────────────────────────────────
-- 사용자당 3행 (친구/직장/가족). 그룹 텍스트는 한글 그대로(이모지·짧음).
create table if not exists public.wedding_gift_groups (
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id text not null check (group_id in ('친구','직장','가족')),
  cnt integer not null default 0 check (cnt >= 0),
  avg integer not null default 0 check (avg >= 0),
  updated_at timestamptz default now(),
  primary key (user_id, group_id)
);

alter table public.wedding_gift_groups enable row level security;

drop policy if exists "본인 축의금그룹 전체 권한" on public.wedding_gift_groups;
create policy "본인 축의금그룹 전체 권한"
  on public.wedding_gift_groups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── 4. 결혼 거래(NL 입력 로그) ──────────────────────────────────────────
-- v1 ledger_entries 와 비슷하지만 카테고리가 v2 9개로 고정되고
-- payer/income_source 같은 필드는 없다. NL 한 줄 입력 → 1행.
create table if not exists public.wedding_recent_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  title text not null,
  amount integer not null check (amount >= 0),
  date date not null,
  method text not null check (method in ('카드','이체','현금')),
  created_at timestamptz default now()
);

create index if not exists idx_wedding_recent_user_date
  on public.wedding_recent_expenses(user_id, date desc);

alter table public.wedding_recent_expenses enable row level security;

drop policy if exists "본인 결혼거래 전체 권한" on public.wedding_recent_expenses;
create policy "본인 결혼거래 전체 권한"
  on public.wedding_recent_expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
