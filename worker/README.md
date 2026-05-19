# sinhon-life-api — Instagram → sinhon.life 미러링 워커

인스타 비즈/크리에이터 계정에 올라온 게시물을 10분 간격으로 폴링해
Cloudflare D1 에 저장하고, sinhon.life 의 `/archive` 라우트에 공개 API 로 제공한다.

```
   인스타 비즈 계정
        │  (Graph API)
        ▼
  Cloudflare Worker  ─── cron 10분 ───┐
        │                              │
        ▼                              │
   D1 (SQLite)  ◀──────────────────────┘
        │
        │  GET /api/media, /api/tags
        ▼
   sinhon.life /archive  (Next.js 14)
```

---

## ❶ 사전 준비 (10분)

### 1-1. Instagram 비즈/크리에이터 계정 확인
앱에서 본인 프로필 → 우상단 ☰ → 설정·개인정보 → **프로페셔널 계정 전환**
이 이미 되어 있어야 한다. (스펙 답변에서 완료됐다고 확인됨)

### 1-2. Facebook 페이지에 인스타 연결
1. https://www.facebook.com/pages/create 에서 페이지를 새로 만든다 (카테고리는 어떤 거든 무방).
2. 페이지 좌측 메뉴 → **설정 → 페이지 및 태깅 → Instagram** → 본인 인스타 계정 연결.
3. (선택) 페이지 좌측 **Meta Business Suite** 에 들어가 보면 인스타 게시물이 잡혀 있어야 정상.

### 1-3. Meta Developer 앱 생성
1. https://developers.facebook.com/ → 로그인 → 우상단 **내 앱 → 앱 만들기**.
2. 앱 유형: **비즈니스** 선택.
3. 앱 이름 = `sinhon-life-mirror` (자유), 연락 이메일 채우고 만든다.
4. 만든 앱 안에서 좌측 **앱 추가 → Instagram Graph API → 설정**.

### 1-4. 권한·테스트 사용자 추가
1. 좌측 **역할 → 역할** 에서 본인을 *테스터* 로 추가 (이미 관리자라면 패스).
2. 인스타 앱 화면에서 본인 계정을 **테스터로 초대**:
   - 인스타 모바일 앱 → 설정 → 계정 → 앱 및 웹사이트 → 테스터 초대 수락.
3. 권한은 다음 3개:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`

> 본인 계정만 다룰 거라 **앱 심사 불필요**. 개발 모드 + 테스터 권한만으로 충분.

### 1-5. Long-Lived Access Token 발급
1. https://developers.facebook.com/tools/explorer/ (Graph API Explorer) 열기.
2. 우측 **Meta App** = 방금 만든 앱 선택.
3. 우측 **User or Page** = "User Token", `Get User Access Token`.
4. 권한 추가: 위 3개를 체크 → 동의.
5. 발급된 **Short-Lived Token** 을 복사.
6. 같은 페이지 우측 검색창에서:
   ```
   GET /oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id={APP_ID}
       &client_secret={APP_SECRET}
       &fb_exchange_token={SHORT_LIVED_TOKEN}
   ```
   → 결과의 `access_token` 이 **60일짜리 Long-Lived Token**. 이걸 메모.

   > App ID·Secret 은 `앱 → 설정 → 기본` 에서 확인.

### 1-6. IG_USER_ID 확인
Graph API Explorer 검색창에:
```
GET /me/accounts?fields=instagram_business_account
```
응답 안의 `instagram_business_account.id` 가 **IG_USER_ID** (숫자 18자리 내외).

> 안 보이면 1-2 의 페이지-인스타 연결이 빠진 것. 다시 확인.

---

## ❷ Cloudflare 셋업 (10분)

### 2-1. Cloudflare 가입
1. https://dash.cloudflare.com/sign-up — 이메일·비밀번호로 가입 (무료 플랜).
2. 이메일 인증 한 번. 도메인 추가 단계는 **건너뛰기** 가능 (Worker 만 쓸 거라 도메인 불필요).

### 2-2. Wrangler 설치 + 로그인
로컬 터미널에서:
```bash
npm install -g wrangler                  # 또는 npx wrangler 로 매번 실행
wrangler login                           # 브라우저 열리고 OAuth 동의
wrangler whoami                          # ✅ 본인 이메일 보이면 OK
```

### 2-3. D1 데이터베이스 생성
```bash
cd worker
npm install                              # @cloudflare/workers-types 등 dev deps
wrangler d1 create sinhon-life-media     # ← 출력에서 database_id 복사
```
출력 예:
```
✅ Successfully created DB 'sinhon-life-media'
[[d1_databases]]
binding = "DB"
database_name = "sinhon-life-media"
database_id = "abcd1234-...."
```
이 `database_id` 를 `worker/wrangler.toml` 의 `REPLACE_WITH_D1_DATABASE_ID` 자리에 붙여넣는다.

### 2-4. 스키마 마이그레이션
```bash
npm run db:init           # 원격 D1 에 0001_init.sql 적용
```
또는 직접:
```bash
wrangler d1 execute sinhon-life-media --file migrations/0001_init.sql --remote
```

### 2-5. 시크릿 등록
```bash
npm run secret:token      # 프롬프트가 뜨면 ❶-5 에서 받은 Long-Lived Token 붙여넣기
npm run secret:userid     # 프롬프트가 뜨면 ❶-6 에서 받은 IG_USER_ID 붙여넣기

