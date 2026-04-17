# sinhon.life 퀄리티 스코어카드 v1.0

> **목표: 16/20 = 80%.** 체크된 항목이 16개 이상이 되면 "성장 이전 관문"을 통과한 것으로 간주한다.
> 검증일: 2026-04-18 (Sprint 1 종료 시점 기준)
> 점검 주기: 매 Sprint 종료일마다 전체 체크 + 주간 개발 완료 시 관련 항목만 스폿 체크.

---

## A. 제품 정합성 (5)

- [x] **A1. 금지 콘텐츠 제로 — 대출·금융상품 언급 완전 제거**
  - Grep `대출|loan|jeonse` on `/src` → 0 matches (2026-04-18 확인)
- [ ] **A2. 통계·수치 과장 제로**
  - "15+", "200+", "수십 개" 같은 하드코딩 숫자를 코드베이스에서 grep → 0 건 + 화면 스탯은 런타임 집계값 사용
- [ ] **A3. 정책 요약·본문의 숫자·마감일 최신성**
  - POLICIES의 각 항목 `updatedAt` ≤ 90일 이내 or 문구에 "2026 기준" 등 명시
- [ ] **A4. 모든 외부 링크 200 OK 확인**
  - 정책 externalLinks, vendors.links, BRAND.kakaoLink/instagram 자동/수동 ping
- [ ] **A5. 온보딩 3단계 완주율 ≥ 70%**
  - 실측은 Sprint 3에서 분석 붙인 뒤 가능. 그 전엔 "장애물 없음(UX 리뷰 완료)"으로 대체

## B. 안정성·보안 (5)

- [x] **B1. /admin 인증 게이트 동작**
  - middleware → /admin/login 리다이렉트 + 쿠키 기반 세션 + ADMIN_PASSWORD env 필수 (2026-04-18 구현)
- [x] **B2. 에러 모니터링 연결**
  - Sentry 3종 config + instrumentation.ts + test-sentry 라우트 (2026-04-18 구현. DSN 주입은 배포 후 확인)
- [x] **B3. CI 파이프라인 — typecheck/lint/build 그린**
  - `.github/workflows/ci.yml` main/PR 대상 (2026-04-18 추가)
- [ ] **B4. 시크릿 리포 노출 제로**
  - `.env.local` / `.env` / API key grep → 커밋 히스토리 포함 0 건
- [ ] **B5. 보안 헤더 세트 확인**
  - middleware의 X-Content-Type-Options, X-Frame-Options, Referrer-Policy 프로덕션 응답에서 확인

## C. SEO·발견성 (5)

- [ ] **C1. 메타 description/keywords 대출 키워드 제거 반영**
  - 홈/정책 상세의 meta generator 출력에 "전세대출" 등 미포함
- [ ] **C2. OG 이미지 1200×630 고유 이미지**
  - /icon-1024.png(1:1) 대신 /og-default.png(1200×630) 생성 + layout.tsx 반영
- [ ] **C3. Naver Search Advisor 사이트맵 등록**
  - sinhon.life/sitemap.xml 제출 및 인덱싱 대기 로그 기록
- [ ] **C4. FAQ/Article/Breadcrumb JSON-LD 구조화 데이터 유효성**
  - Google Rich Results Test로 3종 유형 전부 PASS
- [ ] **C5. 카테고리 허브 페이지 텍스트 노출 ≥ 300자**
  - /category/{id}, /explore 페이지에 봇이 읽을 본문 충분

## D. 제품 완성도 UX (5)

- [ ] **D1. 모바일(375px) 깨짐 0건**
  - 홈/정책 상세/Explore/My/Onboarding/Admin 주요 7페이지 스크롤 점검
- [ ] **D2. 첫 로딩 LCP < 2.5초**
  - Lighthouse 모바일 모드 실측, 프로덕션 URL 기준
- [ ] **D3. 빈 상태·에러 상태 복구 가능**
  - 정책 없음/저장 없음/네트워크 에러에서 CTA 이탈 없음
- [ ] **D4. 접근성 스모크 — 대비·alt·포커스**
  - axe DevTools Critical/Serious 0건
- [ ] **D5. 공유 링크 미리보기 OG/Twitter 카드 정상**
  - 카톡·슬랙·X에 실제 붙여서 사진+제목+설명 모두 뜨는지 확인

---

## 현재 점수
**5 / 20 = 25%**
(A1 · B1 · B2 · B3 + A2는 부분적으로 코드레벨 완료지만 grep 최종 확인 전)

## 다음 Sprint에서 채울 목표
- Sprint 2: A2, A4, B4, B5, C1 (5개) → 10/20
- Sprint 3: C2, C3, C4, D2, D4 (5개) → 15/20
- Sprint 4: A3, A5, C5, D1, D3, D5 → 20/20 (스트레치 목표)

**80% 관문(16/20)**은 Sprint 3 완료 시점에서 도달 예정.
