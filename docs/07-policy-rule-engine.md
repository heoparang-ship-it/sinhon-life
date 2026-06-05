# 신혼OS 정책 룰 엔진

## 1. 문서 목적

이 문서는 신혼OS MVP의 정책·혜택 매칭 룰 엔진 기준을 정의한다. 13-B 구현에서는 Policy API, 관리자 정책 등록 기본 구조, 사용자 정책 결과 화면, 필요 서류 체크리스트, 테스트가 이 기준에 맞춰 추가되었다.

주의:

- 정책 결과는 가능성 안내이며 최종 선정, 승인, 지급 확정이 아니다.
- 외부 정책 API를 연동하지 않는다.
- 실제 정책 수치와 조건을 임의로 만들지 않는다.
- 샘플 정책과 샘플 룰은 반드시 `sample`로 표시한다.
- 주민등록번호, 계좌번호, 민감 서류 원본은 룰 입력값으로 받지 않는다.

## 2. 핵심 도메인

### 2.1 PolicyProgram

정책 또는 혜택 프로그램의 기본 정보다.

필수 역할:

- 사용자에게 보일 정책명, 제공기관, 지역, 카테고리, 요약을 저장한다.
- 출처 URL, 출처 기준일, 내부 검증일을 가진다.
- 신청 시작일과 종료일이 있으면 상태 판단에 사용한다.
- 최신 자격 조건은 직접 들고 있지 않고 `PolicyRuleVersion`으로 분리한다.

상태값:

- `draft`: 운영자가 작성 중
- `active`: 사용자에게 노출 가능
- `expired`: 신청 기간 또는 유효 기간이 지남
- `hidden`: 운영자가 숨김
- `retired`: 더 이상 운영하지 않음

### 2.2 PolicyRuleVersion

특정 시점의 자격 판단 규칙이다.

필수 역할:

- `policyProgramId`와 `version`으로 특정 정책의 룰 버전을 구분한다.
- `eligibilityCriteria`에 판단 조건을 저장한다.
- `requiredInputs`에 필요한 사용자 입력값을 저장한다.
- `resultReasonTemplate`에 결과 사유 템플릿을 저장한다.
- `requiredDocuments`에 결과 화면과 할 일 생성에 사용할 서류 목록을 저장한다.
- 출처 URL, 출처 기준일, 내부 검증일을 가진다.

상태값:

- `draft`: 운영자가 작성 중
- `active`: 정책 매칭에 사용
- `retired`: 새 결과 생성에는 사용하지 않음
- `sample`: 데모 또는 검증용 샘플 룰

원칙:

- 한 정책에 활성 룰은 1개만 두는 것을 MVP 기본값으로 한다.
- 룰 수정은 기존 row 업데이트가 아니라 새 `version` 생성이 기본이다.
- 기존 EligibilityResult는 과거 룰 버전을 계속 참조한다.

### 2.3 EligibilityResult

커플 입력값을 특정 정책 룰 버전에 적용한 결과다.

필수 역할:

- `coupleId`, `policyProgramId`, `policyRuleVersionId`를 함께 저장한다.
- 결과 상태, 결과 사유, 부족 입력값, 필요 서류, 입력 스냅샷을 저장한다.
- 결과 생성 시점과 만료 시점을 저장한다.
- 재계산 시 새 row 생성을 기본으로 한다.

## 3. 결과 상태값

정책 결과 상태값은 아래 6개만 사용한다.

| status            | 의미                                                  | 사용자 표시 방향                        |
| ----------------- | ----------------------------------------------------- | --------------------------------------- |
| `likely_eligible` | 현재 입력과 룰 기준으로 조건에 대체로 맞음            | "조건에 맞을 가능성이 있습니다"         |
| `maybe_eligible`  | 일부 조건은 맞지만 불확실한 입력이나 추가 확인이 있음 | "추가 확인이 필요합니다"                |
| `not_eligible`    | 현재 입력과 룰 기준으로 명확히 맞지 않음              | "현재 입력 기준으로는 맞지 않습니다"    |
| `need_more_info`  | 필수 입력이 부족해 판단할 수 없음                     | "정보를 더 입력해야 확인할 수 있습니다" |
| `expired`         | 정책 또는 룰의 신청 기간·유효 기간이 지남             | "현재는 신청 기간이 지났습니다"         |
| `unknown`         | 룰 구조, 출처, 검증 상태 문제로 판단 보류             | "확인할 수 없습니다"                    |

