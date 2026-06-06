export type Confidence = "확인" | "미확인";
export type PolicyLevel = "central" | "city" | "district";

export type LifeStage =
  | "engaged"
  | "married"
  | "youth"
  | "renting"
  | "buying"
  | "newborn"
  | "vulnerable";

export type PolicyCategory = "housing-loan" | "housing-rent" | "birth" | "youth";

export type Policy = {
  amountOrRate: string;
  applicationOrg: string;
  applicationUrl: string;
  category: PolicyCategory;
  confidence: Confidence;
  duration: string;
  eligibility: Record<string, string | number | boolean | null>;
  estSavingManwon: number | null;
  id: string;
  level: PolicyLevel;
  name: string;
  note?: string;
  oneLiner: string;
  sourceTitle: string;
  sourceUrl: string;
  stages: LifeStage[];
  supportSummary: string;
  target: string;
  verifiedAt: string;
};

export const POLICIES: Policy[] = [
  {
    amountOrRate: "연 2.55%~3.85%, 최대 3.2억원",
    applicationOrg: "주택도시기금 수탁은행·기금e든든",
    applicationUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030601.jsp",
    category: "housing-loan",
    confidence: "확인",
    duration: "10/15/20/30년",
    eligibility: {
      "소득": "부부합산 8,500만원 이하",
      "자산": "5.11억원 이하",
      "주택": "무주택",
      "혼인": "7년 이내 또는 3개월 내 결혼예정"
    },
    estSavingManwon: null,
    id: "central-newlywed-home-purchase-fund",
    level: "central",
    name: "신혼부부전용 구입자금",
    oneLiner: "혼인 7년 이내 무주택 부부 주택구입 저리대출",
    sourceTitle: "주택도시기금 신혼부부전용 구입자금",
    sourceUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030601.jsp",
    stages: ["married", "engaged", "buying"],
    supportSummary: "주택구입자금 저리대출",
    target: "혼인 7년 이내 또는 3개월 이내 결혼예정 무주택 세대주",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "연 1.8%~4.5%, 최대 4억원",
    applicationOrg: "주택도시기금 수탁은행·기금e든든",
    applicationUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030801.jsp",
    category: "housing-loan",
    confidence: "확인",
    duration: "10/15/20/30년",
    eligibility: {
      "출산": "2023-01-01 이후 출생아",
      "소득": "1.3억(맞벌이 2억) 이하",
      "자산": "5.11억원 이하",
      "주택가격": "9억원 이하"
    },
    estSavingManwon: null,
    id: "central-newborn-special-didimdol",
    level: "central",
    name: "신생아 특례 디딤돌대출",
    oneLiner: "2년 내 출산 무주택 가구 주택구입 특례대출",
    sourceTitle: "주택도시기금 신생아 특례 디딤돌대출",
    sourceUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0503/FP05030801.jsp",
    stages: ["newborn", "buying", "married"],
    supportSummary: "주택구입자금 특례대출",
    target: "대출접수일 기준 2년 내 출산(입양) 무주택 세대주",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "연 1.3%~4.3%, 최대 2.4억원",
    applicationOrg: "주택도시기금 수탁은행·기금e든든",
    applicationUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05021401.jsp",
    category: "housing-loan",
    confidence: "확인",
    duration: "2년 단위, 최장 12년",
    eligibility: {
      "출산": "2023-01-01 이후 출생아",
      "소득": "1.3억(맞벌이 2억) 이하",
      "자산": "3.45억원 이하",
      "대출한도": "전세보증금의 80%"
    },
    estSavingManwon: null,
    id: "central-newborn-special-buteummok",
    level: "central",
    name: "신생아 특례 버팀목대출",
    oneLiner: "2년 내 출산 무주택 가구 전세자금 특례대출",
    sourceTitle: "주택도시기금 신생아 특례 버팀목대출",
    sourceUrl: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05021401.jsp",
    stages: ["newborn", "renting", "married"],
    supportSummary: "전세자금 특례대출",
    target: "대출접수일 기준 2년 내 출산(입양) 무주택 세대주",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "신혼가구 우대 0.3%p",
    applicationOrg: "한국주택금융공사·취급기관",
    applicationUrl: "https://www.hf.go.kr/ko/sub01/sub01_01_02.do",
    category: "housing-loan",
    confidence: "확인",
    duration: "상품만기 기준",
    eligibility: {
      "소득": "부부합산 7,000만원 이하",
      "주택가격": "6억원 이하",
      "혼인": "혼인신고일 7년 이내"
    },
    estSavingManwon: null,
    id: "central-bogeumjari-newlywed-rate-cut",
    level: "central",
    name: "보금자리론 신혼가구 우대",
    oneLiner: "혼인 7년 이내 신혼가구 보금자리론 금리 우대",
    sourceTitle: "HF 보금자리론 상품소개",
    sourceUrl: "https://www.hf.go.kr/ko/sub01/sub01_01_02.do",
    stages: ["married", "engaged", "buying"],
    supportSummary: "보금자리론 우대금리",
    target: "혼인신고일 7년 이내 신혼가구 또는 결혼예정 가구",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "하루 1천원, 월 3만원",
    applicationOrg: "인천주거포털·iH",
    applicationUrl: "https://www.incheon.go.kr/housing/hou030201",
    category: "housing-rent",
    confidence: "확인",
    duration: "최대 6년",
    eligibility: {
      "비고": "세부 자격은 모집공고별 상이"
    },
    estSavingManwon: null,
    id: "ic-cheonwon-maeip",
    level: "city",
    name: "천원주택 매입임대",
    note: "2025 매입임대 500호 개시",
    oneLiner: "하루 1천원으로 사는 인천형 매입임대",
    sourceTitle: "인천주거포털 천원주택 매입임대 안내",
    sourceUrl: "https://www.incheon.go.kr/housing/hou030201",
    stages: ["married", "newborn", "renting"],
    supportSummary: "인천형 매입임대",
    target: "신혼·신생아 가구 중심",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "하루 1천원, 월 3만원",
    applicationOrg: "인천주거포털·iH",
    applicationUrl: "https://www.incheon.go.kr/housing/hou030201",
    category: "housing-rent",
    confidence: "확인",
    duration: "최대 6년",
    eligibility: {
      "비고": "세부 자격과 전세금 구조는 모집공고별 상이"
    },
    estSavingManwon: null,
    id: "ic-cheonwon-jeonse",
    level: "city",
    name: "천원주택 전세임대",
    note: "2026 추가 공급 안내",
    oneLiner: "하루 1천원으로 사는 인천형 전세임대",
    sourceTitle: "인천주거포털 천원주택 전세임대 안내",
    sourceUrl: "https://www.incheon.go.kr/housing/hou030201",
    stages: ["married", "newborn", "renting"],
    supportSummary: "인천형 전세임대",
    target: "신혼·신생아 가구 중심",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "최대 1.0%",
    applicationOrg: "인천주거포털",
    applicationUrl: "https://youth.incheon.go.kr/dwelling/interest.jsp",
    category: "birth",
    confidence: "확인",
    duration: "공고 기준",
    eligibility: {
      "출산": "2025-01-01 이후 출생",
      "비고": "가구소득·자녀수 기준 세부 차등"
    },
    estSavingManwon: null,
    id: "ic-1point0-interest",
    level: "city",
    name: "1.0 이자지원",
    note: "2026년 3,000가구 예정",
    oneLiner: "출산가구 주택담보대출 이자 최대 1.0% 인천시 지원",
    sourceTitle: "인천주거포털 1.0 이자지원",
    sourceUrl: "https://youth.incheon.go.kr/dwelling/interest.jsp",
    stages: ["newborn", "buying"],
    supportSummary: "주택담보대출 이자 지원",
    target: "2025-01-01 이후 출생 자녀가 있는 주담대 이용 가구",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "대출이자 2.0% 또는 3.5%",
    applicationOrg: "인천시 청년정책 담당",
    applicationUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    category: "youth",
    confidence: "확인",
    duration: "2년 계약 기준 최대 4년",
    eligibility: {
      "나이": "19~39세",
      "보증금": "2.5억원 이하",
      "월세": "85만원 이하",
      "대출한도": "1억원"
    },
    estSavingManwon: null,
    id: "ic-youth-jeonse-interest",
    level: "city",
    name: "청년 주택임차보증금 이자 지원",
    oneLiner: "19~39세 청년 임차보증금 대출이자 지원",
    sourceTitle: "인천 청년 주택임차보증금 이자 지원",
    sourceUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    stages: ["youth", "renting"],
    supportSummary: "임차보증금 대출 이자 지원",
    target: "19~39세 무주택 청년 세대주",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "최대 40만원",
    applicationOrg: "거주지 군·구 담당부서",
    applicationUrl: "https://youth.incheon.go.kr/dwelling/guarantee.jsp",
    category: "housing-rent",
    confidence: "확인",
    duration: "1회성 보조",
    eligibility: {
      "보증금": "3억원 이하",
      "소득_청년": "5,000만원 이하",
      "소득_일반": "6,000만원 이하",
      "소득_신혼": "7,500만원 이하"
    },
    estSavingManwon: 40,
    id: "ic-jeonse-guarantee-fee",
    level: "city",
    name: "전세보증금반환보증 보증료 지원",
    oneLiner: "전세 보증보험 가입 보증료 최대 40만원 지원",
    sourceTitle: "인천 전세보증금반환보증 보증료 지원",
    sourceUrl: "https://youth.incheon.go.kr/dwelling/guarantee.jsp",
    stages: ["renting", "youth", "married"],
    supportSummary: "전세보증금 반환보증 가입 보증료 지원",
    target: "인천 거주 무주택자, 신혼부부 포함",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "150만원",
    applicationOrg: "주소지 보건소·정부24",
    applicationUrl: "https://www.incheon.go.kr/icbenefit/ICB020201/view?srvcId=628000000744",
    category: "birth",
    confidence: "확인",
    duration: "포인트 유효기간 1년",
    eligibility: {
      "거주": "신청일 기준 인천 1년 이상 주민등록 및 실거주",
      "출산": "2025-01-01 이후 분만자",
      "신청기간": "임신 32주부터 출산 후 90일 이내"
    },
    estSavingManwon: 150,
    id: "ic-postpartum-care-voucher",
    level: "city",
    name: "맘편한 산후조리비 지원",
    oneLiner: "산후조리비 인천e음 포인트 150만원",
    sourceTitle: "인천광역시 맘편한 산후조리비 지원",
    sourceUrl: "https://www.incheon.go.kr/icbenefit/ICB020201/view?srvcId=628000000744",
    stages: ["newborn", "vulnerable"],
    supportSummary: "산후조리비 인천e음 포인트 지급",
    target: "취약계층 산모",
    verifiedAt: "2026-05-31"
  },
  {
    amountOrRate: "월 70만원",
    applicationOrg: "계양구",
    applicationUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    category: "birth",
    confidence: "확인",
    duration: "최대 6개월",
    eligibility: {
      "육아휴직최소일": 30,
      "비고": "주민등록·고용보험 요건은 공고 확인"
    },
    estSavingManwon: 420,
    id: "gyeyang-dad-parental-leave",
    level: "district",
    name: "아빠 육아휴직 장려금 (계양구)",
    note: "계양구 거주자 한정",
    oneLiner: "계양구 거주 아빠 육아휴직 시 월 70만원",
    sourceTitle: "계양구 아빠 육아휴직 장려금 지원",
    sourceUrl: "https://www.incheon.go.kr/icbenefit/ICB010201",
    stages: ["newborn"],
    supportSummary: "육아휴직 장려금",
    target: "육아휴직을 사용하는 아빠",
    verifiedAt: "2026-05-31"
  }
];

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
  birth: "출산·육아",
  "housing-loan": "주택 구입·대출",
  "housing-rent": "전·월세·임대",
  youth: "청년"
};

export const POLICY_LEVEL_LABELS: Record<PolicyLevel, string> = {
  central: "중앙",
  city: "인천시",
  district: "군·구"
};
