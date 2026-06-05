# 신혼OS Production Readiness

작성일: 2026-06-05

## 공개 배포 전 게이트

- CI에서 `format`, `lint`, `typecheck`, `test`, `build`, `test:e2e`가 모두 통과해야 한다.
- E2E 기준 URL은 `http://localhost:3002`를 사용한다.
- 운영 API는 `AUTH_TOKEN_SECRET`, `PII_ENCRYPTION_KEY`, `CORS_ALLOWED_ORIGINS`, `ADMIN_ALLOWED_ORIGINS`가 없으면 시작하지 않는다.
- production Vercel 배포는 웹과 API를 같은 프로젝트에서 제공하며 API는 `/api/v1`로 rewrite된다.
- production Vercel build는 `pnpm db:generate` 후 `VERCEL_ENV=production`에서만 DB migration과 seed를 실행한다.
- 실결제, 예약금, 환불, 파트너 정산은 법무·보안·운영 승인 전까지 배포 범위에서 제외한다.

## 최소 SLI

- API availability: `/ready` 2xx 비율 99% 이상.
- API latency: 주요 API p95 1초 이하.
- E2E reliability: `core newlywed journey` 일일 성공.
- Lead success: 승인된 비교방의 상담 신청 성공률 95% 이상.
- Privacy guard: 분석 이벤트 PII 차단 테스트 통과.

## 배포 후 7일 점검

- 매일 가입, 초대, 온보딩 완료, 비교방 생성, 상담 신청 이벤트 수를 확인한다.
- 매일 `/ready` 실패, API 5xx, DB 연결 오류를 확인한다.
- 매일 `https://www.sinhon.life/api/v1/ready`와 가입 API의 2xx 응답을 확인한다.
- 매일 리드 상태 지연 건을 운영자가 확인한다.
- 개인정보 payload와 리드 접근 로그를 표본 점검한다.
