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
import {
  deleteEntryRemote,
  fetchRemoteBudgets,
  fetchRemoteEntries,
  pushBudgetsRemote,
  pushEntryRemote,
} from "@/lib/budget/sync";
import type { BudgetMap, LedgerEntry } from "@/lib/budget/types";
import { useSession } from "@/lib/supabase/useSession";

type EntrySheetState = { initial: LedgerEntry | null } | null;
type BudgetSheetState = { firstSetup: boolean; focusCategoryId?: string } | null;

export function BudgetScreen() {
  const session = useSession();
  const userId = session.user?.id ?? null;
  const isAuthed = session.status === "authenticated";

  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [budgets, setBudgets] = useState<BudgetMap | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [entrySheet, setEntrySheet] = useState<EntrySheetState>(null);
  const [budgetSheet, setBudgetSheet] = useState<BudgetSheetState>(null);

  // 초기 로딩: 로컬에서 먼저 채우고 mounted 표시
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

  // 로그인 후: 원격 데이터로 덮어쓰기 (last-write-wins)
  useEffect(() => {
    if (!isAuthed || !userId) return;
    let cancelled = false;
    (async () => {
      const [remoteEntries, remoteBudgets] = await Promise.all([
        fetchRemoteEntries(userId),
        fetchRemoteBudgets(userId),
      ]);
      if (cancelled) return;
      if (remoteEntries) setEntries(remoteEntries);
      if (remoteBudgets) {
        setBudgets(remoteBudgets);
        setBudgetSheet(null); // 원격에 예산 있으면 첫 셋업 시트 닫기
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, userId]);

  // 변경 시 로컬에 저장
  useEffect(() => {
    if (mounted) saveEntries(entries);
  }, [entries, mounted]);

  useEffect(() => {
    if (mounted && budgets) saveBudgets(budgets);
  }, [budgets, mounted]);

  const summary = summarizeLedger(entries, budgets);

  const upsertEntry = async (entry: LedgerEntry) => {
    let finalEntry = entry;
    if (isAuthed && userId) {
      const pushed = await pushEntryRemote(userId, entry);
      if (pushed) finalEntry = pushed;
    }
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id || e.id === finalEntry.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = finalEntry;
        return next;
      }
      return [finalEntry, ...prev];
    });
  };

  const deleteEntry = async (id: string) => {
    if (isAuthed && userId) await deleteEntryRemote(userId, id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const saveBudgetsCombined = async (next: BudgetMap) => {
    setBudgets(next);
    if (isAuthed && userId) await pushBudgetsRemote(userId, next);
  };

  if (!mounted) {
    return <div className="pt-16 px-6 text-mute text-sm">불러오는 중…</div>;
  }

  return (
    <div className="relative bg-white min-h-[100dvh]">
      <div className="pt-[18px] bg-surface">
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
      {entrySheet && (
        <div className="fixed inset-0 z-[60] max-w-[480px] mx-auto">
          <LedgerEntrySheet
            onClose={() => setEntrySheet(null)}
            onSave={upsertEntry}
            onDelete={deleteEntry}
            initial={entrySheet.initial}
          />
        </div>
      )}
      {!entrySheet && budgetSheet && (
        <div className="fixed inset-0 z-[60] max-w-[480px] mx-auto">
          <BudgetEditSheet
            onClose={() => setBudgetSheet(null)}
            onSave={saveBudgetsCombined}
            initialBudgets={budgets}
            isFirstSetup={budgetSheet.firstSetup}
            focusCategoryId={budgetSheet.focusCategoryId}
          />
        </div>
      )}
    </div>
  );
}
