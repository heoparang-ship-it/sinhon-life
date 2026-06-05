# 신혼생활 도메인 모델

## 1. 문서 목적

이 문서는 신혼생활 MVP의 핵심 도메인을 정의한다. ORM 코드나 실제 테이블 정의가 아니라, 각 도메인이 어떤 역할을 갖고 어떤 데이터와 관계를 가져야 하는지 정리하는 기준 문서다.

다음 단계의 DB 스키마 설계안은 이 문서를 기준으로 작성한다.

## 2. 공통 원칙

- 신혼생활의 중심 단위는 User가 아니라 Couple이다.
- User는 행위자이고, 신혼 준비 데이터는 원칙적으로 Couple에 귀속된다.
- 정책, 가격, 계산 규칙은 버전 관리한다.
- 주요 결정과 운영 변경은 로그로 남긴다.
- 개인정보와 민감 정보는 최소 수집한다.
- 소득, 자산, 보유 현금은 가능한 한 구간으로 저장한다.
- 주민등록번호는 저장하지 않는다.
- 전화번호, 이름, 파일명, 계좌 등 직접 식별 정보는 분석 이벤트에 저장하지 않는다.
- 비즈니스 규칙이 확정되지 않은 항목은 "확정 필요"로 남긴다.

## 3. 개인정보 구분 기준

- 직접 개인정보: 이름, 닉네임, 이메일, 전화번호, 인증 식별자, 파일명 등 개인을 직접 알 수 있는 정보
- 민감 가능 정보: 소득 구간, 자산 구간, 예산, 보유 현금, 가족 지원금 여부, 대출 고려 여부, 자녀 계획, 거주 희망 지역
- 커플 운영 정보: 커플 멤버십, 승인, 반려, 댓글, 상담 신청 상태
- 비개인 운영 정보: 정책, 상품, 가격, 콘텐츠, 공개 가능한 파트너 정보

## 4. 전체 관계 요약

- User는 CoupleMember를 통해 Couple에 참여한다.
- Couple은 Scenario, EligibilityResult, CompareRoom, LeadRequest, Document, Task, Notification, EventLog의 중심 소유자다.
- PolicyProgram은 PolicyRuleVersion을 가진다.
- EligibilityResult는 Couple, PolicyProgram, PolicyRuleVersion을 기준으로 생성된다.
- Vendor는 Offer를 가진다.
- Offer는 OfferPriceVersion을 가진다.
- CompareRoom은 CompareCard와 Approval을 가진다.
- CompareCard는 Offer와 OfferPriceVersion의 특정 시점을 참조한다.
- LeadRequest는 CompareRoom, Offer, Vendor, Couple을 연결한다.
- DecisionLog는 CompareRoom, Approval, LeadRequest, 정책/가격 운영 변경 등 중요한 결정과 상태 변경을 기록한다.

## 5. 도메인 상세

### 5.1 User

역할:
서비스에 로그인하고 행동을 수행하는 개인 사용자다. 커플 데이터의 직접 소유자가 아니라 CoupleMember를 통해 Couple에 참여한다.

주요 필드:

- id
- displayName 또는 nickname
- email: 가입 방식 확정 필요
- phoneNumber: 가입 또는 리드 연락처에서 사용할지 확정 필요
- authProvider
- authProviderUserId
- status: active, suspended, deleted 등 상태값 확정 필요
- lastLoginAt
- createdAt
- updatedAt
- deletedAt

관계:

- User 1명은 CoupleMember를 통해 0개 또는 1개 이상의 Couple에 연결될 수 있다. MVP에서 다중 커플 허용 여부는 확정 필요.
- User는 Scenario, DecisionLog, Approval, LeadRequest, Article, EventLog의 actor가 될 수 있다.

주의사항:

- User에 신혼 준비 핵심 데이터를 직접 붙이지 않는다.
- 전화번호를 인증용과 리드 연락용으로 함께 쓸지 분리할지 확정 필요.
- 계정 삭제와 커플 데이터 보존 정책은 확정 필요.

