export type Assignee = "함께" | "신랑" | "신부";

export interface ChecklistItem {
  id: string;
  name: string;
  who: Assignee;
  offsetDays?: number; // negative = past, 0 = today, positive = future
  defaultDone?: boolean;
}

export interface ChecklistGroup {
  id: string;
  icon: string;
  title: string;
  when: string;
  items: ChecklistItem[];
}

export const CHECKLIST_SEED: ChecklistGroup[] = [
  {
    id: "wedding",
    icon: "💍",
    title: "결혼 준비",
    when: "D-73",
    items: [
      { id: "wedding-venue", name: "예식장 계약", who: "함께", offsetDays: -85, defaultDone: true },
      { id: "wedding-sdm", name: "스드메 계약", who: "신부", offsetDays: -80, defaultDone: true },
      { id: "wedding-fitting", name: "웨딩드레스 1차 피팅", who: "신부", offsetDays: -5 },
      { id: "wedding-invite", name: "청첩장 디자인 시안 확정", who: "함께", offsetDays: -12 },
      { id: "wedding-mc", name: "축가/사회자 섭외", who: "함께", offsetDays: -20 },
    ],
  },
  {
    id: "house",
    icon: "🏡",
    title: "신혼집 준비",
    when: "D-60",
    items: [
      { id: "house-moving", name: "이사 견적 비교 (3곳)", who: "신랑", offsetDays: -55, defaultDone: true },
      { id: "house-internet", name: "인터넷·TV 신규 설치 예약", who: "신랑", offsetDays: -30 },
      { id: "house-gas", name: "도시가스 전출 신고", who: "신랑", offsetDays: -15 },
      { id: "house-delivery", name: "가전 배송일 조율", who: "함께", offsetDays: -10 },
    ],
  },
  {
    id: "furniture",
    icon: "🛋️",
    title: "혼수·가구",
    when: "D-45",
    items: [
      { id: "furn-sofa", name: "소파 (2인용)", who: "함께", defaultDone: true },
      { id: "furn-table", name: "식탁 (원목)", who: "함께", defaultDone: true },
      { id: "furn-bed", name: "침대 프레임 + 매트리스", who: "신부", offsetDays: -14 },
      { id: "furn-rug", name: "거실 러그 고르기", who: "함께", offsetDays: 0 },
      { id: "furn-curtain", name: "커튼 채광별 결정", who: "신부", offsetDays: -7 },
    ],
  },
  {
    id: "honeymoon",
    icon: "✈️",
    title: "신혼여행",
    when: "D-40",
    items: [
      { id: "hm-dest", name: "여행지 확정 (몰디브)", who: "함께", defaultDone: true },
      { id: "hm-flight", name: "항공권 예약", who: "신랑", defaultDone: true },
      { id: "hm-resort", name: "리조트 예약", who: "신부", offsetDays: -3 },
      { id: "hm-insurance", name: "여행자보험 가입", who: "신랑", offsetDays: -10 },
    ],
  },
];

const STORAGE_KEY = "sinhon.checklist.done";

export function readDoneMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeDoneMap(map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function formatOffset(offset?: number): string {
  if (offset === undefined) return "";
  if (offset === 0) return "오늘";
  return `${offset > 0 ? "+" : ""}${offset}`;
}

export function getInitialDoneMap(): Record<string, boolean> {
  const seed: Record<string, boolean> = {};
  for (const group of CHECKLIST_SEED) {
    for (const item of group.items) {
      if (item.defaultDone) seed[item.id] = true;
    }
  }
  return seed;
}
