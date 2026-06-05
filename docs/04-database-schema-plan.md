# 신혼OS DB 스키마 설계안

## 1. 문서 목적

이 문서는 `docs/03-domain-model.md`를 기준으로 신혼OS MVP의 PostgreSQL 스키마 설계안을 정리한다.

주의:

- 이 문서는 설계안이다.
- 마이그레이션 파일, ORM 스키마, 애플리케이션 코드는 만들지 않는다.
- 비즈니스 규칙이 확정되지 않은 부분은 "확정 필요"로 남긴다.

## 2. 설계 원칙

- 핵심 소유 단위는 `couples`다.
- `users`는 행위자이며, 커플 데이터는 `couple_members`를 통해 접근한다.
- 정책, 가격, 계산 결과는 과거 재현이 가능해야 한다.
- 가격과 정책 룰은 업데이트가 아니라 새 버전 추가를 기본으로 한다.
- 주요 결정, 승인, 상태 변경, 운영 변경은 로그로 남긴다.
- 분석 이벤트 payload에는 직접 개인정보를 저장하지 않는다.
- 전화번호, 이메일, 리드 연락처, 파일명 등 직접 개인정보는 암호화 또는 해시 분리를 검토한다.
- 주민등록번호는 어떤 테이블에도 저장하지 않는다.
- 삭제는 기본적으로 soft delete를 우선한다.
- 법무, 개인정보, 보안 보존 정책은 아직 확정 필요다.

## 3. 공통 컬럼 규칙

대부분의 업무 테이블은 아래 공통 컬럼을 가진다.

- `id uuid primary key`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`: soft delete 대상인 경우

로그성 테이블은 `updated_at` 없이 append-only로 둘 수 있다.

공통 타입 후보:

- 식별자: `uuid`
- 상태값: `text` 또는 PostgreSQL enum. 초기에는 `text + check constraint`가 변경에 유연하다.
- 금액: `numeric(14, 0)` 또는 원화 정수 `bigint`
- 날짜와 시간: `timestamptz`
- 유연한 스냅샷: `jsonb`
- 긴 본문: `text`

## 4. 테이블 목록

### 사용자와 커플

- `users`
- `couples`
- `couple_members`
- `couple_invitations`: 후보 도메인이지만 MVP 초대 흐름에 필요

### 온보딩과 시나리오

- `scenarios`
- `scenario_items`

### 정책

- `policy_programs`
- `policy_rule_versions`
- `eligibility_results`

### 파트너와 가격

- `vendors`
- `vendor_branches`: 후보 도메인. MVP에서 지점 단위가 필요하면 사용
- `offers`
- `offer_price_versions`

### 비교와 승인

- `compare_rooms`
- `compare_cards`
- `approvals`
- `compare_comments`: 후보 도메인. Approval comment와 분리 여부 확정 필요
- `decision_logs`

### 상담 신청과 리드

- `lead_requests`
- `lead_status_histories`: 후보 도메인. 리드 상태 변경 이력 관리에 필요

### 문서, 할 일, 알림

- `documents`
- `tasks`
- `notifications`

### 콘텐츠와 분석

- `articles`
- `event_logs`

## 5. 관계 요약

- `users` 1:N `couple_members`
- `couples` 1:N `couple_members`
- `couples` 1:N `couple_invitations`
- `couples` 1:N `scenarios`
- `scenarios` 1:N `scenario_items`
- `policy_programs` 1:N `policy_rule_versions`
- `couples` 1:N `eligibility_results`
- `policy_programs` 1:N `eligibility_results`
- `policy_rule_versions` 1:N `eligibility_results`
- `vendors` 1:N `vendor_branches`
- `vendors` 1:N `offers`
- `offers` 1:N `offer_price_versions`
- `couples` 1:N `compare_rooms`
- `compare_rooms` 1:N `compare_cards`
- `compare_rooms` 1:N `approvals`
- `compare_rooms` 1:N `compare_comments`
- `compare_rooms` 1:N `lead_requests`
- `lead_requests` 1:N `lead_status_histories`
- `couples` 1:N `documents`
- `couples` 1:N `tasks`
- `couples` 1:N `notifications`
- `couples` 1:N `event_logs`

## 6. 삭제와 cascade 기본 정책

기본값:

- 업무 데이터는 물리 삭제보다 soft delete를 우선한다.
- `decision_logs`, `event_logs`, `lead_status_histories`는 append-only로 두고 cascade 삭제하지 않는다.
- 중요한 이력 테이블은 FK 삭제 시 `restrict` 또는 `set null`을 우선한다.
- 자식 row가 부모 없이 의미가 없는 draft 데이터만 제한적으로 cascade를 검토한다.

권장 정책:

- `couples` 삭제: soft delete. 하위 데이터 물리 cascade 금지.
- `users` 삭제: soft delete 또는 익명화. 커플 이력의 actor 참조는 `set null` 또는 익명 사용자 처리 확정 필요.
- `scenarios` 삭제: soft delete. `scenario_items`는 함께 soft delete 또는 cascade 후보.
- `compare_rooms` 삭제: archived 또는 soft delete. `compare_cards`, `approvals`, `comments` 물리 삭제 금지.
- `policy_programs`, `offers`, `offer_price_versions` 삭제: hidden/retired 상태 처리 우선.
- `couple_invitations`: 만료된 초대는 보존 기간 이후 물리 삭제 가능. 보존 기간 확정 필요.

## 7. 테이블 상세

### 7.1 `users`

역할:
로그인 가능한 개인 사용자.

핵심 컬럼:

- `id uuid primary key`
- `display_name text null`
- `email_encrypted text null`
- `email_hash text null`
- `phone_encrypted text null`
- `phone_hash text null`
- `auth_provider text not null`
- `auth_provider_user_id text not null`
- `status text not null`
- `last_login_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- `users.id` -> `couple_members.user_id`
- `users.id` -> 각종 `created_by_user_id`, `actor_user_id`, `submitted_by_user_id`