금지:

- `eligible`
- `approved`
- `confirmed`
- `guaranteed`
- `loan_available`
- `selected`

## 4. 입력값 구조

### 4.1 기본 입력 출처

MVP 정책 매칭은 아래 입력만 사용한다.

- 온보딩 커플 공통 입력
- 온보딩 개인별 구간 입력
- 정책 매칭 화면의 추가 입력
- 운영자가 만든 샘플 입력

사용 가능한 입력 키 후보:

| key                        | 출처           | 예시                           | 주의                        |
| -------------------------- | -------------- | ------------------------------ | --------------------------- |
| `lifecycleStatus`          | Couple         | `preparing`, `married`         | 혼인 상태 증빙 아님         |
| `weddingDate`              | Couple         | `2027-05-15`                   | 날짜 기반 범위 판단 가능    |
| `weddingRegion`            | Couple         | `서울`                         | 정책 지역과 다를 수 있음    |
| `preferredResidenceRegion` | Couple         | `서울`                         | 거주 희망지                 |
| `housingType`              | Couple         | `rental_jeonse`                | 실제 계약 상태 아님         |
| `totalBudgetRange`         | Couple         | `100m_200m`                    | 정확한 금액으로 환산 금지   |
| `cashOnHandRange`          | Couple         | `50m_100m`                     | 정확한 현금액으로 환산 금지 |
| `familySupportType`        | Couple         | `possible`                     | 증빙된 지원금 아님          |
| `loanConsiderationStatus`  | Couple         | `considering`                  | 대출 가능 여부 아님         |
| `childrenPlanStatus`       | Couple         | `undecided`                    | 민감 가능 정보              |
| `incomeRange`              | CoupleMember   | `50m_100m`                     | 공개 범위 확인 필요         |
| `assetRange`               | CoupleMember   | `50m_100m`                     | 공개 범위 확인 필요         |
| `workRegion`               | CoupleMember   | `서울`                         | 직장 증빙 아님              |
| `additionalInputs`         | 정책 매칭 화면 | `{ "hasLeaseContract": true }` | 주민등록번호 금지           |

### 4.2 EligibilityInput

룰 엔진 내부 입력은 아래 형태로 정규화한다.

```json
{
  "couple": {
    "lifecycleStatus": "preparing",
    "weddingDate": "2027-05-15",
    "preferredResidenceRegion": "서울",
    "housingType": "rental_jeonse",
    "totalBudgetRange": "100m_200m",
    "cashOnHandRange": "50m_100m"
  },
  "members": [
    {
      "role": "owner",
      "incomeRange": "50m_100m",
      "assetRange": "50m_100m",
      "workRegion": "서울"
    }
  ],
  "additionalInputs": {
    "hasLeaseContract": true
  }
}
```

저장 원칙:

- `EligibilityResult.inputSnapshot`에는 판단에 실제 사용한 값만 저장한다.
- 직접 개인정보는 저장하지 않는다.
- 소득, 자산, 예산, 현금은 구간값 그대로 저장한다.
- 누가 어떤 추가 입력을 넣었는지는 MVP에서는 저장하지 않고, 필요하면 `DecisionLog`로 확장한다.

## 5. 룰 구조

### 5.1 eligibilityCriteria

`PolicyRuleVersion.eligibilityCriteria`는 JSON으로 저장한다.

MVP 룰 연산자:

| operator       | 의미                               | 예시                 |
| -------------- | ---------------------------------- | -------------------- |
| `in`           | 입력값이 허용 목록에 포함됨        | 지역, 주거 유형      |
| `not_in`       | 입력값이 제외 목록에 포함되지 않음 | 제외 상태            |
| `exists`       | 입력값이 비어 있지 않음            | 계약서 여부          |
| `date_between` | 날짜가 범위 안에 있음              | 혼인일, 신청일       |
| `range_in`     | 구간 enum이 허용 목록에 포함됨     | 소득 구간, 예산 구간 |
| `equals`       | 입력값이 특정 값과 같음            | boolean 추가 입력    |

예시:

```json
{
  "mode": "all",
  "conditions": [
    {
      "inputKey": "couple.preferredResidenceRegion",
      "operator": "in",
      "values": ["서울"]
    },
    {
      "inputKey": "couple.housingType",
      "operator": "in",
      "values": ["rental_jeonse", "monthly_rent"]
    },
    {
      "inputKey": "couple.totalBudgetRange",
      "operator": "range_in",
      "values": ["under_100m", "100m_200m", "200m_300m"]
    },
    {
      "inputKey": "additionalInputs.hasLeaseContract",
      "operator": "equals",
      "value": true
    }
  ]
}
```

### 5.2 mode

- `all`: 모든 조건을 만족해야 한다.
- `any`: 하나 이상 만족하면 된다.

MVP에서는 중첩 그룹을 허용하지 않는다. 복잡한 정책은 여러 PolicyRuleVersion 후보로 분리하거나 "확정 필요"로 남긴다.

### 5.3 requiredInputs

`requiredInputs`는 룰 평가 전에 필요한 입력 키 목록이다.

예시:

```json
[
  {
    "key": "couple.preferredResidenceRegion",
    "label": "거주 희망 지역",
    "source": "onboarding"
  },
  {
    "key": "additionalInputs.hasLeaseContract",
    "label": "임대차 계약 여부",
    "source": "policy_check"
  }
]
```

필수 입력이 없으면 결과는 `need_more_info`다.

## 6. 결과 판단 순서

룰 엔진은 아래 순서로 결과를 결정한다.

1. PolicyProgram 상태 확인
2. PolicyRuleVersion 상태 확인
3. 신청 기간과 룰 유효 기간 확인
4. 필수 입력 누락 확인
5. 조건 평가
6. 결과 사유 생성
7. 필요 서류와 주의 문구 연결
8. EligibilityResult 저장

상세 규칙:

- 정책 또는 룰이 `expired`, `retired`, `hidden`이면 `expired` 또는 `unknown`을 반환한다.
- 현재 날짜가 `applicationEndAt` 또는 `effectiveTo` 이후면 `expired`를 반환한다.
- `requiredInputs` 중 누락된 값이 있으면 `need_more_info`를 반환한다.
- 모든 조건이 충족되면 `likely_eligible`을 반환한다.
- 일부 조건은 충족되지만 sample 룰, 미검증 룰, 불확실한 입력이 있으면 `maybe_eligible`을 반환한다.
- 명확히 불일치하는 조건이 있으면 `not_eligible`을 반환한다.
- 룰 구조를 해석할 수 없거나 출처가 없으면 `unknown`을 반환한다.

## 7. resultReasonTemplate

`resultReasonTemplate`은 상태별 사용자 표시 사유를 만든다.

예시:

```json
{
  "likely_eligible": "{{region}} 지역, {{housingType}} 주거 유형이 현재 룰 기준과 맞습니다.",
  "maybe_eligible": "일부 조건은 맞지만 {{missingLabel}} 확인이 필요합니다.",
  "not_eligible": "{{failedLabel}} 조건이 현재 입력과 맞지 않습니다.",
  "need_more_info": "{{missingLabel}} 정보를 더 입력해야 확인할 수 있습니다.",
  "expired": "이 정책은 현재 신청 기간이 지났습니다.",
  "unknown": "출처 또는 룰 상태를 확인할 수 없어 판단하지 않았습니다."
}
```

