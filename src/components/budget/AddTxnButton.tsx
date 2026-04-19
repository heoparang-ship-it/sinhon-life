"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Transaction, TxnCategory, Who } from "@/lib/design/budget";

const CATEGORIES: TxnCategory[] = ["식비", "생활", "고정비", "혼수", "수입", "기타"];
const WHO: Who[] = ["지훈", "서연", "공동"];
const ICONS_BY_CAT: Record<TxnCategory, string> = {
  식비: "🍚",
  생활: "🧺",
  고정비: "📱",
  혼수: "🛋️",
  수입: "💸",
  기타: "🧾",
};

export default function AddTxnButton({
  onAdd,
}: {
  onAdd: (t: Transaction) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TxnCategory>("식비");
  const [who, setWho] = useState<Who>("지훈");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!name.trim() || !Number.isFinite(n) || n <= 0) return;
    const txn: Transaction = {
      id: `t-${Date.now()}`,
      icon: ICONS_BY_CAT[category],
      name: name.trim(),
      category,
      who,
      amount: n,
      income: category === "수입",
      time: "방금",
      createdAt: Date.now(),
    };
    onAdd(txn);
    setOpen(false);
    setName("");
    setAmount("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="지출 추가"
        className="fixed bottom-24 right-4 z-30 w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center shadow-xl active:scale-95 transition"
      >
        <Plus size={22} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-sm bg-paper-surface rounded-3xl p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[20px] font-medium tracking-tight">지출 추가</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-ink-muted"
              >
                <X size={20} />
              </button>
            </div>

            <label className="block">
              <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                항목
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 한샘 소파"
                className="w-full mt-1 bg-paper rounded-xl px-3.5 py-2.5 text-[14px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
              />
            </label>

            <label className="block">
              <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                금액 (원)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="w-full mt-1 bg-paper rounded-xl px-3.5 py-2.5 text-[14px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                  분류
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TxnCategory)}
                  className="w-full mt-1 bg-paper rounded-xl px-3 py-2.5 text-[14px] border border-paper-line"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                  결제자
                </span>
                <select
                  value={who}
                  onChange={(e) => setWho(e.target.value as Who)}
                  className="w-full mt-1 bg-paper rounded-xl px-3 py-2.5 text-[14px] border border-paper-line"
                >
                  {WHO.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-coral-500 text-white rounded-full font-bold text-[14px] active:scale-95 transition"
            >
              추가하기
            </button>
          </form>
        </div>
      )}
    </>
  );
}
