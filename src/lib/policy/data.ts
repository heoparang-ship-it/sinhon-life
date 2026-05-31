/**
 * 인천 신혼·청년 정책 DB.
 *
 * 출처: 인천 정책 심층조사 보고서(2026-05-31). 모든 항목은 공식 원문에서 재확인된 "확인" 등급.
 * 신뢰도 원칙: confidence + sourceUrl + verifiedAt 필수. 미확인 수치는 절대 단정 노출 금지.
 *
 * 설계 핵심(보고서 권고): "군구별 정책이 많은 게 아니라, 시 정책의 군구별 집행창구가 다르다."
 * → 정책 설명(PolicyRecord)과 군구 접수처(DISTRICT_CONTACTS)를 분리 저장.
 */

export type Confidence = "확인" | "미확인";
export type PolicyLevel = "central" | "city" | "district";

/** 자가진단 매칭용 생애주기 태그 */
export type LifeStage =
  | "engaged" // 결혼 예정
  | "married" // 혼인 7년 이내
  | "youth" // 19~39세 청년
  | "renting" // 전·월세 임차
  | "buying" // 주택 구입
  | "newborn" // 출산(2년 이내)
  | "vulnerable"; // 취약계층

export type PolicyCategory = "housing-loan" | "housing-rent" | "birth" | "youth";

export type Policy = {
  id: string;
  level: PolicyLevel;
  category: PolicyCategory;
  name: string;
  oneLiner: string; // 카드용 한 줄
  target: string;
  supportSummary: string;
  amountOrRate: string;
  duration: string;
  applicationOrg: string;
  applicationUrl: string;
  /** 자가진단 매칭 태그 */
  stages: LifeStage[];
  eligibility: Record<string, string | number | boolean | null>;
  /** 정책으로 절감/확보 가능한 대략 금액(만원). 가치 각인용. null이면 "조건부" */
  estSavingManwon: number | null;
  sourceTitle: string;
  sourceUrl: string;
  verifiedAt: string;
  confidence: Confidence;
  note?: string;
};