개인정보 여부:

- 직접 개인정보 포함.
- 이메일, 전화번호, 인증 식별자는 보안 관리 대상.

버전 관리 필요 여부:

- 일반 버전 관리는 필요하지 않다.
- 상태 변경과 삭제 요청은 audit 또는 DecisionLog와 별도 정책 확정 필요.

### 5.2 Couple

역할:
신혼생활의 핵심 작업 단위다. 예산, 주거, 정책, 비교, 승인, 상담 신청이 Couple을 기준으로 묶인다.

주요 필드:

- id
- displayName
- lifecycleStatus: preparing, married, inactive 등 상태값 확정 필요
- weddingDate
- weddingRegion
- preferredResidenceRegion
- housingType
- totalBudgetRange 또는 totalBudgetAmount: 저장 방식 확정 필요
- cashOnHandRange 또는 cashOnHandAmount: 저장 방식 확정 필요
- familySupportType: 확정 필요
- loanConsiderationStatus: 대출 가능 판단이 아니라 고려 여부만 저장
- childrenPlanStatus: 선택 안 함 허용
- onboardingStatus
- createdByUserId
- createdAt
- updatedAt
- deletedAt

관계:

- Couple은 여러 CoupleMember를 가진다.
- Couple은 여러 Scenario, EligibilityResult, CompareRoom, LeadRequest, Document, Task, Notification, EventLog를 가진다.

주의사항:

- Couple에는 개인별 소득이나 자산 상세값을 저장하지 않는다.
- 커플 이동, 탈퇴, 해산, 재참여 정책은 확정 필요.
- 커플 데이터 삭제와 감사 로그 보존 기준은 확정 필요.

개인정보 여부:

- 민감 가능 정보 포함.
- 예산, 보유 현금, 거주 희망 지역, 자녀 계획 등은 신중히 처리한다.

버전 관리 필요 여부:

- 일반 버전 관리는 필수는 아니다.
- 중요한 상태 변경과 삭제, 멤버 변경은 DecisionLog 또는 audit log 필요.

### 5.3 CoupleMember

역할:
User와 Couple의 관계를 표현한다. 커플 내 역할, 참여 상태, 공개 범위, 권한 판단의 기준이 된다.

주요 필드:

- id
- coupleId
- userId
- role: owner, partner, member 등 역할명 확정 필요
- status: invited, active, left, removed 등 상태값 확정 필요
- displayLabel 또는 relationshipLabel: 확정 필요
- invitedByUserId
- invitedAt
- joinedAt
- leftAt
- visibilityPreference
- createdAt
- updatedAt

관계:

- CoupleMember는 하나의 User와 하나의 Couple을 연결한다.
- Approval, Task, Notification, DecisionLog에서 행위자 또는 담당자로 참조될 수 있다.

주의사항:

- MVP에서 한 User가 여러 Couple에 속할 수 있는지 확정 필요.
- 공개 범위 기본값은 보수적으로 설정해야 한다.
- 배우자 초대 자체는 CoupleInvitation 도메인이 별도로 필요할 수 있다.

개인정보 여부:

- 커플 관계 정보 포함.
- 역할과 참여 상태는 커플 운영 정보지만 개인의 관계 상태를 드러낼 수 있다.

버전 관리 필요 여부:

- 일반 버전 관리는 필요하지 않다.
- 역할, 상태, 공개 범위 변경은 로그 필요.

### 5.4 Scenario

역할:
커플의 입력값을 바탕으로 예식, 주거, 혼수, 월 부담 등 신혼 비용 시나리오를 계산한 결과 묶음이다.

주요 필드:

- id
- coupleId
- title
- status: draft, completed, archived 등 확정 필요
- calculationVersion
- inputSnapshot
- totalAmount
- monthlyAmount
- shortfallAmount
- riskFlags
- containsSampleValue
- createdByUserId
- createdAt
- updatedAt
- archivedAt