인덱스:

- `idx_users_status`
- `idx_users_email_hash`
- `idx_users_phone_hash`
- `idx_users_auth_provider_user_id`

unique 제약:

- `unique(auth_provider, auth_provider_user_id)`
- `unique(email_hash)` where `email_hash is not null and deleted_at is null`
- `unique(phone_hash)` where `phone_hash is not null and deleted_at is null`

cascade 정책:

- `users` 물리 삭제 금지.
- actor 참조는 보존 정책 확정 전까지 `restrict` 또는 `set null` 후보.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 상태 변경, 삭제 요청, 개인정보 변경은 필요.

개인정보 컬럼:

- `display_name`
- `email_encrypted`
- `email_hash`
- `phone_encrypted`
- `phone_hash`

암호화 필요 컬럼:

- `email_encrypted`
- `phone_encrypted`

### 7.2 `couples`

역할:
신혼OS의 핵심 작업 단위.

핵심 컬럼:

- `id uuid primary key`
- `display_name text not null`
- `lifecycle_status text not null`
- `wedding_date date null`
- `wedding_region text null`
- `preferred_residence_region text null`
- `housing_type text null`
- `total_budget_range text null`
- `total_budget_amount bigint null`: 금액 저장 여부 확정 필요
- `cash_on_hand_range text null`
- `cash_on_hand_amount bigint null`: 금액 저장 여부 확정 필요
- `family_support_type text null`
- `loan_consideration_status text null`
- `children_plan_status text null`
- `onboarding_status text not null`
- `created_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- `couples.id` -> `couple_members.couple_id`
- `couples.id` -> `scenarios.couple_id`
- `couples.id` -> `compare_rooms.couple_id`
- `couples.id` -> `lead_requests.couple_id`
- `couples.id` -> `documents.couple_id`
- `couples.id` -> `tasks.couple_id`

인덱스:

- `idx_couples_created_by_user_id`
- `idx_couples_lifecycle_status`
- `idx_couples_onboarding_status`
- `idx_couples_wedding_region`
- `idx_couples_preferred_residence_region`

unique 제약:

- 없음.

cascade 정책:

- 하위 데이터 물리 cascade 금지.
- 커플 삭제는 soft delete 또는 익명화 정책으로 처리.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 필요. 멤버 변경, 상태 변경, 삭제 요청, 핵심 온보딩 변경.

개인정보 컬럼:

- `display_name`
- `wedding_region`
- `preferred_residence_region`
- `total_budget_range`
- `total_budget_amount`
- `cash_on_hand_range`
- `cash_on_hand_amount`
- `family_support_type`
- `loan_consideration_status`
- `children_plan_status`

암호화 필요 컬럼:

- 금액을 정확한 값으로 저장한다면 `total_budget_amount`, `cash_on_hand_amount` 암호화 검토.
- MVP에서는 구간 저장 우선.

### 7.3 `couple_members`

역할:
사용자와 커플의 관계, 권한, 참여 상태.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `user_id uuid not null references users(id)`
- `role text not null`
- `status text not null`
- `display_label text null`
- `invited_by_user_id uuid null references users(id)`
- `invited_at timestamptz null`
- `joined_at timestamptz null`
- `left_at timestamptz null`
- `visibility_preference jsonb null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

관계:

- N:1 `users`
- N:1 `couples`
- `approvals`, `tasks`, `notifications`, `decision_logs`에서 참조

인덱스:

- `idx_couple_members_couple_id`
- `idx_couple_members_user_id`
- `idx_couple_members_status`
- `idx_couple_members_role`

unique 제약:

- `unique(couple_id, user_id)`
- MVP에서 한 사용자의 단일 활성 커플만 허용하면 `unique(user_id) where status = 'active'` 후보. 확정 필요.

cascade 정책:

- `couples` 또는 `users` 물리 삭제 cascade 금지.

soft delete 여부:

- `left_at`, `status`로 처리. 별도 `deleted_at`은 선택.

audit log 필요 여부:

- 필요. 역할 변경, 참여, 탈퇴, 제거.

개인정보 컬럼:

- `display_label`
- `visibility_preference`

암호화 필요 컬럼:

- 일반적으로 없음. 공개 범위 설정에 민감 정보가 들어가면 `visibility_preference` 암호화 검토.

### 7.4 `couple_invitations`