export const POLICIES: Policy[] = [
  // ── 중앙정책 ──
  {
    id: "central-newlywed-home-purchase-fund",
    level: "central",
    category: "housing-loan",
    name: "신혼부부전용 구입자금",
    oneLiner: "혼인 7년 이내 무주택 부부 주택구입 저리대출 (최대 3.2억)",
    target: "혼인 7년 이내 또는 3개월 이내 결혼예정 무주택 세대주",
    supportSummary: "주택구입자금 저리대출",
    amountOrRate: "연 2.55%~3.85%, 최대 3.2억원",
    duration: "10/15/20/30년",
    applicationOrg: "주택도시기금 수탁은행·기금e든든",
    applicationUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030601.jsp",
    stages: ["married", "engaged", "buying"],
    eligibility: {
      소득: "부부합산 8,500만원 이하",
      자산: "5.11억원 이하",
      주택: "무주택",
      혼인: "7년 이내 또는 3개월 내 결혼예정",
    },
    estSavingManwon: null,
    sourceTitle: "주택도시기금 신혼부부전용 구입자금",
    sourceUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030601.jsp",
    verifiedAt: "2026-05-31",
    confidence: "확인",
  },
  {
    id: "central-newborn-special-didimdol",
    level: "central",
    category: "housing-loan",
    name: "신생아 특례 디딤돌대출",
    oneLiner: "2년 내 출산 무주택 가구 주택구입 특례대출 (최대 4억, 연 1.8%~)",
    target: "대출접수일 기준 2년 내 출산(입양) 무주택 세대주",
    supportSummary: "주택구입자금 특례대출",
    amountOrRate: "연 1.8%~4.5%, 최대 4억원",
    duration: "10/15/20/30년",
    applicationOrg: "주택도시기금 수탁은행·기금e든든",
    applicationUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030801.jsp",
    stages: ["newborn", "buying", "married"],
    eligibility: {
      출산: "2023-01-01 이후 출생아",
      소득: "1.3억(맞벌이 2억) 이하",
      자산: "5.11억원 이하",
      주택가격: "9억원 이하",
    },
    estSavingManwon: null,
    sourceTitle: "주택도시기금 신생아 특례 디딤돌대출",
    sourceUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030801.jsp",
    verifiedAt: "2026-05-31",
    confidence: "확인",
  },
  {
    id: "central-newborn-special-buteummok",
    level: "central",
    category: "housing-loan",
    name: "신생아 특례 버팀목대출",
    oneLiner: "2년 내 출산 무주택 가구 전세자금 특례대출 (최대 2.4억, 연 1.3%~)",
    target: "대출접수일 기준 2년 내 출산(입양) 무주택 세대주",
    supportSummary: "전세자금 특례대출",
    amountOrRate: "연 1.3%~4.3%, 최대 2.4억원",
    duration: "2년 단위, 최장 12년",
    applicationOrg: "주택도시기금 수탁은행·기금e든든",
    applicationUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05021401.jsp",
    stages: ["newborn", "renting", "married"],
    eligibility: {
      출산: "2023-01-01 이후 출생아",
      소득: "1.3억(맞벌이 2억) 이하",
      자산: "3.45억원 이하",
      대출한도: "전세보증금의 80%",
    },
    estSavingManwon: null,
    sourceTitle: "주택도시기금 신생아 특례 버팀목대출",
    sourceUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05021401.jsp",
    verifiedAt: "2026-05-31",
    confidence: "확인",
  },
  {
    id: "central-bogeumjari-newlywed-rate-cut",
    level: "central",
    category: "housing-loan",
    name: "보금자리론 신혼가구 우대",
    oneLiner: "혼인 7년 이내 신혼가구 보금자리론 금리 0.3%p 우대",
    target: "혼인신고일 7년 이내 신혼가구 또는 결혼예정 가구",
    supportSummary: "보금자리론 우대금리",
    amountOrRate: "신혼가구 우대 0.3%p",
    duration: "상품만기 기준",
    applicationOrg: "한국주택금융공사·취급기관",
    applicationUrl: "https://www.hf.go.kr/ko/sub01/sub01_01_02.do",
    stages: ["married", "engaged", "buying"],
    eligibility: {
      소득: "부부합산 7,000만원 이하",
      주택가격: "6억원 이하",
      혼인: "혼인신고일 7년 이내",
    },
    estSavingManwon: null,
    sourceTitle: "HF 보금자리론 (특성별) 상품소개",
    sourceUrl: "https://www.hf.go.kr/ko/sub01/sub01_01_02.do",
    verifiedAt: "2026-05-31",
    confidence: "확인",
  },

  // ── 인천시 정책 ──
  {
    id: "ic-cheonwon-maeip",
    level: "city",
    category: "housing-rent",
    name: "천원주택 매입임대",
    oneLiner: "하루 1천원(월 3만원)으로 사는 인천형 매입임대 — 신혼·신생아 우선",
    target: "신혼·신생아 가구 중심",
    supportSummary: "인천형 매입임대",
    amountOrRate: "하루 1천원, 월 3만원",
    duration: "최대 6년",
    applicationOrg: "인천주거포털·iH",
    applicationUrl: "https://www.incheon.go.kr/housing/hou030201",
    stages: ["married", "newborn", "renting"],
    eligibility: { 비고: "세부 자격은 모집공고별 상이" },
    estSavingManwon: null,
    sourceTitle: "인천주거포털 천원주택 매입임대 안내",
    sourceUrl: "https://www.incheon.go.kr/housing/hou030201",
    verifiedAt: "2026-05-31",
    confidence: "확인",
    note: "2025 매입임대 500호 개시",
  },
  {
    id: "ic-cheonwon-jeonse",
    level: "city",
    category: "housing-rent",
    name: "천원주택 전세임대",
    oneLiner: "하루 1천원으로 사는 인천형 전세임대 — 2026 추가 공급",
    target: "신혼·신생아 가구 중심",
    supportSummary: "인천형 전세임대",
    amountOrRate: "하루 1천원, 월 3만원",
    duration: "최대 6년",
    applicationOrg: "인천주거포털·iH",
    applicationUrl: "https://www.incheon.go.kr/housing/hou030201",
    stages: ["married", "newborn", "renting"],
    eligibility: { 비고: "세부 자격과 전세금 구조는 모집공고별 상이" },
    estSavingManwon: null,
    sourceTitle: "인천주거포털 천원주택 전세임대 안내",
    sourceUrl: "https://www.incheon.go.kr/housing/hou030201",
    verifiedAt: "2026-05-31",
    confidence: "확인",
    note: "2026 추가 공급 안내",
  },
  {
    id: "ic-1point0-interest",
    level: "city",
    category: "birth",
    name: "1.0 이자지원",
    oneLiner: "출산가구 주택담보대출 이자 최대 1.0% 인천시 지원",
    target: "2025-01-01 이후 출생 자녀가 있는 주담대 이용 가구",
    supportSummary: "주택담보대출 이자 지원",
    amountOrRate: "최대 1.0%",
    duration: "공고 기준",
    applicationOrg: "인천주거포털",
    applicationUrl: "https://youth.incheon.go.kr/dwelling/interest.jsp",
    stages: ["newborn", "buying"],
    eligibility: {
      출산: "2025-01-01 이후 출생",
      비고: "가구소득·자녀수 기준 세부 차등",
    },
    estSavingManwon: null,
    sourceTitle: "인천주거포털 1.0 이자지원",
    sourceUrl: "https://youth.incheon.go.kr/dwelling/interest.jsp",
    verifiedAt: "2026-05-31",
    confidence: "확인",
    note: "2026년 3,000가구 예정",
  },
  {
    id: "ic-youth-jeonse-interest",
    level: "city",
    category: "youth",
    name: "청년 주택임차보증금 이자 지원",
    oneLiner: "19~39세 청년 임차보증금 대출이자 지원 (2.0%/3.5%)",
    target: "19~39세 무주택 청년 세대주",
    supportSummary: "임차보증금 대출 이자 지원",
    amountOrRate: "대출이자 2.0% 또는 3.5%",
    duration: "2년 계약 기준 최대 4년",
    applicationOrg: "인천시 청년정책 담당",
    applicationUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    stages: ["youth", "renting"],
    eligibility: {
      나이: "19~39세",
      보증금: "2.5억원 이하",
      월세: "85만원 이하",
      대출한도: "1억원",
    },
    estSavingManwon: null,
    sourceTitle: "인천 청년 주택임차보증금 이자 지원",
    sourceUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    verifiedAt: "2026-05-31",
    confidence: "확인",
  },
  {
    id: "ic-jeonse-guarantee-fee",
    level: "city",
    category: "housing-rent",
    name: "전세보증금반환보증 보증료 지원",
    oneLiner: "전세 보증보험 가입 보증료 최대 40만원 지원 (신혼 포함)",
    target: "인천 거주 무주택자, 신혼부부 포함",
    supportSummary: "전세보증금 반환보증 가입 보증료 지원",
    amountOrRate: "최대 40만원",
    duration: "1회성 보조",
    applicationOrg: "거주지 군·구 담당부서",
    applicationUrl: "https://youth.incheon.go.kr/dwelling/guarantee.jsp",
    stages: ["renting", "youth", "married"],
    eligibility: {
      보증금: "3억원 이하",
      소득_청년: "5,000만원 이하",
      소득_일반: "6,000만원 이하",
      소득_신혼: "7,500만원 이하",
    },
    estSavingManwon: 40,
    sourceTitle: "인천 전세보증금반환보증 보증료 지원",
    sourceUrl: "https://youth.incheon.go.kr/dwelling/guarantee.jsp",
    verifiedAt: "2026-05-31",
    confidence: "확인",
  },
  {
    id: "ic-postpartum-care-voucher",
    level: "city",
    category: "birth",
    name: "맘편한 산후조리비 지원",
    oneLiner: "산후조리비 인천e음 포인트 150만원 (취약계층 산모)",
    target: "취약계층 산모",
    supportSummary: "산후조리비 인천e음 포인트 지급",
    amountOrRate: "150만원",
    duration: "포인트 유효기간 1년",
    applicationOrg: "주소지 보건소·정부24",
    applicationUrl:
      "https://www.incheon.go.kr/icbenefit/ICB020201/view?srvcId=628000000744",
    stages: ["newborn", "vulnerable"],
    eligibility: {
      거주: "신청일 기준 인천 1년 이상 주민등록 및 실거주",
      출산: "2025-01-01 이후 분만자",
      신청기간: "임신 32주부터 출산 후 90일 이내",
    },
    estSavingManwon: 150,
    sourceTitle: "인천광역시 맘편한 산후조리비 지원",
    sourceUrl:
      "https://www.incheon.go.kr/icbenefit/ICB020201/view?srvcId=628000000744",
    verifiedAt: "2026-05-31",
    confidence: "확인",
  },
  {
    id: "gyeyang-dad-parental-leave",
    level: "district",
    category: "birth",
    name: "아빠 육아휴직 장려금 (계양구)",
    oneLiner: "계양구 거주 아빠 육아휴직 시 월 70만원 (최대 6개월)",
    target: "육아휴직을 사용하는 아빠",
    supportSummary: "육아휴직 장려금",
    amountOrRate: "월 70만원",
    duration: "최대 6개월",
    applicationOrg: "계양구",
    applicationUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    stages: ["newborn"],
    eligibility: { 육아휴직최소일: 30, 비고: "주민등록·고용보험 요건은 공고 확인" },
    estSavingManwon: 420,
    sourceTitle: "계양구 아빠 육아휴직 장려금 지원",
    sourceUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    verifiedAt: "2026-05-31",
    confidence: "확인",
    note: "계양구 거주자 한정",
  },
];

