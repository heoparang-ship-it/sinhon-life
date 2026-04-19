"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Eyebrow from "@/components/design/Eyebrow";
import SectionTitle from "@/components/design/SectionTitle";
import ProgressCard from "@/components/checklist/ProgressCard";
import ChecklistGroupCard from "@/components/checklist/ChecklistGroupCard";
import {
  addCustomItem,
  cycleWho,
  getMergedGroups,
  readDoneMap,
  removeItem,
  setItemWho,
  writeDoneMap,
  type Assignee,
  type ChecklistGroup,
} from "@/lib/design/checklist";

export default function ChecklistPage() {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setDoneMap(readDoneMap());
    setGroups(getMergedGroups());
    setMounted(true);
  }, [tick]);

  const bump = useCallback(() => setTick((t) => t + 1), []);

  const toggle = useCallback(
    (itemId: string) => {
      setDoneMap((prev) => {
        const next = { ...prev, [itemId]: !prev[itemId] };
        writeDoneMap(next);
        return next;
      });
    },
    [],
  );

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

  const { done, total, nextLabel } = useMemo(() => {
    let d = 0;
    let t = 0;
    let next: string | undefined;
    for (const g of groups) {
      for (const it of g.items) {
        t += 1;
        if (doneMap[it.id]) d += 1;
        else if (!next) next = it.name;
      }
    }
    return { done: d, total: t, nextLabel: next };
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
          9개 그룹 {total}항목 기본 템플릿 · +버튼으로 추가, −버튼으로 삭제, 담당 칩을 눌러 함께/신랑/신부 순환.
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
            onToggle={toggle}
            onRemove={handleRemove}
            onCycleWho={handleCycleWho}
            onAddCustom={handleAdd}
          />
        ))}
      </div>
    </div>
  );
}
