# 신혼생활 MVP API 계약

## 1. 문서 목적

이 문서는 신혼생활 MVP의 API 계약을 정의한다. 구현 코드가 아니라 프론트, API, 데이터 모델이 공유할 약속이다.

기준 문서:

- `AGENTS.md`
- `docs/01-prd.md`
- `docs/02-user-flows.md`
- `docs/03-domain-model.md`
- `docs/04-database-schema-plan.md`
- `docs/06-scenario-engine.md`
- `docs/07-policy-rule-engine.md`
- `docs/08-offer-price-schema.md`

주의:

- 정책 자격, 가격, 결제, 개인정보 처리 기준은 임의로 확정하지 않는다.
- 주민등록번호는 어떤 API에서도 받지 않는다.
- 금융 심사, 대출 가능, 정책 선정 확정처럼 보이는 응답을 만들지 않는다.
- 결제 API는 MVP API 계약에서 제외한다.

## 2. 공통 규칙

### 2.1 Base URL

- MVP 기본 경로: `/api/v1`
- 관리자 API: `/api/v1/admin`
- 파트너 API: `/api/v1/partner`

### 2.2 인증 방식

- 현재 로컬 MVP 인증은 `Authorization: Bearer <accessToken>`을 사용한다.
- `accessToken`은 만료 시간을 가진 HMAC 토큰이며, 운영 인증 제공자는 이후 단계에서 확정한다.
- 초대 링크 원본 토큰은 응답과 URL에만 노출하고 DB에는 `token_hash`로 저장한다.
- 운영 배포에서는 `AUTH_TOKEN_SECRET`, `PII_ENCRYPTION_KEY`, `CORS_ALLOWED_ORIGINS`, `ADMIN_ALLOWED_ORIGINS`를 반드시 설정한다.

### 2.3 공통 응답 형식

성공:

```json
{
  "data": {},
  "meta": {}
}
```

실패:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인해 주세요.",
    "fields": {}
  }
}
```

### 2.4 공통 에러 코드

- `UNAUTHENTICATED`: 로그인 필요
- `FORBIDDEN`: 권한 없음
- `NOT_FOUND`: 리소스 없음
- `VALIDATION_ERROR`: 입력값 오류
- `CONFLICT`: 상태 충돌 또는 중복 요청
- `INVITATION_EXPIRED`: 초대 만료
- `ALREADY_IN_COUPLE`: 이미 다른 커플 소속
- `PARTNER_REQUIRED`: 배우자 참여 필요
- `ONBOARDING_INCOMPLETE`: 온보딩 미완료
- `COMPARE_ROOM_NOT_READY`: 비교방 조건 미충족
- `APPROVAL_REQUIRED`: 둘 다 승인 필요
- `CONSENT_REQUIRED`: 개인정보 제공 동의 필요
- `PRICE_VERSION_EXPIRED`: 가격 유효기간 만료
- `RATE_LIMITED`: 요청이 너무 많음
- `INTERNAL_ERROR`: 서버 오류

### 2.5 권한 용어

- `Public`: 로그인 전 접근 가능
- `Authenticated`: 로그인 사용자
- `CoupleMember`: 해당 커플의 활성 멤버
- `CoupleOwner`: 커플 생성자 또는 관리자 역할. 정확한 역할명 확정 필요
- `Admin`: 운영자
- `Partner`: 파트너 사용자
- `System`: 서버 내부 작업

### 2.6 개인정보 표기

- `없음`: 직접 개인정보 없음
- `내부 식별자`: `userId`, `coupleId` 등 내부 ID 포함
- `직접 개인정보`: 이름, 닉네임, 이메일, 전화번호, 파일명 등 포함
- `민감 가능 정보`: 예산, 소득 구간, 자산 구간, 자녀 계획, 거주 희망 지역 등 포함

## 3. Auth API

현재 구현된 API:

| API          | method | path             | request body                                                                                                                                                                                                    | response body                                                                                                                                          | error code                                                                | 권한          |
| ------------ | ------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------- |
| 회원가입     | POST   | `/auth/register` | `{ "displayName": "string", "email": "string?", "phone": "string?", "coupleDisplayName": "string?", "invitationToken": "string?", "termsAccepted": true, "privacyAccepted": true, "marketingAccepted": false }` | `{ "accessToken": "string", "user": UserSummary, "couple": CoupleSummary, "member": CoupleMemberSummary, "nextStep": "invite_partner \| onboarding" }` | `VALIDATION_ERROR`, `CONFLICT`, `INVITATION_EXPIRED`, `ALREADY_IN_COUPLE` | Public        |
| 로그인       | POST   | `/auth/login`    | `{ "authProvider": "local?", "authProviderUserId": "string?", "email": "string?", "phone": "string?" }`                                                                                                         | `{ "accessToken": "string", "user": UserSummary, "nextStep": "home" }`                                                                                 | `VALIDATION_ERROR`, `UNAUTHENTICATED`                                     | Public        |
| 내 정보 조회 | GET    | `/auth/me`       | 없음                                                                                                                                                                                                            | `{ "user": UserSummary, "currentCoupleId": "uuid?", "currentMember": CoupleMemberSummary?, "roles": ["string"] }`                                      | `UNAUTHENTICATED`                                                         | Authenticated |

UserSummary:

```json
{
  "id": "uuid",
  "displayName": "string",
  "emailMasked": "string?",
  "phoneMasked": "string?",
  "status": "active"
}
```

## 4. Couple API

현재 구현된 API:

| API              | method | path                                 | request body               | response body                                                                                                                                             | error code                                                               | 권한          |
| ---------------- | ------ | ------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------- |
| 현재 커플 조회   | GET    | `/couples/current`                   | 없음                       | `{ "couple": CoupleSummary?, "member": CoupleMemberSummary?, "partnerStatus": "waiting_partner \| connected \| null" }`                                   | `UNAUTHENTICATED`                                                        | Authenticated |
| 배우자 초대 생성 | POST   | `/couples/{coupleId}/invitations`    | `{ "expiresInHours": 72 }` | `{ "invitationId": "uuid", "inviteUrl": "string", "token": "string", "expiresAt": "datetime" }`                                                           | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`                       | CoupleMember  |
| 초대 미리보기    | GET    | `/couple-invitations/{token}`        | 없음                       | `{ "invitation": { "coupleDisplayName": "string", "inviterDisplayName": "string", "status": "active \| expired \| accepted", "expiresAt": "datetime" } }` | `NOT_FOUND`                                                              | Public        |
| 초대 수락        | POST   | `/couple-invitations/{token}/accept` | `{ "accept": true }`       | `{ "couple": CoupleSummary, "member": CoupleMemberSummary }`                                                                                              | `UNAUTHENTICATED`, `INVITATION_EXPIRED`, `ALREADY_IN_COUPLE`, `CONFLICT` | Authenticated |