주의:

- 템플릿은 단정형을 피한다.
- "선정됩니다", "받을 수 있습니다", "승인됩니다"를 사용하지 않는다.
- 템플릿에 직접 개인정보를 넣지 않는다.
- 템플릿 치환값은 allowlist된 입력 라벨과 상태 요약만 사용한다.

## 8. requiredDocuments

`requiredDocuments`는 결과 화면과 할 일 생성에 사용한다.

예시:

```json
[
  {
    "key": "lease_contract",
    "label": "임대차 계약서",
    "requiredWhen": ["likely_eligible", "maybe_eligible"],
    "note": "공식 신청 전 최신 공고문 기준을 확인해야 합니다."
  },
  {
    "key": "marriage_certificate",
    "label": "혼인관계 증명 자료",
    "requiredWhen": ["likely_eligible", "maybe_eligible", "need_more_info"]
  }
]
```

원칙:

- 필요 서류는 원본 업로드를 강제하지 않는다.
- 사용자가 할 일로 추가할 수 있게 표시한다.
- 주민등록번호가 포함될 수 있는 서류는 "원본 업로드 금지" 또는 "마스킹 필요" 주의 문구를 붙인다.

## 9. 출처와 기준일 관리

정책과 룰은 아래 값을 반드시 가진다.

- `sourceUrl`: 공식 공고문, 기관 페이지, 운영자가 확인한 출처
- `sourceUpdatedAt`: 출처 문서 또는 페이지의 기준일
- `verifiedAt`: 운영자가 신혼OS 내부에서 확인한 시각
- `effectiveFrom`: 룰 적용 시작일
- `effectiveTo`: 룰 적용 종료일

표시 원칙:

- 사용자 화면에는 출처명 또는 제공기관, 출처 기준일, 내부 확인일을 함께 보여준다.
- `verifiedAt`이 없으면 사용자에게 확정적으로 보여주지 않는다.
- `sourceUrl`이 없으면 룰 상태를 `draft` 또는 `sample`로 유지한다.
- 출처가 오래된 정책은 운영자가 상태를 `hidden` 또는 `expired`로 바꿀 수 있어야 한다.

## 10. 룰 버전 관리

버전 원칙:

- 같은 정책의 첫 룰은 `version = 1`이다.
- 조건, 필요 입력, 결과 사유, 필요 서류, 출처 중 하나라도 바뀌면 새 버전을 만든다.
- 새 버전을 `active`로 만들 때 기존 active 버전은 `retired`로 바꾼다.
- 기존 EligibilityResult는 기존 `policyRuleVersionId`를 유지한다.
- 재계산은 최신 active 룰 기준으로 새 EligibilityResult를 생성한다.

금지:

- active 룰의 `eligibilityCriteria`를 조용히 덮어쓰기
- 과거 결과의 `policyRuleVersionId` 바꾸기
- 출처 없는 룰을 active로 만들기

## 11. 관리자 업데이트 방식

관리자 기본 흐름:

1. PolicyProgram을 `draft`로 생성한다.
2. 출처 URL, 제공기관, 지역, 카테고리, 신청 기간을 입력한다.
3. PolicyRuleVersion을 `draft`로 생성한다.
4. requiredInputs, eligibilityCriteria, resultReasonTemplate, requiredDocuments를 입력한다.
5. 운영자가 출처와 기준일을 확인하고 `verifiedAt`을 저장한다.
6. 검증된 룰을 `active`로 전환한다.
7. 이전 active 룰은 `retired`로 전환한다.
8. 변경 내용은 DecisionLog 또는 운영 로그로 남긴다.

필수 검증:

- `sourceUrl` 필수
- `sourceUpdatedAt` 또는 `verifiedAt` 중 최소 `verifiedAt` 필수
- active 룰은 정책당 1개
- sample 룰은 사용자 기본 결과에서 별도 배지 표시
- 신청 종료일이 지난 정책은 기본 매칭에서 제외하거나 `expired`로 결과 표시

