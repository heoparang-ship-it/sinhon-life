-- ─── 파트너 입점 LOI (Partner Leads) ───────────────────────────────
-- 스튜디오·예식장·인테리어·가전·여행사 등 B2B 입점 의향서.
-- /partners 페이지에서 폼 제출 → 적재. 비로그인 가능.
--
-- 적용: Supabase SQL Editor → New query → 붙여넣기 → Run

do $$ begin
  create type public.partner_lead_status as enum (
    'new',
    'reviewing',
    'qualified',
    'signed',
    'rejected'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  representative_name text not null,
  contact_phone text not null,
  contact_email text,
  categories text[] not null default '{}',   -- ['sdm','venue',...]
  region text not null,                      -- 'incheon-bupyeong' 등
  monthly_volume integer,                    -- 월 평균 신혼 고객 수(자기 보고)
  message text,
  consent_at timestamptz not null,
  status public.partner_lead_status not null default 'new',
  created_at timestamptz default now()
);

create index if not exists idx_partner_leads_status_created
  on public.partner_leads(status, created_at desc);

create index if not exists idx_partner_leads_region
  on public.partner_leads(region, created_at desc);

alter table public.partner_leads enable row level security;

-- INSERT: 누구나 가능 (B2B 공개 폼)
drop policy if exists "파트너리드 INSERT" on public.partner_leads;
create policy "파트너리드 INSERT"
  on public.partner_leads for insert
  with check (true);

-- SELECT/UPDATE/DELETE: service_role 만 (RLS 통과 불가 = 정책 없음)
-- 운영진은 Supabase Studio (service_role) 로만 조회/업데이트
