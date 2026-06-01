// v2 가계부 로컬 저장소 (localStorage). 로그아웃 상태에서 SSOT.
// 로그인 후엔 sync_v2 가 원격 데이터를 fetch해 이 위로 덮어쓴다.

import { CATEGORIES_V2 } from "./categories_v2";
import type { BudgetV2State, Gifts } from "./types_v2";

const KEY = "sinhon.budget.v2";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const DEFAULT_GIFTS: Gifts = {
  tier: 1,
  tier1: { headcount: 150, avgAmount: 80_000 },
  tier2: {
    친구: { count: 60, avg: 80_000 },
    직장: { count: 50, avg: 50_000 },
    가족: { count: 40, avg: 100_000 },
  },
  actual: 0,
  sideSplit: false,
  sideBreakdown: { 신랑: 0.42, 신부: 0.58 },
};

export function defaultV2State(): BudgetV2State {
  return {
    weddingDate: null,
    expenses: CATEGORIES_V2.map((c) => ({
      categoryId: c.id,
      planned: 0,
      spent: 0,
    })),
    gifts: DEFAULT_GIFTS,
    recentExpenses: [],
  };
}

export function loadV2(): BudgetV2State {
  const s = safeStorage();
  if (!s) return defaultV2State();
  try {
    const raw = s.getItem(KEY);
    if (!raw) return defaultV2State();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultV2State();
    // 카테고리 누락 시 채워 넣는다(스키마 진화 대비)
    const expensesById = new Map<string, { planned: number; spent: number }>(
      (parsed.expenses ?? []).map((e: { categoryId: string; planned: number; spent: number }) => [
        e.categoryId,
        { planned: e.planned ?? 0, spent: e.spent ?? 0 },
      ]),
    );
    const expenses = CATEGORIES_V2.map((c) => ({
      categoryId: c.id,
      planned: expensesById.get(c.id)?.planned ?? 0,
      spent: expensesById.get(c.id)?.spent ?? 0,
    }));
    return {
      weddingDate: parsed.weddingDate ?? null,
      expenses,
      gifts: { ...DEFAULT_GIFTS, ...(parsed.gifts ?? {}) },
      recentExpenses: Array.isArray(parsed.recentExpenses) ? parsed.recentExpenses : [],
    };
  } catch {
    return defaultV2State();
  }
}

export function saveV2(state: BudgetV2State): void {
  const s = safeStorage();
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota/storage error — ignore */
  }
}
