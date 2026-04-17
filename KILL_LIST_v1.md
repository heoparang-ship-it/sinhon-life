# sinhon.life Kill List v1.0

> 성장 이전에 반드시 제거해야 할 품질 결함 목록. 1개 항목 = 3줄 (문제·근거·처치).
> 검증일: 2026-04-18. Sprint 1에서 2개 제거(✅), 5개 잔여.

---

## 1. ✅ 대출 콘텐츠 잔재 (2026-04-18 제거 완료)
- **문제**: /policy/jeonse-loan-guide, JeonseLoanCalculator, "버팀목/디딤돌/신생아특례대출" 언급이 곳곳에 남아 Meta 광고 Regulated 심사 탈락·브랜드 부정 프레이밍 유발
- **근거**: feedback_sinhon_no_loans.md, 2026-03-24 Meta 광고 리젝 로그
- **처치**: 정책 오브젝트·계산기 컴포넌트·FAQ·메타·시스템 프롬프트·가드 문구까지 전수 스캔 후 제거. 대체 앵커(청약·공공임대·특공)로 리라이트. Grep `대출|loan|jeonse` → 0

## 2. ✅ "15+ 혜택" 하드코딩 과장 (2026-04-18 제거 완료)
- **문제**: 홈 스탯 박스 "15+ / 1.1% / 200만" 숫자가 실제 POLICIES 개수와 무관하게 고정 → 거짓말
- **근거**: PersonalizedHome.tsx lines 184-211, 2026-04-15 내부 QA 지적
- **처치**: `POLICIES.length` · housing/baby 카테고리 count로 런타임 계산, "최저 대출금리" 라벨은 "주거·청약"으로 교체

## 3. /admin 노출 위험
- **문제**: 초기에는 /admin 경로가 누구에게나 열려 있어 가입자 DB·지식 관리·업체 관리가 노출
- **근거**: 본 스프린트 이전 middleware는 /admin 체크 없음
- **처치**: 2026-04-18 middleware + /admin/login + API route + ADMIN_PASSWORD 게이트 구현 (배포 검증 대기 중)

## 4. 에러 감지 부재
- **문제**: 프로덕션 500·client crash가 발생해도 로그가 CloudWatch까지만, 추적/트리아지 어려움
- **근거**: 2026-04-01 KakaoTalk 제보 "이 페이지 안 열려요" 5건 이상, 원인 미상
- **처치**: 2026-04-18 @sentry/nextjs 3 config + instrumentation 훅 + /api/test-sentry. DSN 주입 → 테스트 콜 → Sentry 대시보드 수신 확인은 배포 직후 검증

## 5. CI 부재 — 빌드가 깨진 채 main 진입 가능
- **문제**: 로컬 빌드만 믿고 푸시, Amplify 실패 → 배포 지연
- **근거**: 2026-04-12 TS 에러로 Amplify 3회 실패
- **처치**: 2026-04-18 GitHub Actions ci.yml (typecheck/lint/build) 추가

## 6. OG 이미지 1:1 아이콘
- **문제**: SNS 공유 시 썸네일이 icon-1024.png(정사각)로 깨짐
- **근거**: 카톡·X 실측, 2026-04-13 자체 QA
- **처치**: og-default.png 1200×630 제작 → layout.tsx openGraph.images 교체. Sprint 3 목표

## 7. 시크릿 리포 노출 점검 미실시
- **문제**: .env.local이 실수로 커밋되었을 가능성, API 키 노출 시 비용 리스크
- **근거**: 마지막 전수 점검 시점 불명
- **처치**: gitleaks / `git log --all -p | grep -E '(ANTHROPIC|PINECONE|SENTRY).*=.*[A-Za-z0-9]{20,}'` 스캔 + .gitignore 검토. Sprint 2 목표
