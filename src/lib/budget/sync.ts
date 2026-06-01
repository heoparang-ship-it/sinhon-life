"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BudgetMap, LedgerEntry } from "./types";

/**
 * Supabase ↔ 로컬 동기화.
 *
 * 정책 v1 (단순):
 * - 로그인 시: Supabase가 SSOT. 클라우드 데이터를 가져와 로컬을 덮어쓴다.
 * - 변경 시: 로컬 + Supabase 양쪽에 쓴다 (write-through). 충돌은 last-write-wins.
 * - 비로그인: 로컬만 사용.
 *
 * 정책 v2 (추후): 오프라인 큐잉, 디바이스간 머지, 부부 공동 가계부.
 */

function getClient() {
  try {
    return createSupabaseBrowserClient();
  } catch {
    return null;
  }
}

type DBEntry = {
  id: string;
  user_id: string;
  type: "expense" | "income";
  category_id: string;
  memo: string;
  payer: string;
  method: string;
  amount: number;
  date: string;
  income_source: string | null;
};

function dbToEntry(row: DBEntry): LedgerEntry {
  return {
    id: row.id,
    type: row.type,
    categoryId: row.category_id,
    memo: row.memo,
    payer: row.payer as LedgerEntry["payer"],
    method: row.method as LedgerEntry["method"],
    amount: row.amount,
    date: row.date,
    ...(row.income_source ? { incomeSource: row.income_source as LedgerEntry["incomeSource"] } : {}),
  };
}

function entryToDb(userId: string, entry: LedgerEntry) {
  return {
    id: entry.id.startsWith("local-") ? crypto.randomUUID() : entry.id,
    user_id: userId,
    type: entry.type,
    category_id: entry.categoryId,
    memo: entry.memo,
    payer: entry.payer,
    method: entry.method,
    amount: entry.amount,
    date: entry.date,
    income_source: entry.incomeSource ?? null,
  };
}

export async function fetchRemoteEntries(userId: string): Promise<LedgerEntry[] | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) {
    console.warn("[sync] fetch entries failed:", error.message);
    return null;
  }
  return (data as DBEntry[]).map(dbToEntry);
}

export async function fetchRemoteBudgets(userId: string): Promise<BudgetMap | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("budgets")
    .select("category_id, amount")
    .eq("user_id", userId);
  if (error) {
    console.warn("[sync] fetch budgets failed:", error.message);
    return null;
  }
  if (!data || data.length === 0) return null;
  const out: BudgetMap = {};
  for (const row of data) out[row.category_id] = row.amount;
  return out;
}

export async function pushEntryRemote(userId: string, entry: LedgerEntry): Promise<LedgerEntry | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const row = entryToDb(userId, entry);
  const { error } = await supabase.from("ledger_entries").upsert(row);
  if (error) {
    console.warn("[sync] push entry failed:", error.message);
    return null;
  }
  return { ...entry, id: row.id };
}

export async function deleteEntryRemote(userId: string, entryId: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("ledger_entries")
    .delete()
    .eq("user_id", userId)
    .eq("id", entryId);
  if (error) {
    console.warn("[sync] delete entry failed:", error.message);
    return false;
  }
  return true;
}

export async function pushBudgetsRemote(userId: string, budgets: BudgetMap): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const rows = Object.entries(budgets).map(([category_id, amount]) => ({
    user_id: userId,
    category_id,
    amount,
  }));
  const { error } = await supabase.from("budgets").upsert(rows);
  if (error) {
    console.warn("[sync] push budgets failed:", error.message);
    return false;
  }
  return true;
}