관계:

- Scenario는 하나의 Couple에 속한다.
- Scenario는 여러 ScenarioItem을 가진다.
- Scenario 결과는 Policy 매칭, Offer 비교, EventLog와 연결될 수 있다.

주의사항:

- 금융 심사나 대출 승인처럼 보이면 안 된다.
- sample 값과 사용자 입력값을 구분해야 한다.
- 계산 규칙 문서 작성 후 calculationVersion 기준을 확정한다.

개인정보 여부:

- 민감 가능 정보 포함.
- 예산, 월 부담, 부족 금액은 커플 재정 상황을 추정하게 할 수 있다.

버전 관리 필요 여부:

- 필요.
- calculationVersion과 inputSnapshot을 저장해 과거 결과를 재현할 수 있어야 한다.

### 5.5 ScenarioItem

역할:
Scenario를 구성하는 개별 비용 항목이다.

주요 필드:

- id
- scenarioId
- category: wedding, housing, furniture, appliance, honeymoon, misc 등 확정 필요
- label
- amount
- amountType: user_input, sample, admin_default 등 확정 필요
- isRequired
- sourceType
- sourceUrl
- note
- sortOrder
- createdAt
- updatedAt

관계:

- ScenarioItem은 하나의 Scenario에 속한다.

주의사항:

- 출처 없는 기본값은 sample로 표시한다.
- 금리, 대출 한도, 금융 승인 관련 수치는 하드코딩하지 않는다.

개인정보 여부:

- 직접 개인정보는 없다.
- 비용 항목은 민감 가능 정보로 취급한다.

버전 관리 필요 여부:

- 단독 버전 관리는 필수는 아니다.
- Scenario의 calculationVersion과 함께 보존한다.

### 5.6 PolicyProgram

역할:
사용자에게 보여줄 정책 또는 혜택 프로그램의 기본 정보다.

주요 필드:

- id
- name
- providerName
- category
- region
- summary
- sourceUrl
- sourceUpdatedAt
- verifiedAt
- applicationStartAt
- applicationEndAt
- status: draft, active, expired, hidden 등 확정 필요
- cautionText
- requiredDocumentsSummary
- createdByUserId
- createdAt
- updatedAt

관계:

- PolicyProgram은 여러 PolicyRuleVersion을 가진다.
- PolicyProgram은 여러 EligibilityResult와 연결될 수 있다.
- PolicyProgram은 Task 또는 Article과 연결될 수 있다.

주의사항:

- 정책 수치와 조건은 최신성을 보장한다고 표현하지 않는다.
- 출처와 기준일이 없는 정책은 사용자에게 확정적으로 보여주지 않는다.
- 샘플 정책은 sample 표시가 필요하다.

개인정보 여부:

- 개인정보 없음.
- 공개 정책 정보에 해당한다.

버전 관리 필요 여부:

- 정책 기본 정보의 변경 로그는 필요.
- 자격 조건은 PolicyRuleVersion에서 버전 관리한다.

### 5.7 PolicyRuleVersion

역할:
PolicyProgram의 특정 시점 자격 판단 규칙이다.

주요 필드:

- id
- policyProgramId
- version
- status: draft, active, retired 등 확정 필요
- ruleSummary
- eligibilityCriteria
- requiredInputs
- resultReasonTemplate
- requiredDocuments
- effectiveFrom
- effectiveTo
- sourceUrl
- sourceUpdatedAt
- verifiedAt
- createdByUserId
- createdAt

관계:

- PolicyRuleVersion은 하나의 PolicyProgram에 속한다.
- EligibilityResult는 특정 PolicyRuleVersion을 참조한다.

주의사항:

- 실제 정책 수치를 임의로 만들지 않는다.
- 룰 구조는 정책 룰 엔진 문서에서 확정한다.
- 관리자 업데이트 방식은 확정 필요.

