"use client";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { krw } from "@/lib/budget/format";
import type { LedgerSummary } from "@/lib/budget/summary";

export function CategoryBudgetCard({
  summary,
  activeCategory,
  onEditAll,
  onEditOne,
}: {
  summary: LedgerSummary;
  activeCategory: string;
  onEditAll: () => void;
  onEditOne: (id: string) => void;
}) {
  const rows = summary.byCategory;
  return (
    <section className="px-7 pt-7">
      <div className="flex items-end justify-between px-0.5 mb-[14px]">
        <div>
          <MicroLabel>Budget Map</MicroLabel>
          <div className="mt-2 text-[20px] font-semibold tracking-tightest text-ink">
            카테고리별 예산
          </div>
          <div className="mt-1 text-[11.5px] text-mute">각 항목을 눌러 예산을 수정하세요</div>
        </div>
        <button
          type="button"
          onClick={onEditAll}
          className="h-8 px-[13px] border border-[rgba(74,155,224,0.30)] rounded-full bg-[rgba(74,155,224,0.08)] text-blue-accent text-[11.5px] font-extrabold"
        >
          예산 편집
        </button>
      </div>
      <div className="rounded-[20px] bg-white shadow-[0_18px_40px_-28px_rgba(20,40,80,0.22)] border border-[rgba(120,140,170,0.10)] overflow-hidden">
        {rows.map((c, i) => {
          const onKey = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEditOne(c.id);
            }
          };
          const status = c.spent > c.budget
            ? { text: `예산 ${krw(c.spent - c.budget)} 초과`, color: "text-expense font-bold" }
            : c.rate >= 80
              ? { text: `${c.rate}% · 거의 다 사용`, color: "text-[#C97A2A] font-bold" }
              : { text: `${c.rate}% 사용 · 남은 ${krw(Math.max(0, c.remaining))}`, color: "text-mute" };
          return (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              aria-label={`${c.name} 예산 수정`}
              onClick={() => onEditOne(c.id)}
              onKeyDown={onKey}
              className={`relative px-4 pl-3 py-[15px] cursor-pointer ${i === 0 ? "" : "border-t border-[rgba(120,140,170,0.08)]"} ${activeCategory === c.id ? "bg-[rgba(74,155,224,0.05)]" : "bg-white"}`}
            >
              <span
                className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                style={{ background: c.color }}
              />
              <div className="pl-1.5">
                <div className="flex justify-between items-baseline gap-2.5">
                  <span className="text-sm font-bold text-ink tracking-tight">{c.name}</span>
                  <span className="text-xs font-bold text-ink-soft tabular-nums">{krw(c.spent)}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#EEF3F8] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.rate}%`, background: c.color }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10.5px]">
                  <span className={status.color}>{status.text}</span>
                  <span className="text-mute">예산 {krw(c.budget)} <span className="text-faint ml-0.5">›</span></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
