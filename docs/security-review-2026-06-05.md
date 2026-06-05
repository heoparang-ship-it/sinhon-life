# 신혼OS 보안 리뷰

작성일: 2026-06-05

범위: 현재 로컬 MVP 코드베이스의 인증, 커플 권한, 초대, 리드, 문서, 관리자, 분석, 결제 전제 보안 점검.

## 요약

현재 MVP는 커플 멤버 권한, 관리자 권한, 리드 마스킹, 주민등록번호 입력 차단, 분석 payload 개인정보 차단의 기본 방어선을 갖췄다. 다만 운영 출시 전에는 토큰 관리, rate limit, CSRF/XSS 방어 헤더, 파일 저장소 접근 제어, 결제 idempotency 설계가 반드시 보강되어야 한다.

## 리스크 목록

| 심각도 | 영역          | 리스크                                                                                                               | 재현 방법                                                                                                 | 수정 제안                                                                                                                 |
| ------ | ------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| High   | 인증 토큰     | 로컬 HMAC accessToken에 만료, 회전, 폐기 목록이 없다. 유출 시 장기간 재사용될 수 있다.                               | 발급된 토큰을 localStorage에서 복사해 다른 브라우저에서 `Authorization` 헤더로 사용한다.                  | JWT 만료 시간, refresh token, 서버 측 세션 폐기 목록, 비밀키 회전 절차를 추가한다.                                        |
| High   | Rate limit    | 회원가입, 로그인, 초대 수락, 리드 신청, 분석 이벤트 수집에 rate limit이 없다.                                        | 같은 IP/토큰으로 `/auth/login`, `/analytics/events`, `/compare-rooms/{id}/lead-requests`를 반복 호출한다. | IP+계정+토큰 기준 rate limit, 초대 토큰 실패 횟수 제한, 리드 신청 중복/쿨다운을 추가한다.                                 |
| High   | 파일 접근     | 문서 첨부 presign은 준비됐지만 실제 저장소 권한 정책과 다운로드 검증이 아직 없다.                                    | 문서 첨부 URL 발급 후 다른 커플 문서 ID로 접근을 시도한다.                                                | 업로드/다운로드 모두 커플 멤버 권한 확인, 짧은 만료 시간, object key 랜덤화, content-type/size 재검증을 적용한다.         |
| Medium | CSRF          | API가 Bearer 토큰 기반이라 기본 CSRF 위험은 낮지만, CORS가 현재 origin 또는 `*`로 열릴 수 있다.                      | 임의 Origin에서 API 요청을 만들고 preflight 허용 여부를 확인한다.                                         | 운영에서는 허용 origin allowlist, credentials 정책 명시, 관리자 API 별도 origin 제한을 둔다.                              |
| Medium | XSS           | Article body, 정책/파트너 설명은 React escape에 의존한다. 향후 rich text 또는 HTML 렌더링 도입 시 XSS 위험이 커진다. | CMS body에 `<script>` 또는 이벤트 속성 문자열을 넣고 상세 페이지 렌더링을 확인한다.                       | HTML 렌더링 금지 유지, rich text 도입 시 sanitizer와 허용 태그 목록을 둔다.                                               |
| Medium | 관리자 권한   | `User.status = admin` 단일 플래그로 운영 권한을 처리한다. 세부 권한, 감사 주체, 승인 절차가 부족하다.                | admin 상태 사용자로 가격 검증, 리드 상태, 정책 생성 API를 호출한다.                                       | role/permission 테이블, 관리자 액션 2단계 승인, 운영자별 감사 로그 조회를 추가한다.                                       |
| Medium | 분석 이벤트   | payload 개인정보 차단은 구현됐지만 이벤트량 제한과 anonymousId 남용 방어가 없다.                                     | 익명 ID를 바꿔 대량 이벤트를 보낸다.                                                                      | anonymousId/IP rate limit, payload 크기 제한, 이벤트 샘플링/폐기 정책을 추가한다.                                         |
| Medium | 리드 개인정보 | 리드 상세 응답은 마스킹되지만 서버에는 암호화 문자열과 해시가 저장된다. 키 관리 정책이 아직 없다.                    | DB dump에서 `contactPhoneEncrypted`, `contactPhoneHash`를 확인한다.                                       | KMS 기반 envelope encryption, 키 회전, 운영자 복호화 권한 분리, 접근 로그를 추가한다.                                     |
| Medium | 결제          | 결제 모델/API가 아직 없다. idempotency, 콜백 검증, 상태 전이 불변성이 설계 전이다.                                   | 결제 단계 없음.                                                                                           | 결제 구현 전 `docs/09-payment-plan.md` 승인, idempotency key unique 제약, PG signature 검증, 환불/취소 상태표를 확정한다. |
| Low    | SQL injection | Prisma 쿼리 중심이라 현재 직접 SQL injection 표면은 낮다.                                                            | query/body에 SQL 문자열을 넣어 목록 API를 호출한다.                                                       | raw query 도입 시 parameter binding만 허용하는 규칙을 둔다.                                                               |
| Low    | 감사 로그     | 주요 운영/결정 액션은 DecisionLog가 있으나 분석/콘텐츠 조회 등 읽기 이벤트는 감사 로그가 아니라 EventLog다.          | 관리자 콘텐츠 수정, 가격 변경, 리드 상태 변경 후 DecisionLog를 확인한다.                                  | 감사 대상 액션 목록을 문서화하고 누락 액션 테스트를 추가한다.                                                             |

## 출시 전 필수 보강

- 운영 `AUTH_TOKEN_SECRET` 비밀 관리와 토큰 만료 정책 확정.
- CORS origin allowlist와 보안 헤더 적용.
- 인증/초대/리드/분석 rate limit 적용.
- 파일 저장소 접근 정책과 presign 만료 정책 확정.
- 관리자 권한 모델을 `status=admin` 단일 플래그에서 분리.
- 개인정보 암호화 키 관리, 복호화 권한, 접근 로그 설계.
- 결제는 별도 승인 전 코드 구현 금지.