개인정보 여부:

- 개인정보 없음.

버전 관리 필요 여부:

- 필요.
- 정책 판단 결과는 반드시 사용된 rule version을 참조해야 한다.

### 5.8 EligibilityResult

역할:
커플 입력값을 특정 정책 룰 버전에 적용한 결과다.

주요 필드:

- id
- coupleId
- policyProgramId
- policyRuleVersionId
- resultStatus: likely_eligible, maybe_eligible, not_eligible, need_more_info, expired, unknown
- resultReason
- missingInputs
- requiredDocuments
- inputSnapshot
- checkedAt
- expiresAt
- createdAt

관계:

- EligibilityResult는 하나의 Couple에 속한다.
- EligibilityResult는 하나의 PolicyProgram과 하나의 PolicyRuleVersion을 참조한다.
- EligibilityResult는 Task 생성의 근거가 될 수 있다.

주의사항:

- 최종 선정 결과나 승인 결과로 표현하지 않는다.
- 부족한 입력값과 판단 사유를 분리해서 저장한다.
- 만료된 정책의 결과를 어떻게 보관할지 확정 필요.

개인정보 여부:

- 민감 가능 정보 포함.
- inputSnapshot에는 소득, 자산, 거주지, 혼인 상태 등 민감 가능 정보가 들어갈 수 있다.

버전 관리 필요 여부:

- 자체 버전보다는 policyRuleVersionId와 inputSnapshot이 필요하다.
- 결과 재계산 시 새 EligibilityResult를 만들지 기존 결과를 갱신할지 확정 필요.

### 5.9 Vendor

역할:
신혼생활에 상품 또는 상담을 제공하는 파트너 업체다.

주요 필드:

- id
- name
- category
- region
- description
- businessIdentifier: 저장 여부 확정 필요
- representativeContactName: 저장 여부 확정 필요
- representativeContactPhone: 저장 여부 확정 필요
- status: draft, active, suspended, hidden 등 확정 필요
- verificationStatus
- verifiedAt
- createdAt
- updatedAt

관계:

- Vendor는 여러 Offer를 가진다.
- Vendor는 LeadRequest의 수신 대상이 된다.
- Vendor는 Article 또는 콘텐츠 CTA와 연결될 수 있다.

주의사항:

- 파트너 셀프 가입은 MVP 제외다.
- 사업자 정보와 담당자 연락처의 보관 범위는 확정 필요.
- 파트너 권한은 본인 업체 리드만 볼 수 있게 제한한다.

개인정보 여부:

- 업체 기본 정보는 개인정보가 아니다.
- 담당자 이름과 연락처를 저장하면 직접 개인정보 포함.

버전 관리 필요 여부:

- 일반 버전 관리는 필수는 아니다.
- 상태, 검증, 계약 관련 변경은 audit log 필요.

### 5.10 Offer

역할:
Vendor가 제공하는 상품 또는 상담 가능한 서비스의 기본 정보다.

주요 필드:

- id
- vendorId
- title
- category
- region
- summary
- description
- status: draft, active, paused, hidden 등 확정 필요
- displayOrder
- createdAt
- updatedAt

관계:

- Offer는 하나의 Vendor에 속한다.
- Offer는 여러 OfferPriceVersion을 가진다.
- Offer는 CompareCard와 LeadRequest에서 참조된다.

주의사항:

- 가격 정보는 Offer에 직접 고정하지 않고 OfferPriceVersion으로 분리한다.
- Offer가 비활성화되었을 때 기존 비교방과 리드에서 어떻게 보일지 확정 필요.

개인정보 여부:

- 개인정보 없음.

버전 관리 필요 여부:

- 상품 설명 변경 로그는 운영상 필요할 수 있다.
- 가격은 OfferPriceVersion에서 버전 관리한다.

### 5.11 OfferPriceVersion

역할:
Offer의 특정 시점 가격, 포함 항목, 옵션, 유효기간을 나타낸다.

