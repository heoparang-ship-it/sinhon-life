// V3.1 wedding-only budget — removed generic categories (식비/생활/고정비/수입)
// that didn't belong in a wedding tracker. `기타` acts as the fallback for any
// legacy transactions still persisted under the old enum.

export type TxnCategory =
  | "예식장"
  | "스드메"
  | "예복"
  | "예물예단"
  | "혼수가전"
  | "신혼집"
  | "신혼여행"
  | "본식현금"
  | "기타";

export type Who = "지훈" | "서연" | "공동";

export const CATEGORIES: TxnCategory[] = [
  "예식장",
  "스드메",
  "예복",
  "예물예단",
  "혼수가전",
  "신혼집",
  "신혼여행",
  "본식현금",
  "기타",
];

export const CATEGORY_ICONS: Record<TxnCategory, string> = {
  예식장: "🏛️",
  스드메: "💒",
  예복: "👔",
  예물예단: "💎",
  혼수가전: "🛋️",
  신혼집: "🏠",
  신혼여행: "✈️",
  본식현금: "💵",
  기타: "📮",
};

// Quick-insert templates per category — tap a chip to pre-fill the name field.
export const CATEGORY_TEMPLATES: Record<TxnCategory, string[]> = {
  예식장: ["예식장 계약금", "예식장 잔금", "하객 식대 추가", "폐백실 사용료"],
  스드메: [
    "스튜디오 계약금",
    "스튜디오 잔금",
    "드레스 대여",
    "본식 메이크업",
    "리허설 드레스",
    "본식 헤어",
  ],
  예복: ["신랑 정장", "신부 한복", "혼주 한복", "이모님 의상", "구두"],
  예물예단: ["결혼반지", "예물 반지", "예단 현금", "이바지 음식", "시계"],
  혼수가전: [
    "냉장고",
    "세탁기",
    "건조기",
    "TV",
    "에어컨",
    "침대",
    "소파",
    "식탁",
    "커튼",
    "침구 세트",
  ],
  신혼집: ["이사 비용", "입주청소", "인테리어 공사", "도어락 교체", "관리비 예치금"],
  신혼여행: ["항공권", "숙박비", "여행자보험", "환전", "로밍/유심"],
  본식현금: ["주례비", "사회비", "축가비", "이모님/헬퍼비", "부케비", "감사봉투"],
  기타: ["청첩장 인쇄", "답례품", "상견례 식사", "폐백 의상", "기타"],
};

export interface Transaction {
  id: string;
  icon: string;
  name: string;
  category: TxnCategory;
  who: Who;
  amount: number;
  time: string;
  createdAt: number;
}

export interface Upcoming {
  id: string;
  icon: string;
  name: string;
  when: string;
  method: string;
  amount: number;
}

export function buildSeedTxns(): Transaction[] {
  const now = Date.now();
  return [
    { id: "t1", icon: "🏛️", name: "예식장 계약금", category: "예식장", who: "공동", amount: 3000000, time: "어제", createdAt: now - 86400_000 },
    { id: "t2", icon: "💒", name: "스튜디오 계약금", category: "스드메", who: "서연", amount: 800000, time: "어제", createdAt: now - 86400_000 - 3600_000 },
    { id: "t3", icon: "🛋️", name: "한샘 2인 소파", category: "혼수가전", who: "공동", amount: 689000, time: "2일 전", createdAt: now - 2 * 86400_000 },
    { id: "t4", icon: "👔", name: "신랑 정장 맞춤", category: "예복", who: "지훈", amount: 450000, time: "3일 전", createdAt: now - 3 * 86400_000 },
    { id: "t5", icon: "💵", name: "이모님 헬퍼비 (봉투)", category: "본식현금", who: "서연", amount: 500000, time: "3일 전", createdAt: now - 3 * 86400_000 - 3600_000 },
    { id: "t6", icon: "📮", name: "청첩장 인쇄 200부", category: "기타", who: "공동", amount: 180000, time: "5일 전", createdAt: now - 5 * 86400_000 },
  ];
}

export const BUDGET_SEED_UPCOMING: Upcoming[] = [
  { id: "u1", icon: "🏛️", name: "예식장 잔금", when: "4/25 (토)", method: "공동 계좌", amount: 4500000 },
  { id: "u2", icon: "💒", name: "스드메 잔금", when: "4/27 (월)", method: "서연 카드", amount: 1200000 },
  { id: "u3", icon: "💵", name: "주례·사회·축가 봉투", when: "본식일 아침", method: "현금", amount: 800000 },
];

const TXN_KEY = "sinhon.budget.txns";

function isValidCategory(v: unknown): v is TxnCategory {
  return (
    typeof v === "string" &&
    (CATEGORIES as string[]).includes(v)
  );
}

function normalizeTxn(raw: Partial<Transaction>): Transaction {
  const category: TxnCategory = isValidCategory(raw.category)
    ? (raw.category as TxnCategory)
    : "기타";
  return {
    id: String(raw.id ?? `t-${Date.now()}`),
    icon: String(raw.icon ?? CATEGORY_ICONS[category]),
    name: String(raw.name ?? ""),
    category,
    who: (raw.who ?? "공동") as Who,
    amount: Number(raw.amount ?? 0),
    time: String(raw.time ?? ""),
    createdAt: Number(raw.createdAt ?? Date.now()),
  };
}

export function readTxns(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TXN_KEY);
    if (!raw) return buildSeedTxns();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return buildSeedTxns();
    // Coerce legacy transactions (식비/생활 etc.) into the new enum so they
    // can still be summarized without crashing.
    return parsed.map((t) => normalizeTxn(t));
  } catch {
    return buildSeedTxns();
  }
}

export function writeTxns(txns: Transaction[]) {
  try {
    window.localStorage.setItem(TXN_KEY, JSON.stringify(txns));
  } catch {
    /* ignore */
  }
}

export function formatWon(amount: number): string {
  return "₩ " + amount.toLocaleString("ko-KR");
}

export interface BudgetSummary {
  totalSpent: number;
  byCategory: Record<TxnCategory, number>;
  byWho: Record<Who, number>;
}

export function summarize(txns: Transaction[]): BudgetSummary {
  const byCategory: Record<TxnCategory, number> = {
    예식장: 0,
    스드메: 0,
    예복: 0,
    예물예단: 0,
    혼수가전: 0,
    신혼집: 0,
    신혼여행: 0,
    본식현금: 0,
    기타: 0,
  };
  const byWho: Record<Who, number> = { 지훈: 0, 서연: 0, 공동: 0 };
  let totalSpent = 0;
  for (const t of txns) {
    const cat: TxnCategory = isValidCategory(t.category) ? t.category : "기타";
    totalSpent += t.amount;
    byCategory[cat] += t.amount;
    byWho[t.who] += t.amount;
  }
  return { totalSpent, byCategory, byWho };
}