## 5. Onboarding API

현재 구현된 API:

| API                   | method | path                                      | request body                                                                                                                                                                                                                                                                                                                                                                     | response body                                                                                                                                                                                                              | error code                                              | 권한         |
| --------------------- | ------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------ |
| 온보딩 상태 조회      | GET    | `/couples/{coupleId}/onboarding`          | 없음                                                                                                                                                                                                                                                                                                                                                                             | `{ "status": "not_started \| in_progress \| completed", "partnerStatus": "waiting_partner \| connected", "myProgress": OnboardingProgress, "partnerProgress": OnboardingProgress?, "coupleInput": CoupleOnboardingInput }` | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`             | CoupleMember |
| 개인 온보딩 저장      | PATCH  | `/couples/{coupleId}/onboarding/me`       | `{ "nickname": "string?", "phoneVerified": "boolean?", "workRegion": "string?", "incomeRange": OnboardingRange?, "assetRange": OnboardingRange?, "visibilityPreference": { "income": "summary \| partner \| private", "asset": "summary \| partner \| private" }? }`                                                                                                             | 온보딩 상태 조회와 동일                                                                                                                                                                                                    | `UNAUTHENTICATED`, `VALIDATION_ERROR`, `FORBIDDEN`      | CoupleMember |
| 커플 공통 온보딩 저장 | PATCH  | `/couples/{coupleId}/onboarding/couple`   | `{ "weddingDate": "YYYY-MM-DD?", "weddingRegion": "string?", "preferredResidenceRegion": "string?", "housingType": "string?", "totalBudgetRange": BudgetRange?, "cashOnHandRange": OnboardingRange?, "familySupportType": "string?", "loanConsiderationStatus": "string?", "childrenPlanStatus": "string?", "preferredWeddingStyle": "string?", "moveInPlanAt": "YYYY-MM-DD?" }` | 온보딩 상태 조회와 동일                                                                                                                                                                                                    | `UNAUTHENTICATED`, `VALIDATION_ERROR`, `FORBIDDEN`      | CoupleMember |
| 온보딩 완료 처리      | POST   | `/couples/{coupleId}/onboarding/complete` | `{ "confirm": true }`                                                                                                                                                                                                                                                                                                                                                            | 온보딩 상태 조회와 동일. 배우자가 아직 미참여 또는 미완료이면 커플 상태는 `in_progress` 유지                                                                                                                               | `UNAUTHENTICATED`, `FORBIDDEN`, `ONBOARDING_INCOMPLETE` | CoupleMember |

주의:

- 소득, 자산, 보유 현금, 예산은 정확한 금액이 아니라 구간만 저장한다.
- `phoneVerified`는 현재 로컬 MVP에서 실제 통신사 인증이 아니라 확인 상태 플래그다.
- 배우자 미참여 상태에서도 본인 입력과 커플 공통 입력은 저장할 수 있다.
- 커플 `onboardingStatus`는 활성 멤버가 2명 이상이고 모두 완료했을 때 `completed`가 된다.

## 6. Scenario API

현재 구현된 API:

| API             | method | path                               | request body                                                                                                                                                | response body                                                       | error code                                                                  | 권한         |
| --------------- | ------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------ |
| 시나리오 생성   | POST   | `/couples/{coupleId}/scenarios`    | `{ "title": "string", "items": [ScenarioItemInput], "budgetBasis": { "availableBudgetAmount": 21000000 }?, "useOnboardingDefaults": true }`                 | `{ "scenario": ScenarioDetail }`                                    | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `ONBOARDING_INCOMPLETE` | CoupleMember |
| 시나리오 목록   | GET    | `/couples/{coupleId}/scenarios`    | query: `status?`, `limit?`                                                                                                                                  | `{ "scenarios": [ScenarioSummary] }`                                | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`                          | CoupleMember |
| 시나리오 상세   | GET    | `/scenarios/{scenarioId}`          | 없음                                                                                                                                                        | `{ "scenario": ScenarioDetail }`                                    | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`                                 | CoupleMember |
| 시나리오 수정   | PATCH  | `/scenarios/{scenarioId}`          | `{ "title": "string?", "items": [ScenarioItemInput]?, "budgetBasis": { "availableBudgetAmount": 21000000 }?, "status": "draft \| completed \| archived"? }` | `{ "scenario": ScenarioDetail }`                                    | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT` | CoupleMember |
| 시나리오 재계산 | POST   | `/scenarios/{scenarioId}/evaluate` | `{ "calculationVersion": "scenario-engine-v1"? }`                                                                                                           | `{ "scenario": ScenarioDetail, "warnings": ["sample_value_used"] }` | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`                     | CoupleMember |
| 시나리오 보관   | POST   | `/scenarios/{scenarioId}/archive`  | 없음                                                                                                                                                        | `{ "scenarioId": "uuid", "status": "archived" }`                    | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`                                 | CoupleMember |

ScenarioItemInput:

```json
{
  "category": "wedding",
  "label": "예식장 예상 비용",
  "amount": 12000000,
  "amountType": "user_input",
  "frequency": "one_time",
  "isRequired": true,
  "sourceType": "user?",
  "sourceUrl": "https://example.com?",
  "note": "string?",
  "sortOrder": 10
}
```