주요 필드:

- id
- offerId
- version
- basePrice
- estimatedTotalPrice
- includedItems
- requiredOptions
- optionalOptions
- additionalCostNote
- cancellationPolicySummary
- verificationStatus: unverified, verified, expired 등 확정 필요
- verifiedAt
- validFrom
- validUntil
- sourceType
- sourceUrl
- createdByUserId
- createdAt

관계:

- OfferPriceVersion은 하나의 Offer에 속한다.
- CompareCard는 비교 시점의 OfferPriceVersion을 참조한다.
- LeadRequest는 상담 신청 시점의 OfferPriceVersion을 참조할 수 있다.

주의사항:

- 유효기간이 지난 가격은 기본 노출하지 않는다.
- 미검증 가격은 검증된 가격과 다른 배지로 표시한다.
- "최저가" 표현은 운영 기준 확정 전까지 사용하지 않는다.
- 취소, 환불, 위약금, 예약금 정책은 파트너 계약 기준 확정 필요.

개인정보 여부:

- 개인정보 없음.

버전 관리 필요 여부:

- 필요.
- 가격 변경은 새 버전으로 남겨야 한다.

### 5.12 LeadRequest

역할:
둘 다 승인된 비교방에서 생성되는 상담 신청이다.

주요 필드:

- id
- coupleId
- compareRoomId
- compareCardId 또는 offerId: 연결 기준 확정 필요
- vendorId
- offerPriceVersionId
- status: submitted, viewed, accepted, contacted, booked, rejected, expired
- preferredContactMethod
- preferredContactDates
- contactName
- contactPhone
- message
- consentGivenAt
- submittedByUserId
- submittedAt
- expiresAt
- createdAt
- updatedAt

관계:

- LeadRequest는 하나의 Couple에 속한다.
- LeadRequest는 CompareRoom과 Vendor, Offer 또는 CompareCard를 참조한다.
- LeadRequest 상태 변경은 DecisionLog 또는 LeadStatusHistory 후보 도메인으로 기록한다.

주의사항:

- both_approved 상태에서만 생성 가능하다.
- 개인정보 제공 동의 없이는 생성하지 않는다.
- 파트너에게 제공할 최소 개인정보 범위는 확정 필요.
- 연락처는 마스킹과 접근 권한이 필요하다.
- 중복 신청 방지 기준은 확정 필요.

개인정보 여부:

- 직접 개인정보 포함.
- 연락처, 이름, 문의 내용은 보안과 마스킹 대상.

버전 관리 필요 여부:

- 일반 버전 관리는 필수는 아니다.
- 상태 변경 이력은 반드시 필요하다. 별도 LeadStatusHistory 도메인 도입 여부 확정 필요.

### 5.13 CompareRoom

역할:
커플이 여러 상품을 담아 비교하고, 각자 승인/보류/반려를 남기는 공간이다.

주요 필드:

- id
- coupleId
- title
- status: draft, shared, waiting_partner, both_approved, rejected, archived
- createdByUserId
- sharedAt
- bothApprovedAt
- rejectedAt
- archivedAt
- createdAt
- updatedAt

관계:

- CompareRoom은 하나의 Couple에 속한다.
- CompareRoom은 여러 CompareCard를 가진다.
- CompareRoom은 여러 Approval과 DecisionLog를 가진다.
- CompareRoom은 LeadRequest 생성의 근거가 된다.

주의사항:

- 상담 신청은 both_approved 상태에서만 가능하다.
- 상품 1개 상태의 draft 저장 허용 여부는 확정 필요.
- 반려 후 재검토 가능 여부는 확정 필요.

개인정보 여부:

- 직접 개인정보는 없다.
- 커플의 의사결정 기록이므로 접근 권한이 필요하다.

버전 관리 필요 여부:

- 일반 버전 관리는 필요하지 않다.
- 상태 변경은 DecisionLog로 남긴다.

### 5.14 CompareCard

