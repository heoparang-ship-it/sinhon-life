"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_TEMPLATES,
  WHO_ROLES,
  type Transaction,
  type TxnCategory,
  type Who,
} from "@/lib/design/budget";
import { useCoupleProfile } from "@/lib/design/useCoupleProfile";

export default function AddTxnButton({
  onAdd,
}: {
  onAdd: (t: Transaction) => void;
}) {
  const { partnerA, partnerB } = useCoupleProfile();
  const whoLabel: Record<Who, string> = {
    A: partnerA,
    B: partnerB,
    JOINT: "공동",
  };

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TxnCategory>("예식장");
  const [who, setWho] = useState<Who>("JOINT");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!name.trim() || !Number.isFinite(n) || n <= 0) return;
    const txn: Transaction = {
      id: `t-${Date.now()}`,
      icon: CATEGORY_ICONS[category],
      name: name.trim(),
      category,
      who,
      amount: n,
      time: "방금",
      createdAt: Date.now(),
    };
    onAdd(txn);
    setOpen(false);
    setName("");
    setAmount("");
  };

  const pickTemplate = (tpl: string) => {
    setName(tpl);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="지출 추가"
        className="fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center shadow-xl active:scale-95 transition"
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
            className="w-full max-w-sm bg-paper-surface rounded-3xl p-5 space-y-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[20px] font-medium tracking-tight">결혼 지출 추가</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-ink-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                카테고리
              </span>
              <div className="mt-1.5 -mx-1 px-1 flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.map((c) => {
                  const isActive = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-tight transition ${
                        isActive
                          ? "bg-ink text-paper"
                          : "bg-paper text-ink-soft border border-paper-line"
                      }`}
                    >
                      <span aria-hidden>{CATEGORY_ICONS[c]}</span>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                빠른 입력
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {CATEGORY_TEMPLATES[category].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => pickTemplate(tpl)}
                    className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium transition active:scale-95 ${
                      name === tpl
                        ? "bg-coral-500 text-white"
                        : "bg-paper text-ink border border-paper-line"
                    }`}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                항목명
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 한샘 2인 소파 / 스튜디오 잔금"
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

            <div>
              <span className="text-[11px] text-ink-muted font-mono uppercase tracking-wider">
                결제자
              </span>
              <div className="mt-1.5 flex gap-1.5">
                {WHO_ROLES.map((w) => {
                  const isActive = who === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWho(w)}
                      className={`flex-1 py-2 rounded-full text-[12.5px] font-bold transition ${
                        isActive
                          ? "bg-ink text-paper"
                          : "bg-paper text-ink-soft border border-paper-line"
                      }`}
                    >
                      {whoLabel[w]}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || !amount}
              className="w-full py-3 bg-coral-500 text-white rounded-full font-bold text-[14px] active:scale-95 transition disabled:opacity-40"
            >
              추가하기
            </button>
          </form>
        </div>
      )}
    </>
  );
}
