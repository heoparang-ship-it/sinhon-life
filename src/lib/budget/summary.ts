import { LEDGER_CATEGORIES } from "./categories";
import type { BudgetMap, LedgerEntry } from "./types";

export type CategorySummary = {
  id: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  remaining: number;
  rate: number;
};

export type LedgerSummary = {
  totalBudget: number;
  expenseTotal: number;
  incomeTotal: number;
  remaining: number;
  spentRate: number;
  byCategory: CategorySummary[];
};

export function summarizeLedger(entries: LedgerEntry[], budgets?: BudgetMap | null): LedgerSummary {
  const resolved = LEDGER_CATEGORIES.map((c) => ({
    ...c,
    budget: Number(budgets && budgets[c.id] != null ? budgets[c.id] : c.defaultBudget) || 0,
  }));
  const totalBudget = resolved.reduce((sum, c) => sum + c.budget, 0);
  const expenseTotal = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const incomeTotal = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const byCategory: CategorySummary[] = resolved.map((c) => {
    const spent = entries
      .filter((e) => e.type === "expense" && e.categoryId === c.id)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return {
      id: c.id,
      name: c.name,
      color: c.color,
      budget: c.budget,
      spent,
      remaining: c.budget - spent,
      rate: c.budget ? Math.min(100, Math.round((spent / c.budget) * 100)) : 0,
    };
  });
  return {
    totalBudget,
    expenseTotal,
    incomeTotal,
    remaining: totalBudget - expenseTotal,
    spentRate: totalBudget ? Math.min(100, Math.round((expenseTotal / totalBudget) * 100)) : 0,
    byCategory,
  };
}

export function groupEntriesByDate(entries: LedgerEntry[]) {
  const groups: Array<{ date: string; entries: LedgerEntry[] }> = [];
  entries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((entry) => {
      let group = groups.find((g) => g.date === entry.date);
      if (!group) {
        group = { date: entry.date, entries: [] };
        groups.push(group);
      }
      group.entries.push(entry);
    });
  return groups;
}
