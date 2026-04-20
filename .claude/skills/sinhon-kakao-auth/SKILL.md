# sinhon-kakao-auth 스킬

sinhon.life 카카오 로그인 전용 운영·디버깅·옵션 2 전환 가이드.

## 이 스킬을 사용해야 하는 트리거

- "카카오 로그인", "카카오 연동", "kakao auth", "NextAuth", "로그인 안 돼", "세션 없어"
- "Supabase 마이그레이션", "DB 세팅", "prisma migrate"
- "알림톡", "옵션 2", "전화번호 받기", "알림 기능"
- "환경변수 설정", "KAKAO_CLIENT_ID", "NEXTAUTH_SECRET"
- "카카오 검수", "개발 모드", "비즈 앱 전환"
- "탈퇴", "soft delete", "account delete"
- "admin/users", "MAU", "신규 가입자 통계"

---

## 옵션 1 아키텍처 요약

```
카카오 OAuth ──► /api/auth/[...nextauth] ──► JWT 쿠키 (httpOnly)
                       │
                  Prisma 7.x ──► Supabase Postgres
                       │
               /api/profile/sync ◄──► localStorage (sinhon-profile-v1)
```

### 핵심 파일 맵

| 파일 | 역할 |
|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth 엔드포인트 |
| `src/lib/auth.ts` | authOptions (KakaoProvider + JWT 콜백) |
| `src/types/next-auth.d.ts` | Session 타입 확장 (kakaoId, nickname 등) |
| `prisma/schema.prisma` | 5-테이블 스키마 (url 없음 — prisma.config.ts 참조) |
| `prisma.config.ts` | Prisma 7.x 연결 URL 설정 |
| `src/lib/prisma.ts` | PrismaClient 싱글톤 |
| `src/lib/profile-sync.ts` | useProfileSync() 훅 |
| `src/app/api/profile/sync/route.ts` | 양방향 sync API |
| `src/app/api/account/delete/route.ts` | 탈퇴 soft delete |
| `src/components/AuthProvider.tsx` | SessionProvider 래퍼 (client) |
| `src/components/my/AuthCard.tsx` | 로그인/비로그인 분기 카드 |
| `src/components/onboarding/KakaoCTAStep.tsx` | 온보딩 step 4 |
| `src/app/admin/users/page.tsx` | MAU·신규·탈퇴 대시보드 |
| `docs/kakao-dev-app.md` | 외부 서비스 셋업 11단계 가이드 |

---

## 실서비스 활성화 체크리스트 (사람이 직접 해야 할 것)

### 1. Kakao Developers 앱 생성
```
https://developers.kakao.com → 내 애플리케이션 → 애플리케이션 추가
앱 이름: 신혼생활
```
- REST API 키 → `KAKAO_CLIENT_ID`
- 카카오 로그인 활성화 ON
- Redirect URI 3종 등록:
  ```
  http://localhost:3000/api/auth/callback/kakao
  https://*.amplifyapp.com/api/auth/callback/kakao
  https://sinhon.life/api/auth/callback/kakao
  ```
- 동의항목: 닉네임(필수), 프로필사진(필수), 이메일(선택), 마케팅(선택)
- Client Secret 생성 → `KAKAO_CLIENT_SECRET`

### 2. Supabase 프로젝트 생성
```
https://supabase.com → 새 프로젝트 → sinhon-life / Seoul
Settings → Database → Connection string
```
- Transaction pooler (6543) → `DATABASE_URL`
- Session pooler (5432) → `DIRECT_URL`
- 그 다음 로컬에서: `npx prisma migrate dev --name init_kakao_auth`

### 3. NEXTAUTH_SECRET 생성
```bash
openssl rand -base64 32
```

### 4. 로컬 .env.local 작성
```env
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
```
`.env.local.example` 참고

### 5. Amplify 환경변수 추가
Amplify 콘솔 → sinhon-life → 호스팅 → 환경 변수:
`KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `NEXTAUTH_URL=https://sinhon.life`, `NEXTAUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`

저장 → main 브랜치 "이 버전 재배포"

### 6. 카카오 검수 신청 (전체 사용자 개방)
앱 설정 → 비즈 앱 → 서비스 유형 선택 → 카카오 로그인 검수 요청
개인정보처리방침: `https://sinhon.life/privacy`
1~2일 소요

