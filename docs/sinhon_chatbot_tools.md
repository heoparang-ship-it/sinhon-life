# sinhon.life 챗봇 Tool Calling 설계

**작성일**: 2026-04-18
**대상**: 결혼 준비 + 신혼 1~2년차 사용자 (자녀 出生 전)
**맥락 경계**: 이 문서는 **sinhon.life 앱 사용자용 챗봇**의 Tool Calling 설계다. 허파랑 운영자 본인의 사업 지원금 스캐너(`founder-gov-radar` 스킬)와 **절대 섞지 않는다**.

---

## 0. 설계 원칙

1. **타겟 집중**: 결혼 준비 → 신혼 1~2년차. 자녀 출생 후 콘텐츠는 "휴면(dormant)" 상태로 준비만 하고 사용자에게 노출되는 경로는 모두 비활성화.
2. **스키마 우선, 구현 차단**: 모든 툴은 JSON Schema로 정의하되, 핸들러는 `ToolDisabledError`를 throw한다. 차후 단계별로 실구현을 활성화한다.
3. **Feature Flag 기반 확장**: `ENABLE_PARENTING_TOOLS=true` 환경변수로 휴면 18개를 미래 활성화.
4. **2개 API 키 원칙**: 외부 API 호출 툴은 Kakao REST API Key + data.go.kr ServiceKey, 단 2종으로 커버.
5. **캐시 필수**: 공공 API 호출은 TTL 15분 in-memory 캐시 경유. 같은 질문으로 반복 호출 방지.
6. **출처 표기 의무**: LLM 답변에는 툴이 반환한 `source_url`을 인용 링크로 포함.

---

## 1. 액티브 툴 14개 (결혼·신혼 1~2년차)

> 모든 툴의 `handler`는 `ToolDisabledError("Active tool schema defined; implementation deferred. Enable via docs/sinhon_chatbot_tools.md roadmap.")`를 throw한다. 스키마는 Claude API의 `tools` 파라미터에 그대로 전달 가능.

### 범주 A — 위치·경로 (2개, Kakao API)

| ID | Tool Name | 목적 | API |
|---|---|---|---|
| A01 | `kakao_local_address` | 사용자 입력 주소/키워드 → 좌표 변환 (다른 툴의 전제) | Kakao Local `/search/keyword.json` |
| A02 | `kakao_mobility_route` | 신혼집 후보 ↔ 회사 통근 경로·시간·거리 계산 | Kakao Mobility `/directions` |

### 범주 B — 주거 (3개, 내부 DB + 계산기)

| ID | Tool Name | 목적 | 데이터 소스 |
|---|---|---|---|
| B01 | `search_sinhon_housing_policies` | 청약·행복주택·신혼희망타운·매입임대 등 주거정책 검색 | 내부 POLICIES 테이블 (RAG 또는 full-text) |
| B02 | `calculate_cheongyak_score` | 청약 가점제 점수 계산 (부양가족·무주택·청약가입기간) | 순수 계산 (외부 API 없음) |
| B03 | `compare_housing_products` | 행복주택 vs 신혼희망타운 vs 매입임대 조건 비교표 | 내부 POLICIES 테이블 |

### 범주 C — 금융 (3개, 내부 DB + 계산기)

| ID | Tool Name | 목적 | 데이터 소스 |
|---|---|---|---|
| C01 | `search_sinhon_financial_support` | 신혼부부 전용 버팀목·디딤돌·구입자금대출 검색 | 내부 POLICIES 테이블 |
| C02 | `calculate_loan_eligibility` | 소득·자산 기준 대출 한도 예측 (규정 기반 계산) | 순수 계산 |
| C03 | `calculate_tax_benefits` | 결혼세액공제·주택자금공제 예상 환급액 | 순수 계산 |

### 범주 D — 결혼 준비 & 신혼 혜택 (3개, 내부 DB)

| ID | Tool Name | 목적 | 데이터 소스 |
|---|---|---|---|
| D01 | `search_wedding_checklist` | 혼인신고·예식·혼수 타임라인 체크리스트 | 내부 static data |
| D02 | `search_newlywed_benefits` | 혼인신고 시 받을 수 있는 전국 공통 혜택 | 내부 POLICIES 테이블 |
| D03 | `search_local_sinhon_support` | 지자체별 신혼부부 지원금 (서울·인천·경기 우선) | 내부 POLICIES + data.go.kr 확장 |

### 범주 E — 공공 서비스 (2개, data.go.kr)

| ID | Tool Name | 목적 | API |
|---|---|---|---|
| E01 | `search_welfare_services` | 보조금24(복지로) 신혼부부 해당 서비스 조회 | 행안부 보조금24 OpenAPI |
| E02 | `find_emergency_room` | 응급실 위치·연락처 (신혼집 주변) | NEMC 응급의료정보 |

### 범주 F — 개인화 (1개, 내부 프로필)

| ID | Tool Name | 목적 | 데이터 소스 |
|---|---|---|---|
| F01 | `get_my_profile` | localStorage `sinhon-profile-v1`에서 사용자 맥락(지역·소득구간·가족상황) 조회 | 내부 (client-side bridge) |

---

## 2. 휴면 툴 18개 (육아, Feature Flag 대기)

**활성화 조건**: 사용자가 자녀 출산 후 프로필에 `has_child: true` 플래그를 세팅했을 때. 환경변수 `ENABLE_PARENTING_TOOLS=true` 필요.

> 현재는 스키마만 정의하고 핸들러는 `ToolDisabledError("Parenting tools are dormant. Enable ENABLE_PARENTING_TOOLS after launching newlywed MVP.")`를 throw.