# (선택) 수동 폴링 트리거를 막을 관리자 키
wrangler secret put ADMIN_KEY
```

### 2-6. 배포
```bash
npm run deploy
```
출력 끝에 `Published sinhon-life-api (...) https://sinhon-life-api.<your-subdomain>.workers.dev` 가 나옴.
이 URL 을 메모 — sinhon.life 프론트에서 이걸 호출한다.

### 2-7. 동작 확인 (1분)
```bash
# 1) 헬스체크
curl https://sinhon-life-api.<sub>.workers.dev/api/health

# 2) 수동 폴링 (ADMIN_KEY 등록한 경우)
curl "https://sinhon-life-api.<sub>.workers.dev/_admin/poll?key=<ADMIN_KEY>"

# 3) 미디어 목록
curl https://sinhon-life-api.<sub>.workers.dev/api/media | jq .

# 4) 태그 목록
curl https://sinhon-life-api.<sub>.workers.dev/api/tags | jq .

# 5) Worker 로그 실시간
wrangler tail
```

---

## ❸ sinhon.life 프론트엔드 연결

### 3-1. 환경 변수
sinhon-life 프로젝트(Next.js)의 `.env.local` 또는 Amplify 환경변수에 추가:
```
NEXT_PUBLIC_INSTAGRAM_API_URL=https://sinhon-life-api.<sub>.workers.dev
```

### 3-2. 라우트
- `/archive`            — 인스타 미러 리스트 (해시태그 필터링 가능)
- `/archive/[id]`       — 단건 상세 (영상 inline 재생)

코드는 `src/app/archive/` 에 있음. 디자인 토큰(coral/mint/honey/navy) + 기존
`ShortsCard`·`Card`·`Skeleton`·`EmptyState` 컴포넌트를 그대로 재사용한다.

---

## ❹ 운영

### 토큰 만료 알림
`/api/health` 응답의 `sync.token_expires_at` 가 7일 이내로 좁혀지면 알림 필요.
대시보드 추가하기 전엔 단순히 매주 일요일 cron 으로 자동 갱신되니, `/api/health`
에서 `token_expires_at` 가 미래(보통 +60일) 로 갱신되는지만 가끔 확인.

### 새 게시물이 안 보일 때
1. `wrangler tail` 로 cron 로그 확인. 10분 안에 `IG /media ...` 호출이 보여야 정상.
2. `/_admin/poll?key=...` 수동 폴링으로 즉시 트리거 가능.
3. `IG /media 400 ... access_token` 이면 토큰이 만료된 것 — `secret put` 으로 갱신.

### 비용
Cloudflare 무료 플랜:
- Workers: 10만 요청/일, 1만 cron 호출/일 — 둘 다 여유.
- D1: 5GB·25만 row read/일·5만 write/일 — 인스타 폴링 한 번에 25개씩 보내도 일 14,400 row 미만.

---

## 부록 A. 로컬 개발

```bash
cd worker
npm install
wrangler d1 create sinhon-life-media-dev   # dev 환경용 D1
# wrangler.toml 의 [env.dev] 섹션 database_id 채우기
npm run db:init:dev
wrangler dev --env dev                     # 로컬 http://localhost:8787
# 토큰을 미설정 상태로 띄우면 폴링은 실패하지만 /api/* 는 빈 응답으로 정상 동작
```

## 부록 B. 사용된 API

- `GET /me/media` — 본인 미디어 (caption, media_url, thumbnail_url, permalink, timestamp)
- `GET /refresh_access_token?grant_type=ig_refresh_token` — Long-Lived 토큰 갱신

레퍼런스:
- https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/media
- https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/refresh_access_token
