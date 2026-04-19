"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Eyebrow from "@/components/design/Eyebrow";
import SectionTitle from "@/components/design/SectionTitle";
import ProgressCard from "@/components/checklist/ProgressCard";
import ChecklistGroupCard from "@/components/checklist/ChecklistGroupCard";
import MemoModal from "@/components/checklist/MemoModal";
import {
  addCustomItem,
  cycleWho,
  getMergedGroups,
  readDoneMap,
  readMemos,
  removeItem,
  setItemWho,
  setMemo,
  writeDoneMap,
  type Assignee,
  type ChecklistGroup,
} from "@/lib/design/checklist";

export default function ChecklistPage() {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [memoMap, setMemoMap] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  const [memoTarget, setMemoTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setDoneMap(readDoneMap());
    setMemoMap(readMemos());
    setGroups(getMergedGroups());
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
