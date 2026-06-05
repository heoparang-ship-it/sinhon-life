# 신혼생활 MVP 릴리즈 체크리스트

작성일: 2026-06-05

## 기능

- [ ] 담당: Product/Engineering - 가입, 로그인, 커플 생성, 배우자 초대, 초대 수락이 Playwright E2E에서 통과한다.
- [ ] 담당: Product/Engineering - 온보딩 필수 입력, 시나리오 생성/재계산, 정책 확인, 비교방, 공동 승인, 상담 신청 흐름이 실제 DB에서 통과한다.
- [ ] 담당: Operations - 관리자 CRM에서 파트너, 상품, 가격 버전, 리드, 정책, 콘텐츠, 분석 퍼널을 조회할 수 있다.

## 디자인

- [ ] 담당: Design - 사용자 앱의 주요 11개 진입점 문구와 버튼 라벨을 최종 검수한다.
- [ ] 담당: Design - 가격 카드, 정책 결과, 비교방 승인 상태 배지의 한국어 라벨을 확정한다.
- [ ] 담당: Design/Engineering - 관리자 앱 탭 수가 늘어난 상태에서도 1366px, 1024px, 390px에서 레이아웃이 깨지지 않는다.

## 모바일

- [ ] 담당: QA - 390px 모바일 viewport에서 가입, 온보딩, 시나리오, 비교방, 상담 신청이 완료된다.
- [ ] 담당: QA - iOS Safari와 Android Chrome에서 localStorage 토큰 유지, 새로고침 후 상태 유지가 확인된다.
- [ ] 담당: Engineering - 입력 폼 하단 버튼이 모바일 키보드에 가려지지 않는다.

## 접근성

- [ ] 담당: QA/Engineering - 모든 입력 필드에 label 또는 aria-label이 있다.
- [ ] 담당: QA - 키보드만으로 가입, 온보딩, 비교방 승인, 상담 신청이 가능하다.
- [ ] 담당: Design - 보조 텍스트, 상태 배지, 에러 박스 색상 대비를 WCAG AA 기준으로 확인한다.

## 보안

- [ ] 담당: Security/Engineering - 운영 `AUTH_TOKEN_SECRET` 저장소와 회전 절차를 확정한다.
- [ ] 담당: Security - 인증, 초대 수락, 리드 신청, 분석 이벤트에 rate limit을 적용한다.
- [ ] 담당: Engineering - 운영 CORS allowlist와 보안 헤더를 적용한다.
- [ ] 담당: Security - 관리자 API 접근 권한을 `User.status=admin` 단일 플래그 이상으로 분리할 계획을 확정한다.

## 개인정보

- [ ] 담당: Privacy/Legal - 수집 항목, 목적, 보관 기간, 파기 정책을 개인정보 처리방침에 반영한다.
- [ ] 담당: Engineering - 리드 연락처 암호화 키 관리와 복호화 권한 정책을 확정한다.
- [ ] 담당: QA - 리드 목록/상세/파트너 화면에서 이름과 전화번호가 기본 마스킹된다.
- [ ] 담당: Engineering - 분석 payload에 이름, 전화번호, 이메일, 계좌, 파일명이 저장되지 않는 테스트가 통과한다.

## 법무

- [ ] 담당: Legal/Product - 정책 가능성 문구가 선정 확정이나 금융 심사처럼 읽히지 않는지 검토한다.
- [ ] 담당: Legal/Product - 파트너 가격 문구가 최저가, 확정가, 계약 확정으로 오해되지 않는지 검토한다.
- [ ] 담당: Legal - 상담 신청 개인정보 제3자 제공 동의 문구를 확정한다.

## 파트너 데이터

- [ ] 담당: Operations - 파트너명, 카테고리, 지역, 검증 상태, 노출 상태를 2인 검수한다.
- [ ] 담당: Operations - 비활성/보류/반려 파트너가 사용자 상품 목록에 노출되지 않는다.
- [ ] 담당: Engineering - 파트너 담당자 직접 개인정보는 사용자 화면에 노출하지 않는다.

## 가격 데이터

- [ ] 담당: Operations - 모든 공개 상품에 검증된 현재 가격 버전이 있다.
- [ ] 담당: Operations - 유효기간이 지난 가격이 기본 상품 목록에서 제외된다.
- [ ] 담당: Engineering - 가격 버전 변경 시 DecisionLog가 남는다.

## 정책 데이터

- [ ] 담당: Operations - 정책 프로그램의 sourceUrl, sourceUpdatedAt, verifiedAt을 확인한다.
- [ ] 담당: Operations/Legal - 정책 결과 문구와 필요 서류 안내가 공식 공고를 대체하지 않는다는 점을 확인한다.
- [ ] 담당: Engineering - 주민등록번호처럼 보이는 입력이 정책 룰과 추가 입력에서 거부된다.

## 분석 이벤트

- [ ] 담당: Data/Engineering - `account_created`부터 `lead_submitted`까지 주요 퍼널 이벤트가 저장된다.
- [ ] 담당: Data - 관리자 퍼널 화면 숫자가 DB EventLog 집계와 일치한다.
- [ ] 담당: Privacy - 분석 payload 샘플 20건을 검수해 직접 개인정보가 없는지 확인한다.

## 고객지원

- [ ] 담당: Support - 초대 실패, 온보딩 막힘, 상담 신청 중복, 가격 유효기간 만료 대응 문구를 준비한다.
- [ ] 담당: Operations - 파트너 리드 문의 대응 SLA를 정한다.
- [ ] 담당: Product - 사용자 신고/문의 접수 채널을 첫 출시 범위에 맞게 확정한다.

## 장애 대응

- [ ] 담당: Engineering - API health check, DB 연결 실패, Next.js 빌드 실패 대응 절차를 문서화한다.
- [ ] 담당: Engineering - Seed/운영 데이터 혼입을 막는 배포 환경 변수를 점검한다.
- [ ] 담당: Operations - 가격/정책 데이터 오류 발견 시 노출 중지 절차를 확정한다.

## 롤백 계획

- [ ] 담당: Engineering - API, web, admin 각각 이전 배포로 되돌리는 절차를 확인한다.
- [ ] 담당: Database - 스키마 변경 전 백업과 롤백 가능성을 확인한다.
- [ ] 담당: Operations - 잘못된 파트너/정책/콘텐츠 노출 시 관리자 화면에서 즉시 비공개 처리할 수 있다.

## 출시 후 7일 모니터링

- [ ] 담당: Product/Data - 매일 가입, 초대, 온보딩 완료, 시나리오 생성, 정책 확인, 비교방 생성, 상담 신청 퍼널을 확인한다.
- [ ] 담당: Engineering - 매일 API 오류율, 응답 시간, DB 연결 오류, Playwright E2E 결과를 확인한다.
- [ ] 담당: Operations - 매일 리드 접수 후 파트너 응답 상태와 지연 리드를 확인한다.
- [ ] 담당: Support - 매일 사용자 문의를 유형별로 분류하고 상위 3개 문제를 제품 백로그에 반영한다.
- [ ] 담당: Security/Privacy - 이벤트 payload와 리드 접근 로그를 표본 점검한다.