/** 인천 10개 군·구 + 집행 창구 (보고서 군구 매트릭스) */
export type DistrictContact = {
  code: string;
  name: string;
  jeonseGuaranteeDept: string;
  jeonseGuaranteePhone: string;
  postpartumPhone: string;
};

export const DISTRICT_CONTACTS: DistrictContact[] = [
  { code: "IC-GH", name: "강화군", jeonseGuaranteeDept: "도시개발과", jeonseGuaranteePhone: "032-930-3513", postpartumPhone: "032-930-4068" },
  { code: "IC-OJ", name: "옹진군", jeonseGuaranteeDept: "건축과", jeonseGuaranteePhone: "032-899-2811", postpartumPhone: "032-899-3145" },
  { code: "IC-JG", name: "중구", jeonseGuaranteeDept: "건축과", jeonseGuaranteePhone: "032-760-7513", postpartumPhone: "032-760-6812" },
  { code: "IC-DG", name: "동구", jeonseGuaranteeDept: "도시정비과", jeonseGuaranteePhone: "032-770-6793", postpartumPhone: "032-770-5712" },
  { code: "IC-MC", name: "미추홀구", jeonseGuaranteeDept: "주택관리과", jeonseGuaranteePhone: "032-880-4743", postpartumPhone: "032-880-5473" },
  { code: "IC-YS", name: "연수구", jeonseGuaranteeDept: "토지정보과", jeonseGuaranteePhone: "032-749-7581", postpartumPhone: "032-749-8152" },
  { code: "IC-ND", name: "남동구", jeonseGuaranteeDept: "공동주택과", jeonseGuaranteePhone: "032-453-8512", postpartumPhone: "032-453-5117" },
  { code: "IC-BP", name: "부평구", jeonseGuaranteeDept: "토지정보과", jeonseGuaranteePhone: "032-509-6943", postpartumPhone: "032-509-8203" },
  { code: "IC-GY", name: "계양구", jeonseGuaranteeDept: "사회보장과", jeonseGuaranteePhone: "032-450-6860", postpartumPhone: "032-430-7774" },
  { code: "IC-SG", name: "서구", jeonseGuaranteeDept: "주택관리과", jeonseGuaranteePhone: "032-560-5973", postpartumPhone: "032-718-0432" },
];

