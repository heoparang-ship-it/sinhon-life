// V3.1 home redesign supplementary data — UrgentList, HomeTours, CategoryGrid seeds.
// These aren't sourced from the policy CMS yet; they mimic the feed layout of the
// design sandbox so the homepage visually hits the V3.1 spec. Replace with real
// feeds once backends exist.

export interface UrgentBenefit {
  dday: string;
  agency: string;
  title: string;
  req: string;
  amount: string;
  urgent?: boolean;
  link?: string;
}

export const URGENT_BENEFITS: UrgentBenefit[] = [
  {
    dday: "D-3",
    agency: "서울특별시",
    title: "신혼부부 월세지원",
    req: "혼인 7년 이내 · 중위소득 120% 이하",
    amount: "월 30만원",
    urgent: true,
    link: "https://housing.seoul.go.kr",
  },
  {
    dday: "D-12",
    agency: "LH · 행복주택",
    title: "2차 신혼부부 특별공급",
    req: "청약통장 6개월 · 무주택 세대",
    amount: "보증금 5천",
    link: "https://www.lh.or.kr",
  },
  {
    dday: "D-28",
    agency: "보건복지부",
    title: "첫만남 이용권",
    req: "2026년 출생 자녀 · 주민등록 완료",
    amount: "200만원",
  },
];

export interface HomeTour {
  slug: string;
  tag: string;
  meta: string;
  title: string;
  likes: number;
  comments: number;
  tone: "coral" | "mint" | "honey" | "paper" | "warm" | "cool";
}

export const HOME_TOURS: HomeTour[] = [
  {
    slug: "seongdong-24py",
    tag: "성동 · 24py",
    meta: "5월 입주 · 신랑 블로거",
    title: "예산 2천으로 꾸민 모던 미드센추리 거실",
    likes: 284,
    comments: 22,
    tone: "coral",
  },
  {
    slug: "bucheon-18py",
    tag: "부천 · 18py",
    meta: "4월 입주 · 신부 인스타",
    title: "소형 평수 수납의 모든 것, 주방 포함",
    likes: 198,
    comments: 14,
    tone: "mint",
  },
];

export interface HomeCategory {
  label: string;
  filter: string;
  count?: string;
  tone: "coral" | "mint" | "honey" | "ink";
}

// Flat 3x2 grid that hangs off Fraunces typography — uses same target routes as HUB_CATEGORIES.
export const HOME_CATEGORIES: HomeCategory[] = [
  { label: "새집 마련", filter: "home", tone: "coral", count: "24 benefits" },
  { label: "돈 모으기", filter: "money", tone: "mint", count: "18 benefits" },
  { label: "출산·육아", filter: "parenting", tone: "coral", count: "12 benefits" },
  { label: "예식 준비", filter: "wedding", tone: "honey", count: "9 guides" },
  { label: "신혼여행", filter: "honeymoon", tone: "ink", count: "7 guides" },
  { label: "세제 혜택", filter: "policy", tone: "mint", count: "15 benefits" },
];
