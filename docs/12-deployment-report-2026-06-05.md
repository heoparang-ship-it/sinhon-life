# 신혼OS Deployment Report

작성일: 2026-06-05

## 배포 결과

- GitHub repo: `https://github.com/heoparang-ship-it/sinhon-life`
- Vercel 프로젝트: `sinhon-life`
- Production URL: `https://sinhon.life`
- Canonical URL: `https://www.sinhon.life`
- API URL: `https://www.sinhon.life/api/v1`
- 상태 확인 기준: Vercel production alias가 `READY` 배포를 가리키고, `sinhon.life` -> `www.sinhon.life` redirect, public HTTP 200, `/api/v1/ready` 2xx를 확인한다.

## 배포를 위해 추가한 설정

- 루트 `vercel.json`에서 Vercel이 모노레포 루트에서 `pnpm install --frozen-lockfile`을 실행하고 Prisma Client 생성, production DB 준비, `@sinhon-os/api` build, `@sinhon-os/web` build를 순서대로 실행하도록 설정했다.
- 루트 `package.json`에 Next.js 감지용 `next`, `react`, `react-dom` dev dependency를 추가했다.
- 기존 `heoparang-ship-it/sinhon-life` main 위에 신혼OS 모노레포 전환 커밋을 push했다.
- Vercel `sinhon-life` 프로젝트에 production 배포해 기존 `sinhon.life`, `www.sinhon.life` alias를 그대로 사용했다.
- 루트 `api/index.js`가 빌드된 Express API 앱을 default export하고, `/api/v1/:path*` 요청을 해당 함수로 rewrite한다.
- production build에서는 `scripts/vercel-production-db-prepare.mjs`가 `VERCEL_ENV=production`일 때만 DB migration과 seed를 실행한다.
- 기존 공개 경로 `/budget`, `/ai`, `/archive`, `/support`, `/cheongmo`는 새 화면으로 임시 redirect한다.

## 현재 한계

- API는 같은 Vercel 프로젝트의 Node.js Function으로 제공된다.
- 운영 환경변수는 Vercel production에 설정되어 있어야 한다: `DATABASE_URL`, `AUTH_TOKEN_SECRET`, `PII_ENCRYPTION_KEY`, `CORS_ALLOWED_ORIGINS`, `ADMIN_ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WEB_BASE_URL`.
- preview 환경은 production과 별도로 CORS/API URL을 조정해야 한다.
- 운영 DB seed에는 샘플 정책, 샘플 상품, 샘플 콘텐츠가 포함된다. 실제 출시 전 운영 데이터로 교체해야 한다.

## 확인한 게이트

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- CI와 동일한 DB 조건의 `pnpm --filter @sinhon-os/api test`
- `vercel build --yes`
- `/ready` DB 연결 확인
- `/api/v1/ready` DB 연결 확인
- CORS 허용/차단 확인
- E2E 상담 신청 저장값 `aesgcm:v1` 암호화 확인
- `https://sinhon.life`에서 `신혼OS`, `파트너 상품` 응답 확인
- `https://www.sinhon.life/signup`에서 API 요청이 `localhost`가 아니라 `/api/v1` 또는 `https://www.sinhon.life/api/v1`로 나가는지 확인
