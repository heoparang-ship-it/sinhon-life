"use client";

import { useEffect, useMemo, useState } from "react";
import Eyebrow from "@/components/design/Eyebrow";
import SectionTitle from "@/components/design/SectionTitle";
import SummaryCard from "@/components/budget/SummaryCard";
import SpendSplit from "@/components/budget/SpendSplit";
import UpcomingList from "@/components/budget/UpcomingList";
import BudgetCategoryGroup from "@/components/budget/BudgetCategoryGroup";
import AddTxnButton from "@/components/budget/AddTxnButton";
import {
  BUDGET_SEED_UPCOMING,
  CATEGORIES,
  groupByCategory,
  readTxns,
  summarize,
  writeTxns,
  type Transaction,
  type TxnCategory,
} from "@/lib/design/budget";

export default function BudgetPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTxns(readTxns());
    setMounted(true);
  }, []);

  const summary = useMemo(() => summarize(txns), [txns]);
  const byCat = useMemo(() => groupByCategory(txns), [txns]);

  const addTxn = (t: Transaction) => {
    setTxns((prev) => {
      const next = [t, ...prev];
      writeTxns(next);
      return next;
    });
  };

  const deleteTxn = (id: string) => {
    setTxns((prev) => {
      const next = prev.filter((t) => t.id !== id);
      writeTxns(next);
      return next;
    });
  };

  if (!mounted) {
    return <div className="pt-6 pb-24 px-4 text-ink-muted text-sm">불러오는 중…</div>;
  }

  return (
    <div className="pt-6 pb-28">
      <div className="px-5 mb-5">
        <Eyebrow tone="coral">wedding budget</Eyebrow>
        <h1 className="font-serif text-[28px] leading-tight tracking-tightest text-ink mt-1 wb-keep">
          우리 부부 결혼, 지금까지 얼마 썼나요
        </h1>
        <p className="text-[13px] text-ink-muted mt-1 wb-keep">
          카테고리를 탭해서 펼치고, 각 그룹 안에서 지출을 바로 추가·삭제할 수 있어요.
        </p>
      </div>

      <SummaryCard summary={summary} />
      <SpendSplit summary={summary} />

      <SectionTitle title="이번 주 예정 지출" accent="honey" />
      <UpcomingList items={BUDGET_SEED_UPCOMING} />

      <SectionTitle title="카테고리별 지출" accent="coral" />
      <div className="px-4 space-y-3">
        {CATEGORIES.map((cat: TxnCategory) => (
          <BudgetCategoryGroup
            key={cat}
            category={cat}
            txns={byCat[cat] ?? []}
            totalSpent={summary.totalSpent}
            onAdd={addTxn}
            onDelete={deleteTxn}
          />
        ))}
      </div>

      <AddTxnButton onAdd={addTxn} />
    </div>
  );
}