## 12. 사용자 주의 문구

정책 결과 화면 공통 문구:

```text
이 결과는 입력값과 신혼OS에 등록된 정책 룰 기준의 가능성 안내입니다. 실제 신청 가능 여부와 선정 결과는 담당 기관의 공식 공고와 심사 기준을 확인해야 합니다.
```

상태별 보조 문구:

- `likely_eligible`: "조건에 맞을 가능성이 있습니다. 신청 전 공식 공고와 필요 서류를 확인해 주세요."
- `maybe_eligible`: "일부 조건은 맞지만 추가 확인이 필요합니다."
- `not_eligible`: "현재 입력 기준으로는 조건과 맞지 않는 항목이 있습니다."
- `need_more_info`: "정보를 더 입력하면 더 구체적으로 확인할 수 있습니다."
- `expired`: "현재는 신청 기간 또는 룰 유효 기간이 지난 상태입니다."
- `unknown`: "출처 또는 룰 상태를 확인할 수 없어 판단하지 않았습니다."

금지 문구:

- "선정 가능"
- "선정 확정"
- "지원금 받을 수 있음"
- "대출 가능"
- "승인 가능"
- "무조건 가능"
- "공식 심사 결과"

## 13. 저장 구조

### 13.1 EligibilityResult.inputSnapshot

예시:

```json
{
  "policyRuleVersionId": "uuid",
  "checkedAt": "2026-06-05T03:00:00.000Z",
  "inputs": {
    "couple": {
      "preferredResidenceRegion": "서울",
      "housingType": "rental_jeonse",
      "totalBudgetRange": "100m_200m"
    },
    "members": [
      {
        "role": "owner",
        "incomeRange": "50m_100m",
        "assetRange": "50m_100m"
      }
    ],
    "additionalInputs": {
      "hasLeaseContract": true
    }
  },
  "matchedConditions": ["region", "housing_type"],
  "failedConditions": [],
  "sample": false
}
```

### 13.2 missingInputs

예시:

```json
[
  {
    "key": "additionalInputs.hasLeaseContract",
    "label": "임대차 계약 여부",
    "source": "policy_check"
  }
]
```

### 13.3 requiredDocuments

`requiredDocuments`는 해당 결과 상태에 필요한 서류만 저장한다.

## 14. 테스트 케이스 예시

단위 테스트:

- 필수 입력 누락 시 `need_more_info`
- 신청 종료일이 지난 정책은 `expired`
- 모든 조건이 일치하면 `likely_eligible`
- 일부 조건이 불확실하거나 sample 룰이면 `maybe_eligible`
- 명확한 불일치가 있으면 `not_eligible`
- sourceUrl이 없거나 룰 구조가 잘못되면 `unknown`
- 결과 사유 템플릿이 금지 문구를 만들지 않는지 확인
- 주민등록번호 형태 입력을 거절하는지 확인

API/E2E 테스트:

- 커플 멤버만 정책 매칭 실행 가능
- 온보딩 미완료 커플은 정책 매칭 제한
- 정책 매칭 결과가 `EligibilityResult`로 저장됨
- 결과 상세에서 정책명, 룰 버전, 출처 기준일, 결과 사유, 필요 서류, 주의 문구 표시
- 결과를 할 일로 추가하면 Task가 생성됨
- 관리자 룰 새 버전 생성 시 이전 active 룰 retired 처리
- 샘플 정책 5개 seed가 sample 표시를 가짐

## 15. 아직 확정하지 않을 항목

- 외부 정책 API 자동 연동
- 실제 심사 기준의 최신성 보장
- 정책 지원금 자동 차감
- 소득·자산 구간을 정확한 금액으로 환산하는 방식
- 주민등록번호 또는 민감 서류 원본 수집
- 정책별 세부 예외 조항 전체 자동화
- 기관별 신청 상태 추적
- 최종 선정 결과 저장

위 항목은 운영 정책, 법무, 보안 검토 후 별도 문서에서 다룬다.
