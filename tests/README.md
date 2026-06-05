# Tests

통합 테스트와 E2E 테스트를 둡니다.

- API 흐름 테스트: `apps/api/src/*.e2e.test.ts`
- Playwright 핵심 흐름: `tests/e2e/core-flow.spec.ts`

Playwright는 가입, 초대, 온보딩, 시나리오, 정책 확인, 비교방, 공동 승인, 상담 신청, 관리자 리드 확인을 API로 검증하고, 모바일 viewport, 권한 없는 접근, 새로고침 후 토큰 유지 상태를 브라우저에서 확인합니다.

```bash
DATABASE_URL=postgresql://sinhon_os:sinhon_os@localhost:5433/sinhon_os?schema=public pnpm db:push
DATABASE_URL=postgresql://sinhon_os:sinhon_os@localhost:5433/sinhon_os?schema=public pnpm db:seed
DATABASE_URL=postgresql://sinhon_os:sinhon_os@localhost:5433/sinhon_os?schema=public pnpm test:e2e
```
