"use client";
import { useEffect, useState } from "react";
import { BudgetEditSheet } from "./BudgetEditSheet";
import { BudgetHero } from "./BudgetHero";
import { CategoryBudgetCard } from "./CategoryBudgetCard";
import { CategoryRail } from "./CategoryRail";
import { LedgerEntrySheet } from "./LedgerEntrySheet";
import { LedgerList } from "./LedgerList";
import { loadBudgets, loadEntries, saveBudgets, saveEntries } from "@/lib/budget/storage";
import { summarizeLedger } from "@/lib/budget/summary";
import type { BudgetMap, LedgerEntry } from "@/lib/budget/types";

type EntrySheetState = { initial: LedgerEntry | null } | null;
type BudgetSheetState = { firstSetup: boolean; focusCategoryId?: string } | null;

export function BudgetScreen() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [budgets, setBudgets] = useState<BudgetMap | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [entrySheet, setEntrySheet] = useState<EntrySheetState>(null);
  const [budgetSheet, setBudgetSheet] = useState<BudgetSheetState>(null);

  // SSR-safe localStorage 로딩
  useEffect(() => {
    const loadedEntries = loadEntries();
    const loadedBudgets = loadBudgets();
    setEntries(loadedEntries);
    setBudgets(loadedBudgets);
    setMounted(true);
    if (loadedBudgets == null) {
      setBudgetSheet({ firstSetup: true });
    }
  }, []);

  useEffect(() => {
    if (mounted) saveEntries(entries);
  }, [entries, mounted]);

  useEffect(() => {
    if (mounted && budgets) saveBudgets(budgets);
  }, [budgets, mounted]);

  const summary = summarizeLedger(entries, budgets);

  const upsertEntry = (entry: LedgerEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = entry;
        return next;
      }
      return [entry, ...prev];
    });
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  if (!mounted) {
    return (
      <div className="pt-16 px-6 text-mute text-sm">불러오는 중…</div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="pt-[54px] bg-surface">
          <BudgetHero summary={summary} />
        </div>
        <CategoryRail activeCategory={activeCategory} onSelect={setActiveCategory} />
        <CategoryBudgetCard
          summary={summary}
          activeCategory={activeCategory}
          onEditAll={() => setBudgetSheet({ firstSetup: false })}
          onEditOne={(id) => setBudgetSheet({ firstSetup: false, focusCategoryId: id })}
        />
        <LedgerList
          entries={entries}
          activeCategory={activeCategory}
          onAddClick={() => setEntrySheet({ initial: null })}
          onEntryClick={(entry) => setEntrySheet({ initial: entry })}
        />
      </div>
      {entrySheet && (
        <LedgerEntrySheet
          onClose={() => setEntrySheet(null)}
          onSave={upsertEntry}
          onDelete={deleteEntry}
          initial={entrySheet.initial}
        />
      )}
      {!entrySheet && budgetSheet && (
        <BudgetEditSheet
          onClose={() => setBudgetSheet(null)}
          onSave={setBudgets}
          initialBudgets={budgets}
          isFirstSetup={budgetSheet.firstSetup}
          focusCategoryId={budgetSheet.focusCategoryId}
        />
      )}
    </div>
  );
}