역할:
CompareRoom에 담긴 개별 상품 카드다. 비교 시점의 상품과 가격 정보를 고정해서 보여주는 역할을 한다.

주요 필드:

- id
- compareRoomId
- offerId
- offerPriceVersionId
- snapshotTitle
- snapshotPriceSummary
- snapshotIncludedItems
- snapshotRequiredOptions
- snapshotOptionalOptions
- position
- addedByUserId
- createdAt
- removedAt

관계:

- CompareCard는 하나의 CompareRoom에 속한다.
- CompareCard는 Offer와 OfferPriceVersion을 참조한다.
- Approval은 CompareCard 또는 CompareRoom 전체를 대상으로 할 수 있다: 확정 필요.

주의사항:

- 가격이 바뀌어도 비교 당시 사용자가 본 가격을 추적할 수 있어야 한다.
- 유효기간 만료 후 상담 신청 가능 여부는 확정 필요.
- 한 CompareRoom의 CompareCard 수는 2개에서 4개가 기본이다.

개인정보 여부:

- 개인정보 없음.

버전 관리 필요 여부:

- 단독 버전 관리는 필요하지 않다.
- price version 참조와 snapshot 보존이 필요하다.

### 5.15 Approval

역할:
커플 구성원이 비교방 또는 비교 카드에 대해 승인, 보류, 반려한 상태를 나타낸다.

주요 필드:

- id
- compareRoomId
- compareCardId: 승인 대상이 카드 단위인지 방 단위인지 확정 필요
- coupleMemberId
- userId
- status: pending, approved, hold, rejected
- comment
- decidedAt
- createdAt
- updatedAt

관계:

- Approval은 CompareRoom에 속한다.
- Approval은 CoupleMember와 User를 참조한다.
- Approval 변경은 DecisionLog에 기록한다.

주의사항:

- 둘 다 approved일 때만 CompareRoom이 both_approved가 된다.
- 보류 상태가 CompareRoom status에 어떻게 반영되는지 확정 필요.
- 댓글에는 민감정보를 입력하지 않도록 안내가 필요하다.

개인정보 여부:

- 커플 운영 정보 포함.
- comment에 개인정보나 민감 정보가 들어갈 수 있어 주의 필요.

버전 관리 필요 여부:

- 일반 버전 관리는 필요하지 않다.
- 상태 변경은 DecisionLog로 남긴다.

### 5.16 DecisionLog

역할:
사용자 또는 운영자가 중요한 상태 변경과 결정을 남기는 감사성 기록이다.

주요 필드:

- id
- coupleId
- actorUserId
- actorCoupleMemberId
- targetType
- targetId
- action
- beforeStatus
- afterStatus
- reason
- metadata
- createdAt

관계:

- DecisionLog는 Couple에 속할 수 있다.
- DecisionLog는 CompareRoom, Approval, LeadRequest, Document, Task, PolicyProgram, OfferPriceVersion 등 다양한 target을 참조할 수 있다.

주의사항:

- 로그는 수정하지 않는 append-only가 원칙이다.
- metadata에는 전화번호, 이름, 계좌, 파일명 등 직접 개인정보를 저장하지 않는다.
- 운영자 audit log와 DecisionLog를 통합할지 분리할지 확정 필요.

개인정보 여부:

- 원칙적으로 직접 개인정보 저장 금지.
- 행위자 ID와 결정 내용은 운영 정보다.

버전 관리 필요 여부:

- 버전 관리가 아니라 불변 로그로 보존한다.

### 5.17 Document

역할:
정책 신청, 상담, 커플 준비 과정에서 필요한 서류의 준비 상태와 선택적 첨부를 관리한다.

주요 필드:

- id
- coupleId
- title
- documentType
- status: needed, preparing, ready, attached, submitted, expired 등 확정 필요
- sourceType: policy, lead, manual 등 확정 필요
- sourceId
- ownerCoupleMemberId
- dueAt
- attachmentRef: 실제 업로드 도입 시 확정 필요
- attachmentProvider
- originalFileName: 저장 여부 신중히 검토
- createdAt
- updatedAt
- deletedAt

