-- ════════════════════════════════════════════════════════════════════════
-- 신혼생활 (sinhon.life) Supabase 스키마 v1
-- 사용법: Supabase 대시보드 → SQL Editor → 아래 전체 붙여넣고 실행
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. 프로필 (회원 가입 시 자동 생성) ───────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  partner_a_name text default '신랑',
  partner_b_name text default '신부',
  wedding_date date,
  region text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "본인 프로필 읽기" on public.profiles;
create policy "본인 프로필 읽기"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "본인 프로필 수정" on public.profiles;
create policy "본인 프로필 수정"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 회원가입 시 빈 프로필 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 2. 가계부 예산 (카테고리별 사용자 예산) ──────────────────────────────
create table if not exists public.budgets (
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  amount integer not null default 0,
  updated_at timestamptz default now(),
  primary key (user_id, category_id)
);

alter table public.budgets enable row level security;

drop policy if exists "본인 예산 전체 권한" on public.budgets;
create policy "본인 예산 전체 권한"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── 3. 가계부 거래 ──────────────────────────────────────────────────────
create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('expense','income')),
  category_id text not null,
  memo text not null,
  payer text not null check (payer in ('공동','신랑','신부','양가')),
  method text not null check (method in ('카드','이체','현금','입금')),
  amount integer not null check (amount >= 0),
  date date not null,
  income_source text,
  created_at timestamptz default now()
);

create index if not exists idx_ledger_user_date on public.ledger_entries(user_id, date desc);

alter table public.ledger_entries enable row level security;

drop policy if exists "본인 거래 전체 권한" on public.ledger_entries;
create policy "본인 거래 전체 권한"
  on public.ledger_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── 4. 체크리스트 진행 상태 ─────────────────────────────────────────────
create table if not exists public.checklist_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  done boolean not null default false,
  who text check (who in ('함께','신랑','신부')),
  memo text,
  updated_at timestamptz default now(),
  primary key (user_id, item_id)
);

alter table public.checklist_state enable row level security;

drop policy if exists "본인 체크리스트 전체 권한" on public.checklist_state;
create policy "본인 체크리스트 전체 권한"
  on public.checklist_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