허용값:

- `category`: `wedding`, `housing_initial`, `housing_monthly`, `furniture`, `appliance`, `honeymoon`, `living_setup`, `misc`
- `amountType`: `user_input`, `sample`, `admin_default`, `partner_price_snapshot`
- `frequency`: `one_time`, `monthly`

주의:

- `evaluate`는 금융 심사가 아니다.
- 응답 문구는 "예상 계산"으로 제한한다.
- 계산 버전은 `scenario-engine-v1`이다.
- 온보딩 개인 입력과 커플 공통 입력을 완료한 멤버만 시나리오를 생성할 수 있다.
- 온보딩의 예산·보유 현금 구간만으로 부족 금액을 계산하지 않는다.
- sample 또는 출처 없는 기본값이 포함되면 `containsSampleValue`와 위험 신호에 표시한다.

## 7. Policy API

현재 구현된 API:

| API                      | method | path                                                     | request body 또는 query                                                                                                                                                                                                                               | response body                                                                                            | error code                                                                  | 권한          |
| ------------------------ | ------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 정책 목록                | GET    | `/policy-programs`                                       | query: `region?`, `category?`, `includeInactive?`, `limit?`                                                                                                                                                                                           | `{ "policyPrograms": [PolicyProgramSummary] }`                                                           | `UNAUTHENTICATED`, `VALIDATION_ERROR`                                       | Authenticated |
| 정책 상세                | GET    | `/policy-programs/{policyProgramId}`                     | 없음                                                                                                                                                                                                                                                  | `{ "policyProgram": PolicyProgramDetail }`                                                               | `UNAUTHENTICATED`, `NOT_FOUND`                                              | Authenticated |
| 정책 매칭 실행           | POST   | `/couples/{coupleId}/policy-checks`                      | `{ "policyProgramIds": ["uuid"]?, "additionalInputs": {} }`                                                                                                                                                                                           | `{ "eligibilityResults": [EligibilityResultDetail], "disclaimer": "string" }`                            | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `ONBOARDING_INCOMPLETE` | CoupleMember  |
| 정책 결과 목록           | GET    | `/couples/{coupleId}/eligibility-results`                | query: `resultStatus?`, `policyProgramId?`, `limit?`                                                                                                                                                                                                  | `{ "eligibilityResults": [EligibilityResultSummary] }`                                                   | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`                          | CoupleMember  |
| 정책 결과 상세           | GET    | `/eligibility-results/{eligibilityResultId}`             | 없음                                                                                                                                                                                                                                                  | `{ "eligibilityResult": EligibilityResultDetail }`                                                       | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`                                 | CoupleMember  |
| 정책 결과를 할 일로 추가 | POST   | `/eligibility-results/{eligibilityResultId}/tasks`       | `{ "dueInDays": 14 }`                                                                                                                                                                                                                                 | `{ "tasks": [TaskSummary] }`                                                                             | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`             | CoupleMember  |
| 관리자 정책 생성         | POST   | `/admin/policy-programs`                                 | `{ "name": "string", "providerName": "string", "category": "string", "region": "string?", "summary": "string", "sourceUrl": "string", "sourceUpdatedAt": "datetime?", "verifiedAt": "datetime?", "status": "draft \| active" }`                       | `{ "policyProgram": PolicyProgramSummary }`                                                              | `UNAUTHENTICATED`, `VALIDATION_ERROR`                                       | Authenticated |
| 관리자 정책 수정         | PATCH  | `/admin/policy-programs/{policyProgramId}`               | `{ "name": "string?", "summary": "string?", "status": "string?", "sourceUrl": "string?", "sourceUpdatedAt": "datetime?", "verifiedAt": "datetime?" }`                                                                                                 | `{ "policyProgram": PolicyProgramSummary }`                                                              | `UNAUTHENTICATED`, `NOT_FOUND`, `VALIDATION_ERROR`                          | Authenticated |
| 관리자 정책 룰 버전 생성 | POST   | `/admin/policy-programs/{policyProgramId}/rule-versions` | `{ "version": 1?, "status": "draft \| active \| retired", "ruleSummary": "string", "eligibilityCriteria": PolicyEligibilityCriteria, "requiredInputs": [PolicyRequiredInput], "requiredDocuments": [PolicyRequiredDocument], "sourceUrl": "string" }` | `{ "policyRuleVersion": { "id": "uuid", "policyProgramId": "uuid", "version": 1, "status": "active" } }` | `UNAUTHENTICATED`, `NOT_FOUND`, `VALIDATION_ERROR`                          | Authenticated |

주의:

- 응답의 `resultStatus`는 가능성 안내이며 최종 선정 결과가 아니다.
- 정책 수치와 조건은 반드시 출처와 기준일을 가진다.
- 주민등록번호처럼 보이는 키나 값은 `additionalInputs`와 룰 JSON에서 거부한다.
- MVP 관리자 API는 `User.status = admin`인 운영자 사용자만 접근한다.
- 활성 룰 버전이 있는 정책만 정책 매칭 실행 대상이 된다.

## 8. Vendor API

현재 구현된 API:

| API                | method | path                        | request body 또는 query                                                                                                                                                                                                         | response body                    | error code                                                      | 권한          | 개인정보 포함 여부                                | 프론트 사용 화면       |
| ------------------ | ------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------- | ------------- | ------------------------------------------------- | ---------------------- |
| 파트너 목록        | GET    | `/vendors`                  | query: `category?`, `region?`, `verificationStatus?`, `includeInactive?`, `limit?`                                                                                                                                              | `{ "vendors": [VendorSummary] }` | `UNAUTHENTICATED`, `VALIDATION_ERROR`                           | Authenticated | 없음                                              | 상품 목록, 파트너 탐색 |
| 파트너 상세        | GET    | `/vendors/{vendorId}`       | 없음                                                                                                                                                                                                                            | `{ "vendor": VendorSummary }`    | `UNAUTHENTICATED`, `NOT_FOUND`                                  | Authenticated | 없음. 담당자 연락처는 사용자 화면에 노출하지 않음 | 상품 상세              |
| 관리자 파트너 생성 | POST   | `/admin/vendors`            | `{ "name": "string", "category": "string", "region": "string?", "description": "string?", "status": "draft \| active", "verificationStatus": "verified \| unverified \| needs_review \| rejected", "verifiedAt": "datetime?" }` | `{ "vendor": VendorSummary }`    | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`              | Admin         | 없음. 담당자 개인정보 입력은 아직 제외            | 관리자 파트너 관리     |
| 관리자 파트너 수정 | PATCH  | `/admin/vendors/{vendorId}` | `{ "name": "string?", "category": "string?", "region": "string?", "description": "string?", "status": "string?", "verificationStatus": "string?", "verifiedAt": "datetime?" }`                                                  | `{ "vendor": VendorSummary }`    | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Admin         | 없음                                              | 관리자 파트너 관리     |