관계:

- Document는 하나의 Couple에 속한다.
- Document는 PolicyProgram, EligibilityResult, Task, LeadRequest와 연결될 수 있다.

주의사항:

- MVP는 민감 서류 원본 업로드를 강제하지 않는다.
- 파일명은 로그와 분석 이벤트에 남기지 않는다.
- 파일 접근 권한은 CoupleMember 기준으로 제한한다.
- 원본 파일 저장, 암호화, 보관 기간은 보안/법무 검토 필요.

개인정보 여부:

- 직접 개인정보와 민감정보가 포함될 수 있다.
- 업로드가 도입되면 최상위 보안 관리 대상이다.

버전 관리 필요 여부:

- 일반 버전 관리는 확정 필요.
- 첨부 파일 교체 이력과 접근 로그는 필요할 수 있다.

### 5.18 Task

역할:
커플이 준비해야 할 할 일이다. 정책 결과의 필요 서류, 상담 전 준비, 일반 결혼 준비 작업을 관리한다.

주요 필드:

- id
- coupleId
- title
- description
- status: todo, in_progress, done, canceled 등 확정 필요
- sourceType: policy_result, document, lead, manual 등 확정 필요
- sourceId
- assignedCoupleMemberId
- dueAt
- completedAt
- createdByUserId
- createdAt
- updatedAt

관계:

- Task는 하나의 Couple에 속한다.
- Task는 Document, EligibilityResult, LeadRequest와 연결될 수 있다.
- Task 상태 변경은 Notification과 EventLog의 근거가 될 수 있다.

주의사항:

- 담당자 지정은 CoupleMember 기준으로 한다.
- 정책 결과에서 자동 생성되는 Task와 사용자가 만든 Task를 구분한다.
- 마감일 알림 기준은 확정 필요.

개인정보 여부:

- 직접 개인정보는 보통 없음.
- 제목과 설명에 민감 정보가 들어갈 수 있어 안내가 필요하다.

버전 관리 필요 여부:

- 일반 버전 관리는 필요하지 않다.
- 상태 변경 이력은 필요할 수 있다.

### 5.19 Notification

역할:
사용자 또는 커플에게 필요한 알림을 저장하고 발송 상태를 관리한다.

주요 필드:

- id
- coupleId
- userId 또는 coupleMemberId
- type
- title
- body
- channel: in_app, email, sms, push 등 확정 필요
- status: pending, sent, failed, read, canceled 등 확정 필요
- scheduledAt
- sentAt
- readAt
- metadata
- createdAt

관계:

- Notification은 Couple, User, CoupleMember 중 알림 대상과 연결된다.
- Task, CompareRoom, Approval, LeadRequest 상태 변경에서 생성될 수 있다.

주의사항:

- 알림 본문에 민감 정보와 직접 개인정보를 넣지 않는다.
- 외부 채널 발송은 별도 동의와 수신 설정이 필요할 수 있다.
- 실패한 알림이 사용자 기능을 막으면 안 된다.

개인정보 여부:

- 대상자 식별자 포함.
- 본문과 metadata에는 민감 정보 저장 금지.

버전 관리 필요 여부:

- 일반 버전 관리는 필요하지 않다.
- 발송 상태 이력 보존 여부는 확정 필요.

### 5.20 Article

역할:
신혼 준비, 정책, 비용, 파트너 비교 등을 설명하는 콘텐츠다.

주요 필드:

- id
- title
- slug
- summary
- body
- category
- status: draft, published, archived 등 확정 필요
- seoTitle
- seoDescription
- ogImageUrl
- publishedAt
- authorUserId
- createdAt
- updatedAt

관계:

- Article은 작성자 User를 참조할 수 있다.
- Article은 PolicyProgram, Offer, Scenario 관련 CTA와 연결될 수 있다.

