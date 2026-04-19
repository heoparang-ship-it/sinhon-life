"use client";

import { useEffect, useMemo, useState } from "react";
import Eyebrow from "@/components/design/Eyebrow";
import SectionTitle from "@/components/design/SectionTitle";
import ProgressCard from "@/components/checklist/ProgressCard";
import ChecklistGroupCard from "@/components/checklist/ChecklistGroupCard";
import {
  CHECKLIST_SEED,
  getInitialDoneMap,
  readDoneMap,
  writeDoneMap,
} from "@/lib/design/checklist";

export default function ChecklistPage() {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readDoneMap();
    setDoneMap(Object.keys(stored).length === 0 ? getInitialDoneMap() : stored);
    setMounted(true);
  }, []);

  const toggle = (itemId: string) => {
    setDoneMap((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      writeDoneMap(next);
      return next;
    });
  };

  const { done, total, nextLabel } = useMemo(() => {
    let d = 0;
    let t = 0;
    let next: string | undefined;
    for (const g of CHECKLIST_SEED) {
      for (const it of g.items) {
        t += 1;
        if (doneMap[it.id]) d += 1;
        else if (!next) next = it.name;
      }
    }
    return { done: d, total: t, nextLabel: next };
  }, [doneMap]);

  if (!mounted) {
    return <div className="pt-6 pb-24 px-4 text-ink-muted text-sm">불러오는 중…</div>;
  }

  return (
    <div className="pt-6 pb-24">
      <div className="px-5 mb-5">
        <Eyebrow tone="mint">wedding checklist</Eyebrow>
        <h1 className="font-serif text-[28px] leading-tight tracking-tightest text-ink mt-1 wb-keep">
          결혼 준비, 어디까지 왔나요
        </h1>
        <p className="text-[13px] text-ink-muted mt-1">
          결혼 준비·신혼집·혼수·신혼여행 18항목을 한눈에. 체크는 자동 저장돼요.
        </p>
      </div>

      <div className="px-4 mb-6">
        <ProgressCard done={done} total={total} nextLabel={nextLabel} />
      </div>

      <SectionTitle title="그룹별 진행률" accent="coral" />

      <div className="px-4 space-y-3">
        {CHECKLIST_SEED.map((group) => (
          <ChecklistGroupCard
            key={group.id}
            group={group}
            doneMap={doneMap}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  );
}
