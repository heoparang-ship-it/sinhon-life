"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function getClient() {
  try {
    return createSupabaseBrowserClient();
  } catch {
    return null;
  }
}

type DBRow = {
  user_id: string;
  item_id: string;
  done: boolean;
};

export async function fetchRemoteDoneMap(userId: string): Promise<Record<string, boolean> | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("checklist_state")
    .select("item_id, done")
    .eq("user_id", userId);
  if (error) {
    console.warn("[sync] fetch checklist failed:", error.message);
    return null;
  }
  const out: Record<string, boolean> = {};
  for (const row of data as DBRow[]) out[row.item_id] = row.done;
  return Object.keys(out).length > 0 ? out : null;
}

export async function pushChecklistItem(
  userId: string,
  itemId: string,
  done: boolean,
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  const { error } = await supabase.from("checklist_state").upsert({
    user_id: userId,
    item_id: itemId,
    done,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn("[sync] push checklist item failed:", error.message);
    return false;
  }
  return true;
}
