# 신혼OS Deployment Report

작성일: 2026-06-05

## 배포 결과

- GitHub repo: `https://github.com/heoparang-ship-it/sinhon-life`
- Vercel 프로젝트: `sinhon-life`
- Production URL: `https://sinhon.life`
- Canonical URL: `https://www.sinhon.life`
- Production deployment: `https://sinhon-life-hdz6k6moi-heoparang-2238s-projects.vercel.app`
- Commit: `29e5a19 Replace sinhon.life with Sinhon OS MVP`
- 상태: Vercel `READY`, `sinhon.life` -> `www.sinhon.life` redirect, public HTTP 200 확인

## 배포를 위해 추가한 설정

- 루트 `vercel.json`에서 Vercel이 모노레포 루트에서 `pnpm install --frozen-lockfile`을 실행하고 `@sinhon-os/web`만 빌드하도록 설정했다.
- 루트 `package.json`에 Next.js 감지용 `next`, `react`, `react-dom` dev dependency를 추가했다.
- 기존 `heoparang-ship-it/sinhon-life` main 위에 신혼OS 모노레포 전환 커밋을 push했다.
- Vercel `sinhon-life` 프로젝트에 production 배포해 기존 `sinhon.life`, `www.sinhon.life` alias를 그대로 사용했다.

## 현재 한계

- 현재 production 배포는 사용자 웹 프론트엔드 배포다.
- API는 아직 별도 공개 호스트와 운영 PostgreSQL이 연결되지 않았다.
- 운영 API 배포 전에는 `DATABASE_URL`, `AUTH_TOKEN_SECRET`, `PII_ENCRYPTION_KEY`, `CORS_ALLOWED_ORIGINS`, `ADMIN_ALLOWED_ORIGINS`를 실제 값으로 설정해야 한다.
- API 공개 URL이 생기면 웹 production의 `NEXT_PUBLIC_API_BASE_URL`을 해당 URL의 `/api/v1`로 재배포해야 한다.

## 확인한 게이트

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- `/ready` DB 연결 확인
- CORS 허용/차단 확인
- E2E 상담 신청 저장값 `aesgcm:v1` 암호화 확인
- `https://sinhon.life`에서 `신혼OS`, `파트너 상품` 응답 확인
