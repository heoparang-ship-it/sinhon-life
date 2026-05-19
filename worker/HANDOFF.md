# 🤝 사용자 작업 핸드오프 — 2026-05-19

이 파일은 "Claude 가 코드는 다 짰으니 사용자가 직접 해야 할 단계만" 모아둔 체크리스트.
순서대로 해주시면 30분 안에 sinhon.life 에 인스타 미러링이 라이브로 붙습니다.

자세한 내용·스크린샷 안내는 `worker/README.md` 의 같은 번호 섹션을 참조.

---

## ⬜ 1. Facebook 페이지 + 인스타 연결 (5분)
- [ ] https://www.facebook.com/pages/create — 페이지 생성 (카테고리 자유)
- [ ] 페이지 → 설정 → 페이지 및 태깅 → **Instagram → 본인 계정 연결**

> README ❶-2

## ⬜ 2. Meta Developer 앱 생성 + 토큰 발급 (10분)
- [ ] https://developers.facebook.com/ → 내 앱 → **앱 만들기 → 비즈니스**
- [ ] 앱 안에서 **Instagram Graph API → 설정**
- [ ] **테스터 추가** (인스타 모바일 앱에서 초대 수락)
- [ ] Graph API Explorer 에서 Short-Lived Token → Long-Lived 변환

발급 후 메모해야 하는 값:
```
LONG_LIVED_TOKEN = (60일짜리 access_token)
IG_USER_ID       = /me/accounts → instagram_business_account.id
```
> README ❶-3 ~ ❶-6

## ⬜ 3. Cloudflare 가입 + Wrangler 로그인 (5분)
- [ ] https://dash.cloudflare.com/sign-up — 가입, 도메인 추가는 건너뛰기
- [ ] 터미널:
  ```bash
  npm install -g wrangler
  wrangler login
  wrangler whoami     # 본인 이메일 보이면 OK
  ```
> README ❷-1, ❷-2

## ⬜ 4. D1 만들고 wrangler.toml 채우기 (3분)
```bash
cd worker
npm install
wrangler d1 create sinhon-life-media
```
출력의 `database_id = "..."` 를 `worker/wrangler.toml` 의 `REPLACE_WITH_D1_DATABASE_ID` 자리에 붙여넣기.

그 다음 마이그레이션:
```bash
npm run db:init
```
> README ❷-3, ❷-4

## ⬜ 5. 시크릿 등록 (1분)
```bash
npm run secret:token       # 2번에서 받은 LONG_LIVED_TOKEN 붙여넣기
npm run secret:userid      # 2번에서 받은 IG_USER_ID 붙여넣기
```
> README ❷-5

## ⬜ 6. Worker 배포 (1분)
```bash
npm run deploy
```
출력의 `https://sinhon-life-api.<sub>.workers.dev` URL 을 저한테 알려주세요.
다음 검증·환경변수 세팅은 제가 이어서 도와드립니다.

> README ❷-6

## ⬜ 7. (저랑 같이) sinhon.life 환경변수 + 라이브 검증
사용자가 6번 마치고 Worker URL 만 알려주시면, 나머지(아래)는 제가 진행:
- `.env.local` / Amplify 콘솔에 `NEXT_PUBLIC_INSTAGRAM_API_URL` 등록
- `/api/health`·`/api/media` 호출해서 D1에 row 있는지 확인
- 인스타에 테스트 게시물 1개 올린 뒤 10분 내 sinhon.life/archive 에 뜨는지 확인
- 토큰 자동 갱신 cron 동작 여부 점검

---

## 🚧 막힐 만한 곳 미리 정리

| 증상 | 원인 | 해결 |
|---|---|---|
| `/me/accounts` 에 `instagram_business_account` 없음 | FB 페이지-인스타 연결 빠짐 | 1번 다시 확인 |
| 토큰 변환 시 `OAuthException` | App Secret 틀림 | 앱 → 설정 → 기본 에서 다시 복사 |
| `wrangler login` 이 브라우저 안 열림 | 헤드리스 환경 | `wrangler login --browser=false` 후 URL 수동 |
| `wrangler d1 create` 가 `permission denied` | Cloudflare 무료 플랜 D1 베타 동의 필요 | 대시보드 → Workers & Pages → D1 한 번 열기 |
| 배포 후 `/api/media` 가 빈 배열 | cron 아직 안 돌았음 | 10분 기다리거나 `/_admin/poll?key=...` 수동 |

---

이번 세션에서 Claude 가 짠 코드 (커밋 전):
- `worker/` (Wrangler + D1 + Cron) — 새 디렉터리
- `src/app/archive/` (Next.js 라우트) — 새 디렉터리
- `src/lib/instagram/` (프론트 클라이언트) — 새 디렉터리
- `tsconfig.json` (worker 제외)
- `.env.example` (`NEXT_PUBLIC_INSTAGRAM_API_URL` 추가)
