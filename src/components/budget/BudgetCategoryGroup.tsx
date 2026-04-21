"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  CATEGORY_ICONS,
  CATEGORY_TEMPLATES,
  WHO_ROLES,
  formatWon,
  type Transaction,
  type TxnCategory,
  type Who,
} from "@/lib/design/budget";
import { useCoupleProfile } from "@/lib/design/useCoupleProfile";

// Role-keyed chip colors — constant. The *label* follows useCoupleProfile so
// renames propagate instantly via the storage + custom-event fan-out.
const whoChip: Record<Who, string> = {
  A: "bg-coral-100 text-coral-700",
  B: "bg-mint-100 text-mint-700",
  JOINT: "bg-honey-100 text-honey-800",
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
  const { partnerA, partnerB } = useCoupleProfile();
  const whoLabel: Record<Who, string> = {
    A: partnerA,
    B: partnerB,
    JOINT: "공동",
  };

  const [open, setOpen] = useState(defaultOpen);
  // `addOpen` holds either null (closed) or a draft: the current form state.
  // When a 미입력 template row is tapped the form opens with `name` prefilled.
  const [addDraft, setAddDraft] = useState<null | {
    name: string;
    amount: string;
    who: Who;
  }>(null);

  const categorySum = txns.reduce((acc, t) => acc + t.amount, 0);
  const pct = totalSpent > 0 ? Math.round((categorySum / totalSpent) * 100) : 0;

  // 2안 — empty template rows. A template is "미입력" when no existing
  // transaction in this category shares its exact name (case-insensitive,
  // trimmed). Custom-named transactions just get ignored by this filter.
  const unfilledTemplates = useMemo(() => {
    const takenNames = new Set(
      txns.map((t) => t.name.trim().toLowerCase()).filter(Boolean),
    );
    return CATEGORY_TEMPLATES[category].filter(
      (tpl) => !takenNames.has(tpl.trim().toLowerCase()),
    );
  }, [txns, category]);

  const openForName = (name: string) => {
    setOpen(true);
    setAddDraft({ name, amount: "", who: "JOINT" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDraft) return;
    const n = parseInt(addDraft.amount.replace(/[^0-9]/g, ""), 10);
    if (!addDraft.name.trim() || !Number.isFinite(n) || n <= 0) return;
    onAdd({
      id: `t-${Date.now()}`,
      icon: CATEGORY_ICONS[category],
      name: addDraft.name.trim(),
      category,
      who: addDraft.who,
      amount: n,
      time: "방금",
      createdAt: Date.now(),
    });
    setAddDraft(null);
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
            {txns.length}건 입력
            {unfilledTemplates.length > 0 && ` · ${unfilledTemplates.length}건 미입력`}
            {totalSpent > 0 && categorySum > 0 && ` · ${pct}%`}
          </div>
        </div>
        <span className="font-mono text-[13px] font-bold text-coral-700 shrink-0">
          {categorySum > 0 ? formatWon(categorySum).replace("₩ ", "₩") : "—"}
        </span>
        <ChevronDown
          size={18}
          className={`text-ink-muted transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* [입력됨] section — actual transactions */}
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
                    {whoLabel[t.who]}
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

          {/* [미입력] section — template placeholders. Tap → prefilled form. */}
          {unfilledTemplates.length > 0 && (
            <div className="border-t border-paper-line bg-paper/40">
              <div className="px-4 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted font-bold">
                미입력 · 탭해서 금액 입력
              </div>
              {unfilledTemplates.map((tpl, i) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => openForName(tpl)}
                  className={`w-full px-4 py-2.5 flex items-center gap-2.5 text-left active:bg-paper transition ${
                    i !== 0 ? "border-t border-paper-line/60" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-paper-line flex items-center justify-center text-[12px] text-ink-muted shrink-0">
                    ＋
                  </div>
                  <div className="flex-1 min-w-0 text-[13px] text-ink-soft tracking-tight truncate">
                    {tpl}
                  </div>
                  <div className="font-mono text-[11px] text-ink-muted shrink-0">미입력</div>
                </button>
              ))}
            </div>
          )}

          {/* Draft form — opens inline, prefilled if launched from a template */}
          {addDraft ? (
            <form onSubmit={submit} className="border-t border-paper-line p-3 space-y-2.5 bg-paper/50">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_TEMPLATES[category].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() =>
                      setAddDraft((d) => (d ? { ...d, name: tpl } : d))
                    }
                    className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium transition active:scale-95 ${
                      addDraft.name === tpl
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
                value={addDraft.name}
                onChange={(e) =>
                  setAddDraft((d) => (d ? { ...d, name: e.target.value } : d))
                }
                placeholder="항목명 (예: 스튜디오 잔금)"
                className="w-full bg-paper-surface rounded-xl px-3.5 py-2.5 text-[13.5px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
                autoFocus
              />
              <input
                type="text"
                inputMode="numeric"
                value={addDraft.amount}
                onChange={(e) =>
                  setAddDraft((d) =>
                    d ? { ...d, amount: e.target.value.replace(/[^0-9]/g, "") } : d,
                  )
                }
                placeholder="금액 (원)"
                className="w-full bg-paper-surface rounded-xl px-3.5 py-2.5 text-[13.5px] border border-paper-line focus:outline-none focus:ring-2 focus:ring-coral-300"
                autoFocus={!!addDraft.name}
              />
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {WHO_ROLES.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() =>
                        setAddDraft((d) => (d ? { ...d, who: w } : d))
                      }
                      className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition ${
                        addDraft.who === w
                          ? whoChip[w]
                          : "bg-paper-surface text-ink-muted border border-paper-line"
                      }`}
                    >
                      {whoLabel[w]}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setAddDraft(null)}
                  className="text-[12px] text-ink-muted px-3 py-1.5"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!addDraft.name.trim() || !addDraft.amount}
                  className="text-[12px] font-bold text-white bg-coral-500 px-3 py-1.5 rounded-full active:scale-95 transition disabled:opacity-40"
                >
                  추가
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => openForName("")}
              className="w-full py-2.5 text-[12.5px] font-medium text-coral-700 border-t border-paper-line flex items-center justify-center gap-1.5 active:bg-paper transition"
            >
              <Plus size={14} strokeWidth={2} />
              {category}에 새 항목 추가
            </button>
          )}
        </>
      )}
    </div>
  );
}
