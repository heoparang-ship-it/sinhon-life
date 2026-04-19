// V3.1 — "신혼부부 지원금 1억원" 가이드 데이터.
// Incheon data sourced from a 2026-04 research pass over 인천주거포털·인천도시공사·
// 인천청년포털 and 복지로/마이홈. Numbers are **max estimates** and should carry
// the top-level disclaimer in the UI. Other regions carry national-only items
// for MVP; add city-specific perks as research lands.

export type RegionId = "seoul" | "incheon" | "gyeonggi" | "busan" | "daegu" | "etc";

export type BenefitCategoryId = "housing" | "loan" | "baby" | "tax" | "local";

export interface BenefitCategory {
  id: BenefitCategoryId;
  emoji: string;
  title: string;
  tone: "coral" | "mint" | "honey" | "ink";
  summary: string;
}

export const BENEFIT_CATEGORIES: BenefitCategory[] = [
  {
    id: "housing",
    emoji: "🏠",
    title: "주거",
    tone: "coral",
    summary: "특공 당첨·공공임대·매입임대 시세 대비 절감액",
  },
  {
    id: "loan",
    emoji: "💰",
    title: "대출 이자차액",
    tone: "mint",
    summary: "버팀목·디딤돌·지자체 이자지원 vs 시중금리",
  },
  {
    id: "baby",
    emoji: "👶",
    title: "출산·양육",
    tone: "coral",
    summary: "첫만남·부모급여·지역 출산장려금 누적",
  },
  {
    id: "tax",
    emoji: "📄",
    title: "세제",
    tone: "honey",
    summary: "혼인세액공제·청약 소득공제·취득세 감면",
  },
  {
    id: "local",
    emoji: "🏷",
    title: "지역 특별",
    tone: "ink",
    summary: "우리 지역에서만 받는 신혼·육아 혜택",
  },
];

export interface BenefitItem {
  title: string;
  agency: string;
  amount: string; // display string e.g. "월 3만원 (시세 대비 70% 절감)"
  amountValue: number; // rough KRW cumulative estimate for stacking totals
  condition?: string; // eligibility tag shown as chip
  note?: string;
  externalUrl?: string;
  policySlug?: string; // matches POLICIES[].slug to deep-link /policy/{slug}
}

export type RegionBenefits = Record<BenefitCategoryId, BenefitItem[]>;

const NATIONAL_TAX: BenefitItem[] = [
  {
    title: "혼인세액공제 (2025 신설)",
    agency: "국세청",
    amount: "부부 합계 최대 100만원",
    amountValue: 1000000,
    condition: "혼인신고 필수",
    note: "2024~2026년 혼인 시 최대 3년 이월 공제.",
    externalUrl: "https://www.nts.go.kr/",
  },
  {
    title: "청약통장 소득공제",
    agency: "국세청",
    amount: "연 최대 240만원 소득공제",
    amountValue: 900000,
    condition: "총급여 7천만 이하",
    note: "연 납입 300만 한도 40% 소득공제, 3년 누적 가치 산출.",
  },
  {
    title: "취득세 감면 (생애최초·신혼)",
    agency: "국세청·지자체",
    amount: "최대 200만원",
    amountValue: 2000000,
    condition: "생애최초 or 신혼부부",
    note: "주택가액 12억 이하, 조건 충족 시 취득세 100% 감면(200만 한도).",
  },
  {
    title: "월세 세액공제",
    agency: "국세청",
    amount: "연 최대 102만원",
    amountValue: 510000,
    condition: "총급여 8천만 이하",
    note: "월세 연 1,000만 한도, 17% 세액공제. 5년 누적 기준.",
  },
];

const NATIONAL_LOAN: BenefitItem[] = [
  {
    title: "신혼부부 전용 버팀목 전세대출",
    agency: "주택도시기금",
    amount: "시중금리 대비 이자차액 누적 2,000만원 (5년)",
    amountValue: 20000000,
    condition: "혼인 7년 이내 · 부부합산 연 7,500만 이하",
    note: "최저 연 1.5% 금리. 전세 3억 기준 연 400만원 절감, 5년 2,000만.",
    externalUrl: "https://nhuf.molit.go.kr/",
  },
  {
    title: "디딤돌 내집마련 대출",
    agency: "주택도시기금",
    amount: "이자차액 연 300만 × 10년",
    amountValue: 15000000,
    condition: "부부합산 연 8,500만 이하 · 주택가액 6억 이하",
    note: "최저 연 2.15% 금리. 10년 거주 기준 누적 절감 추정.",
    externalUrl: "https://nhuf.molit.go.kr/",
  },
];

