# 신혼OS 파트너 상품 가격 스키마

## 1. 문서 목적

이 문서는 신혼OS MVP의 파트너 상품과 가격 버전 구조를 정의한다. 파트너 상품 API, 사용자 상품 목록·상세 화면, 가격 카드 컴포넌트, 비교방 가격 스냅샷은 이 문서를 기준으로 구현한다.

주의:

- 가격은 계약 확정이 아니라 상담 전 비교를 돕는 참고 정보다.
- 실제 결제, 예약 확정, 계약 체결 기능은 MVP 가격 API 범위가 아니다.
- "최저가", "무조건 가장 저렴", "계약 가능 확정"처럼 단정적인 문구를 쓰지 않는다.
- 유효기간이 지난 가격은 기본 목록과 기본 카드에 노출하지 않는다.
- 미검증 가격은 검증 가격과 반드시 다른 배지로 표시한다.

## 2. 모델 개요

파트너 가격 영역은 아래 모델로 나눈다.

| 모델                | 역할                                  | 현재 DB 테이블         |
| ------------------- | ------------------------------------- | ---------------------- |
| `Vendor`            | 파트너 업체 기본 정보                 | `vendors`              |
| `VendorBranch`      | 업체 지점, 상담 지역, 지점 연락 정보  | `vendor_branches`      |
| `Offer`             | 업체가 제공하는 상품 또는 상담 서비스 | `offers`               |
| `OfferPriceVersion` | 특정 시점의 가격, 옵션, 유효기간      | `offer_price_versions` |
| `CompareCard`       | 비교방에 담긴 가격 스냅샷             | `compare_cards`        |
| `LeadRequest`       | 상담 신청 시점의 상품·가격 참조       | `lead_requests`        |

원칙:

- 상품의 현재 가격은 `Offer`에 직접 저장하지 않고 `OfferPriceVersion`에서 버전 관리한다.
- 가격이 변경되면 기존 `OfferPriceVersion`을 덮어쓰지 않고 새 버전을 만든다.
- 비교방과 상담 신청은 사용자가 본 특정 `OfferPriceVersion`을 참조하거나 스냅샷으로 보존한다.

## 3. Vendor

파트너 업체의 공개 가능한 기본 정보다.

핵심 필드:

| 필드                  | 의미             | 사용자 노출 |
| --------------------- | ---------------- | ----------- |
| `id`                  | 업체 식별자      | 내부만      |
| `name`                | 업체명           | 노출        |
| `category`            | 대표 카테고리    | 노출        |
| `region`              | 대표 지역        | 노출        |
| `description`         | 업체 설명        | 노출 가능   |
| `status`              | 운영 상태        | 내부/필터   |
| `verificationStatus`  | 업체 검증 상태   | 배지 가능   |
| `verifiedAt`          | 업체 검증일      | 배지 가능   |
| `businessIdentifier*` | 사업자 식별 정보 | 사용자 금지 |
| `representative*`     | 담당자 개인정보  | 사용자 금지 |

상태값:

| status     | 의미           | 사용자 기본 노출 |
| ---------- | -------------- | ---------------- |
| `draft`    | 등록 중        | 금지             |
| `active`   | 노출 가능      | 가능             |
| `paused`   | 일시 중지      | 금지             |
| `archived` | 운영 종료/보관 | 금지             |

검증 상태:

| verificationStatus | 의미                  | 표시 방식        |
| ------------------ | --------------------- | ---------------- |
| `verified`         | 운영자가 검증 완료    | 검증 배지        |
| `unverified`       | 아직 검증 전          | 미검증 배지      |
| `needs_review`     | 정보 재확인 필요      | 확인 필요 배지   |
| `rejected`         | 노출 부적합 또는 반려 | 사용자 노출 금지 |

MVP에서는 파트너 셀프 가입을 다루지 않는다. 관리자 seed 또는 관리자 API로 업체를 등록한다.

## 4. VendorBranch

업체의 지점 또는 상담 가능 지역 단위다.

핵심 필드:

