# 신혼생활

신혼생활은 예비 신혼부부와 혼인 초기 부부가 필요한 정책 정보를 빠르게 확인하고, 공식 인스타 피드와 릴스를 한 곳에서 볼 수 있게 돕는 미니멀 서비스입니다.

## 현재 단계

v1 공개 웹은 정책 톡과 인스타 아카이브 2개 기능만 노출합니다. 정책 톡은 로그인 없는 룰베이스 선택 흐름으로 동작하고, 인스타 아카이브는 신혼생활 공식 인스타그램 피드와 릴스를 모아 보여줍니다. 공개 콘텐츠(`articles`)는 SEO 자산으로 파일과 라우트를 보존하되 홈 진입점에서는 숨깁니다.

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

Vercel production build는 `pnpm db:generate` 후 `VERCEL_ENV=production`일 때만 `scripts/vercel-production-db-prepare.mjs`로 `DIRECT_URL`을 사용해 호환 스키마 기준점 처리, 필요 시 체크인된 migration SQL bootstrap, `migrate deploy`, seed를 실행합니다. 이 과정은 기존 public schema의 다른 테이블을 삭제하거나 강제 동기화하지 않습니다.

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
- `신혼생활_코덱스_명령세트_v1.md`

## 주의

- 주민등록번호는 수집하지 않습니다.
- 정책 선정, 대출 가능, 금융 심사 결과처럼 보이는 표현은 사용하지 않습니다.
- 정책 룰은 `PolicyRuleVersion`으로 버전 관리하며 결과는 가능성 안내로만 표시합니다.
- 파트너 가격은 `OfferPriceVersion`으로 버전 관리하며, 실제 결제나 계약 확정 기능은 만들지 않습니다.
- 운영 환경에서는 개인정보성 입력을 암호화하기 위해 `PII_ENCRYPTION_KEY`가 반드시 필요합니다.