역할:
배우자 초대 링크, 만료, 수락, 취소 상태 관리.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `invited_by_user_id uuid not null references users(id)`
- `invited_user_id uuid null references users(id)`
- `token_hash text not null`
- `status text not null`
- `expires_at timestamptz not null`
- `accepted_at timestamptz null`
- `accepted_by_user_id uuid null references users(id)`
- `canceled_at timestamptz null`
- `rejected_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

관계:

- N:1 `couples`
- N:1 `users`

인덱스:

- `idx_couple_invitations_couple_id`
- `idx_couple_invitations_status`
- `idx_couple_invitations_expires_at`
- `idx_couple_invitations_token_hash`

unique 제약:

- `unique(token_hash)`

cascade 정책:

- 커플 soft delete 시 초대도 만료 처리.
- 물리 cascade 금지. 만료 초대 보존 기간 이후 삭제 가능. 보존 기간 확정 필요.

soft delete 여부:

- 상태와 만료 시간으로 처리. `deleted_at`은 선택.

audit log 필요 여부:

- 필요. 초대 생성, 수락, 취소, 만료.

개인정보 컬럼:

- `invited_user_id`
- `accepted_by_user_id`

암호화 필요 컬럼:

- 원본 토큰 저장 금지. `token_hash`만 저장.

### 7.5 `scenarios`

역할:
커플 비용 시나리오와 계산 결과 묶음.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `title text not null`
- `status text not null`
- `calculation_version text not null`
- `input_snapshot jsonb not null`
- `total_amount bigint null`
- `monthly_amount bigint null`
- `shortfall_amount bigint null`
- `risk_flags jsonb null`
- `contains_sample_value boolean not null default false`
- `created_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `archived_at timestamptz null`
- `deleted_at timestamptz null`

관계:

- N:1 `couples`
- 1:N `scenario_items`

인덱스:

- `idx_scenarios_couple_id`
- `idx_scenarios_status`
- `idx_scenarios_created_at`
- `idx_scenarios_calculation_version`

unique 제약:

- 없음.

cascade 정책:

- 물리 삭제 금지.
- `scenario_items`는 scenario soft delete 시 함께 숨김 처리.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 계산 생성, 수정, 보관 처리에 필요.

개인정보 컬럼:

- `input_snapshot`
- `total_amount`
- `monthly_amount`
- `shortfall_amount`

암호화 필요 컬럼:

- `input_snapshot` 암호화 검토.
- 정확한 재정 수치를 저장하면 금액 컬럼 암호화 검토.

### 7.6 `scenario_items`

역할:
시나리오의 개별 비용 항목.

핵심 컬럼:

- `id uuid primary key`
- `scenario_id uuid not null references scenarios(id)`
- `category text not null`
- `label text not null`
- `amount bigint not null`
- `amount_type text not null`
- `is_required boolean not null default false`
- `source_type text null`
- `source_url text null`
- `note text null`
- `sort_order integer not null default 0`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

관계:

- N:1 `scenarios`

인덱스:

- `idx_scenario_items_scenario_id`
- `idx_scenario_items_category`
- `idx_scenario_items_sort_order`

unique 제약:

- 없음.

cascade 정책:

- scenario 물리 삭제를 하지 않으므로 cascade 없음.
- 만약 draft scenario를 물리 삭제한다면 같이 삭제 가능 후보.

soft delete 여부:

- 보통 필요 없음. scenario 단위로 보관.

audit log 필요 여부:

- 단독 audit은 선택. scenario 변경 로그로 대체 가능.

개인정보 컬럼:

- `amount`
- `note`

암호화 필요 컬럼:

- 일반적으로 없음. `note`에 민감 정보가 들어갈 가능성이 있으면 입력 제한 우선.

### 7.7 `policy_programs`

역할:
정책 또는 혜택 프로그램 기본 정보.

핵심 컬럼:

- `id uuid primary key`
- `name text not null`
- `provider_name text not null`
- `category text not null`
- `region text null`
- `summary text not null`
- `source_url text not null`
- `source_updated_at timestamptz null`
- `verified_at timestamptz null`
- `application_start_at timestamptz null`
- `application_end_at timestamptz null`
- `status text not null`
- `caution_text text null`
- `required_documents_summary jsonb null`
- `created_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

관계:

- 1:N `policy_rule_versions`
- 1:N `eligibility_results`

인덱스:

- `idx_policy_programs_status`
- `idx_policy_programs_region`
- `idx_policy_programs_category`
- `idx_policy_programs_application_end_at`
- `idx_policy_programs_verified_at`

unique 제약:

- `unique(name, provider_name, region)` 후보. 정책명 중복 가능성이 있어 확정 필요.

cascade 정책:

- 물리 삭제 금지. `hidden`, `expired`, `retired` 상태 사용.

soft delete 여부:

- 보통 상태값으로 처리. `deleted_at` 선택.

audit log 필요 여부:

- 필요.

개인정보 컬럼:

- 없음.

암호화 필요 컬럼:

- 없음.

### 7.8 `policy_rule_versions`

역할:
정책 자격 판단 룰의 버전.

핵심 컬럼:

- `id uuid primary key`
- `policy_program_id uuid not null references policy_programs(id)`
- `version integer not null`
- `status text not null`
- `rule_summary text not null`
- `eligibility_criteria jsonb not null`
- `required_inputs jsonb null`
- `result_reason_template jsonb null`
- `required_documents jsonb null`
- `effective_from timestamptz null`
- `effective_to timestamptz null`
- `source_url text not null`
- `source_updated_at timestamptz null`
- `verified_at timestamptz null`
- `created_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`

관계:

- N:1 `policy_programs`
- 1:N `eligibility_results`

인덱스:

- `idx_policy_rule_versions_policy_program_id`
- `idx_policy_rule_versions_status`
- `idx_policy_rule_versions_effective_range`
- `idx_policy_rule_versions_verified_at`

unique 제약:

- `unique(policy_program_id, version)`
- `unique(policy_program_id) where status = 'active'` 후보. 활성 룰을 하나만 둘지 확정 필요.

cascade 정책:

- 물리 삭제 금지.
- retired 상태 사용.

soft delete 여부:

- 불필요. append-only 버전 관리.

audit log 필요 여부:

- 필요.

개인정보 컬럼:

- 없음.

암호화 필요 컬럼:

- 없음.

### 7.9 `eligibility_results`

역할:
커플 입력값을 정책 룰 버전에 적용한 결과.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `policy_program_id uuid not null references policy_programs(id)`
- `policy_rule_version_id uuid not null references policy_rule_versions(id)`
- `result_status text not null`
- `result_reason text not null`
- `missing_inputs jsonb null`
- `required_documents jsonb null`
- `input_snapshot jsonb not null`
- `checked_at timestamptz not null`
- `expires_at timestamptz null`
- `created_at timestamptz not null`

관계:

- N:1 `couples`
- N:1 `policy_programs`
- N:1 `policy_rule_versions`

인덱스:

- `idx_eligibility_results_couple_id`
- `idx_eligibility_results_policy_program_id`
- `idx_eligibility_results_policy_rule_version_id`
- `idx_eligibility_results_result_status`
- `idx_eligibility_results_checked_at`

unique 제약:

- 없음.
- 최신 결과만 하나 유지하려면 `unique(couple_id, policy_program_id, policy_rule_version_id)` 후보. 재계산 보존 정책 확정 필요.

cascade 정책:

- 커플 삭제 시 물리 cascade 금지.
- 정책 또는 룰 삭제 금지.

soft delete 여부:

- 보통 불필요. 결과 재계산은 새 row 추가 권장.

audit log 필요 여부:

- 결과 생성 자체가 이력이다. 별도 audit은 선택.

개인정보 컬럼:

- `input_snapshot`
- `result_reason`
- `missing_inputs`

암호화 필요 컬럼:

- `input_snapshot` 암호화 검토.

### 7.10 `vendors`

역할:
파트너 업체.

핵심 컬럼:

- `id uuid primary key`
- `name text not null`
- `category text not null`
- `region text null`
- `description text null`
- `business_identifier_encrypted text null`
- `business_identifier_hash text null`
- `representative_contact_name_encrypted text null`
- `representative_contact_phone_encrypted text null`
- `representative_contact_phone_hash text null`
- `status text not null`
- `verification_status text not null`
- `verified_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- 1:N `vendor_branches`
- 1:N `offers`
- 1:N `lead_requests`

인덱스:

- `idx_vendors_category`
- `idx_vendors_region`
- `idx_vendors_status`
- `idx_vendors_verification_status`
- `idx_vendors_business_identifier_hash`

unique 제약:

- `unique(business_identifier_hash)` where not null. 사업자 식별자 저장 여부 확정 필요.

cascade 정책:

- 물리 삭제 금지. `hidden`, `suspended` 상태 사용.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 필요. 상태, 검증, 담당자 정보 변경.

개인정보 컬럼:

- `representative_contact_name_encrypted`
- `representative_contact_phone_encrypted`
- `representative_contact_phone_hash`
- `business_identifier_encrypted`: 사업자 정보의 개인정보성은 법무 검토 필요.

암호화 필요 컬럼:

- 담당자 이름과 전화번호.
- 사업자 식별자 저장 시 암호화 검토.

### 7.11 `vendor_branches`

역할:
파트너 지점과 지역별 상담 범위. MVP 포함 여부 확정 필요.

핵심 컬럼:

- `id uuid primary key`
- `vendor_id uuid not null references vendors(id)`
- `name text not null`
- `region text null`
- `address text null`
- `contact_phone_encrypted text null`
- `contact_phone_hash text null`
- `status text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `vendors`
- `offers`가 지점 단위로 연결될지 확정 필요.

인덱스:

- `idx_vendor_branches_vendor_id`
- `idx_vendor_branches_region`
- `idx_vendor_branches_status`

unique 제약:

- `unique(vendor_id, name)` 후보.

cascade 정책:

- vendor 물리 삭제 금지. cascade 없음.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 필요.

개인정보 컬럼:

- `contact_phone_encrypted`
- `address`: 지점 주소가 개인 주소일 가능성은 낮지만 검토 필요.

암호화 필요 컬럼:

- `contact_phone_encrypted`

### 7.12 `offers`

역할:
파트너가 제공하는 상품 또는 상담 서비스.

핵심 컬럼:

- `id uuid primary key`
- `vendor_id uuid not null references vendors(id)`
- `vendor_branch_id uuid null references vendor_branches(id)`
- `title text not null`
- `category text not null`
- `region text null`
- `summary text not null`
- `description text null`
- `status text not null`
- `display_order integer not null default 0`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `vendors`
- N:1 `vendor_branches` 선택
- 1:N `offer_price_versions`
- 1:N `compare_cards`

인덱스:

- `idx_offers_vendor_id`
- `idx_offers_vendor_branch_id`
- `idx_offers_category`
- `idx_offers_region`
- `idx_offers_status`
- `idx_offers_display_order`

unique 제약:

- 없음. `unique(vendor_id, title)` 후보이나 같은 이름 상품 가능성 있어 확정 필요.

cascade 정책:

- 물리 삭제 금지. 비활성은 `status` 또는 `deleted_at` 처리.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 필요.

개인정보 컬럼:

- 없음.

암호화 필요 컬럼:

- 없음.

### 7.13 `offer_price_versions`

역할:
상품 가격과 옵션의 특정 버전.

핵심 컬럼:

- `id uuid primary key`
- `offer_id uuid not null references offers(id)`
- `version integer not null`
- `base_price bigint not null`
- `estimated_total_price bigint not null`
- `included_items jsonb not null`
- `required_options jsonb null`
- `optional_options jsonb null`
- `additional_cost_note text null`
- `cancellation_policy_summary text null`
- `verification_status text not null`
- `verified_at timestamptz null`
- `valid_from timestamptz null`
- `valid_until timestamptz null`
- `source_type text null`
- `source_url text null`
- `created_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`

관계:

- N:1 `offers`
- 1:N `compare_cards`
- 1:N `lead_requests`

인덱스:

- `idx_offer_price_versions_offer_id`
- `idx_offer_price_versions_verification_status`
- `idx_offer_price_versions_valid_until`
- `idx_offer_price_versions_verified_at`

unique 제약:

- `unique(offer_id, version)`
- `unique(offer_id) where verification_status = 'verified' and valid_until > now()`는 PostgreSQL partial index에서 `now()` 사용이 부적절하므로 애플리케이션 또는 별도 active flag 검토 필요.

cascade 정책:

- 물리 삭제 금지. 가격 이력 보존.

soft delete 여부:

- 불필요. 버전 append-only.

audit log 필요 여부:

- 필요.

개인정보 컬럼:

- 없음.

암호화 필요 컬럼:

- 없음.

### 7.14 `compare_rooms`

역할:
커플 상품 비교 공간.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `title text not null`
- `status text not null`
- `created_by_user_id uuid null references users(id)`
- `shared_at timestamptz null`
- `both_approved_at timestamptz null`
- `rejected_at timestamptz null`
- `archived_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `couples`
- 1:N `compare_cards`
- 1:N `approvals`
- 1:N `compare_comments`
- 1:N `lead_requests`

