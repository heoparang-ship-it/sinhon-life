export type TxnCategory = "식비" | "생활" | "고정비" | "혼수" | "수입" | "기타";
export type Who = "지훈" | "서연" | "공동";

export interface Transaction {
  id: string;
  icon: string;
  name: string;
  category: TxnCategory;
  who: Who;
  amount: number;
  income?: boolean;
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

// Seed data is computed lazily so timestamps don't clash with SSR snapshot.
export function buildSeedTxns(): Transaction[] {
  const now = Date.now();
  return [
    { id: "t1", icon: "🍚", name: "동네식당 · 김치찌개", category: "식비", who: "지훈", amount: 18000, time: "13:24", createdAt: now - 3600_000 },
    { id: "t2", icon: "☕", name: "스타벅스 · 라떼 2", category: "식비", who: "서연", amount: 10600, time: "10:08", createdAt: now - 2 * 3600_000 },
    { id: "t3", icon: "🛋️", name: "한샘 · 2인 소파", category: "혼수", who: "공동", amount: 689000, time: "어제", createdAt: now - 86400_000 },
    { id: "t4", icon: "💸", name: "월급 입금", category: "수입", who: "지훈", amount: 4200000, income: true, time: "어제", createdAt: now - 86400_000 - 7200_000 },
  ];
}

export const BUDGET_SEED_UPCOMING: Upcoming[] = [
  { id: "u1", icon: "🏠", name: "월세 이체", when: "4/25 (토)", method: "자동이체", amount: 1200000 },
  { id: "u2", icon: "📱", name: "통신비 · 공동", when: "4/27 (월)", method: "서연 카드", amount: 88000 },
  { id: "u3", icon: "💍", name: "스드메 잔금", when: "4/28 (화)", method: "지훈 계좌", amount: 2400000 },
];

const TXN_KEY = "sinhon.budget.txns";

export function readTxns(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TXN_KEY);
    if (!raw) return buildSeedTxns();
    return JSON.parse(raw) as Transaction[];
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
  totalIncome: number;
  byCategory: Record<TxnCategory, number>;
  byWho: Record<Who, number>;
}

export function summarize(txns: Transaction[]): BudgetSummary {
  const byCategory: Record<TxnCategory, number> = {
    식비: 0, 생활: 0, 고정비: 0, 혼수: 0, 수입: 0, 기타: 0,
  };
  const byWho: Record<Who, number> = { 지훈: 0, 서연: 0, 공동: 0 };
  let totalSpent = 0;
  let totalIncome = 0;
  for (const t of txns) {
    if (t.income) {
      totalIncome += t.amount;
    } else {
      totalSpent += t.amount;
      byCategory[t.category] += t.amount;
      byWho[t.who] += t.amount;
    }
  }
  return { totalSpent, totalIncome, byCategory, byWho };
}
