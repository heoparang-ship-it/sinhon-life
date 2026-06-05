# 신혼생활 시나리오 계산 규칙

## 1. 문서 목적

이 문서는 신혼생활 MVP의 시나리오 생성과 계산 규칙을 정의한다. 다음 단계의 Scenario API, 계산 서비스, 결과 화면, 테스트는 이 문서를 기준으로 구현한다.

주의:

- 시나리오 계산은 예산 정리를 돕는 예상 계산이다.
- 금융 심사, 대출 한도, 정책 선정, 계약 가능성을 판단하지 않는다.
- 실제 금리, 정책 수치, 파트너 실제 가격을 하드코딩하지 않는다.
- MVP는 사용자 입력값, 샘플값, 운영자 입력 기본값만 사용한다.
- 출처 없는 숫자 또는 임시 숫자는 반드시 `sample`로 표시한다.

## 2. 계산 버전

MVP 기본 계산 버전은 `scenario-engine-v1`이다.

버전 원칙:

- `scenarios.calculation_version`에 계산 버전을 저장한다.
- `scenarios.input_snapshot`에 계산 당시 입력값과 사용한 기본값 출처를 저장한다.
- 계산 규칙이 바뀌면 기존 Scenario를 덮어쓰지 않고 재계산 결과를 새 버전으로 저장하거나 명시적으로 재계산한다.
- 과거 결과는 당시 `calculationVersion`, `inputSnapshot`, `ScenarioItem`으로 재현 가능해야 한다.

## 3. 시나리오 입력값

### 3.1 기본 입력

- `title`: 사용자가 구분할 수 있는 시나리오 이름
- `coupleId`: 커플 식별자
- `useOnboardingDefaults`: 온보딩 값을 기본값으로 불러올지 여부
- `items`: 사용자가 추가하거나 수정한 비용 항목
- `budgetBasis`: 부족 금액 계산에 사용할 기준
- `note`: 사용자 메모. MVP에서는 선택값

### 3.2 온보딩에서 가져올 수 있는 값

온보딩 값은 계산의 초기 맥락으로만 사용한다.

- `weddingDate`
- `weddingRegion`
- `preferredResidenceRegion`
- `housingType`
- `totalBudgetRange`
- `cashOnHandRange`
- `familySupportType`
- `loanConsiderationStatus`
- `childrenPlanStatus`
- `preferredWeddingStyle`
- `moveInPlanAt`

주의:

- `totalBudgetRange`, `cashOnHandRange`, 소득 구간, 자산 구간은 정확한 금액으로 변환하지 않는다.
- 구간값만 있을 때는 `shortfallAmount`를 확정 계산하지 않는다.
- 구간값 기반 안내는 "예산 구간 기준으로 점검 필요" 수준으로 제한한다.

### 3.3 비용 항목 입력

ScenarioItem 후보 입력:

```json
{
  "category": "wedding",
  "label": "예식장 예상 비용",
  "amount": 12000000,
  "amountType": "user_input",
  "frequency": "one_time",
  "isRequired": true,
  "sourceType": "user",
  "sourceUrl": null,
  "note": "견적서 기준",
  "sortOrder": 10
}
```

필드 규칙:

- `amount`는 원화 정수다.
- `amount`는 0 이상이어야 한다.
- `amountType`은 `user_input`, `sample`, `admin_default`, `partner_price_snapshot` 중 하나를 우선 사용한다.
- `frequency`는 `one_time`, `monthly` 중 하나를 `inputSnapshot`에 저장한다. 현재 DB의 `scenario_items`에는 별도 컬럼이 없으므로 구현 시 `inputSnapshot.items[]`에 보존한다.
- `sourceUrl`이 없는 운영자 기본값이나 임시값은 사용자 화면에서 sample 표시한다.
- 사용자가 직접 입력한 금액은 `user_input`으로 표시한다.

## 4. 계산 항목

MVP에서 계산하는 큰 항목은 아래로 제한한다.

| category          | 의미           | 기본 frequency | 예시                         |
| ----------------- | -------------- | -------------- | ---------------------------- |
| `wedding`         | 예식 관련 비용 | `one_time`     | 예식장, 스드메, 예복, 예물   |
| `housing_initial` | 주거 초기 비용 | `one_time`     | 보증금, 계약금, 이사비       |
| `housing_monthly` | 월 주거 부담   | `monthly`      | 월세, 관리비, 월 고정 주거비 |
| `furniture`       | 가구           | `one_time`     | 침대, 소파, 식탁             |
| `appliance`       | 가전           | `one_time`     | 냉장고, 세탁기, TV           |
| `honeymoon`       | 허니문         | `one_time`     | 항공, 숙박, 현지 비용        |
| `living_setup`    | 입주 준비      | `one_time`     | 생활용품, 청소, 설치         |
| `misc`            | 기타           | `one_time`     | 예비비, 미분류 비용          |

주의:

- 대출 이자, 금리, 한도는 MVP 계산 항목에 포함하지 않는다.
- 정책 지원금은 정책 룰 엔진 단계 전까지 자동 차감하지 않는다.
- 파트너 가격은 가격 버전 구조가 구현된 뒤 `partner_price_snapshot`으로만 반영한다.

