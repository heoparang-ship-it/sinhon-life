"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  CATEGORY_ICONS,
  CATEGORY_TEMPLATES,
  formatWon,
  type Transaction,
  type TxnCategory,
  type Who,
} from "@/lib/design/budget";

const WHO: Who[] = ["지훈", "서연", "공동"];

const whoChip: Record<Who, string> = {
  지훈: "bg-coral-100 text-coral-700",
  서연: "bg-mint-100 text-mint-700",
  공동: "bg-honey-100 text-honey-800",
};

export default function BudgetCategoryGroup({
  category,
  txns,
  totalSpent,
  defaultOpen = false,
  onAdd,
  onDelete,
}: {
  category: TxnCategory;
  txns: Transaction[];
  totalSpent: number;
  defaultOpen?: boolean;
  onAdd: (t: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [who, setWho] = useState<Who>("공동");

  const categorySum = txns.reduce((acc, t) => acc + t.amount, 0);
  const pct = totalSpent > 0 ? Math.round((categorySum / totalSpent) * 100) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!name.trim() || !Number.isFinite(n) || n <= 0) return;
    onAdd({
      id: `t-${Date.now()}`,
      icon: CATEGORY_ICONS[category],
      name: name.trim(),
      category,
      who,
      amount: n,
      time: "방금",
      createdAt: Date.now(),
    });
    setName("");
    setAmount("");
    setWho("공동");
    setAddOpen(false);
    setOpen(true);
  };

  return (
    <div className="bg-paper-surface border border-paper-line rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3.5 flex items-center gap-2.5 active:bg-paper transition text-left"
      >
        <div className="text-[18px]" aria-hidden>
          {CATEGORY_ICONS[category]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-bold text-ink tracking-tight">{category}</div>
          <div className="text-[11px] text-ink-muted mt-px">
            {txns.length}건 {totalSpent > 0 && `· ${pct}%`}
          </div>
        </div>
        <span className="font-mono text-[13px] font-bold text-coral-700 shrink-0">
          {formatWon(categorySum).replace("₩ ", "₩")}
        </span>
        <ChevronDown
          size={18}
          className={`text-ink-muted transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {txns.length > 0 && (
            <div className="border-t border-paper-line">
              {txns.map((t, i) => (
                <div
                  key={t.id}
                  className={`px-4 py-3 flex items-center gap-2.5 ${
                    i !== 0 ? "border-t border-paper-line" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-paper-alt flex items-center justify-center text-[14px] shrink-0">
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink tracking-tight truncate">
                      {t.name}
                    </div>
                    <div className="text-[10.5px] text-ink-muted mt-px">{t.time}</div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${whoChip[t.who]}`}
                  >
                    {t.who}
                  </span>
                  <div className="font-serif text-[13px] font-bold text-ink text-right shrink-0">
                    − {formatWon(t.amount).replace("₩ ", "")}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`"${t.name}" 지출을 삭제할까요?`)) onDelete(t.id);
                    }}
                    aria-label="지출 삭제"
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-coral-700 hover:bg-coral-50 active:scale-90 transition"
                  >
                    <Trash2 size={13} strokeWidth={1.9} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {addOpen ? (
            <form onSubmit={submit} className="border-t border-paper-line p-3 space-y-2.5 bg-paper/50">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_TEMPLATES[category].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setName(tpl)}
                    className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium transition active:scale-95 ${
                      name === tpl
                        ? "bg-coral-500 text-white"
                        : "bg-paper-surface text-ink border border-paper-line"
                    }`}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="항목명 (예: 스튜디오 잔금)"
                className="w-full bg-paper-surface rounded-xl px-3.5 py-2.5 text-[13.5px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
                autoFocus
              />
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="금액 (원)"
                className="w-full bg-paper-surface rounded-xl px-3.5 py-2.5 text-[13.5px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
              />
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {WHO.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWho(w)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition ${
                        who === w ? whoChip[w] : "bg-paper-surface text-ink-muted border border-paper-line"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => {
                    setAddOpen(false);
                    setName("");
                    setAmount("");
                  }}
                  className="text-[12px] text-ink-muted px-3 py-1.5"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || !amount}
                  className="text-[12px] font-bold text-white bg-coral-500 px-3 py-1.5 rounded-full active:scale-95 transition disabled:opacity-40"
                >
                  추가
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddOpen(true)}
              className="w-full py-2.5 text-[12.5px] font-medium text-coral-700 border-t border-paper-line flex items-center justify-center gap-1.5 active:bg-paper transition"
            >
              <Plus size={14} strokeWidth={2} />
              {category}에 지출 추가
            </button>
          )}
        </>
      )}
    </div>
  );
}