주의사항:

- 정책이나 금융성 내용을 확정적으로 표현하지 않는다.
- published 상태만 사용자에게 노출한다.
- 복잡한 에디터는 MVP 제외다.

개인정보 여부:

- 일반 콘텐츠에는 개인정보 없음.
- authorUserId는 내부 사용자 식별자다.

버전 관리 필요 여부:

- MVP에서는 필수 아님.
- 콘텐츠 수정 이력은 Beta 이후 검토 가능.

### 5.21 EventLog

역할:
제품 분석과 퍼널 확인을 위한 이벤트 기록이다.

주요 필드:

- id
- eventName
- userId
- coupleId
- anonymousId
- source
- payload
- occurredAt
- createdAt

관계:

- EventLog는 User 또는 Couple과 연결될 수 있다.
- Scenario, Policy, Offer, CompareRoom, LeadRequest 등 사용자 행동에서 생성될 수 있다.

주의사항:

- payload에 이름, 전화번호, 계좌, 파일명, 상세 소득, 상세 자산을 저장하지 않는다.
- 분석 이벤트 저장 실패가 사용자 기능을 막으면 안 된다.
- 이벤트 이름은 상수로 관리한다.

개인정보 여부:

- 원칙적으로 직접 개인정보 없음.
- userId, coupleId는 내부 식별자이므로 접근 제한이 필요하다.

버전 관리 필요 여부:

- 버전 관리가 아니라 append-only 로그로 보존한다.
- 이벤트 스키마 버전 필드 도입 여부는 확정 필요.

## 6. 추가 검토 후보 도메인

명령세트의 필수 도메인은 아니지만, 현재 사용자 플로우와 MVP 범위를 보면 아래 도메인이 필요할 가능성이 높다.

### CoupleInvitation

- 배우자 초대 링크, 만료 시간, 수락, 취소, 거절 상태를 관리한다.
- 초대 토큰은 안전하게 저장해야 한다.
- 필수 도메인으로 승격할지 확정 필요.

### Comment

- 비교방에서 커플이 의견을 남기는 기능을 담당한다.
- Approval comment와 분리할지 확정 필요.
- 민감 정보 입력 방지 안내가 필요하다.

### LeadStatusHistory

- LeadRequest의 상태 변경 이력을 관리한다.
- DecisionLog로 대체할지 별도 도메인으로 둘지 확정 필요.

### VendorBranch

- 파트너 지점이 있는 경우 지역, 주소, 상담 가능 범위를 관리한다.
- MVP에서 지점 단위가 필요한지 확정 필요.

### ContentBlock 또는 FAQ

- Article 내부의 구조화된 콘텐츠와 FAQ를 관리한다.
- 복잡한 에디터는 MVP 제외이므로 단순 구조부터 검토한다.

## 7. 확정 필요 사항

- User 가입 식별자: 이메일, 휴대폰, 소셜 로그인 중 MVP 기준
- 한 User의 다중 Couple 소속 허용 여부
- CoupleMember 역할명과 권한 범위
- 커플 이동, 탈퇴, 해산, 재참여 정책
- CoupleInvitation을 필수 도메인으로 추가할지 여부
- 보유 현금과 예산을 구간으로 저장할지 금액으로 저장할지
- 정책 결과 재계산 시 기존 결과 갱신 또는 새 결과 생성 기준
- 파트너 담당자 개인정보 저장 범위
- 리드 전달 시 파트너에게 제공할 최소 개인정보 범위
- LeadStatusHistory와 DecisionLog의 역할 분리 여부
- CompareRoom 승인 대상이 방 단위인지 카드 단위인지
- 가격 만료 시 상담 신청 차단 여부
- Document 원본 파일 업로드 도입 시점, 암호화, 보관 기간
- 운영자 audit log와 DecisionLog 통합 여부
- EventLog 스키마 버전 도입 여부
