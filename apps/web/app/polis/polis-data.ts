export type PolisPolicy = {
  id: string;
  cat: string;
  dept: string;
  icon: "b1" | "b2" | "b3" | "b4" | "b5" | "b6";
  title: string;
  short: string;
  amount: string;
  amountSub: string;
  match: number;
  deadline: string;
  deadlineTag: string;
  cash: number;
  dday: number | null;
  summary: string;
  benefits: [string, string][];
  eligibility: string[];
  sourceUrl?: string;
};

export const POLIS_POLICIES: PolisPolicy[] = [
  {
    id: "p1",
    sourceUrl: "https://nhuf.molit.go.kr/",
    cat: "전세/대출",
    dept: "주택도시기금",
    icon: "b1",
    title: "신혼부부 버팀목 전세자금대출",
    short: "버팀목 전세대출",
    amount: "최대 3억",
    amountSub: "연 1.5~2.7%",
    match: 97,
    deadline: "상시 신청",
    deadlineTag: "상시",
    cash: 0,
    dday: null,
    summary:
      "혼인 7년 이내 무주택 신혼부부에게 전세보증금의 최대 80%를 빌려줘요. 수도권 한도 3억원, 금리는 소득·보증금에 따라 연 1.5~2.7%로 시중 전세대출보다 크게 낮아요.",
    benefits: [
      ["대출 한도", "수도권 최대 3억원"],
      ["금리", "연 1.5~2.7%"],
      ["대출 비율", "보증금의 80%까지"],
      ["대출 기간", "기본 2년 (최장 10년)"]
    ],
    eligibility: [
      "혼인 7년 이내 또는 3개월 내 결혼 예정",
      "부부 모두 무주택",
      "부부합산 연소득 7,500만원 이하",
      "순자산 3.45억원 이하"
    ]
  },
  {
    id: "p2",
    sourceUrl: "https://www.bokjiro.go.kr/",
    cat: "출산",
    dept: "보건복지부",
    icon: "b4",
    title: "첫만남이용권",
    short: "첫만남이용권",
    amount: "200만원",
    amountSub: "출생아 1인당",
    match: 94,
    deadline: "출생 후 1년 이내",
    deadlineTag: "출생 1년",
    cash: 200,
    dday: 365,
    summary:
      "출생아 1명당 200만원(둘째부터 300만원)을 국민행복카드 바우처로 지급해요. 산후조리·육아용품 등 폭넓게 쓸 수 있고, 출생 후 1년 안에 신청하면 돼요.",
    benefits: [
      ["첫째", "200만원"],
      ["둘째 이상", "300만원"],
      ["지급 방식", "국민행복카드 바우처"],
      ["사용 기한", "출생일로부터 1년"]
    ],
    eligibility: ["2022년 이후 출생아 보호자", "출생 신고 완료", "국민행복카드 발급 가능"]
  },
  {
    id: "p3",
    sourceUrl: "https://www.applyhome.co.kr/",
    cat: "주거/청약",
    dept: "국토교통부",
    icon: "b1",
    title: "신혼부부 특별공급",
    short: "신혼 특별공급",
    amount: "우선 공급",
    amountSub: "공공 30% / 민영 18%",
    match: 90,
    deadline: "공고별 상이",
    deadlineTag: "공고중",
    cash: 0,
    dday: 21,
    summary:
      "혼인 7년 이내(예비부부 포함) 무주택 부부에게 아파트 물량을 따로 떼어 우선 공급해요. 자녀 수·청약통장 가입기간·거주기간으로 순위가 정해지고, 맞벌이 소득 기준이 완화돼요.",
    benefits: [
      ["대상 물량", "공공 30% / 민영 18%"],
      ["소득 기준", "맞벌이 200%까지 완화"],
      ["우선순위", "자녀 수 · 거주기간"],
      ["청약통장", "가입 6개월·6회 이상"]
    ],
    eligibility: [
      "혼인 7년 이내 또는 예비부부",
      "부부 모두 무주택",
      "청약통장 가입 6개월 이상",
      "해당 지역 거주 요건 충족"
    ]
  },
  {
    id: "p4",
    sourceUrl: "https://nhuf.molit.go.kr/",
    cat: "전세/대출",
    dept: "주택도시기금",
    icon: "b2",
    title: "신생아 특례 디딤돌 대출",
    short: "신생아 특례대출",
    amount: "최대 5억",
    amountSub: "연 1.6~3.3%",
    match: 86,
    deadline: "상시 신청",
    deadlineTag: "상시",
    cash: 0,
    dday: null,
    summary:
      "2년 이내 출산한 가구에 주택 구입자금을 최대 5억원까지 연 1.6~3.3%로 빌려줘요. 일반 신혼부부 디딤돌보다 한도와 금리가 유리해, 출산을 계획 중이라면 가장 강력한 카드예요.",
    benefits: [
      ["대출 한도", "최대 5억원"],
      ["금리", "연 1.6~3.3%"],
      ["대상 주택", "9억원 이하 주택"],
      ["특례 기간", "출산 후 5년"]
    ],
    eligibility: [
      "대출 신청일 기준 2년 내 출산",
      "부부 모두 무주택",
      "부부합산 연소득 1.3억원 이하",
      "순자산 4.69억원 이하"
    ]
  },
  {
    id: "p5",
    sourceUrl: "https://apply.lh.or.kr/",
    cat: "주거/청약",
    dept: "LH",
    icon: "b1",
    title: "신혼희망타운",
    short: "신혼희망타운",
    amount: "시세 이하",
    amountSub: "분양형 / 임대형",
    match: 83,
    deadline: "모집 공고별",
    deadlineTag: "모집중",
    cash: 0,
    dday: 30,
    summary:
      "신혼부부·예비부부에게 시세보다 저렴하게 공급하는 신혼 특화 단지예요. 분양형과 임대형이 있고, 단지 전체가 육아 친화 설계로 지어져 아이 키우기 좋아요.",
    benefits: [
      ["공급 형태", "분양형 / 임대형"],
      ["분양가", "시세의 70~80% 수준"],
      ["전용 대출", "연 1.3% 수익공유형 모기지"],
      ["특화 설계", "국공립 어린이집·놀이터"]
    ],
    eligibility: [
      "혼인 7년 이내 또는 예비부부",
      "무주택 세대구성원",
      "월평균 소득 기준 충족",
      "총자산 기준 충족"
    ]
  },
  {
    id: "p6",
    sourceUrl: "https://www.bokjiro.go.kr/",
    cat: "건강/난임",
    dept: "보건복지부",
    icon: "b6",
    title: "난임부부 시술비 지원",
    short: "난임 시술비 지원",
    amount: "회당 110만원",
    amountSub: "최대 지원",
    match: 88,
    deadline: "상시 신청",
    deadlineTag: "상시",
    cash: 110,
    dday: null,
    summary:
      "체외수정·인공수정 등 난임 시술비를 회당 최대 110만원까지 지원해요. 소득 기준이 폐지·완화되어 이제 더 많은 부부가 받을 수 있어요.",
    benefits: [
      ["체외수정(신선)", "회당 최대 110만원"],
      ["체외수정(동결)", "회당 최대 50만원"],
      ["인공수정", "회당 최대 30만원"],
      ["지원 횟수", "총 25회"]
    ],
    eligibility: [
      "난임 진단을 받은 부부",
      "부부 중 1인 이상 건강보험 가입",
      "사실혼 부부도 신청 가능"
    ]
  },
  {
    id: "p7",
    sourceUrl: "https://apply.lh.or.kr/",
    cat: "주거/청약",
    dept: "LH / 지자체",
    icon: "b1",
    title: "신혼부부 전세임대주택",
    short: "신혼 전세임대",
    amount: "최대 1.35억",
    amountSub: "보증금 지원",
    match: 91,
    deadline: "수시 모집",
    deadlineTag: "모집중",
    cash: 0,
    dday: 14,
    summary:
      "LH가 집주인과 전세 계약을 맺고 신혼부부에게 저렴하게 재임대해요. 보증금의 일부만 부담하고 낮은 임대료로 원하는 집에 살 수 있어요.",
    benefits: [
      ["보증금 지원", "수도권 최대 1.35억원"],
      ["본인 부담금", "지원금의 5%"],
      ["임대료", "지원금의 연 1~2%"],
      ["거주 기간", "최장 20년"]
    ],
    eligibility: [
      "혼인 7년 이내 또는 예비부부",
      "무주택 세대구성원",
      "소득·자산 기준 충족",
      "해당 지역 거주"
    ]
  },
  {
    id: "p8",
    sourceUrl: "https://www.mapo.go.kr/",
    cat: "혼인/세제",
    dept: "마포구",
    icon: "b5",
    title: "마포구 결혼축하금",
    short: "마포구 결혼축하금",
    amount: "100만원",
    amountSub: "부부당",
    match: 89,
    deadline: "혼인신고 1년 이내",
    deadlineTag: "1년내",
    cash: 100,
    dday: 7,
    summary:
      "마포구에 주소를 둔 신혼부부에게 부부당 100만원의 결혼축하금을 지급해요. 혼인신고 1년 이내, 일정 기간 이상 관내 거주가 조건이에요.",
    benefits: [
      ["지원 금액", "부부당 100만원"],
      ["지급 방식", "지역사랑상품권"],
      ["신청 기한", "혼인신고 1년 이내"],
      ["거주 요건", "관내 6개월 이상"]
    ],
    eligibility: ["혼인신고 1년 이내", "부부 모두 마포구 주민등록", "관내 6개월 이상 거주"]
  }
];

export function policyById(id: string): PolisPolicy | undefined {
  return POLIS_POLICIES.find((p) => p.id === id);
}
