# 신혼생활 Next.js 전환 가이드

생성일: 2026-05-21

## 현재 상태

- **브랜치**: `feat/next-migration`
- **스택**: Next.js 16.2.6 + React 19 + TypeScript 5 + Tailwind 4 + Supabase
- **라우트 9개**: `/` `/archive` `/archive/[id]` `/auth/callback` `/budget` `/checklist` `/login` `/my` `/_not-found`

## 로컬 실행

```bash
cd "Projects/신혼생활/웹/04_코드/sinhon-life"
npm install   # 한 번만
npm run dev   # → http://localhost:3000
```

가계부·체크리스트는 환경변수 없어도 localStorage로 작동합니다. 로그인만 Supabase 환경변수 필요.

## 단계 5: 백엔드 (Supabase) 셋업 — 사장님이 직접

### 5-1. Supabase 프로젝트 생성

1. https://supabase.com 가입
2. **New Project** 클릭
3. 입력값:
   - Name: `sinhon-life`
   - Database Password: 임의 강력한 비밀번호 (저장 필수)
   - Region: `Northeast Asia (Seoul)`
   - Plan: **Free**
4. 약 2분 대기 후 프로젝트 생성 완료

### 5-2. DB 스키마 적용

1. Supabase 대시보드 → 좌측 **SQL Editor**
2. **New query**
3. `src/lib/supabase/schema.sql` 파일 내용 전체 복사·붙여넣기
4. **Run** 클릭
5. "Success. No rows returned" 확인

### 5-3. 카카오 OAuth 등록

1. https://developers.kakao.com 로그인 → **내 애플리케이션** → **애플리케이션 추가하기**
2. 앱 이름 `신혼생활` 입력 → **저장**
3. 생성된 앱 → **앱 설정** → **플랫폼** → **Web 플랫폼 등록**
   - 사이트 도메인: `https://sinhon.life` 와 `http://localhost:3000` 둘 다 추가
4. **제품 설정** → **카카오 로그인** 활성화
5. **OpenID Connect 활성화** 켜기
6. **Redirect URI** 추가:
   - `[Supabase URL]/auth/v1/callback` (Supabase URL은 5-1에서 받은 값)
7. **동의 항목** 설정:
   - 닉네임: 필수 동의
   - 카카오계정(이메일): 선택 동의 권장

### 5-4. Supabase에 카카오 Provider 연결

1. Supabase 대시보드 → **Authentication** → **Providers** → **Kakao**
2. **Enable Kakao** 켜기
3. 카카오 앱의 **REST API 키**를 **Kakao OAuth Client ID**에 입력
4. 카카오 앱 → **보안** → **Client Secret** 생성 후 **Kakao OAuth Client Secret**에 입력
5. **Save**

### 5-5. 환경변수 입력

```bash
cd "Projects/신혼생활/웹/04_코드/sinhon-life"
cp .env.local.example .env.local
```

`.env.local` 파일을 열어서:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 대시보드 → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 같은 페이지의 **anon public** 키
- `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` (로컬) 또는 `https://sinhon.life` (배포)

### 5-6. 로컬 로그인 테스트

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/login` → 카카오 버튼 클릭 → 로그인 → `/my`로 돌아옴 → 성공.

## 단계 6: Vercel 배포 — 사장님이 직접

### 6-1. Vercel 가입 + GitHub 연결

1. https://vercel.com 에서 **Continue with GitHub** 가입
2. **Add New Project**
3. `heoparang-ship-it/sinhon-life` 저장소 선택 → **Import**

### 6-2. 빌드 설정

- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: 비워두기 (기본값)
- **Build Command**: `npm run build`
- **Branch**: `feat/next-migration` (현재) 또는 머지 후 `main`

### 6-3. 환경변수 등록

**Environment Variables** 섹션에서 5-5와 동일한 3개 변수를 등록:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (값은 `https://sinhon.life`)

### 6-4. 첫 배포

**Deploy** 클릭 → 2분 대기 → `https://sinhon-life-xxxx.vercel.app` 임시 URL 발급.
이 URL에서 모든 페이지 작동 확인.

### 6-5. sinhon.life 도메인 연결

1. Vercel 프로젝트 → **Settings** → **Domains** → `sinhon.life` 입력 → **Add**
2. Vercel이 알려주는 DNS 레코드 메모 (보통 A 레코드 76.76.21.21 또는 CNAME `cname.vercel-dns.com`)
3. **사장님 도메인 등록기관**(가비아·카페24·후이즈 등) 관리자 로그인
4. DNS 설정에서:
   - 기존 GitHub Pages용 A 레코드(`185.199.108.153` 등) **삭제**
   - Vercel이 알려준 새 레코드 **추가**
5. 약 5분~수 시간 후 `sinhon.life` 가 Next.js 앱으로 연결됨

### 6-6. 카카오·Supabase 콜백 URL 업데이트

배포 후 `https://sinhon.life/auth/callback` 도 카카오·Supabase 양쪽 Redirect URLs에 추가.

## 단계 7: 머지 + index.html 정리 (선택)

전부 잘 작동하면:

```bash
git checkout main
git merge feat/next-migration
git push
```

그 후 `index.html`은 삭제하거나 `legacy/` 폴더로 옮겨 보관.

## 마이그레이션 후 남은 작업

- 가계부·체크리스트의 localStorage → Supabase 동기화 (현재 코드는 localStorage만 사용)
- 검색 페이지(`/search`) — 현재 BottomNav에 없음, 필요 시 추가
- 상견례·답례품 등 카테고리 세부 데이터 보강
- /terms /privacy 페이지 (로그인 화면에서 링크됨)

## 트러블슈팅

**`npm run dev` 에서 hydration 에러**: 가계부·체크리스트는 `mounted` 가드를 두어 SSR/CSR 충돌을 회피 중. 다른 페이지에서 발생 시 동일 패턴 적용.

**카카오 로그인이 안 됨**:
- Supabase 대시보드 → Authentication → URL Configuration → **Redirect URLs**에 `http://localhost:3000/auth/callback`, `https://sinhon.life/auth/callback` 둘 다 등록 확인
- 카카오 개발자센터 → Redirect URI에 `[Supabase URL]/auth/v1/callback` 등록 확인

**Vercel 빌드 실패**:
- `worker/`, `archive/`(정적), `test/`, `public/`는 `tsconfig.json`의 exclude에 있음. 새로 디렉토리를 만들면 필요에 따라 추가.
