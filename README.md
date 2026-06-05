# 신혼OS

신혼OS는 예비 신혼부부와 혼인 초기 부부가 예산, 주거, 정책 혜택, 파트너 상품 비교, 공동 승인, 상담 신청을 함께 진행하는 커플 중심 실행 서비스입니다.

## 현재 단계

Phase 5의 `21. E2E 테스트`, 결제 전 단계 `25-A. 결제 설계 문서`, 공개 배포 전 최소 보안 하드닝까지 진행되었습니다. 로컬 MVP 인증, 커플 생성, 초대 링크 생성, 초대 가입/수락, 개인·커플 공통 온보딩, 시나리오 생성·계산·결과 확인, 정책·혜택 가능성 확인, 필요 서류 체크리스트, 파트너 상품 목록·상세, 비교방 생성·카드 추가·댓글·공동 승인, 상담 신청·리드 상태 변경, 문서함·할 일·인앱 알림, 운영자 CRM, 공개 콘텐츠·CMS·계산기 랜딩, 분석 이벤트·관리자 퍼널, Playwright 핵심 E2E 흐름이 연결되어 있습니다. 사용자 웹과 API는 Vercel production의 같은 배포에서 제공되며 API는 `/api/v1` 경로로 노출됩니다. 결제 샌드박스 구현은 법무·보안·운영 승인 전까지 보류합니다.

Production URL: `https://sinhon.life`

API base URL: `https://www.sinhon.life/api/v1`

## 구조

```text
apps/
  web/      사용자용 Next.js 앱
  admin/    운영자용 Next.js 앱
  api/      TypeScript Express API
packages/
  ui/        공통 UI 최소 골격
  config/    공통 설정 상수
  database/  PostgreSQL/ORM 준비용 패키지
  schemas/   공통 입력 스키마
  analytics/ 분석 이벤트 상수
docs/        제품/도메인/API 문서
tests/       통합 테스트 자리
```

## 명령어

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

개발 서버:

```bash
pnpm dev:web
pnpm dev:admin
pnpm dev:api
```

로컬 DB와 인증 흐름:

```bash
docker compose up -d postgres
DATABASE_URL=postgresql://sinhon_os:sinhon_os@localhost:5433/sinhon_os?schema=public pnpm db:migrate:deploy
AUTH_TOKEN_SECRET=dev-only-change-me PII_ENCRYPTION_KEY=local-dev-pii-key-change-me DATABASE_URL=postgresql://sinhon_os:sinhon_os@localhost:5433/sinhon_os?schema=public pnpm dev:api
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1 NEXT_PUBLIC_WEB_BASE_URL=http://localhost:3000 pnpm dev:web
```

운영 배포 필수 환경변수:

```bash
AUTH_TOKEN_SECRET=...
AUTH_TOKEN_TTL_SECONDS=604800
PII_ENCRYPTION_KEY=...
CORS_ALLOWED_ORIGINS=https://your-web-domain.example
ADMIN_ALLOWED_ORIGINS=https://your-admin-domain.example
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.example/api/v1
NEXT_PUBLIC_WEB_BASE_URL=https://your-web-domain.example
```

Vercel production build는 `pnpm db:generate` 후 `VERCEL_ENV=production`일 때만 `scripts/vercel-production-db-prepare.mjs`로 `DIRECT_URL`을 사용해 호환 스키마 기준점 처리, 필요 시 Supabase `auth` schema를 인식한 비파괴 `db push` bootstrap, `migrate deploy`, seed를 실행합니다.

## 기준 문서

- `AGENTS.md`
- `docs/01-prd.md`
- `docs/02-user-flows.md`
- `docs/03-domain-model.md`
- `docs/04-database-schema-plan.md`
- `docs/05-api-contract.md`
- `docs/06-scenario-engine.md`
- `docs/07-policy-rule-engine.md`
- `docs/08-offer-price-schema.md`
- `docs/09-payment-plan.md`
- `docs/10-release-checklist.md`
- `docs/11-production-readiness.md`
- `docs/12-deployment-report-2026-06-05.md`
- `신혼OS_코덱스_명령세트_v1.md`

## 주의

- 주민등록번호는 수집하지 않습니다.
- 정책 선정, 대출 가능, 금융 심사 결과처럼 보이는 표현은 사용하지 않습니다.
- 정책 룰은 `PolicyRuleVersion`으로 버전 관리하며 결과는 가능성 안내로만 표시합니다.
- 파트너 가격은 `OfferPriceVersion`으로 버전 관리하며, 실제 결제나 계약 확정 기능은 만들지 않습니다.
- 운영 환경에서는 개인정보성 입력을 암호화하기 위해 `PII_ENCRYPTION_KEY`가 반드시 필요합니다.
