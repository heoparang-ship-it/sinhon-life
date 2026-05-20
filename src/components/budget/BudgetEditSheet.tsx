"use client";
import { useEffect, useRef, useState } from "react";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { LEDGER_CATEGORIES } from "@/lib/budget/categories";
import { formatAmountInput, krw, krwHangul, parseAmountInput } from "@/lib/budget/format";
import type { BudgetMap } from "@/lib/budget/types";

export function BudgetEditSheet({
  onClose,
  onSave,
  initialBudgets,
  isFirstSetup,
  focusCategoryId,
}: {
  onClose: () => void;
  onSave: (b: BudgetMap) => void | Promise<void>;
  initialBudgets: BudgetMap | null;
  isFirstSetup: boolean;
  focusCategoryId?: string;
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const seed = LEDGER_CATEGORIES.reduce<Record<string, string>>((acc, c) => {
    const v = initialBudgets && initialBudgets[c.id] != null ? initialBudgets[c.id] : c.defaultBudget;
    acc[c.id] = formatAmountInput(v);
    return acc;
  }, {});
  const [values, setValues] = useState(seed);

  useEffect(() => {
    if (focusCategoryId && inputRefs.current[focusCategoryId]) {
      const el = inputRefs.current[focusCategoryId];
      el?.focus();
      el?.select();
    }
  }, [focusCategoryId]);

  const total = LEDGER_CATEGORIES.reduce((sum, c) => sum + parseAmountInput(values[c.id]), 0);

  const update = (id: string, v: string) => setValues((prev) => ({ ...prev, [id]: formatAmountInput(v) }));

  const submit = () => {
    const out: BudgetMap = {};
    LEDGER_CATEGORIES.forEach((c) => {
      out[c.id] = parseAmountInput(values[c.id]);
    });
    onSave(out);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[60]">
      <div
        onClick={isFirstSetup ? undefined : onClose}
        className="absolute inset-0 bg-[rgba(26,36,51,0.26)] backdrop-blur-[5px]"
      />
      <div className="absolute left-3.5 right-3.5 top-10 bottom-[18px] rounded-[26px] bg-white shadow-[0_-20px_60px_-24px_rgba(20,40,80,0.35)] p-[18px] pb-[22px] flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <MicroLabel>{isFirstSetup ? "Setup Budget" : "Edit Budget"}</MicroLabel>
            <div className="mt-1.5 text-xl font-bold tracking-tightest text-ink">
              {isFirstSetup ? "예산 설정" : "예산 편집"}
            </div>
            <div className="mt-1 text-[11.5px] text-mute">
              {isFirstSetup ? "카테고리별 예산을 입력해 시작하세요" : "카테고리별 예산을 수정하세요"}
            </div>
          </div>
          {!isFirstSetup && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 border-0 rounded-full bg-[#F1F5F9] text-mute text-xl"
            >
              ×
            </button>
          )}
        </div>

        <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-[rgba(74,155,224,0.06)] flex justify-between items-center">
          <span className="text-[11.5px] font-bold text-blue-accent tracking-[0.04em] uppercase">
            총 예산
          </span>
          <span className="text-right">
            <span className="text-base font-extrabold text-ink tabular-nums">{krw(total)}</span>
            {total > 0 && <div className="text-[10.5px] text-mute mt-px">{krwHangul(total)}</div>}
          </span>
        </div>

        <div className="mt-3.5 flex-1 overflow-y-auto pr-0.5">
          {LEDGER_CATEGORIES.map((c, i) => {
            const highlighted = focusCategoryId === c.id;
            return (
              <div
                key={c.id}
                className={`grid grid-cols-[1fr_1.4fr] gap-3 items-center py-2.5 px-1.5 ${
                  i === 0 ? "" : "border-t border-[rgba(120,140,170,0.10)]"
                } ${highlighted ? "bg-[rgba(74,155,224,0.06)] rounded-[10px] -mx-1.5" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-7 rounded-full" style={{ background: c.color }} />
                  <span className="text-sm font-bold text-ink">{c.name}</span>
                </div>
                <div className="relative">
                  <input
                    ref={(el) => {
                      inputRefs.current[c.id] = el;
                    }}
                    value={values[c.id]}
                    onChange={(e) => update(c.id, e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className={`w-full h-11 border rounded-xl px-3 text-sm font-semibold text-ink outline-none bg-[#F8FBFE] text-right tabular-nums pr-7 ${
                      highlighted
                        ? "border-[rgba(74,155,224,0.45)]"
                        : "border-[rgba(120,140,170,0.18)]"
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-mute pointer-events-none">
                    원
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-3.5 w-full h-[52px] border-0 rounded-2xl bg-pill-active text-white text-[15px] font-extrabold shadow-[0_18px_36px_-16px_rgba(74,155,224,0.55)]"
        >
          {isFirstSetup ? "시작하기" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
