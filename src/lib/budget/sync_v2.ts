"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CATEGORIES_V2 } from "./categories_v2";
import { DEFAULT_GIFTS } from "./storage_v2";
import type {
  BudgetV2State,
  CategoryId,
  Expense,
  GiftGroupId,
  Gifts,
  RecentExpense,
} from "./types_v2";

/**
 * v2 Supabase 동기화. 정책:
 *   - 로그인 시 fetchV2Remote() 로 원격 SSOT 가져와 로컬에 덮어쓴다.
 *   - 변경 시 push* 함수로 원격에 write-through. 로컬도 즉시 갱신.
 *   - 충돌은 last-write-wins. v1 sync.ts 와 같은 정책.
 */

function getClient() {
  try {
    return createSupabaseBrowserClient();
  } catch {
    return null;
  }
}

// ─── fetch ─────────────────────────────────────────────────────────────

export async function fetchV2Remote(userId: string): Promise<BudgetV2State | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const [expensesRes, giftsRes, groupsRes, recentRes, profileRes] = await Promise.all([
    supabase.from("wedding_expenses").select("*").eq("user_id", userId),
    supabase.from("wedding_gifts").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("wedding_gift_groups").select("*").eq("user_id", userId),
    supabase
      .from("wedding_recent_expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(50),
    supabase.from("profiles").select("wedding_date").eq("id", userId).maybeSingle(),
  ]);

  if (expensesRes.error) console.warn("[sync v2] expenses fetch:", expensesRes.error.message);
  if (giftsRes.error) console.warn("[sync v2] gifts fetch:", giftsRes.error.message);
  if (groupsRes.error) console.warn("[sync v2] groups fetch:", groupsRes.error.message);
  if (recentRes.error) console.warn("[sync v2] recent fetch:", recentRes.error.message);

  // 카테고리 누락 시 0 채움
  const expensesById = new Map<string, { planned: number; spent: number }>(
    (expensesRes.data ?? []).map((r) => [r.category_id, { planned: r.planned, spent: r.spent }]),
  );
  const expenses: Expense[] = CATEGORIES_V2.map((c) => ({
    categoryId: c.id,
    planned: expensesById.get(c.id)?.planned ?? 0,
    spent: expensesById.get(c.id)?.spent ?? 0,
  }));

  // gifts 조립
  const g = giftsRes.data;
  const groupRows = groupsRes.data ?? [];
  const tier2 = { ...DEFAULT_GIFTS.tier2 };
  for (const row of groupRows) {
    const id = row.group_id as GiftGroupId;
    if (id in tier2) tier2[id] = { count: row.cnt, avg: row.avg };
  }
  const gifts: Gifts = g
    ? {
        tier: g.tier as 1 | 2 | 3,
        tier1: { headcount: g.tier1_headcount, avgAmount: g.tier1_avg_amount },
        tier2,
        actual: g.actual,
        sideSplit: g.side_split,
        sideBreakdown: { 신랑: Number(g.side_groom), 신부: Number(g.side_bride) },
      }
    : { ...DEFAULT_GIFTS, tier2 };

  const recentExpenses: RecentExpense[] = (recentRes.data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    categoryId: r.category_id as CategoryId,
    amount: r.amount,
    method: r.method as RecentExpense["method"],
  }));

  return {
    weddingDate: profileRes.data?.wedding_date ?? null,
    expenses,
    gifts,
    recentExpenses,
  };
}

// ─── push: expense (한 카테고리만) ─────────────────────────────────────

export async function pushExpenseRemote(
  userId: string,
  expense: Expense,
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const { error } = await supabase.from("wedding_expenses").upsert({
    user_id: userId,
    category_id: expense.categoryId,
    planned: expense.planned,
    spent: expense.spent,
  });
  if (error) {
    console.warn("[sync v2] push expense:", error.message);
    return false;
  }
  return true;
}

// ─── push: gifts (전체 한 번에) ─────────────────────────────────────────

export async function pushGiftsRemote(userId: string, gifts: Gifts): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const [g1, g2] = await Promise.all([
    supabase.from("wedding_gifts").upsert({
      user_id: userId,
      tier: gifts.tier,
      tier1_headcount: gifts.tier1.headcount,
      tier1_avg_amount: gifts.tier1.avgAmount,
      actual: gifts.actual,
      side_split: gifts.sideSplit,
      side_groom: gifts.sideBreakdown.신랑,
      side_bride: gifts.sideBreakdown.신부,
    }),
    supabase.from("wedding_gift_groups").upsert(
      (Object.entries(gifts.tier2) as [GiftGroupId, { count: number; avg: number }][]).map(
        ([group_id, g]) => ({
          user_id: userId,
          group_id,
          cnt: g.count,
          avg: g.avg,
        }),
      ),
    ),
  ]);
  if (g1.error) console.warn("[sync v2] push gifts:", g1.error.message);
  if (g2.error) console.warn("[sync v2] push gift groups:", g2.error.message);
  return !g1.error && !g2.error;
}

// ─── push: recent expense (1건 추가) ────────────────────────────────────

export async function pushRecentExpenseRemote(
  userId: string,
  entry: RecentExpense,
): Promise<RecentExpense | null> {
  const supabase = getClient();
  if (!supabase) return null;
  // 로컬 임시 id ("local-...") 는 새 uuid 발급, 기존 id 는 upsert
  const id = entry.id.startsWith("local-") ? crypto.randomUUID() : entry.id;
  const { error } = await supabase.from("wedding_recent_expenses").upsert({
    id,
    user_id: userId,
    category_id: entry.categoryId,
    title: entry.title,
    amount: entry.amount,
    date: entry.date,
    method: entry.method,
  });
  if (error) {
    console.warn("[sync v2] push recent:", error.message);
    return null;
  }
  return { ...entry, id };
}

export async function deleteRecentExpenseRemote(
  userId: string,
  id: string,
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("wedding_recent_expenses")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);
  if (error) {
    console.warn("[sync v2] delete recent:", error.message);
    return false;
  }
  return true;
}

// ─── push: wedding date (profiles) ──────────────────────────────────────

export async function pushWeddingDateRemote(
  userId: string,
  weddingDate: string | null,
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("profiles")
    .update({ wedding_date: weddingDate })
    .eq("id", userId);
  if (error) {
    console.warn("[sync v2] push wedding_date:", error.message);
    return false;
  }
  return true;
}