/** 공공임대 유형 (인천주거포털 — 거의 불변, 단지검색은 iH/LH 연결) */
export const PUBLIC_RENTAL_TYPES = [
  { type: "영구임대", target: "최저소득계층", size: "전용 40㎡ 이하", rent: "시세의 약 30%" },
  { type: "국민임대", target: "무주택·소득기준 충족", size: "전용 60㎡ 이하", rent: "시세의 약 60~80%" },
  { type: "행복주택", target: "청년·신혼·사회초년생 등", size: "전용 45㎡ 이하 중심", rent: "시세의 약 60~80%" },
  { type: "분양전환 공공임대", target: "무주택세대구성원", size: "전용 85㎡ 이하 중심", rent: "시세의 약 90%" },
  { type: "통합공공임대", target: "중위소득 150% 이하 등", size: "다양한 면적", rent: "중위소득 연계형" },
] as const;

export const PUBLIC_RENTAL_SOURCE = {
  title: "인천주거포털 공공임대주택 안내",
  url: "https://www.incheon.go.kr/housing/hou020101",
  verifiedAt: "2026-05-31",
};

// ── 조회 헬퍼 ──

export function getPolicy(id: string): Policy | null {
  return POLICIES.find((p) => p.id === id) ?? null;
}

export function listPolicyIds(): string[] {
  return POLICIES.map((p) => p.id);
}

export type DiagnosisInput = {
  stages: LifeStage[];
};

/** 자가진단: 선택한 생애주기 태그와 하나라도 겹치면 매칭. 매칭 수 많은 순 정렬 */
export function matchPolicies(input: DiagnosisInput): Policy[] {
  const set = new Set(input.stages);
  if (set.size === 0) return POLICIES;
  return POLICIES.map((p) => ({
    p,
    score: p.stages.filter((s) => set.has(s)).length,
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export const LIFE_STAGE_LABELS: { value: LifeStage; label: string; emoji: string }[] = [
  { value: "engaged", label: "결혼 예정", emoji: "💍" },
  { value: "married", label: "혼인 7년 이내", emoji: "💑" },
  { value: "youth", label: "19~39세 청년", emoji: "🧑" },
  { value: "renting", label: "전·월세 거주", emoji: "🔑" },
  { value: "buying", label: "집 살 계획", emoji: "🏡" },
  { value: "newborn", label: "출산했어요 (2년 내)", emoji: "👶" },
  { value: "vulnerable", label: "소득이 넉넉지 않아요", emoji: "🤝" },
];

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
  "housing-loan": "주택 구입·대출",
  "housing-rent": "전·월세·임대",
  birth: "출산·육아",
  youth: "청년",
};