| ID | Tool Name | 미래 목적 | 예상 API |
|---|---|---|---|
| P01 | `find_daycare_by_coordinates` | 좌표 주변 어린이집 검색 | 어린이집정보공개포털 |
| P02 | `search_daycare_by_name` | 어린이집 이름 검색 | 어린이집정보공개포털 |
| P03 | `find_kindergarten_by_coordinates` | 좌표 주변 유치원 검색 | 유치원알리미 |
| P04 | `get_kindergarten_details` | 유치원 상세(학급·교사·비용) | 유치원알리미 |
| P05 | `compare_kindergartens` | 유치원 복수 비교 | 유치원알리미 |
| P06 | `get_vaccination_clinics` | 영유아 예방접종 지정 병원 | 질병관리청 |
| P07 | `list_vaccinations_by_age` | 연령별 권장 접종 스케줄 | 질병관리청 |
| P08 | `analyze_child_growth` | 성장도표 기반 신장·체중 분석 | 질병관리청 성장도표 |
| P09 | `get_popular_books_by_age` | 연령별 추천 도서 | 도서관정보나루 |
| P10 | `search_seoul_kids_cafes` | 서울 키즈카페 검색 | 서울열린데이터광장 |
| P11 | `get_museum_places` | 어린이박물관·체험관 | 문화포털 |
| P12 | `search_academies` | 학원 검색 (유아 대상) | 학원알리미 |
| P13 | `neis_school_schedule` | 학사일정 조회 | NEIS OpenAPI |
| P14 | `neis_school_search` | 학교 검색 | NEIS OpenAPI |
| P15 | `search_welfare_services_parenting` | 육아 전용 복지서비스 | 보조금24 (육아 필터) |
| P16 | `calculate_child_benefit` | 아동수당·양육수당 계산 | 순수 계산 |
| P17 | `search_childcare_leave` | 육아휴직 급여·기간 조회 | 내부 + 고용노동부 |
| P18 | `search_child_medical` | 영유아 건강검진 일정 | 질병관리청 |

---

## 3. Feature Flag 구조

```ts
// src/lib/tools/index.ts
const ENABLE_PARENTING = process.env.ENABLE_PARENTING_TOOLS === 'true';

export const ACTIVE_TOOLS: SinhonTool[] = [
  kakao_local_address, kakao_mobility_route,
  search_sinhon_housing_policies, calculate_cheongyak_score, compare_housing_products,
  search_sinhon_financial_support, calculate_loan_eligibility, calculate_tax_benefits,
  search_wedding_checklist, search_newlywed_benefits, search_local_sinhon_support,
  search_welfare_services, find_emergency_room,
  get_my_profile,
];

export const DORMANT_TOOLS: SinhonTool[] = [
  find_daycare_by_coordinates, search_daycare_by_name,
  // ... P01 ~ P18
];

export function getEnabledTools(): SinhonTool[] {
  const enabled = [...ACTIVE_TOOLS];
  if (ENABLE_PARENTING) enabled.push(...DORMANT_TOOLS);
  // 🚨 Phase 1: 모든 툴의 handler는 ToolDisabledError throw
  // 🚀 Phase 2: 14개 액티브 중 순수 계산기·내부 DB 툴부터 구현 풀기
  // 🌱 Phase 3: 외부 API 툴 (Kakao/data.go.kr) 실구현
  // 👶 Phase 4: 육아 휴면 툴 단계적 활성화
  return enabled;
}
```

---

## 4. 필요 API 키 (2개)

| 키 | 발급처 | 커버 툴 |
|---|---|---|
| `KAKAO_REST_API_KEY` | developers.kakao.com | A01, A02 |
| `DATA_GO_KR_SERVICE_KEY` | data.go.kr (한 키로 여러 API) | E01, E02, P01~P18 |

---

## 5. 구현 로드맵 (Phase)

- **Phase 1 (현재)**: 스키마 32개 정의 완료. 모든 핸들러 `ToolDisabledError`. Chat API는 기존 non-tool 응답만 유지.
- **Phase 2**: 순수 계산기 5개(B02, B03, C02, C03, D01) 실구현. API 키 불필요.
- **Phase 3**: 내부 POLICIES DB 기반 검색 툴 4개(B01, C01, D02, D03) + `get_my_profile`(F01) 실구현. RAG 또는 간단한 full-text 매칭.
- **Phase 4**: 외부 API 툴 5개(A01, A02, E01, E02) 활성화. `ENABLE_PARENTING_TOOLS=false` 유지.
- **Phase 5 (미래)**: 사용자 프로필에 `has_child: true` 감지되면 DORMANT_TOOLS 중 P15, P16, P17부터 풀어 서비스 재타게팅.

---

## 6. 안티패턴 (하지 말 것)

- ❌ `founder-gov-radar`의 `recommendations.json` 데이터를 챗봇 툴로 노출
- ❌ K-Startup 공고를 "신혼부부 혜택"으로 포장해서 앱 사용자에게 푸시
- ❌ sinhon.life 앱 UI에서 "내 사업 지원금" 섹션 추가 (이건 운영자만 보는 대시보드로 존재)
- ❌ 툴 이름에 "startup/kstartup/bizpbanc" 포함 (맥락 B로 오해됨)

---

## 7. 연관 문서

- `docs/kidshub_parity.md` (구버전, DEPRECATED, 현재 `_DEPRECATED_kidshub_parity.md`)
- `/신혼생활/.claude/skills/founder-gov-radar/SKILL.md` (별개 스킬, 운영자용)
- `src/lib/tools/` (이 문서의 구현 코드베이스)