## 5. 계산식

### 5.1 일회성 총액

`oneTimeTotalAmount`는 `frequency = one_time`인 항목의 합계다.

```text
oneTimeTotalAmount =
  wedding
  + housing_initial
  + furniture
  + appliance
  + honeymoon
  + living_setup
  + misc
```

저장:

- `scenarios.total_amount`에 `oneTimeTotalAmount`를 저장한다.
- 화면에는 "예상 총액"으로 표시한다.

### 5.2 월 부담액

`monthlyAmount`는 `frequency = monthly`인 항목의 합계다.

```text
monthlyAmount =
  housing_monthly
  + other monthly items
```

저장:

- `scenarios.monthly_amount`에 `monthlyAmount`를 저장한다.
- 화면에는 "월 예상 부담"으로 표시한다.

주의:

- 소득 구간만으로 월 부담 적정성을 단정하지 않는다.
- 대출 상환액은 사용자가 직접 월 상환 예상액을 입력한 경우에만 `monthly` 항목으로 다룬다.
- 금리 기반 상환액 자동 산정은 MVP에서 제외한다.

### 5.3 부족 금액

`shortfallAmount`는 명시적인 예산 기준이 있을 때만 계산한다.

계산 가능 조건:

- 사용자가 시나리오 안에서 정확한 예산 기준을 직접 입력했다.
- 또는 운영자가 제공한 검증된 예산 기준 값이 있고 출처가 저장되어 있다.

계산식:

```text
shortfallAmount = max(oneTimeTotalAmount - availableBudgetAmount, 0)
```

저장:

- 계산 가능하면 `scenarios.shortfall_amount`에 저장한다.
- 계산할 수 없으면 `null`로 둔다.

주의:

- 온보딩의 `totalBudgetRange`, `cashOnHandRange`만으로 부족 금액을 계산하지 않는다.
- 구간값만 있을 때는 위험 신호에 `budget_range_only`를 넣고, 화면에는 "정확한 부족 금액은 예산 기준 입력 후 계산됩니다."처럼 표시한다.

## 6. 샘플값과 출처 규칙

### 6.1 amountType

- `user_input`: 사용자가 직접 입력한 금액
- `sample`: 출처 없는 예시값, 임시 기본값, 데모용 값
- `admin_default`: 운영자가 입력한 기본값. 출처가 없으면 화면에서는 sample 성격을 함께 표시한다.
- `partner_price_snapshot`: 특정 파트너 가격 버전에서 가져온 금액

### 6.2 containsSampleValue

아래 중 하나라도 해당하면 `scenarios.contains_sample_value = true`로 저장한다.

- `amountType = sample`인 항목이 있다.
- 출처 없는 `admin_default` 항목이 있다.
- 온보딩 구간을 바탕으로 추천 항목을 채웠다.
- 데모 또는 테스트용 기본값을 사용했다.

사용자 화면:

- 결과 상단 또는 항목 배지에 "샘플 포함"을 표시한다.
- 샘플 포함 결과를 확정 견적처럼 표현하지 않는다.

## 7. 위험 신호 기준

`riskFlags`는 사용자에게 확인이 필요한 상태를 알려주는 보조 정보다. 위험 신호는 금융 판단이 아니며, 승인·가능·불가능을 뜻하지 않는다.

권장 키:

| key                            | 조건                         | 사용자 표시 방향                        |
| ------------------------------ | ---------------------------- | --------------------------------------- |
| `sample_value_used`            | sample 값이 하나 이상 포함됨 | 샘플 항목을 실제 견적으로 바꿔야 함     |
| `budget_range_only`            | 예산 또는 현금이 구간값뿐임  | 정확한 부족 금액 계산 전 예산 기준 필요 |
| `shortfall_present`            | `shortfallAmount > 0`        | 예상 총액이 입력한 예산 기준보다 큼     |
| `missing_required_item`        | 필수 항목 금액이 비어 있음   | 필수 항목 입력 필요                     |
| `monthly_amount_present`       | 월 부담 항목이 있음          | 월 고정 지출을 별도 확인                |
| `loan_considered_needs_review` | 온보딩에서 대출 고려 상태임  | 금융 상담이나 공식 조건 확인 필요       |
| `partner_price_snapshot_used`  | 파트너 가격 스냅샷 포함      | 가격 유효기간 확인 필요                 |

금지:

- 소득 구간을 근거로 "감당 가능", "대출 가능", "위험 확정"처럼 표현하지 않는다.
- 특정 금리나 한도를 가정해 위험 신호를 만들지 않는다.
- 정책 지원 가능성을 시나리오 엔진에서 판정하지 않는다.

## 8. 결과 저장 구조

### 8.1 Scenario

저장 필드:

- `title`
- `status`: `draft`, `completed`, `archived`
- `calculationVersion`: `scenario-engine-v1`
- `inputSnapshot`: 계산 입력과 보조 메타데이터
- `totalAmount`
- `monthlyAmount`
- `shortfallAmount`
- `riskFlags`
- `containsSampleValue`
- `createdByUserId`