아직 구현 전:

| API                   | method | path                       | 권한    | 비고                          |
| --------------------- | ------ | -------------------------- | ------- | ----------------------------- |
| 파트너 본인 업체 조회 | GET    | `/partner/vendors/current` | Partner | 파트너 인증 설계 후 구현한다. |

## 9. Offer API

현재 구현된 API:

| API                   | method | path                                                | request body 또는 query                                                                                                                                                                                                                                                                                                                                                            | response body                                  | error code                                                      | 권한          | 개인정보 포함 여부 | 프론트 사용 화면  |
| --------------------- | ------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- | ------------- | ------------------ | ----------------- |
| 상품 목록             | GET    | `/offers`                                           | query: `category?`, `region?`, `budgetRange?`, `vendorId?`, `includeUnverified?`, `validOnly=true`, `limit?`                                                                                                                                                                                                                                                                       | `{ "offers": [OfferCard] }`                    | `UNAUTHENTICATED`, `VALIDATION_ERROR`                           | Authenticated | 없음               | 파트너 상품 목록  |
| 상품 상세             | GET    | `/offers/{offerId}`                                 | 없음                                                                                                                                                                                                                                                                                                                                                                               | `{ "offer": OfferDetail }`                     | `UNAUTHENTICATED`, `NOT_FOUND`                                  | Authenticated | 없음               | 상품 상세         |
| 상품 가격 버전 조회   | GET    | `/offers/{offerId}/price-versions/current`          | 없음                                                                                                                                                                                                                                                                                                                                                                               | `{ "priceVersion": OfferPriceVersionDetail? }` | `UNAUTHENTICATED`, `NOT_FOUND`                                  | Authenticated | 없음               | 상품 상세, 비교방 |
| 관리자 상품 목록      | GET    | `/admin/offers`                                     | query: `category?`, `region?`, `budgetRange?`, `vendorId?`, `includeUnverified?`, `validOnly?`, `limit?`                                                                                                                                                                                                                                                                           | `{ "offers": [OfferCard] }`                    | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`              | Admin         | 없음               | 관리자 상품 관리  |
| 관리자 상품 생성      | POST   | `/admin/vendors/{vendorId}/offers`                  | `{ "title": "string", "category": "string", "region": "string?", "summary": "string", "description": "string?", "status": "draft \| active \| paused \| sold_out \| archived", "displayOrder": 0, "vendorBranchId": "uuid?" }`                                                                                                                                                     | `{ "offer": OfferDetail }`                     | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Admin         | 없음               | 관리자 상품 관리  |
| 관리자 상품 수정      | PATCH  | `/admin/offers/{offerId}`                           | `{ "title": "string?", "summary": "string?", "description": "string?", "status": "string?", "displayOrder": 0?, "vendorBranchId": "uuid?" }`                                                                                                                                                                                                                                       | `{ "offer": OfferDetail }`                     | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Admin         | 없음               | 관리자 상품 관리  |
| 관리자 가격 버전 생성 | POST   | `/admin/offers/{offerId}/price-versions`            | `{ "basePrice": 0, "includedItems": [IncludedItem], "requiredOptions": [PriceOption], "optionalOptions": [PriceOption], "additionalCostNote": "string?", "validFrom": "datetime?", "validUntil": "datetime?", "sourceUrl": "string?", "sourceType": "string?", "verificationStatus": "verified \| unverified \| needs_review \| expired \| rejected", "verifiedAt": "datetime?" }` | `{ "priceVersion": OfferPriceVersionDetail }`  | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Admin         | 없음               | 관리자 가격 관리  |
| 관리자 가격 검증 변경 | PATCH  | `/admin/offer-price-versions/{offerPriceVersionId}` | `{ "verificationStatus": "verified \| unverified \| needs_review \| expired \| rejected", "verifiedAt": "datetime?" }`                                                                                                                                                                                                                                                             | `{ "priceVersion": OfferPriceVersionDetail }`  | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Admin         | 없음               | 관리자 가격 관리  |

주의:

- 유효기간이 지난 가격은 기본 목록에서 제외한다.
- 미검증 가격은 반드시 별도 배지로 표시할 수 있게 응답한다.
- "최저가" 표현을 위한 필드는 만들지 않는다.
- 가격 버전 생성 시 `estimatedTotalPrice`는 `basePrice + requiredOptions` 기준으로 서버에서 계산한다.
- 사용자 화면은 `/offers`, `/offers/{offerId}`에서 가격 카드와 버전 이력을 표시한다.

## 10. CompareRoom API

현재 구현된 API:

| API              | method | path                                           | request body 또는 query                                                               | response body                                                                                                                                                                                 | error code                                                                        | 권한         | 개인정보 포함 여부                       | 프론트 사용 화면  |
| ---------------- | ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------ | ---------------------------------------- | ----------------- |
| 비교방 생성      | POST   | `/couples/{coupleId}/compare-rooms`            | `{ "title": "string", "initialOfferId": "uuid?", "offerPriceVersionId": "uuid?" }`    | `{ "compareRoom": CompareRoomSummary, "cards": [CompareCardSummary], "approvals": [ApprovalSummary], "comments": [CompareCommentSummary] }`                                                   | `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `PRICE_VERSION_EXPIRED`, `CONFLICT` | CoupleMember | 내부 식별자. 제목에 개인정보 입력 가능   | 비교방 생성       |
| 비교방 목록      | GET    | `/couples/{coupleId}/compare-rooms`            | query: `status?`, `limit?`                                                            | `{ "compareRooms": [CompareRoomSummary] }`                                                                                                                                                    | `FORBIDDEN`, `VALIDATION_ERROR`                                                   | CoupleMember | 내부 식별자                              | 홈, 비교방 목록   |
| 비교방 상세      | GET    | `/compare-rooms/{compareRoomId}`               | 없음                                                                                  | `{ "compareRoom": CompareRoomSummary, "cards": [CompareCardSummary], "approvals": [ApprovalSummary], "comments": [CompareCommentSummary] }`                                                   | `FORBIDDEN`, `NOT_FOUND`                                                          | CoupleMember | 내부 식별자, 댓글에 민감 가능 정보       | 비교방            |
| 비교방 수정      | PATCH  | `/compare-rooms/{compareRoomId}`               | `{ "title": "string?", "status": "draft \| shared \| waiting_partner \| archived"? }` | `{ "compareRoom": CompareRoomSummary, "cards": [CompareCardSummary], "approvals": [ApprovalSummary], "comments": [CompareCommentSummary] }`                                                   | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`                          | CoupleMember | 제목에 개인정보 입력 가능                | 비교방            |
| 비교 카드 추가   | POST   | `/compare-rooms/{compareRoomId}/cards`         | `{ "offerId": "uuid", "offerPriceVersionId": "uuid?" }`                               | `{ "cardId": "uuid", "compareRoom": CompareRoomSummary, "cards": [CompareCardSummary], "approvals": [ApprovalSummary], "comments": [CompareCommentSummary] }`                                 | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `PRICE_VERSION_EXPIRED`, `CONFLICT` | CoupleMember | 없음                                     | 상품 상세, 비교방 |
| 비교 카드 제거   | DELETE | `/compare-cards/{compareCardId}`               | 없음                                                                                  | `{ "compareCardId": "uuid", "removedAt": "datetime", "compareRoom": CompareRoomSummary, "cards": [CompareCardSummary], "approvals": [ApprovalSummary], "comments": [CompareCommentSummary] }` | `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`                                              | CoupleMember | 없음                                     | 비교방            |
| 비교방 댓글 작성 | POST   | `/compare-rooms/{compareRoomId}/comments`      | `{ "compareCardId": "uuid?", "body": "string" }`                                      | `{ "comment": CompareCommentSummary }`                                                                                                                                                        | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`                                      | CoupleMember | 댓글에 개인정보 또는 민감 정보 입력 가능 | 비교방            |
| 결정 로그 조회   | GET    | `/compare-rooms/{compareRoomId}/decision-logs` | 없음                                                                                  | `{ "logs": [DecisionLogSummary] }`                                                                                                                                                            | `FORBIDDEN`, `NOT_FOUND`                                                          | CoupleMember | 내부 식별자                              | 비교방 결정 로그  |