인덱스:

- `idx_compare_rooms_couple_id`
- `idx_compare_rooms_status`
- `idx_compare_rooms_created_at`

unique 제약:

- 없음.

cascade 정책:

- 물리 삭제 금지.

soft delete 여부:

- 필요 또는 `archived_at` 중심 처리.

audit log 필요 여부:

- 필요. 상태 변경, 공유, 승인 완료, 반려.

개인정보 컬럼:

- `title`에 민감 정보가 들어갈 수 있음.

암호화 필요 컬럼:

- 일반적으로 없음. 제목 입력 제한 우선.

### 7.15 `compare_cards`

역할:
비교방에 담긴 상품 카드와 가격 스냅샷.

핵심 컬럼:

- `id uuid primary key`
- `compare_room_id uuid not null references compare_rooms(id)`
- `offer_id uuid not null references offers(id)`
- `offer_price_version_id uuid not null references offer_price_versions(id)`
- `snapshot_title text not null`
- `snapshot_price_summary jsonb not null`
- `snapshot_included_items jsonb null`
- `snapshot_required_options jsonb null`
- `snapshot_optional_options jsonb null`
- `position integer not null`
- `added_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`
- `removed_at timestamptz null`

관계:

- N:1 `compare_rooms`
- N:1 `offers`
- N:1 `offer_price_versions`
- 1:N `approvals` if card-level approval 확정 시

인덱스:

- `idx_compare_cards_compare_room_id`
- `idx_compare_cards_offer_id`
- `idx_compare_cards_offer_price_version_id`
- `idx_compare_cards_position`

unique 제약:

- `unique(compare_room_id, position)` where `removed_at is null`
- `unique(compare_room_id, offer_id)` where `removed_at is null` 후보. 같은 상품 중복 담기 허용 여부 확정 필요.

cascade 정책:

- 비교방 물리 삭제 금지. cascade 없음.
- 제거는 `removed_at`으로 처리.

soft delete 여부:

- `removed_at` 사용.

audit log 필요 여부:

- 필요. 카드 추가, 제거.

개인정보 컬럼:

- 없음.

암호화 필요 컬럼:

- 없음.

### 7.16 `approvals`

역할:
커플 구성원의 승인, 보류, 반려 상태.

핵심 컬럼:

- `id uuid primary key`
- `compare_room_id uuid not null references compare_rooms(id)`
- `compare_card_id uuid null references compare_cards(id)`
- `couple_member_id uuid not null references couple_members(id)`
- `user_id uuid not null references users(id)`
- `status text not null`
- `comment text null`
- `decided_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

관계:

- N:1 `compare_rooms`
- N:1 `compare_cards` 선택
- N:1 `couple_members`
- N:1 `users`

인덱스:

- `idx_approvals_compare_room_id`
- `idx_approvals_compare_card_id`
- `idx_approvals_couple_member_id`
- `idx_approvals_status`

unique 제약:

- 방 단위 승인이라면 `unique(compare_room_id, couple_member_id)`
- 카드 단위 승인이라면 `unique(compare_card_id, couple_member_id)`
- 승인 대상 단위 확정 필요.

cascade 정책:

- 물리 삭제 금지.

soft delete 여부:

- 일반적으로 없음. 상태 변경은 row update + DecisionLog.

audit log 필요 여부:

- 필요. 모든 상태 변경.

개인정보 컬럼:

- `comment`

암호화 필요 컬럼:

- 일반적으로 없음. 민감 정보 입력 제한 우선.

### 7.17 `compare_comments`

역할:
비교방 댓글. Approval comment와 분리할지 확정 필요.

핵심 컬럼:

- `id uuid primary key`
- `compare_room_id uuid not null references compare_rooms(id)`
- `compare_card_id uuid null references compare_cards(id)`
- `couple_member_id uuid not null references couple_members(id)`
- `user_id uuid not null references users(id)`
- `body text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `compare_rooms`
- N:1 `compare_cards` 선택
- N:1 `couple_members`
- N:1 `users`

