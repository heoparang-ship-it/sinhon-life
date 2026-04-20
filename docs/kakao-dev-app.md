# Kakao Developers 앱 셋업 가이드

> W1 게이트 산출물: 로컬에서 카카오 계정으로 로그인 → 세션 쿠키 발급 → kakao_id·email 확인
> 작성: 2026-04-20

## 1단계: Kakao Developers 앱 생성

1. https://developers.kakao.com → 로그인
2. **내 애플리케이션** → **애플리케이션 추가**
   - 앱 이름: `신혼생활`
   - 사업자명: 개인
3. 생성된 앱 클릭 → **앱 키** 메뉴에서 확인:
   - `REST API 키` → `KAKAO_CLIENT_ID`
   - `JavaScript 키` → (웹 SDK용, 옵션 2에서 사용)

## 2단계: 카카오 로그인 활성화

1. 왼쪽 메뉴 **카카오 로그인** → **활성화 설정** ON
2. **Redirect URI** 등록 (3종 모두 추가):
   ```
   http://localhost:3000/api/auth/callback/kakao
   https://*.amplifyapp.com/api/auth/callback/kakao
   https://sinhon.life/api/auth/callback/kakao
   ```

## 3단계: 동의항목 설정

1. 왼쪽 메뉴 **카카오 로그인** → **동의항목**
2. 아래 설정 적용:

| 항목 | 설정 | 비고 |
|---|---|---|
| 닉네임 | 필수 동의 | 프로필 표시용 |
| 프로필 사진 | 필수 동의 | AuthCard 아바타용 |
| 카카오계정(이메일) | 선택 동의 | 마케팅 동의와 분리 |
| 마케팅 정보 수신 동의 | 선택 동의 | 현재는 토글만, 발송은 옵션 2 |

> ⚠️ **수집하지 않을 항목**: 성별, 연령대, 생일, 전화번호, 친구 목록
> 카카오 검수에서 "과수집" 지적의 대표 원인.

## 4단계: 클라이언트 시크릿 발급

1. 왼쪽 메뉴 **카카오 로그인** → **보안**
2. **Client Secret 코드** 생성 → 복사
   - → `KAKAO_CLIENT_SECRET`
3. **활성화 상태**: 사용함으로 변경

## 5단계: NEXTAUTH_SECRET 생성

```bash
openssl rand -base64 32
```

출력값 → `NEXTAUTH_SECRET`

## 6단계: Supabase 프로젝트 생성

1. https://supabase.com → 새 프로젝트 생성
   - 이름: `sinhon-life`
   - 리전: `Northeast Asia (Seoul)` 또는 `Singapore`
   - 비밀번호: 강한 비밀번호 (저장해둘 것)
2. 프로젝트 생성 후 **Settings → Database → Connection string**:
   - **Transaction pooler** (포트 6543): → `DATABASE_URL`
   - **Session pooler 또는 Direct** (포트 5432): → `DIRECT_URL`
3. 연결 문자열 형식:
   ```
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
   ```

## 7단계: 로컬 .env.local 작성

```bash
# .env.local.example을 복사해서 시작
cp .env.local.example .env.local
```

```env
KAKAO_CLIENT_ID=your_rest_api_key
KAKAO_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_openssl_output
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
```

## 8단계: DB 마이그레이션

```bash
# prisma 마이그레이션 실행 (Supabase에 테이블 생성)
npx prisma migrate dev --name init_kakao_auth

# 또는 직접 push (개발 초기)
npx prisma db push
```

> Supabase 대시보드 → Table Editor에서 5개 테이블(users, profiles, checklist_items, budget_txns, consents) 생성 확인

## 9단계: 로컬 로그인 테스트

```bash
npm run dev
```

1. `http://localhost:3000/my` 접속
2. "카카오로 3초 가입하기" 버튼 클릭
3. 카카오 계정으로 로그인
4. 브라우저 개발자도구 → Application → Cookies에서 `next-auth.session-token` 확인
5. `/api/auth/session` 접속 → JSON에 `kakaoId`, `nickname`, `profileImage` 확인

**게이트 통과 조건**: 로컬에서 kakao.com 계정으로 로그인 → 세션 쿠키 발급 → JSON에 kakao_id·email 확인 ✅

## 10단계: Amplify 환경변수 설정

Amplify 콘솔 → sinhon-life 앱 → 왼쪽 메뉴 **호스팅 → 환경 변수** → 변수 관리:

| 키 | 값 |
|---|---|
| `KAKAO_CLIENT_ID` | REST API 키 |
| `KAKAO_CLIENT_SECRET` | 클라이언트 시크릿 |
| `NEXTAUTH_URL` | `https://sinhon.life` |
| `NEXTAUTH_SECRET` | openssl 출력값 |
| `DATABASE_URL` | Supabase pooler URL |
| `DIRECT_URL` | Supabase direct URL |

저장 후 → main 브랜치 **"이 버전 재배포"** 클릭

## 11단계: 카카오 검수 신청 (프로덕션 전환)

카카오 개발자 콘솔에서 기본적으로 **개발 모드** (본인만 로그인 가능)로 시작됨.

실 서비스 공개를 위해:
1. 왼쪽 메뉴 **앱 설정 → 비즈 앱** → 서비스 유형 선택
2. **카카오 로그인** → 검수 요청
   - 서비스 설명: 신혼부부 정책·혜택 AI 상담 플랫폼
   - 개인정보처리방침 URL: `https://sinhon.life/privacy`
   - 서비스 스크린샷 3장 이상
3. 검수 완료 시 (1~2일) → 전체 사용자 로그인 가능

---

## 참고: Redirect URI Amplify *.amplifyapp.com

Amplify 자동 생성 URL은 앱마다 다르므로, Amplify 콘솔에서 실제 URL을 확인해 Kakao Developers에 추가해야 함:
```
https://main.[AMPLIFY_APP_ID].amplifyapp.com/api/auth/callback/kakao
```
