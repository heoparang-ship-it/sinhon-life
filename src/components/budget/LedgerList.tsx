"use client";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { getCategory } from "@/lib/budget/categories";
import { formatLedgerDate, krw } from "@/lib/budget/format";
import { groupEntriesByDate } from "@/lib/budget/summary";
import type { LedgerEntry } from "@/lib/budget/types";

function LedgerRow({ entry, onClick }: { entry: LedgerEntry; onClick: () => void }) {
  const isIncome = entry.type === "income";
  const cat = getCategory(entry.categoryId);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };
  const label = isIncome ? entry.incomeSource || "수입" : cat.name;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${entry.memo} 수정`}
      onClick={onClick}
      onKeyDown={onKey}
      className="flex items-center gap-3.5 px-1 py-3.5 border-b border-[rgba(120,140,170,0.10)] cursor-pointer"
    >
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          background: isIncome ? "#3B8BCF" : cat.color,
          boxShadow: isIncome ? "0 0 0 4px rgba(74,155,224,0.12)" : `0 0 0 4px ${cat.color}1A`,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink tracking-tight truncate">{entry.memo}</div>
        <div className="mt-0.5 text-[11px] text-mute">
          {label} · {entry.payer} · {entry.method}
        </div>
      </div>
      <div
        className={`text-sm font-extrabold tabular-nums whitespace-nowrap ${
          isIncome ? "text-blue-accent" : "text-expense"
        }`}
      >
        {isIncome ? "+" : "−"}
        {krw(entry.amount, false)}
      </div>
    </div>
  );
}

export function LedgerList({
  entries,
  activeCategory,
  onAddClick,
  onEntryClick,
}: {
  entries: LedgerEntry[];
  activeCategory: string;
  onAddClick: () => void;
  onEntryClick: (entry: LedgerEntry) => void;
}) {
  const filtered = activeCategory === "all" ? entries : entries.filter((e) => e.categoryId === activeCategory);
  const groups = groupEntriesByDate(filtered);
  return (
    <section className="px-7 pt-8 pb-[200px]">
      <div className="flex items-end justify-between px-1 mb-4">
        <div>
          <MicroLabel>Entries</MicroLabel>
          <div className="mt-2.5 text-[20px] font-semibold tracking-tightest text-ink">최근 내역</div>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="h-9 px-3.5 border-0 rounded-full bg-pill-active text-white text-xs font-extrabold shadow-[0_10px_24px_-16px_rgba(74,155,224,0.55)]"
        >
          + 내역 추가
        </button>
      </div>
      <div className="-mt-2 mb-[18px] mx-1 text-[11px] text-faint">
        총 {filtered.length}건 · 항목을 눌러 수정
      </div>
      {groups.length === 0 && (
        <div className="py-11 text-center text-sm text-mute">아직 이 카테고리의 내역이 없어요.</div>
      )}
      {groups.map((group, i) => {
        const dayTotal = group.entries.reduce(
          (sum, entry) =>
            sum + (entry.type === "income" ? Number(entry.amount || 0) : -Number(entry.amount || 0)),
          0,
        );
        return (
          <div key={group.date} className={i === 0 ? "" : "mt-6"}>
            <div className="flex justify-between items-baseline px-1 pb-1.5">
              <span className="text-xs font-semibold text-ink-soft">{formatLedgerDate(group.date)}</span>
              <span
                className={`text-[11.5px] font-bold tabular-nums ${
                  dayTotal >= 0 ? "text-blue-accent" : "text-expense"
                }`}
              >
                {dayTotal >= 0 ? "+" : "−"}
                {krw(Math.abs(dayTotal), false)}
              </span>
            </div>
            {group.entries.map((entry) => (
              <LedgerRow key={entry.id} entry={entry} onClick={() => onEntryClick(entry)} />
            ))}
          </div>
        );
      })}
    </section>
  );
}
