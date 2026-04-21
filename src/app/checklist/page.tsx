"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Eyebrow from "@/components/design/Eyebrow";
import SectionTitle from "@/components/design/SectionTitle";
import ProgressCard from "@/components/checklist/ProgressCard";
import ChecklistGroupCard from "@/components/checklist/ChecklistGroupCard";
import ChecklistSearch from "@/components/checklist/ChecklistSearch";
import ChecklistSearchResults, {
  type ActiveMatch,
  type HiddenMatch,
} from "@/components/checklist/ChecklistSearchResults";
import MemoModal from "@/components/checklist/MemoModal";
import { EmptyState } from "@/components/design/states";
import {
  addCustomItem,
  countHiddenItems,
  cycleWho,
  getHiddenItems,
  getMergedGroups,
  readDoneMap,
  readMemos,
  removeItem,
  restoreItem,
  setItemWho,
  setMemo,
  writeDoneMap,
  type Assignee,
  type ChecklistGroup,
} from "@/lib/design/checklist";
import { track } from "@/lib/analytics";

// Normalize for case/whitespace-insensitive matching. Korean input is already
// canonical once we lowercase + strip whitespace for substring search.
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

const SEARCH_DEBOUNCE_MS = 300;

export default function ChecklistPage() {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [memoMap, setMemoMap] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  const [memoTarget, setMemoTarget] = useState<{ id: string; name: string } | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setDoneMap(readDoneMap());
    setMemoMap(readMemos());
    setGroups(getMergedGroups());
    setHiddenCount(countHiddenItems());
    setMounted(true);
  }, [tick]);

  const bump = useCallback(() => setTick((t) => t + 1), []);

  const toggle = useCallback((itemId: string) => {
    setDoneMap((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      writeDoneMap(next);
      return next;
    });
  }, []);

  const handleRemove = useCallback(
    (itemId: string) => {
      removeItem(itemId);
      track("item_hidden", { itemId });
      bump();
    },
    [bump],
  );

  const handleRestore = useCallback(
    (itemId: string, itemName: string) => {
      restoreItem(itemId);
      track("item_unhidden", { itemId, via: "search" });
      track("item_added_from_search", { itemId, itemName, origin: "hidden" });
      bump();
    },
    [bump],
  );

  const handleAdd = useCallback(
    (groupId: string, data: { name: string; who: Assignee }) => {
      addCustomItem(groupId, data);
      bump();
    },
    [bump],
  );

  const handleCycleWho = useCallback(
    (itemId: string, current: Assignee) => {
      setItemWho(itemId, cycleWho(current));
      bump();
    },
    [bump],
  );

  const handleOpenMemo = useCallback((itemId: string, itemName: string) => {
    setMemoTarget({ id: itemId, name: itemName });
  }, []);

  const handleSaveMemo = useCallback(
    (memo: string) => {
      if (!memoTarget) return;
      setMemo(memoTarget.id, memo);
      setMemoMap(readMemos());
    },
    [memoTarget],
  );

  const { done, total } = useMemo(() => {
    let d = 0;
    let t = 0;
    for (const g of groups) {
      for (const it of g.items) {
        t += 1;
        if (doneMap[it.id]) d += 1;
      }
    }
    return { done: d, total: t };
  }, [doneMap, groups]);

  const nextLabel = useMemo(() => {
    for (const g of groups) {
      for (const it of g.items) {
        if (!doneMap[it.id]) return it.name;
      }
    }
    return undefined;
  }, [doneMap, groups]);

  // --- Search filtering ------------------------------------------------------

  const trimmedQuery = query.trim();
  const searchActive = trimmedQuery.length > 0;

  const { activeMatches, hiddenMatches } = useMemo(() => {
    if (!searchActive) {
      return { activeMatches: [] as ActiveMatch[], hiddenMatches: [] as HiddenMatch[] };
    }
    const q = normalize(trimmedQuery);
    const active: ActiveMatch[] = [];
    for (const g of groups) {
      for (const it of g.items) {
        if (normalize(it.name).includes(q)) {
          active.push({
            item: it,
            groupId: g.id,
            groupTitle: g.title,
            groupIcon: g.icon,
          });
        }
      }
    }
    const hidden: HiddenMatch[] = getHiddenItems()
      .filter((h) => normalize(h.item.name).includes(q))
      .map((h) => ({
        item: h.item,
        groupId: h.groupId,
        groupTitle: h.groupTitle,
        groupIcon: h.groupIcon,
      }));
    return { activeMatches: active, hiddenMatches: hidden };
    // `hiddenCount` included so re-derivation runs after a restore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery, searchActive, groups, hiddenCount]);

  const resultCount = activeMatches.length + hiddenMatches.length;

  // Debounce `checklist_search_input` analytics event so we don't spam on
  // every keystroke. Fires 300ms after the last keystroke.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!mounted) return;
    if (!searchActive) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      track("checklist_search_input", {
        query: trimmedQuery,
        resultCount,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmedQuery, searchActive, resultCount, mounted]);

  // --- Render ---------------------------------------------------------------

  if (!mounted) {
    return <div className="pt-6 pb-24 px-4 text-ink-muted text-sm">불러오는 중…</div>;
  }

  return (
    <div className="pt-6 pb-24">
      <div className="px-5 mb-5">
        <Eyebrow tone="mint">wedding checklist · {total} items</Eyebrow>
        <h1 className="font-serif text-[28px] leading-tight tracking-tightest text-ink mt-1 wb-keep">
          결혼 전 과정, 우리 부부 맞춤으로
        </h1>
        <p className="text-[13px] text-ink-muted mt-1 wb-keep">
          그룹을 탭해 펼치고, 담당 칩으로 역할 바꾸고, 📝를 눌러 메모를 남겨요.
        </p>
      </div>

      <div className="px-4 mb-6">
        <ProgressCard done={done} total={total} nextLabel={nextLabel} />
      </div>

      {/* V3.2 S1 · F4 검색창 */}
      <div className="px-4 mb-5">
        <ChecklistSearch
          value={query}
          onChange={setQuery}
          hiddenCount={hiddenCount}
        />
      </div>

      {searchActive ? (
        <div className="px-4">
          {resultCount > 0 ? (
            <ChecklistSearchResults
              activeMatches={activeMatches}
              hiddenMatches={hiddenMatches}
              doneMap={doneMap}
              onToggle={toggle}
              onRestore={handleRestore}
            />
          ) : (
            <EmptyState
              icon="🔍"
              title="검색 결과가 없어요"
              body={`"${trimmedQuery}" 와 맞는 항목이 없어요. 다른 키워드로 검색해 보세요.`}
            />
          )}
        </div>
      ) : (
        <>
          <SectionTitle title="그룹별 진행률" accent="coral" />

          <div className="px-4 space-y-3">
            {groups.map((group) => (
              <ChecklistGroupCard
                key={group.id}
                group={group}
                doneMap={doneMap}
                memoMap={memoMap}
                defaultOpen={false}
                onToggle={toggle}
                onRemove={handleRemove}
                onCycleWho={handleCycleWho}
                onAddCustom={handleAdd}
                onOpenMemo={handleOpenMemo}
              />
            ))}
          </div>
        </>
      )}

      <MemoModal
        open={!!memoTarget}
        itemName={memoTarget?.name ?? ""}
        initialMemo={memoTarget ? memoMap[memoTarget.id] ?? "" : ""}
        onClose={() => setMemoTarget(null)}
        onSave={handleSaveMemo}
      />
    </div>
  );
}