주의:

- 비교방 상태는 `draft`, `waiting_partner`, `shared`, `both_approved`, `rejected`, `archived`를 사용한다.
- 비교 카드는 최소 2개, 최대 4개다. 2개 미만이면 승인 제출이 거부된다.
- 비교 카드에는 담는 시점의 검증된 가격 버전만 스냅샷으로 저장한다.
- `both_approved`와 `rejected`는 직접 PATCH로 만들 수 없고 승인 제출 결과로만 전환한다.

## 11. Approval API

현재 구현된 API:

| API               | method | path                                          | request body                                                         | response body                                                                                                                                                     | error code                                                                                             | 권한         | 개인정보 포함 여부                       | 프론트 사용 화면 |
| ----------------- | ------ | --------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------ | ---------------------------------------- | ---------------- |
| 내 승인 상태 제출 | POST   | `/compare-rooms/{compareRoomId}/approvals/me` | `{ "status": "approved \| hold \| rejected", "comment": "string?" }` | `{ "approvalId": "uuid", "compareRoom": CompareRoomSummary, "cards": [CompareCardSummary], "approvals": [ApprovalSummary], "comments": [CompareCommentSummary] }` | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `COMPARE_ROOM_NOT_READY`, `PARTNER_REQUIRED`, `CONFLICT` | CoupleMember | 댓글에 개인정보 또는 민감 정보 입력 가능 | 비교방           |
| 승인 상태 목록    | GET    | `/compare-rooms/{compareRoomId}/approvals`    | 없음                                                                 | `{ "compareRoom": CompareRoomSummary, "approvals": [ApprovalSummary] }`                                                                                           | `FORBIDDEN`, `NOT_FOUND`                                                                               | CoupleMember | 내부 식별자, 댓글                        | 비교방           |

주의:

- Approval은 MVP에서 비교 카드 단위가 아니라 비교방 단위다.
- 활성 커플 멤버 전원이 `approved`이고 비교 카드가 2개 이상이면 비교방 상태가 `both_approved`가 된다.
- 한 명이라도 `rejected`를 제출하면 비교방 상태가 `rejected`가 된다.
- 상담 신청은 `both_approved`에서만 가능하다.

## 12. LeadRequest API

현재 구현된 API:

| API                    | method | path                                           | request body 또는 query                                                                                                                                                                                                                                                                                       | response body                                                               | error code                                                                                                                 | 권한          | 개인정보 포함 여부                            | 프론트 사용 화면        |
| ---------------------- | ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------- | ----------------------- |
| 상담 신청 생성         | POST   | `/compare-rooms/{compareRoomId}/lead-requests` | `{ "compareCardId": "uuid?", "preferredContactMethod": "phone \| sms \| email \| kakao \| other", "preferredContactDates": [{ "date": "YYYY-MM-DD", "window": "morning \| afternoon \| evening \| any" }], "contactName": "string", "contactPhone": "string", "message": "string?", "privacyConsent": true }` | `{ "leadRequest": LeadRequestDetail }`                                      | `FORBIDDEN`, `NOT_FOUND`, `APPROVAL_REQUIRED`, `CONSENT_REQUIRED`, `PRICE_VERSION_EXPIRED`, `VALIDATION_ERROR`, `CONFLICT` | CoupleMember  | 이름, 전화번호, 문의 내용은 저장 시 보호 처리 | 상담 신청, 전송 전 확인 |
| 내 커플 상담 신청 목록 | GET    | `/couples/{coupleId}/lead-requests`            | query: `status?`, `limit?`, `vendorId?`, `submittedFrom?`, `submittedTo?`                                                                                                                                                                                                                                     | `{ "leadRequests": [LeadRequestDetail] }`                                   | `FORBIDDEN`, `VALIDATION_ERROR`                                                                                            | CoupleMember  | 응답은 이름·전화번호 마스킹                   | 상담 신청 내역          |
| 상담 신청 상세         | GET    | `/lead-requests/{leadRequestId}`               | 없음                                                                                                                                                                                                                                                                                                          | `{ "leadRequest": LeadRequestDetail }`                                      | `FORBIDDEN`, `NOT_FOUND`                                                                                                   | CoupleMember  | 응답은 이름·전화번호 마스킹                   | 상담 신청 완료/상세     |
| 관리자 리드 목록       | GET    | `/admin/lead-requests`                         | query: `status?`, `limit?`, `vendorId?`, `submittedFrom?`, `submittedTo?`                                                                                                                                                                                                                                     | `{ "leadRequests": [LeadRequestDetail] }`                                   | `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`                                                                         | Admin         | 직접 개인정보는 기본 마스킹                   | 관리자 리드 목록        |
| 관리자 리드 상태 변경  | PATCH  | `/admin/lead-requests/{leadRequestId}/status`  | `{ "status": "submitted \| viewed \| accepted \| contacted \| booked \| rejected \| expired", "reason": "string?" }`                                                                                                                                                                                          | `{ "leadRequest": LeadRequestDetail, "history": LeadStatusHistorySummary }` | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`                                                | Admin         | reason에 개인정보 입력 가능                   | 관리자 리드 목록        |
| 파트너 리드 상세       | GET    | `/partner/lead-requests/{leadRequestId}`       | 없음                                                                                                                                                                                                                                                                                                          | `{ "leadRequest": PartnerLeadRequestDetail }`                               | `UNAUTHENTICATED`, `NOT_FOUND`                                                                                             | Authenticated | 파트너 기본 화면은 마스킹된 최소 정보만 표시  | 파트너용 리드 상세 기본 |

주의:

- 상담 신청은 `both_approved` 비교방에서만 생성된다.
- 리드 생성 전 개인정보 제공 동의가 필수다. 동의가 false이면 `CONSENT_REQUIRED`를 반환한다.
- 같은 비교 카드에 활성 리드가 이미 있으면 중복 신청을 막는다.
- 가격 스냅샷의 유효기간이 만료되면 상담 신청을 막는다.
- MVP 파트너 상세는 실제 파트너 계정 권한이 아니라 인증 사용자 기준의 기본 미리보기다.

## 13. Document API

| API              | method | path                                          | request body                                                                                                                                                 | response body                                                                                                             | error code                                   | 권한         | 개인정보 포함 여부           | 프론트 사용 화면 |
| ---------------- | ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------ | ---------------------------- | ---------------- |
| 커플 구성원 목록 | GET    | `/couples/{coupleId}/members`                 | 없음                                                                                                                                                         | `{ "members": [CoupleMemberSummary] }`                                                                                    | `FORBIDDEN`                                  | CoupleMember | 표시명                       | 문서함, 할 일    |
| 문서 목록        | GET    | `/couples/{coupleId}/documents`               | query: `status?`, `sourceType?`, `limit?`                                                                                                                    | `{ "documents": [DocumentSummary] }`                                                                                      | `FORBIDDEN`, `VALIDATION_ERROR`              | CoupleMember | 제목에 개인정보 가능         | 문서함           |
| 문서 생성        | POST   | `/couples/{coupleId}/documents`               | `{ "title": "string", "documentType": "string", "sourceType": "string?", "sourceId": "uuid?", "ownerCoupleMemberId": "uuid?", "dueAt": "datetime?" }`        | `{ "document": DocumentDetail }`                                                                                          | `FORBIDDEN`, `VALIDATION_ERROR`              | CoupleMember | 제목에 개인정보 가능         | 문서함           |
| 문서 수정        | PATCH  | `/documents/{documentId}`                     | `{ "title": "string?", "status": "needed \| preparing \| ready \| attached \| submitted \| expired", "ownerCoupleMemberId": "uuid?", "dueAt": "datetime?" }` | `{ "document": DocumentDetail }`                                                                                          | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | CoupleMember | 제목에 개인정보 가능         | 문서함           |
| 문서 첨부 준비   | POST   | `/documents/{documentId}/attachments/presign` | `{ "fileName": "string", "contentType": "string", "size": 12345 }`                                                                                           | `{ "attachment": { "uploadUrl": null, "attachmentRef": "string", "expiresAt": "datetime" }, "document": DocumentDetail }` | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | CoupleMember | 요청 파일명은 저장 전 암호화 | 문서함           |
| 문서 삭제        | DELETE | `/documents/{documentId}`                     | 없음                                                                                                                                                         | `{ "documentId": "uuid", "deletedAt": "datetime" }`                                                                       | `FORBIDDEN`, `NOT_FOUND`                     | CoupleMember | 내부 식별자                  | 문서함           |

주의:

- MVP는 민감 서류 원본 업로드를 강제하지 않는다.
- 파일명은 응답, 로그, 분석 이벤트에 원문으로 남기지 않는다.
- 첨부 준비 API는 로컬 MVP에서 실제 업로드 URL 대신 `uploadUrl: null`을 반환한다.
- 마감일이 있는 문서를 만들거나 수정하면 인앱 알림이 저장된다.

## 14. Task API

| API        | method | path                        | request body                                                                                                                                                     | response body                                   | error code                                   | 권한         | 개인정보 포함 여부           | 프론트 사용 화면 |
| ---------- | ------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------- | ------------ | ---------------------------- | ---------------- |
| 할 일 목록 | GET    | `/couples/{coupleId}/tasks` | query: `status?`, `assignee?`, `dueBefore?`, `limit?`                                                                                                            | `{ "tasks": [TaskSummary] }`                    | `FORBIDDEN`, `VALIDATION_ERROR`              | CoupleMember | 제목과 설명에 민감 정보 가능 | 할 일            |
| 할 일 생성 | POST   | `/couples/{coupleId}/tasks` | `{ "title": "string", "description": "string?", "sourceType": "string?", "sourceId": "uuid?", "assignedCoupleMemberId": "uuid?", "dueAt": "datetime?" }`         | `{ "task": TaskDetail }`                        | `FORBIDDEN`, `VALIDATION_ERROR`              | CoupleMember | 제목과 설명에 민감 정보 가능 | 할 일            |
| 할 일 수정 | PATCH  | `/tasks/{taskId}`           | `{ "title": "string?", "description": "string?", "status": "open \| in_progress \| done \| canceled", "assignedCoupleMemberId": "uuid?", "dueAt": "datetime?" }` | `{ "task": TaskDetail }`                        | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | CoupleMember | 제목과 설명에 민감 정보 가능 | 할 일            |
| 할 일 완료 | POST   | `/tasks/{taskId}/complete`  | `{ "completed": true }`                                                                                                                                          | `{ "task": TaskDetail }`                        | `FORBIDDEN`, `NOT_FOUND`                     | CoupleMember | 내부 식별자                  | 할 일            |
| 할 일 삭제 | DELETE | `/tasks/{taskId}`           | 없음                                                                                                                                                             | `{ "taskId": "uuid", "deletedAt": "datetime" }` | `FORBIDDEN`, `NOT_FOUND`                     | CoupleMember | 내부 식별자                  | 할 일            |

주의:

- 마감일이 있는 할 일을 만들거나 수정하면 인앱 알림이 저장된다.
- 정책 결과의 필요 서류를 할 일로 추가하면 `Task`, `Document`, `Notification`이 함께 생성된다.

## 15. Notification API

| API            | method | path                                   | request body               | response body                                | error code                            | 권한          | 개인정보 포함 여부                          | 프론트 사용 화면 |
| -------------- | ------ | -------------------------------------- | -------------------------- | -------------------------------------------- | ------------------------------------- | ------------- | ------------------------------------------- | ---------------- |
| 알림 목록      | GET    | `/notifications`                       | query: `status?`, `limit?` | `{ "notifications": [NotificationSummary] }` | `UNAUTHENTICATED`, `VALIDATION_ERROR` | Authenticated | 본문에 개인정보 저장 금지. 내부 식별자 포함 | 알림함           |
| 알림 읽음 처리 | PATCH  | `/notifications/{notificationId}/read` | `{ "read": true }`         | `{ "notification": NotificationSummary }`    | `FORBIDDEN`, `NOT_FOUND`              | Authenticated | 내부 식별자                                 | 알림함           |

주의:

- 현재 MVP는 인앱 알림 저장과 읽음 처리만 구현한다.
- 외부 채널 발송은 별도 동의와 수신 설정이 필요하다.
- 알림 실패가 사용자 핵심 기능을 막으면 안 된다.

## 16. Content API

| API            | method | path                                  | request body 또는 query                                                                                                                                                                                               | response body                       | error code                                   | 권한   | 개인정보 포함 여부 | 프론트 사용 화면          |
| -------------- | ------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------- | ------ | ------------------ | ------------------------- |
| 글 목록        | GET    | `/articles`                           | query: `category?`, `limit?`                                                                                                                                                                                          | `{ "articles": [ArticleSummary] }`  | `VALIDATION_ERROR`                           | Public | 없음               | 콘텐츠 목록, 랜딩, 홈 CTA |
| 글 상세        | GET    | `/articles/{slug}`                    | 없음                                                                                                                                                                                                                  | `{ "article": ArticleDetail }`      | `NOT_FOUND`                                  | Public | 없음               | 콘텐츠 상세               |
| 관리자 글 목록 | GET    | `/admin/articles`                     | query: `category?`, `status?`, `includeDrafts?`, `limit?`                                                                                                                                                             | `{ "articles": [ArticleSummary] }`  | `UNAUTHENTICATED`, `FORBIDDEN`               | Admin  | 없음               | 관리자 콘텐츠 관리        |
| 관리자 글 생성 | POST   | `/admin/articles`                     | `{ "title": "string", "slug": "kebab-case", "summary": "string?", "body": "string", "category": "string", "seoTitle": "string?", "seoDescription": "string?", "ogImageUrl": "url?", "status": "draft \| published" }` | `{ "article": AdminArticleDetail }` | `FORBIDDEN`, `VALIDATION_ERROR`, `CONFLICT`  | Admin  | 없음               | 관리자 콘텐츠 관리        |
| 관리자 글 수정 | PATCH  | `/admin/articles/{articleId}`         | `{ "title": "string?", "summary": "string?", "body": "string?", "status": "draft \| published \| archived", "seoTitle": "string?", "seoDescription": "string?", "ogImageUrl": "url?" }`                               | `{ "article": AdminArticleDetail }` | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Admin  | 없음               | 관리자 콘텐츠 관리        |
| 관리자 글 발행 | POST   | `/admin/articles/{articleId}/publish` | `{ "publish": true }`                                                                                                                                                                                                 | `{ "article": AdminArticleDetail }` | `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR` | Admin  | 없음               | 관리자 콘텐츠 관리        |

주의:

- 정책과 금융성 콘텐츠는 확정적 표현을 피한다.
- 사용자 화면에는 `published` 상태만 노출한다.
- `ArticleDetail`에는 `contentBlocks`, `faq`, `ctaLinks`, `seoTitle`, `seoDescription`, `ogImageUrl`이 포함된다.
- 복잡한 에디터, 댓글, 사용자 생성 콘텐츠는 MVP 범위에서 제외한다.

## 17. Analytics API

| API                | method | path                              | request body                                                                                                        | response body                      | error code                         | 권한                      | 개인정보 포함 여부                             | 프론트 사용 화면     |
| ------------------ | ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- | ------------------------- | ---------------------------------------------- | -------------------- |
| 이벤트 수집        | POST   | `/analytics/events`               | `{ "eventName": "string", "anonymousId": "string?", "coupleId": "uuid?", "payload": {}, "occurredAt": "datetime" }` | `{ "accepted": true }`             | `VALIDATION_ERROR`, `RATE_LIMITED` | Public 또는 Authenticated | 내부 식별자 가능. payload에 직접 개인정보 금지 | 모든 주요 화면       |
| 관리자 퍼널 조회   | GET    | `/admin/analytics/funnel`         | query: `from`, `to`, `groupBy?`                                                                                     | `{ "funnel": [FunnelStepMetric] }` | `FORBIDDEN`, `VALIDATION_ERROR`    | Admin                     | 집계 데이터. 직접 개인정보 없음                | 관리자 퍼널 대시보드 |
| 관리자 이벤트 요약 | GET    | `/admin/analytics/events/summary` | query: `from`, `to`, `eventName?`                                                                                   | `{ "events": [EventMetric] }`      | `FORBIDDEN`, `VALIDATION_ERROR`    | Admin                     | 집계 데이터. 직접 개인정보 없음                | 관리자 분석 화면     |

이벤트 이름 후보:

- `account_created`
- `couple_created`
- `partner_invited`
- `partner_joined`
- `onboarding_started`
- `onboarding_completed`
- `scenario_created`
- `scenario_evaluated`
- `policy_check_started`
- `policy_check_completed`
- `offer_viewed`
- `offer_compared`
- `compare_room_created`
- `approval_submitted`
- `both_approved`
- `lead_submitted`
- `content_viewed`
- `calculator_started`
- `task_completed`

주의:

- `payload`에는 이름, 전화번호, 계좌, 파일명, 상세 소득, 상세 자산을 저장하지 않는다.
- 이벤트 저장 실패가 사용자 기능을 막으면 안 된다.

## 18. 주요 응답 타입 초안

### CoupleSummary

```json
{
  "id": "uuid",
  "displayName": "string",
  "lifecycleStatus": "preparing",
  "onboardingStatus": "in_progress",
  "createdAt": "datetime"
}
```

### CoupleMemberSummary

```json
{
  "id": "uuid",
  "userId": "uuid",
  "displayName": "string",
  "role": "owner",
  "status": "active",
  "joinedAt": "datetime?"
}
```

### ScenarioSummary

```json
{
  "id": "uuid",
  "title": "string",
  "status": "completed",
  "totalAmount": 0,
  "monthlyAmount": 0,
  "shortfallAmount": 0,
  "containsSampleValue": true,
  "createdAt": "datetime"
}
```

### EligibilityResultSummary

```json
{
  "id": "uuid",
  "policyProgramId": "uuid",
  "policyName": "string",
  "resultStatus": "maybe_eligible",
  "resultReason": "string",
  "missingInputs": [],
  "requiredDocuments": [],
  "checkedAt": "datetime",
  "sourceUpdatedAt": "datetime?",
  "verifiedAt": "datetime?"
}
```

### OfferCard

```json
{
  "id": "uuid",
  "title": "string",
  "category": "string",
  "region": "string",
  "summary": "string",
  "status": "active",
  "vendor": {
    "id": "uuid",
    "name": "string",
    "region": "string?",
    "verificationStatus": "verified",
    "verifiedAt": "datetime?"
  },
  "vendorBranch": {
    "id": "uuid",
    "name": "string",
    "region": "string?"
  },
  "currentPriceVersion": {
    "id": "uuid",
    "version": 1,
    "basePrice": 1500000,
    "estimatedTotalPrice": 1950000,
    "includedItems": [],
    "requiredOptions": [],
    "optionalOptions": [],
    "verificationStatus": "verified",
    "validityStatus": "valid",
    "verifiedAt": "datetime?",
    "validUntil": "datetime?"
  }
}
```

### CompareRoomSummary

```json
{
  "id": "uuid",
  "title": "string",
  "status": "waiting_partner",
  "cardCount": 2,
  "myApprovalStatus": "approved",
  "partnerApprovalStatus": "pending",
  "updatedAt": "datetime"
}
```

### LeadRequestSummary

```json
{
  "id": "uuid",
  "vendorName": "string",
  "offerTitle": "string",
  "status": "submitted",
  "preferredContactMethod": "phone",
  "submittedAt": "datetime"
}
```

## 19. 확정 필요 사항

- 인증 방식: 세션 쿠키, Bearer token, 소셜 로그인 조합
- 가입 식별자: 이메일, 휴대폰, 소셜 로그인 중 MVP 필수값
- `CoupleOwner` 역할명과 권한 범위
- 한 사용자의 다중 커플 소속 허용 여부
- Approval 대상: 비교방 단위인지 비교 카드 단위인지
- 가격 만료 시 상담 신청을 차단할지 운영자 확인 요청으로 보낼지
- 리드 중복 신청 기준
- 파트너에게 제공할 최소 개인정보 범위
- 문서 첨부 presign API를 MVP에 포함할지
- 관리자와 파트너 계정 생성 방식
- 이벤트 payload 스키마 검증 방식