| 필드            | 의미                     | 사용자 노출 |
| --------------- | ------------------------ | ----------- |
| `vendorId`      | 소속 업체                | 내부만      |
| `name`          | 지점명                   | 노출 가능   |
| `region`        | 지점 또는 상담 가능 지역 | 노출        |
| `address`       | 주소                     | 노출 가능   |
| `contactPhone*` | 지점 연락처              | 사용자 금지 |
| `status`        | 지점 운영 상태           | 내부/필터   |

원칙:

- 사용자 화면에는 직접 연락처를 기본 노출하지 않는다.
- 상담 신청 전에는 신혼OS 내부 CTA를 우선 사용한다.
- 지점이 없는 업체는 `Offer.vendorBranchId = null`로 둘 수 있다.

## 5. Offer

상품 또는 상담 가능한 서비스의 기본 정보다. 가격이 아닌 설명과 분류를 가진다.

핵심 필드:

| 필드             | 의미           | 사용자 노출               |
| ---------------- | -------------- | ------------------------- |
| `vendorId`       | 제공 업체      | 업체명으로 노출           |
| `vendorBranchId` | 제공 지점      | 지점명/지역으로 노출 가능 |
| `title`          | 상품명         | 노출                      |
| `category`       | 상품 카테고리  | 필터/노출                 |
| `region`         | 상품 제공 지역 | 필터/노출                 |
| `summary`        | 짧은 요약      | 노출                      |
| `description`    | 상세 설명      | 노출 가능                 |
| `status`         | 상품 상태      | 내부/필터                 |
| `displayOrder`   | 목록 정렬      | 내부                      |

권장 카테고리:

| category              | 의미          |
| --------------------- | ------------- |
| `wedding_hall`        | 예식장        |
| `studio`              | 스튜디오      |
| `dress`               | 드레스        |
| `makeup`              | 메이크업      |
| `studio_dress_makeup` | 스드메 패키지 |
| `appliance`           | 가전          |
| `furniture`           | 가구          |
| `honeymoon`           | 허니문        |
| `moving`              | 이사/입주     |
| `etc`                 | 기타          |

상태값:

| status     | 의미                | 사용자 기본 노출    |
| ---------- | ------------------- | ------------------- |
| `draft`    | 등록 중             | 금지                |
| `active`   | 노출 가능           | 가능                |
| `paused`   | 일시 중지           | 금지                |
| `sold_out` | 상담 또는 판매 중지 | 금지 또는 별도 표시 |
| `archived` | 보관                | 금지                |

## 6. OfferPriceVersion

`Offer`의 특정 시점 가격과 옵션을 나타내는 버전이다.

핵심 필드:

| 필드                        | 의미                            | 필수 |
| --------------------------- | ------------------------------- | ---- |
| `offerId`                   | 소속 상품                       | 필수 |
| `version`                   | 상품별 가격 버전 번호           | 필수 |
| `basePrice`                 | 기본 가격                       | 필수 |
| `estimatedTotalPrice`       | 사실상 필수 옵션 포함 예상 총액 | 필수 |
| `includedItems`             | 기본 가격에 포함된 항목         | 필수 |
| `requiredOptions`           | 사실상 필수로 붙는 옵션         | 선택 |
| `optionalOptions`           | 사용자가 선택할 수 있는 옵션    | 선택 |
| `additionalCostNote`        | 추가 비용 가능성 안내           | 선택 |
| `cancellationPolicySummary` | 취소, 환불, 위약금 요약         | 선택 |
| `verificationStatus`        | 가격 검증 상태                  | 필수 |
| `verifiedAt`                | 가격 검증일                     | 선택 |
| `validFrom`                 | 가격 적용 시작일                | 선택 |
| `validUntil`                | 가격 유효 종료일                | 선택 |
| `sourceType`                | 출처 유형                       | 선택 |
| `sourceUrl`                 | 출처 URL                        | 선택 |

버전 규칙:

- 같은 `offerId` 안에서 `version`은 1부터 증가한다.
- 새 가격이 들어오면 이전 버전을 수정하지 않고 새 `OfferPriceVersion`을 만든다.
- 오탈자나 개인정보 제거 같은 비가격성 수정은 운영자 판단에 따라 현재 버전 수정이 가능하지만, 금액·옵션·유효기간 변경은 새 버전을 기본값으로 한다.
- 사용자 화면의 기본 가격은 `verificationStatus = verified`이고 `validUntil`이 없거나 현재 이후인 최신 버전만 사용한다.