const NATIONAL_BABY: BenefitItem[] = [
  {
    title: "첫만남이용권",
    agency: "보건복지부",
    amount: "첫째 200만 / 둘째 이상 300만",
    amountValue: 2500000,
    condition: "2024년 이후 출생",
    note: "국민행복카드 포인트. 만 1년 이내 사용.",
    externalUrl: "https://www.bokjiro.go.kr/",
  },
  {
    title: "부모급여 (만 0~23개월)",
    agency: "보건복지부",
    amount: "0세 월 100만 · 1세 월 50만",
    amountValue: 18000000,
    condition: "2024년 이후 출생",
    note: "2자녀 가구 24개월 누적 약 1,800만.",
    externalUrl: "https://www.bokjiro.go.kr/",
  },
  {
    title: "아동수당",
    agency: "보건복지부",
    amount: "월 10만 × 만 8세까지",
    amountValue: 9600000,
    condition: "만 8세 미만",
    note: "8년 누적 960만원.",
  },
];

const NATIONAL_HOUSING: BenefitItem[] = [
  {
    title: "신혼부부 특별공급",
    agency: "LH / SH / 지방공사",
    amount: "시세 대비 20~30% 할인 추정",
    amountValue: 50000000,
    condition: "당첨 필수 · 청약 6개월 이상",
    note: "당첨 시 시세 대비 1회성 큰 폭 절감. 운적 요소.",
    policySlug: "newlywed-special-supply",
  },
  {
    title: "신생아 특별공급",
    agency: "LH · 2자녀 가구",
    amount: "100% 추첨 + 분양가 우대",
    amountValue: 40000000,
    condition: "출산 2년 이내",
    note: "2024 신설. 당첨 확률 높음.",
    policySlug: "newborn-special-supply",
  },
];

const INCHEON_BENEFITS: RegionBenefits = {
  housing: [
    ...NATIONAL_HOUSING,
    {
      title: "천원주택 (전세임대)",
      agency: "인천도시공사(iH)",
      amount: "월 3만원 (시세 70~80% 절감)",
      amountValue: 4320000,
      condition: "혼인 7년 이내 · 부부합산 월평균 소득 130% 이하",
      note: "1일 1천원. 최장 6년 거주, 이후 공공임대 전환 가능.",
      externalUrl: "https://www.incheon.go.kr/housing/hou060103",
    },
    {
      title: "천원주택 (매입임대)",
      agency: "인천도시공사(iH)",
      amount: "월 20~40만 (시세 30% 수준)",
      amountValue: 21600000,
      condition: "혼인 7년 이내 · 연소득 1.3억 이하",
      note: "60~85㎡. 신생아·미성년 자녀 가구 우선.",
      externalUrl: "https://www.ih.co.kr/main/sale_lease/management/newlywed.jsp",
    },
    {
      title: "검단신도시 신혼부부 분양",
      agency: "인천도시공사·LH",
      amount: "시세 20~30% 할인 추정",
      amountValue: 30000000,
      condition: "청약·자격 요건 공고 시 확인",
      note: "마전·당하·불로·원당. 지하철 연장·인프라 확충 중.",
      externalUrl: "https://www.incheon.go.kr/build/BU040219",
    },
  ],
  loan: [
    ...NATIONAL_LOAN,
    {
      title: "i+ 집드림 이자지원",
      agency: "인천광역시",
      amount: "월 최대 25만 (연 300만) × 5년",
      amountValue: 15000000,
      condition: "2025년 이후 신생아 출생 가구 · 주택가액 6억 이하",
      note: "신생아 출산 가구 주담대 이자 직접 지원. 대출한도 3억.",
      externalUrl: "https://www.incheon.go.kr/housing/hou060201",
    },
    {
      title: "청년·신혼 임차보증금 이자지원",
      agency: "인천광역시",
      amount: "연 3.0~3.5% 이자 지원",
      amountValue: 3000000,
      condition: "19~39세 무주택 · 대출한도 1억",
      note: "1자녀 이상 가구 3.5% / 그 외 3.0%.",
      externalUrl: "https://youth.incheon.go.kr/dwelling/interest.jsp",
    },
    {
      title: "전세보증금반환보증 보증료 지원",
      agency: "인천광역시",
      amount: "최대 40만원",
      amountValue: 400000,
      condition: "보증금 3억 이하 · 신혼 연 7,500만 이하",
      note: "전세사기 예방 — HUG·HF·SGI 보증료 실비.",
      externalUrl: "https://www.incheon.go.kr/housing/hou030104",
    },
  ],
  baby: [
    ...NATIONAL_BABY,
    {
      title: "천사(1040) 지원금",
      agency: "인천광역시",
      amount: "월 120만원 × 최대 7년 (인천e음)",
      amountValue: 72800000,
      condition: "2023년 이후 출생 · 인천 거주",
      note: "인천 대표 출산 정책. 1~7세 누적 최대 7,280만.",
      externalUrl: "https://www.incheon.go.kr/welfare/WE020327",
    },
    {
      title: "강화·옹진 출산축하금",
      agency: "강화군·옹진군",
      amount: "첫째~다섯째 각 100만~250만 (구별 상이)",
      amountValue: 5000000,
      condition: "강화·옹진 거주 (인구소멸지역)",
      note: "다른 8개 구는 2024 말 폐지 · 천사지원금으로 통합.",
    },
  ],
  tax: [...NATIONAL_TAX],
  local: [
    {
      title: "아이돌봄서비스 (I-Mom)",
      agency: "여성가족부·인천",
      amount: "시간제 연 720시간 지원",
      amountValue: 3600000,
      condition: "맞벌이·한부모 · 만 12세 이하",
      note: "1회 2시간 이상 방문 돌봄. 복지로 또는 행정복지센터 신청.",
      externalUrl: "https://idolbom.go.kr/",
    },
    {
      title: "드림체크카드 (청년 구직지원)",
      agency: "인천광역시·인천테크노파크",
      amount: "월 50만원 × 6개월",
      amountValue: 3000000,
      condition: "18~39세 미취업",
      note: "드림체크 30만 + 인천e음 20만. 신혼부부 중 무직 배우자 활용 가능.",
      externalUrl: "https://youth.incheon.go.kr/job/dream.jsp",
    },
    {
      title: "청년 월세 지원",
      agency: "인천광역시",
      amount: "월 20만원 × 24개월",
      amountValue: 4800000,
      condition: "19~39세 · 중위소득 60% 이하",
      note: "부모와 별도 거주. 신혼 청년 배우자 활용 가능.",
      externalUrl: "https://youth.incheon.go.kr/dwelling/monthly.jsp",
    },
  ],
};