인덱스:

- `idx_compare_comments_compare_room_id`
- `idx_compare_comments_compare_card_id`
- `idx_compare_comments_created_at`

unique 제약:

- 없음.

cascade 정책:

- 물리 cascade 금지.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 삭제 또는 운영자 숨김 처리 시 필요.

개인정보 컬럼:

- `body`

암호화 필요 컬럼:

- 일반적으로 없음. 민감 정보 입력 제한 우선.

### 7.18 `lead_requests`

역할:
둘 다 승인된 비교방에서 생성되는 상담 신청.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `compare_room_id uuid not null references compare_rooms(id)`
- `compare_card_id uuid null references compare_cards(id)`
- `offer_id uuid null references offers(id)`
- `vendor_id uuid not null references vendors(id)`
- `offer_price_version_id uuid null references offer_price_versions(id)`
- `status text not null`
- `preferred_contact_method text not null`
- `preferred_contact_dates jsonb null`
- `contact_name_encrypted text null`
- `contact_phone_encrypted text null`
- `contact_phone_hash text null`
- `message_encrypted text null`
- `consent_given_at timestamptz not null`
- `submitted_by_user_id uuid not null references users(id)`
- `submitted_at timestamptz not null`
- `expires_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `couples`
- N:1 `compare_rooms`
- N:1 `vendors`
- N:1 `offers` 선택
- N:1 `offer_price_versions` 선택
- 1:N `lead_status_histories`

인덱스:

- `idx_lead_requests_couple_id`
- `idx_lead_requests_compare_room_id`
- `idx_lead_requests_vendor_id`
- `idx_lead_requests_status`
- `idx_lead_requests_submitted_at`
- `idx_lead_requests_contact_phone_hash`

unique 제약:

- 중복 신청 방지를 위해 `unique(couple_id, compare_room_id, vendor_id, offer_price_version_id)` 후보.
- 재신청 허용 정책 확정 필요.

cascade 정책:

- 물리 삭제 금지.

soft delete 여부:

- 필요 또는 status로 보관.

audit log 필요 여부:

- 필요. 제출, 조회, 상태 변경, 개인정보 접근.

개인정보 컬럼:

- `contact_name_encrypted`
- `contact_phone_encrypted`
- `contact_phone_hash`
- `message_encrypted`
- `preferred_contact_dates`

암호화 필요 컬럼:

- `contact_name_encrypted`
- `contact_phone_encrypted`
- `message_encrypted`

### 7.19 `lead_status_histories`

역할:
리드 상태 변경 이력.

핵심 컬럼:

- `id uuid primary key`
- `lead_request_id uuid not null references lead_requests(id)`
- `from_status text null`
- `to_status text not null`
- `changed_by_user_id uuid null references users(id)`
- `changed_by_role text null`
- `reason text null`
- `created_at timestamptz not null`

관계:

- N:1 `lead_requests`

인덱스:

- `idx_lead_status_histories_lead_request_id`
- `idx_lead_status_histories_to_status`
- `idx_lead_status_histories_created_at`

unique 제약:

- 없음.

cascade 정책:

- 물리 cascade 금지.

soft delete 여부:

- 없음. append-only.

audit log 필요 여부:

- 자체가 audit 성격.

개인정보 컬럼:

- `reason`에 개인정보 입력 가능성이 있어 제한 필요.

암호화 필요 컬럼:

- 일반적으로 없음. 입력 제한 우선.

### 7.20 `decision_logs`

역할:
중요 상태 변경과 의사결정의 append-only 로그.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid null references couples(id)`
- `actor_user_id uuid null references users(id)`
- `actor_couple_member_id uuid null references couple_members(id)`
- `target_type text not null`
- `target_id uuid not null`
- `action text not null`
- `before_status text null`
- `after_status text null`
- `reason text null`
- `metadata jsonb null`
- `created_at timestamptz not null`

관계:

- 다형 target. FK를 직접 걸기 어렵기 때문에 애플리케이션 검증 필요.
- `couple_id`, `actor_user_id`, `actor_couple_member_id`는 가능한 경우 FK 사용.

인덱스:

- `idx_decision_logs_couple_id`
- `idx_decision_logs_actor_user_id`
- `idx_decision_logs_target`
- `idx_decision_logs_action`
- `idx_decision_logs_created_at`

unique 제약:

- 없음.

cascade 정책:

- 물리 cascade 금지.

soft delete 여부:

- 없음. append-only.

audit log 필요 여부:

- 자체가 audit log.

개인정보 컬럼:

- `reason`
- `metadata`

암호화 필요 컬럼:

- 원칙적으로 개인정보 저장 금지. 암호화보다 필드 차단 우선.

### 7.21 `documents`