## 7. 가격 JSON 구조

현재 DB는 포함 항목과 옵션을 JSON으로 저장한다. MVP 구현에서는 아래 구조를 우선 사용한다.

### 7.1 IncludedItem

`includedItems`는 기본 가격에 포함된 항목이다.

```json
[
  {
    "key": "studio_session",
    "label": "스튜디오 촬영",
    "description": "평일 촬영 기준",
    "quantity": 1,
    "unit": "회"
  }
]
```

필드:

| 필드          | 의미             | 필수 |
| ------------- | ---------------- | ---- |
| `key`         | 안정적인 내부 키 | 필수 |
| `label`       | 사용자 표시명    | 필수 |
| `description` | 조건 또는 설명   | 선택 |
| `quantity`    | 수량             | 선택 |
| `unit`        | 단위             | 선택 |

### 7.2 RequiredOption

`requiredOptions`는 사용자가 사실상 함께 부담해야 하는 옵션이다. 예식장 대관 필수 보증 인원, 주말 필수 추가금, 필수 헬퍼비처럼 총액 판단에 필요한 항목을 넣는다.

```json
[
  {
    "key": "weekend_fee",
    "label": "주말 추가 비용",
    "amount": 300000,
    "pricingType": "fixed",
    "includedInEstimatedTotal": true,
    "note": "토요일 기준"
  }
]
```

필드:

| 필드                       | 의미                               | 필수 |
| -------------------------- | ---------------------------------- | ---- |
| `key`                      | 안정적인 내부 키                   | 필수 |
| `label`                    | 사용자 표시명                      | 필수 |
| `amount`                   | 원화 정수 금액. 미정이면 생략      | 선택 |
| `pricingType`              | `fixed`, `range`, `quote_required` | 필수 |
| `minAmount`                | 범위형 최소 금액                   | 선택 |
| `maxAmount`                | 범위형 최대 금액                   | 선택 |
| `includedInEstimatedTotal` | 예상 총액에 반영했는지 여부        | 필수 |
| `appliesWhen`              | 적용 조건                          | 선택 |
| `note`                     | 추가 설명                          | 선택 |

### 7.3 OptionalOption

`optionalOptions`는 선택형 업그레이드 또는 추가 구성이다. 예상 총액에는 기본 반영하지 않는다.

```json
[
  {
    "key": "album_upgrade",
    "label": "앨범 업그레이드",
    "amount": 250000,
    "pricingType": "fixed",
    "note": "선택 시 추가"
  }
]
```

필드 구조는 `RequiredOption`과 같지만 `includedInEstimatedTotal`은 기본 `false`다.

### 7.4 CancellationPolicy

현재 DB에는 `cancellationPolicySummary` 문자열만 있다. MVP 화면은 요약 문자열을 사용하고, 이후 필요하면 JSON 필드로 분리한다.

권장 문구:

- "계약 전 상담 단계에서는 취소 수수료가 발생하지 않습니다."
- "예약금 입금 후 취소 규정은 업체 약관 확인이 필요합니다."
- "날짜 변경과 취소 가능 기간은 상담 시 확인해 주세요."

금지 문구:

- "취소 수수료 없음 확정"
- "언제든 전액 환불"
- 확인되지 않은 위약금 수치

## 8. 예상 총액 계산 기준

`estimatedTotalPrice`는 사용자가 가격을 비교할 때 볼 대표 총액이다.

기본 계산:

```text
estimatedTotalPrice =
  basePrice
  + requiredOptions 중 includedInEstimatedTotal = true이고 amount가 확정된 항목의 합
```

원칙:

- `basePrice`는 상품의 가장 기본 구성을 나타낸다.
- 사실상 필수 옵션은 `requiredOptions`에 분리하고, 예상 총액에 반영했는지 명시한다.
- 금액이 범위형이면 보수적으로 `maxAmount`를 반영하거나, `estimatedTotalPrice`와 함께 추가 비용 가능성 문구를 표시한다.
- `quote_required` 옵션은 예상 총액에 자동 합산하지 않는다.
- 선택 옵션은 사용자가 선택하기 전 예상 총액에 넣지 않는다.
- 세금, 봉사료, 출장비, 주말비처럼 변동 가능성이 있으면 `additionalCostNote`에 남긴다.