const SEOUL_BENEFITS: RegionBenefits = {
  housing: [
    ...NATIONAL_HOUSING,
    {
      title: "서울시 신혼부부 임차보증금 지원",
      agency: "서울특별시",
      amount: "보증금 최대 2억 · 연 최대 3.6% 이자 지원",
      amountValue: 18000000,
      condition: "혼인 7년 이내 · 부부합산 연 9,700만 이하",
      note: "서울 거주 · 주거비 부담 완화 핵심 사업.",
      externalUrl: "https://housing.seoul.go.kr/",
    },
    {
      title: "행복주택",
      agency: "SH서울주택도시공사",
      amount: "시세 60~80% 임대료",
      amountValue: 20000000,
      condition: "무주택 · 신혼·청년",
      note: "최장 10년 거주.",
      policySlug: "happy-housing",
    },
  ],
  loan: [...NATIONAL_LOAN],
  baby: [
    ...NATIONAL_BABY,
    {
      title: "서울시 첫째아 출산지원금",
      agency: "서울특별시",
      amount: "첫째 100만원 (자치구별 추가 가능)",
      amountValue: 1000000,
      condition: "서울 거주",
      note: "자치구마다 추가 장려금. 관할 주민센터 확인.",
    },
  ],
  tax: [...NATIONAL_TAX],
  local: [
    {
      title: "서울시 청년월세 지원",
      agency: "서울특별시",
      amount: "월 20만원 × 12개월",
      amountValue: 2400000,
      condition: "19~39세 · 중위소득 150% 이하",
      note: "서울 거주 청년. 신혼 청년 배우자 가능.",
      externalUrl: "https://housing.seoul.go.kr/",
    },
    {
      title: "서울형 아이돌봄·우리동네키움센터",
      agency: "서울특별시",
      amount: "시간당 5,000원~ 돌봄",
      amountValue: 1200000,
      condition: "만 6~12세",
      note: "자치구별 운영. 연간 절감 추정.",
    },
  ],
};

// Minimal MVP regions — only national items. Replace with researched data later.
function nationalOnly(): RegionBenefits {
  return {
    housing: [...NATIONAL_HOUSING],
    loan: [...NATIONAL_LOAN],
    baby: [...NATIONAL_BABY],
    tax: [...NATIONAL_TAX],
    local: [],
  };
}

export const BENEFITS_BY_REGION: Record<RegionId, RegionBenefits> = {
  seoul: SEOUL_BENEFITS,
  incheon: INCHEON_BENEFITS,
  gyeonggi: nationalOnly(),
  busan: nationalOnly(),
  daegu: nationalOnly(),
  etc: nationalOnly(),
};

export const REGION_LABELS: Record<RegionId, string> = {
  seoul: "서울",
  incheon: "인천",
  gyeonggi: "경기",
  busan: "부산",
  daegu: "대구",
  etc: "그 외",
};

export function sumRegion(region: RegionId): number {
  const data = BENEFITS_BY_REGION[region];
  let sum = 0;
  for (const catId of Object.keys(data) as BenefitCategoryId[]) {
    for (const item of data[catId]) {
      sum += item.amountValue;
    }
  }
  return sum;
}

export function sumCategory(region: RegionId, catId: BenefitCategoryId): number {
  return BENEFITS_BY_REGION[region][catId].reduce((acc, b) => acc + b.amountValue, 0);
}

export function formatMan(amount: number): string {
  const man = Math.round(amount / 10000);
  if (man >= 10000) {
    return `${(man / 10000).toFixed(1)}억`;
  }
  return `${man.toLocaleString("ko-KR")}만`;
}