역할:
필요 서류 준비 상태와 선택적 첨부 정보.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `title text not null`
- `document_type text not null`
- `status text not null`
- `source_type text null`
- `source_id uuid null`
- `owner_couple_member_id uuid null references couple_members(id)`
- `due_at timestamptz null`
- `attachment_ref_encrypted text null`
- `attachment_provider text null`
- `original_file_name_encrypted text null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `couples`
- N:1 `couple_members` as owner
- source는 policy, eligibility result, lead 등 다형 참조 후보

인덱스:

- `idx_documents_couple_id`
- `idx_documents_owner_couple_member_id`
- `idx_documents_status`
- `idx_documents_due_at`
- `idx_documents_source`

unique 제약:

- 없음.

cascade 정책:

- 물리 cascade 금지.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 필요. 상태 변경, 첨부, 삭제, 접근.

개인정보 컬럼:

- `title`
- `attachment_ref_encrypted`
- `original_file_name_encrypted`

암호화 필요 컬럼:

- `attachment_ref_encrypted`
- `original_file_name_encrypted`

### 7.22 `tasks`

역할:
커플 할 일.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid not null references couples(id)`
- `title text not null`
- `description text null`
- `status text not null`
- `source_type text null`
- `source_id uuid null`
- `assigned_couple_member_id uuid null references couple_members(id)`
- `due_at timestamptz null`
- `completed_at timestamptz null`
- `created_by_user_id uuid null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `couples`
- N:1 `couple_members` as assignee
- source 다형 참조 후보

인덱스:

- `idx_tasks_couple_id`
- `idx_tasks_assigned_couple_member_id`
- `idx_tasks_status`
- `idx_tasks_due_at`
- `idx_tasks_source`

unique 제약:

- 정책 결과에서 자동 생성되는 task 중복 방지를 위해 `unique(couple_id, source_type, source_id, title)` 후보. 확정 필요.

cascade 정책:

- 물리 cascade 금지.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 상태 변경과 담당자 변경에 필요.

개인정보 컬럼:

- `title`
- `description`

암호화 필요 컬럼:

- 일반적으로 없음. 민감 정보 입력 제한 우선.

### 7.23 `notifications`

역할:
인앱 또는 외부 채널 알림 저장과 발송 상태.

핵심 컬럼:

- `id uuid primary key`
- `couple_id uuid null references couples(id)`
- `user_id uuid null references users(id)`
- `couple_member_id uuid null references couple_members(id)`
- `type text not null`
- `title text not null`
- `body text null`
- `channel text not null`
- `status text not null`
- `scheduled_at timestamptz null`
- `sent_at timestamptz null`
- `read_at timestamptz null`
- `metadata jsonb null`
- `created_at timestamptz not null`

관계:

- N:1 `couples`
- N:1 `users`
- N:1 `couple_members`

인덱스:

- `idx_notifications_user_id`
- `idx_notifications_couple_id`
- `idx_notifications_couple_member_id`
- `idx_notifications_status`
- `idx_notifications_scheduled_at`
- `idx_notifications_read_at`

unique 제약:

- 없음.

cascade 정책:

- 물리 cascade 금지.

soft delete 여부:

- 보통 불필요. 읽음 또는 취소 상태 사용.

audit log 필요 여부:

- 외부 발송 실패/성공 이력은 필요.

개인정보 컬럼:

- `title`
- `body`
- `metadata`

암호화 필요 컬럼:

- 원칙적으로 개인정보 저장 금지. 외부 발송용 직접 연락처는 별도 발송 시스템에서 처리.

### 7.24 `articles`

역할:
콘텐츠와 SEO 문서.

핵심 컬럼:

- `id uuid primary key`
- `title text not null`
- `slug text not null`
- `summary text null`
- `body text not null`
- `category text not null`
- `status text not null`
- `seo_title text null`
- `seo_description text null`
- `og_image_url text null`
- `published_at timestamptz null`
- `author_user_id uuid null references users(id)`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

관계:

- N:1 `users` as author

인덱스:

- `idx_articles_slug`
- `idx_articles_status`
- `idx_articles_category`
- `idx_articles_published_at`

unique 제약:

- `unique(slug)` where `deleted_at is null`

cascade 정책:

- 작성자 삭제 시 `author_user_id set null` 후보.

soft delete 여부:

- 필요.

audit log 필요 여부:

- 게시, 수정, 보관 처리에 필요.

개인정보 컬럼:

- 일반 콘텐츠에는 없음.
- `author_user_id`는 내부 식별자.

암호화 필요 컬럼:

- 없음.

### 7.25 `event_logs`

역할:
분석과 퍼널 이벤트.

핵심 컬럼:

- `id uuid primary key`
- `event_name text not null`
- `user_id uuid null references users(id)`
- `couple_id uuid null references couples(id)`
- `anonymous_id text null`
- `source text not null`
- `schema_version integer not null default 1`
- `payload jsonb null`
- `occurred_at timestamptz not null`
- `created_at timestamptz not null`

관계:

- N:1 `users` 선택
- N:1 `couples` 선택

인덱스:

- `idx_event_logs_event_name`
- `idx_event_logs_user_id`
- `idx_event_logs_couple_id`
- `idx_event_logs_anonymous_id`
- `idx_event_logs_occurred_at`
- `idx_event_logs_event_name_occurred_at`

unique 제약:

- 없음. 클라이언트 중복 방지용 `idempotency_key` 추가 여부 확정 필요.

cascade 정책:

- 물리 cascade 금지.
- 개인정보 삭제 요청 시 user/couple 참조 익명화 정책 확정 필요.

soft delete 여부:

- 없음. append-only.

audit log 필요 여부:

- 자체 로그. 별도 audit 없음.

개인정보 컬럼:

- `user_id`
- `couple_id`
- `anonymous_id`
- `payload`는 직접 개인정보 저장 금지.

암호화 필요 컬럼:

- 원칙적으로 없음. payload 차단과 스키마 검증 우선.

## 8. 주요 인덱스 전략

사용자 흐름 기준:

- 홈 화면: `couple_members(user_id, status)`, `couples(onboarding_status)`, `scenarios(couple_id, created_at)`, `compare_rooms(couple_id, status)`, `tasks(couple_id, status, due_at)`
- 정책 결과: `eligibility_results(couple_id, result_status)`, `policy_programs(status, region, category)`
- 상품 목록: `offers(status, category, region)`, `offer_price_versions(offer_id, verification_status, valid_until)`
- 비교방: `compare_cards(compare_room_id)`, `approvals(compare_room_id, couple_member_id)`
- 리드: `lead_requests(vendor_id, status, submitted_at)`, `lead_requests(couple_id, status)`
- 알림: `notifications(user_id, status, scheduled_at)`, `notifications(couple_member_id, read_at)`
- 분석: `event_logs(event_name, occurred_at)`, `event_logs(couple_id, occurred_at)`

## 9. unique 제약 요약

확정 권장:

- `users(auth_provider, auth_provider_user_id)`
- `couple_members(couple_id, user_id)`
- `couple_invitations(token_hash)`
- `policy_rule_versions(policy_program_id, version)`
- `offer_price_versions(offer_id, version)`
- `compare_cards(compare_room_id, position)` where `removed_at is null`
- `articles(slug)` where `deleted_at is null`

확정 필요:

- `users(email_hash)`, `users(phone_hash)` 중 어떤 식별자를 필수로 둘지
- 한 User의 단일 활성 Couple만 허용할지
- 정책 프로그램 중복 기준
- 활성 정책 룰을 프로그램당 하나만 둘지
- 같은 상품을 같은 비교방에 중복 추가할 수 있는지
- Approval이 방 단위인지 카드 단위인지
- 리드 중복 신청 기준
- 자동 생성 Task 중복 기준

## 10. audit log 필요 테이블

반드시 필요:

- `couple_members`
- `couple_invitations`
- `policy_programs`
- `policy_rule_versions`
- `vendors`
- `vendor_branches`
- `offers`
- `offer_price_versions`
- `compare_rooms`
- `compare_cards`
- `approvals`
- `lead_requests`
- `documents`
- `tasks`
- `articles`

자체 로그 성격:

- `decision_logs`
- `lead_status_histories`
- `event_logs`

선택 또는 상위 로그로 대체:

- `scenario_items`
- `notifications`

## 11. 개인정보와 암호화 요약

### 직접 개인정보 포함

- `users.display_name`
- `users.email_encrypted`
- `users.phone_encrypted`
- `vendors.representative_contact_name_encrypted`
- `vendors.representative_contact_phone_encrypted`
- `lead_requests.contact_name_encrypted`
- `lead_requests.contact_phone_encrypted`
- `lead_requests.message_encrypted`
- `documents.attachment_ref_encrypted`
- `documents.original_file_name_encrypted`

### 민감 가능 정보 포함

- `couples.total_budget_range`
- `couples.total_budget_amount`
- `couples.cash_on_hand_range`
- `couples.cash_on_hand_amount`
- `couples.loan_consideration_status`
- `couples.children_plan_status`
- `scenarios.input_snapshot`
- `scenarios.total_amount`
- `scenarios.monthly_amount`
- `scenarios.shortfall_amount`
- `eligibility_results.input_snapshot`
- `tasks.title`
- `tasks.description`
- `compare_comments.body`
- `approvals.comment`

### 암호화 우선 검토 컬럼

- `users.email_encrypted`
- `users.phone_encrypted`
- `vendors.business_identifier_encrypted`
- `vendors.representative_contact_name_encrypted`
- `vendors.representative_contact_phone_encrypted`
- `vendor_branches.contact_phone_encrypted`
- `lead_requests.contact_name_encrypted`
- `lead_requests.contact_phone_encrypted`
- `lead_requests.message_encrypted`
- `documents.attachment_ref_encrypted`
- `documents.original_file_name_encrypted`
- `scenarios.input_snapshot`
- `eligibility_results.input_snapshot`

### 해시 분리 컬럼

검색과 unique를 위해 원문 대신 해시를 둔다.

- `users.email_hash`
- `users.phone_hash`
- `vendors.business_identifier_hash`
- `vendors.representative_contact_phone_hash`
- `vendor_branches.contact_phone_hash`
- `lead_requests.contact_phone_hash`
- `couple_invitations.token_hash`

## 12. 확정 필요 사항

- PostgreSQL enum을 사용할지, `text + check constraint`로 시작할지
- 이메일, 휴대폰, 소셜 로그인 중 MVP 필수 가입 식별자
- 한 User의 다중 Couple 소속 허용 여부
- 보유 현금과 예산을 구간만 저장할지 정확한 금액도 저장할지
- `CoupleInvitation`, `CompareComment`, `LeadStatusHistory`, `VendorBranch`를 MVP 필수 테이블로 승격할지
- 정책 결과 재계산 시 새 row를 계속 남길지, 최신 row를 갱신할지
- Approval 대상이 `compare_rooms` 단위인지 `compare_cards` 단위인지
- 리드 중복 신청 방지 기준
- 가격 만료 시 상담 신청 차단 여부
- 문서 원본 업로드 도입 시 암호화, 보관 기간, 접근 로그 범위
- 개인정보 삭제 요청 시 `decision_logs`, `event_logs`, `lead_status_histories` 익명화 기준
- 운영자 audit log를 `decision_logs` 하나로 통합할지 별도 `audit_logs` 테이블을 둘지
