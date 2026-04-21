// V3.1 wedding-only budget — removed generic categories (식비/생활/고정비/수입)
// that didn't belong in a wedding tracker. `기타` acts as the fallback for any
// legacy transactions still persisted under the old enum.
//
// Schema v2 (2026-04-21): `Who` switched from literal names ("지훈"/"서연"/"공동")
// to role keys ("A"/"B"/"JOINT") so the display labels can follow
// useCoupleProfile (partnerA/partnerB) without touching stored data. A
// one-shot legacy migration inside `normalizeTxn` silently rewrites old
// transactions on read.

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

export type Who = "A" | "B" | "JOINT";

export const WHO_ROLES: Who[] = ["A", "B", "JOINT"];

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
// These also drive the "미입력" placeholder rows in BudgetCategoryGroup: any
// template name without a matching Transaction is rendered as an empty slot.
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

// 2안 — seed a clean slate. Category groups show CATEGORY_TEMPLATES as
// "미입력" placeholder rows; users tap to fill in just the amount.
export function buildSeedTxns(): Transaction[] {
  return [];
}

// Kept as a neutral, rename-friendly preview of "돌아올 청구". Method text
// avoids any one partner's name so it stays sensible after rename. Users
// will eventually replace these with their own upcoming entries.
export const BUDGET_SEED_UPCOMING: Upcoming[] = [
  { id: "u1", icon: "🏛️", name: "예식장 잔금", when: "예식 2주 전", method: "공동 계좌", amount: 0 },
  { id: "u2", icon: "💒", name: "스드메 잔금", when: "예식 3주 전", method: "배우자 카드", amount: 0 },
  { id: "u3", icon: "💵", name: "주례·사회·축가 봉투", when: "본식일 아침", method: "현금", amount: 0 },
];

const TXN_KEY = "sinhon.budget.txns";

function isValidCategory(v: unknown): v is TxnCategory {
  return (
    typeof v === "string" &&
    (CATEGORIES as string[]).includes(v)
  );
}

// Legacy-name → role-key migration. Old transactions persisted before
// 2026-04-21 stored `who: "지훈" | "서연" | "공동"` literally; anything unknown
// defaults to JOINT so the sum still balances.
function migrateWho(raw: unknown): Who {
  if (raw === "A" || raw === "B" || raw === "JOINT") return raw;
  if (raw === "지훈") return "A";
  if (raw === "서연") return "B";
  if (raw === "공동") return "JOINT";
  return "JOINT";
}

function normalizeTxn(raw: Partial<Transaction> & { who?: unknown }): Transaction {
  const category: TxnCategory = isValidCategory(raw.category)
    ? (raw.category as TxnCategory)
    : "기타";
  return {
    id: String(raw.id ?? `t-${Date.now()}`),
    icon: String(raw.icon ?? CATEGORY_ICONS[category]),
    name: String(raw.name ?? ""),
    category,
    who: migrateWho(raw.who),
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
    // Coerce legacy transactions (식비/생활/지훈/서연 etc.) into the new enum
    // so they can still be summarized without crashing.
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

export function groupByCategory(txns: Transaction[]): Record<TxnCategory, Transaction[]> {
  const acc: Record<TxnCategory, Transaction[]> = {
    예식장: [], 스드메: [], 예복: [], 예물예단: [], 혼수가전: [],
    신혼집: [], 신혼여행: [], 본식현금: [], 기타: [],
  };
  for (const t of txns) {
    const cat: TxnCategory = isValidCategory(t.category) ? t.category : "기타";
    acc[cat].push(t);
  }
  return acc;
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
  const byWho: Record<Who, number> = { A: 0, B: 0, JOINT: 0 };
  let totalSpent = 0;
  for (const t of txns) {
    const cat: TxnCategory = isValidCategory(t.category) ? t.category : "기타";
    totalSpent += t.amount;
    byCategory[cat] += t.amount;
    byWho[t.who] += t.amount;
  }
  return { totalSpent, byCategory, byWho };
}