`inputSnapshot` 예시:

```json
{
  "calculationVersion": "scenario-engine-v1",
  "budgetBasis": {
    "type": "range_only",
    "totalBudgetRange": "100m_200m",
    "cashOnHandRange": "50m_100m"
  },
  "onboardingContext": {
    "weddingRegion": "서울",
    "housingType": "rental_jeonse",
    "preferredWeddingStyle": "small"
  },
  "items": [
    {
      "category": "wedding",
      "label": "예식장 예상 비용",
      "amount": 12000000,
      "amountType": "user_input",
      "frequency": "one_time",
      "isRequired": true,
      "sourceType": "user"
    }
  ]
}
```

### 8.2 ScenarioItem

저장 필드:

- `scenarioId`
- `category`
- `label`
- `amount`
- `amountType`
- `isRequired`
- `sourceType`
- `sourceUrl`
- `note`
- `sortOrder`

주의:

- `ScenarioItem`은 결과 화면의 항목 카드와 재계산의 근거다.
- `frequency`는 현재 DB 컬럼이 없으므로 `inputSnapshot.items[]`에 반드시 보존한다.
- 향후 월 부담 항목 편집이 많아지면 `frequency` 컬럼 추가를 검토한다.

## 9. 화면 표시 원칙

결과 화면에 반드시 표시할 값:

- 예상 총액
- 월 예상 부담
- 부족 금액 또는 부족 금액 계산 불가 사유
- 위험 신호
- 다음 행동
- 샘플 포함 여부
- 계산 버전

권장 문구:

- "예상 총액"
- "월 예상 부담"
- "샘플 항목이 포함되어 있어 실제 견적과 다를 수 있습니다."
- "정확한 부족 금액은 예산 기준을 입력하면 계산됩니다."
- "대출이나 정책 가능 여부는 공식 조건 확인이 필요합니다."

금지 문구:

- "대출 가능"
- "정책 선정 가능"
- "승인 확정"
- "무조건 가능"
- "최저가 보장"
- "이 금액이면 충분합니다"

## 10. 다음 행동 추천 규칙

`nextActions`는 화면 전용 파생값으로 시작한다. DB 필드가 필요해지면 별도 설계한다.

예시:

- 샘플값이 있으면 "샘플 항목을 실제 견적으로 바꾸기"
- 필수 항목이 비어 있으면 "비어 있는 필수 항목 채우기"
- 부족 금액을 계산할 수 없으면 "예산 기준 입력하기"
- 월 부담 항목이 있으면 "월 고정 지출 따로 확인하기"
- 대출 고려 상태이면 "공식 금융 조건 또는 상담 자료 확인하기"
- 파트너 가격 스냅샷이 있으면 "가격 유효기간 확인하기"

주의:

- 다음 행동은 안내일 뿐이며 승인, 심사, 계약 유도를 단정하지 않는다.

## 11. Validation 규칙

입력 검증:

- `title`: 1자 이상 80자 이하
- `items`: 최소 1개 이상
- `category`: 허용 목록 중 하나
- `label`: 1자 이상 80자 이하
- `amount`: 0 이상의 원화 정수
- `amountType`: 허용 목록 중 하나
- `frequency`: `one_time` 또는 `monthly`
- `sourceUrl`: URL 형식. 없을 수 있음
- `note`: 500자 이하

상태 검증:

- 온보딩이 최소 `in_progress` 상태여야 시나리오 생성을 허용한다.
- 커플 멤버만 해당 커플 시나리오를 생성, 조회, 수정할 수 있다.
- `archived` 상태는 기본 목록에서 제외한다.
- 재계산은 입력 변경 또는 계산 버전 변경이 있을 때만 수행한다.

## 12. 테스트 기준

단위 테스트:

- 일회성 총액 합산
- 월 부담 합산
- 부족 금액 계산 가능 조건
- 구간값만 있을 때 `shortfallAmount = null`
- sample 포함 시 `containsSampleValue = true`
- 위험 신호 생성
- 음수 금액 validation 거절
- 금리, 정책 수치 없이 계산되는지 확인

API/E2E 테스트:

- 온보딩 완료 전 시나리오 생성 제한
- 커플 멤버 권한 확인
- 시나리오 생성 후 `Scenario`와 `ScenarioItem` 저장
- 목록, 상세, 재계산, 보관 흐름
- sample 배지와 위험 신호가 응답에 포함되는지 확인

## 13. 아직 확정하지 않을 항목

- 실제 금리 또는 대출 상환액 자동 계산
- 정책 지원금 자동 차감
- 정책 자격 가능성 판단
- 파트너 실제 가격 자동 반영
- 가격 만료와 재검증 운영 규칙
- 예산 구간을 정확한 금액으로 환산하는 규칙
- 소득 대비 월 부담 적정성 판정
- 결제, 예약금, 정산

위 항목은 이후 정책 룰 엔진, 파트너 가격 버전, 리드/상담 흐름 문서에서 별도로 다룬다.
