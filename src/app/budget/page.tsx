"use client";

import { useEffect, useState } from "react";
import Eyebrow from "@/components/design/Eyebrow";
import SectionTitle from "@/components/design/SectionTitle";
import SummaryCard from "@/components/budget/SummaryCard";
import SpendSplit from "@/components/budget/SpendSplit";
import UpcomingList from "@/components/budget/UpcomingList";
import TransactionList from "@/components/budget/TransactionList";
import AddTxnButton from "@/components/budget/AddTxnButton";
import {
  BUDGET_SEED_UPCOMING,
  readTxns,
  summarize,
  writeTxns,
  type Transaction,
} from "@/lib/design/budget";

export default function BudgetPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTxns(readTxns());
    setMounted(true);
  }, []);

  const addTxn = (t: Transaction) => {
    setTxns((prev) => {
      const next = [t, ...prev];
      writeTxns(next);
      return next;
    });
  };

  if (!mounted) {
    return <div className="pt-6 pb-24 px-4 text-ink-muted text-sm">불러오는 중…</div>;
  }

  const summary = summarize(txns);

  return (
    <div className="pt-6 pb-28">
      <div className="px-5 mb-5">
        <Eyebrow tone="coral">couple budget</Eyebrow>
        <h1 className="font-serif text-[28px] leading-tight tracking-tightest text-ink mt-1 wb-keep">
          우리 부부 한 달, 어디에 쓰고 있을까
        </h1>
        <p className="text-[13px] text-ink-muted mt-1">
          지훈·서연·공동 지출을 한 지갑에서 추적. 로컬에만 저장돼요.
        </p>
      </div>

      <SummaryCard summary={summary} />
      <SpendSplit summary={summary} />

      <SectionTitle title="이번 주 예정 지출" accent="honey" />
      <UpcomingList items={BUDGET_SEED_UPCOMING} />

      <SectionTitle title="최근 지출" accent="coral" />
      <TransactionList txns={txns} />

      <AddTxnButton onAdd={addTxn} />
    </div>
  );
}
