"use client";
import { useState } from "react";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { Pill } from "@/components/ui/Pill";
import { LEDGER_CATEGORIES } from "@/lib/budget/categories";
import { formatAmountInput, krwHangul, parseAmountInput } from "@/lib/budget/format";
import type { EntryType, IncomeSource, LedgerEntry, Method, Payer } from "@/lib/budget/types";

const inputClass =
  "w-full h-12 border border-[rgba(120,140,170,0.18)] rounded-[14px] px-3.5 text-sm font-semibold text-ink outline-none bg-[#F8FBFE]";

const INCOME_SOURCES: IncomeSource[] = ["축의금", "양가 지원금", "본인 저축", "기타"];

export function LedgerEntrySheet({
  onClose,
  onSave,
  onDelete,
  initial,
}: {
  onClose: () => void;
  onSave: (entry: LedgerEntry) => void;
  onDelete: (id: string) => void;
  initial: LedgerEntry | null;
}) {
  const editing = !!initial;
  const [type, setType] = useState<EntryType>(initial?.type || "expense");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "venue");
  const [incomeSource, setIncomeSource] = useState<IncomeSource>(initial?.incomeSource || "축의금");
  const [amount, setAmount] = useState(initial ? formatAmountInput(initial.amount) : "");
  const [memo, setMemo] = useState(initial?.memo || "");
  const [payer, setPayer] = useState<Payer>(initial?.payer || "공동");
  const [method, setMethod] = useState<Method>(initial?.method || "카드");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));

  const cleanAmount = parseAmountInput(amount);
  const canSubmit = cleanAmount > 0 && memo.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSave({
      id: initial?.id || `local-${Date.now()}`,
      type,
      categoryId,
      memo: memo.trim(),
      payer,
      method,
      amount: cleanAmount,
      date,
      ...(type === "income" ? { incomeSource } : {}),
    });
    onClose();
  };

  const remove = () => {
    if (!initial) return;
    if (typeof window !== "undefined" && !window.confirm(`'${initial.memo}' 내역을 삭제할까요?`)) return;
    onDelete(initial.id);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[60]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(26,36,51,0.26)] backdrop-blur-[5px]"
      />
      <div className="absolute left-3.5 right-3.5 bottom-[18px] max-h-[calc(100%-36px)] overflow-y-auto rounded-[26px] bg-white shadow-[0_-20px_60px_-24px_rgba(20,40,80,0.35)] p-[18px] pb-[22px]">
        <div className="flex items-center justify-between">
          <div>
            <MicroLabel>{editing ? "Edit Entry" : "New Entry"}</MicroLabel>
            <div className="mt-1.5 text-xl font-bold tracking-tightest text-ink">
              {editing ? "내역 수정" : "내역 추가"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 border-0 rounded-full bg-[#F1F5F9] text-mute text-xl"
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["expense", "income"] as EntryType[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setType(v)}
              className={`h-[42px] border-0 rounded-[14px] text-[13px] font-extrabold ${
                type === v ? "bg-pill-active text-white" : "bg-[#EEF3F8] text-blue-accent"
              }`}
            >
              {v === "expense" ? "지출" : "수입"}
            </button>
          ))}
        </div>

        {type === "income" && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
            {INCOME_SOURCES.map((s) => (
              <Pill
                key={s}
                onWhite
                active={incomeSource === s}
                size={32}
                onClick={() => setIncomeSource(s)}
                style={{ fontSize: 12, padding: "0 13px" }}
              >
                {s}
              </Pill>
            ))}
          </div>
        )}

        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <div>
            <div className="relative">
              <input
                value={amount}
                onChange={(e) => setAmount(formatAmountInput(e.target.value))}
                inputMode="numeric"
                placeholder="금액"
                className={`${inputClass} pr-[30px] text-right tabular-nums`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-mute pointer-events-none">
                원
              </span>
            </div>
            {cleanAmount > 0 && (
              <div className="mt-1 text-[10.5px] text-faint text-right">{krwHangul(cleanAmount)}</div>
            )}
          </div>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className={inputClass}
          />
        </div>

        <div className="mt-2.5">
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 웨딩홀 계약금"
            className={inputClass}
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {LEDGER_CATEGORIES.map((c) => (
            <Pill
              key={c.id}
              onWhite
              active={categoryId === c.id}
              size={32}
              onClick={() => setCategoryId(c.id)}
              style={{ fontSize: 12, padding: "0 13px" }}
            >
              {c.name}
            </Pill>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value as Payer)}
            className={inputClass}
          >
            <option>공동</option>
            <option>신랑</option>
            <option>신부</option>
            <option>양가</option>
          </select>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className={inputClass}
          >
            <option>카드</option>
            <option>이체</option>
            <option>현금</option>
            <option>입금</option>
          </select>
        </div>

        <button
          type="button"
          onClick={submit}
          className={`mt-4 w-full h-[52px] border-0 rounded-2xl text-[15px] font-extrabold ${
            canSubmit
              ? "bg-pill-active text-white shadow-[0_18px_36px_-16px_rgba(74,155,224,0.55)] cursor-pointer"
              : "bg-[#DDE7F1] text-faint cursor-default"
          }`}
          disabled={!canSubmit}
        >
          {editing ? "저장하기" : "추가하기"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={remove}
            className="mt-2.5 w-full h-11 border border-[rgba(224,82,99,0.30)] rounded-[14px] bg-[rgba(224,82,99,0.06)] text-expense text-[13px] font-semibold"
          >
            이 내역 삭제
          </button>
        )}
      </div>
    </div>
  );
}