---

## 로컬 테스트 게이트 (W1)

```bash
npm run dev
# http://localhost:3000/my → 카카오로 3초 가입하기 클릭
# 브라우저 개발자도구 → Application → Cookies → next-auth.session-token 확인
# /api/auth/session → kakaoId, nickname, profileImage 확인
```

---

## 디버깅 가이드

### 로그인 버튼 클릭 시 에러 페이지 (/my?error=...)
| 에러 코드 | 원인 | 해결 |
|---|---|---|
| `OAuthCallback` | Redirect URI 불일치 | Kakao 콘솔에서 현재 URL 확인 후 추가 |
| `Configuration` | CLIENT_ID/SECRET 환경변수 미설정 | .env.local 확인 |
| `AccessDenied` | 개발 모드에서 비허가 계정 | 본인 계정만 가능 (검수 전) |

### Prisma 연결 오류
```
Error: P1001 - Can't reach database server
```
- DATABASE_URL 환경변수 확인
- Supabase 프로젝트 활성화 확인 (비활성화 시 자동 pause)
- `?pgbouncer=true` 파라미터 포함 여부 확인

### `P1012 - datasource property url` 에러
Prisma 7 breaking change: `schema.prisma`의 `datasource` 블록에 `url`을 쓰면 에러.
`prisma.config.ts`의 `defineConfig({ datasource: { url: ... } })` 에서만 설정해야 함.

### JWT 세션에 kakaoId가 없음
`src/lib/auth.ts`의 `jwt` 콜백에서 `account?.providerAccountId` 확인.
초기 로그인 시만 account가 존재함 — 이미 있는 토큰은 token.kakaoId를 그대로 전달.

### useProfileSync가 두 번 실행됨
`sessionStorage.getItem('profile-synced')` 플래그 확인.
React StrictMode 개발 환경에서는 useEffect가 두 번 실행되어 정상 동작처럼 보일 수 있음.

---

## 옵션 2 전환 트리거 조건

다음 기준 중 하나 이상 충족 시 옵션 2 (알림톡) 스프린트 착수:

- [ ] MAU 500명 이상 (`/admin/users` 기준)
- [ ] D+30 이상 신혼부부 리마인드 케이스 10건 이상 누적
- [ ] 체크리스트 완성률 30% 미만 → 알림 효과 기대

### 옵션 2 구현 체크리스트

1. **카카오 비즈니스 채널 연동** — 알림톡 발송을 위해 필요
2. **전화번호 scope 추가** — Kakao Developers → 동의항목 → 전화번호(선택)
3. **재동의 flow** — 로그인 사용자 중 phone_number가 null인 경우 `/my` 진입 시 CTA
4. **알림톡 발송 로직** — D-day 알림, 체크리스트 미완료 알림
5. **MY 탭 "알림 설정" 토글** 활성화 (현재 "준비중" 표시)

스키마 준비 현황:
- `users.phone_number` (nullable) ✅
- `users.alimtalk_opt_in` (boolean default false) ✅
- `consents.kind` (extensible) ✅
- 개인정보처리방침 v2에 "향후 별도 동의" 문구 ✅

---

## 배포 후 모니터링

### Amplify 빌드 실패 시
```
# Amplify 콘솔 → 빌드 로그 확인
# 주요 실패 원인:
# 1. 환경변수 누락 (DATABASE_URL 미설정)
# 2. prisma generate 미실행 (amplify.yml에 추가 필요)
```

### amplify.yml prisma generate 추가
```yaml
build:
  commands:
    - npm ci
    - npx prisma generate   # ← 추가 필요
    - npm run build
```

### 관리자 접근
`/admin/users` — adminAuth 미들웨어 (ADMIN_SECRET 환경변수 기반)
Amplify에 `ADMIN_SECRET` 환경변수 추가 필요

---

## 커밋 로그
- `86edb52` (2026-04-20): feat(auth): 카카오 로그인 옵션1 W1~W4 전체 구현
  - NextAuth v4 + KakaoProvider + JWT + Prisma 7.x + Supabase 스키마
  - 파일 13종 신규, 5종 수정