검증:

- `estimatedTotalPrice`는 `basePrice`보다 작을 수 없다.
- 음수 가격은 허용하지 않는다.
- 가격 단위는 원화 정수다.
- "최저가" 비교를 위한 필드는 만들지 않는다.

## 9. VerificationStatus

가격 검증 상태는 사용자 신뢰 표시와 기본 노출 조건을 결정한다.

| verificationStatus | 의미                                    | 기본 목록 노출         | 배지      |
| ------------------ | --------------------------------------- | ---------------------- | --------- |
| `verified`         | 운영자가 출처와 유효기간 확인           | 가능                   | 검증됨    |
| `unverified`       | 파트너 또는 운영자가 입력했지만 검증 전 | 기본 제외 또는 별도 탭 | 미검증    |
| `needs_review`     | 정보가 오래되었거나 재확인 필요         | 기본 제외              | 확인 필요 |
| `expired`          | 유효기간 지남                           | 제외                   | 만료      |
| `rejected`         | 노출 부적합                             | 제외                   | 내부만    |

검증 기준:

- `verified` 가격은 `verifiedAt`을 가진다.
- `sourceUrl` 또는 `sourceType` 중 하나 이상이 있어야 한다.
- `validUntil`이 지난 가격은 기본 목록에서 제외한다.
- 유효기간이 없는 가격은 노출 가능하지만, 화면에 "유효기간 미기록"을 표시한다.

## 10. 가격 카드 표시 방식

가격 카드는 사용자가 상품을 비교하고 상담 신청으로 넘어가는 기본 단위다.

필수 표시:

1. 업체명
2. 상품명
3. 기본 가격
4. 예상 총액
5. 포함 항목
6. 사실상 필수 옵션
7. 선택 옵션
8. 검증일
9. 유효기간
10. 추가 비용 가능성
11. 상담 신청 CTA

권장 배치:

- 상단: 업체명, 상품명, 카테고리, 지역
- 가격 영역: 기본 가격과 예상 총액을 나란히 표시
- 세부 영역: 포함 항목, 필수 옵션, 선택 옵션을 구분
- 신뢰 영역: 출처, 검증일, 유효기간, 미검증/만료 배지
- 하단 CTA: "상담 신청" 또는 "비교함에 담기"

문구 원칙:

- "예상 총액", "상담 전 확인 필요", "유효기간 기준"처럼 참고 성격을 드러낸다.
- "최저가", "확정가", "계약 가능", "예약 확정"은 쓰지 않는다.
- 유효기간이 얼마 남지 않은 경우 "유효기간 확인 필요" 배지를 붙인다.
- 미검증 가격은 가격보다 검증 상태가 먼저 보이게 한다.

## 11. 목록과 필터

상품 목록 기본 필터:

| 필터          | 의미                          |
| ------------- | ----------------------------- |
| `category`    | 상품 카테고리                 |
| `region`      | 제공 지역                     |
| `budgetRange` | 예상 총액 기준 구간           |
| `vendorId`    | 특정 업체                     |
| `validOnly`   | 유효 가격만 조회. 기본 `true` |

기본 정렬:

1. `Offer.displayOrder` 오름차순
2. 최신 검증 가격 우선
3. `Offer.createdAt` 최신순

주의:

- `budgetRange`는 사용자가 보기 위한 필터일 뿐, 추천이나 적합 판정이 아니다.
- 유효 가격이 없는 상품은 기본 목록에서 제외하거나 "가격 확인 필요" 상태로 별도 노출한다.
- `unverified` 가격은 기본 목록에서 제외하고, 운영자 또는 별도 확인 탭에서만 다룬다.

## 12. 비교방 가격 스냅샷

비교방은 가격 변경 이후에도 사용자가 비교하던 당시 정보를 재현해야 한다.

`CompareCard`는 아래를 가진다.

- `offerId`
- `offerPriceVersionId`
- `snapshotTitle`
- `snapshotPriceSummary`
- `snapshotIncludedItems`
- `snapshotRequiredOptions`
- `snapshotOptionalOptions`

스냅샷 원칙:

- 비교방에 담을 때 현재 표시된 가격 정보를 복사한다.
- 가격 버전이 바뀌어도 기존 비교 카드의 스냅샷은 바꾸지 않는다.
- 최신 가격이 생기면 사용자에게 "새 가격 확인" CTA를 별도로 제공한다.
- 삭제 또는 비활성화된 상품도 과거 비교방에서는 최소 정보가 유지되어야 한다.

`snapshotPriceSummary` 권장 구조:

```json
{
  "basePrice": 1500000,
  "estimatedTotalPrice": 1900000,
  "currency": "KRW",
  "verificationStatus": "verified",
  "verifiedAt": "2026-06-05T00:00:00.000Z",
  "validUntil": "2026-09-05T00:00:00.000Z"
}
```

## 13. 상담 신청 연결

상담 신청은 계약이 아니라 문의 또는 견적 확인 요청이다.

`LeadRequest`는 다음 가격 맥락을 참조할 수 있다.

- `vendorId`
- `offerId`
- `offerPriceVersionId`
- `compareRoomId`
- `compareCardId`

원칙:

- 상담 신청 CTA 문구는 "상담 신청", "견적 확인 요청"으로 제한한다.
- 결제, 예약금, 계약 확정, 자동 계약 생성은 하지 않는다.
- 유효기간이 지난 가격에서 상담 신청을 누르면 최신 가격 확인 안내를 먼저 보여준다.
- 파트너에게 전달할 개인정보 범위는 별도 리드 생성 단계에서 최소화한다.

## 14. 관리자 입력 흐름

기본 흐름:

1. `Vendor`를 `draft`로 생성한다.
2. 업체 검증 후 `verificationStatus = verified`, `status = active`로 변경한다.
3. 필요하면 `VendorBranch`를 만든다.
4. `Offer`를 `draft`로 생성한다.
5. 첫 `OfferPriceVersion`을 `version = 1`로 생성한다.
6. 가격 출처, 검증일, 유효기간, 포함 항목, 필수 옵션, 선택 옵션을 입력한다.
7. 검증 완료 후 `Offer.status = active`, `OfferPriceVersion.verificationStatus = verified`로 노출한다.

가격 변경 흐름:

1. 기존 가격 버전은 유지한다.
2. 새 `OfferPriceVersion`을 `version + 1`로 생성한다.
3. 새 버전의 `validFrom`, `validUntil`, `verifiedAt`을 저장한다.
4. 목록과 상세는 최신 유효 검증 버전을 사용한다.
5. 기존 비교방 스냅샷은 변경하지 않는다.

## 15. 16단계 구현 상태

현재 구현된 범위:

- Vendor, VendorBranch, Offer, OfferPriceVersion API
- 상품 목록·상세 화면
- 가격 카드에 기본 가격과 예상 총액 동시 표시
- 포함 항목, 사실상 필수 옵션, 선택 옵션 분리 표시
- `verifiedAt`, `validUntil`, `verificationStatus` 배지 표시
- 유효기간 지난 가격 기본 노출 제외
- 미검증 가격 배지 구분
- 가격 버전 생성 시 기존 버전 유지
- 비교방에 상품을 담는 흐름
- 둘 다 승인된 비교방에서 상담 신청 생성
- 상담 신청 전 개인정보 제공 동의와 전송 전 확인 화면
- 리드 상태 변경과 LeadStatusHistory 기록
- 관리자 seed에 검증 가격과 미검증 가격 샘플 포함
- 단위 테스트: 예상 총액, 만료 필터, 최신 버전 선택, 미검증 배지

아직 다음 단계로 남긴 범위:

- 파트너 전용 입력/수정 화면
- 실제 파트너 계정 권한 체계
- 실제 결제, 예약 확정, 계약 생성은 계속 제외

## 16. MVP 제외

이번 가격 스키마와 다음 API 구현에서 제외한다.

- 실제 결제
- 예약금 결제
- 계약서 생성
- 자동 예약 확정
- 최저가 보장
- 파트너 직접 정산
- 외부 결제사 연동
- 파트너에게 직접 연락처 공개

위 항목은 상담 신청, 파트너 운영 정책, 법무·개인정보 검토 후 별도 단계에서 다룬다.
