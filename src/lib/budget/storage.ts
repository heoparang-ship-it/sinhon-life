import type { BudgetMap, LedgerEntry } from "./types";

const ENTRIES_KEY = "sinhon.ledger.entries.v1";
const BUDGETS_KEY = "sinhon.ledger.budgets.v1";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadEntries(): LedgerEntry[] {
  const s = safeStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: LedgerEntry[]): void {
  const s = safeStorage();
  if (!s) return;
  try {
    s.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch {
    /* quota or storage error — ignore */
  }
}

export function loadBudgets(): BudgetMap | null {
  const s = safeStorage();
  if (!s) return null;
  try {
    const raw = s.getItem(BUDGETS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBudgets(budgets: BudgetMap): void {
  const s = safeStorage();
  if (!s) return;
  try {
    s.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch {
    /* ignore */
  }
}
