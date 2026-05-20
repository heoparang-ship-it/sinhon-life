import { MicroLabel } from "@/components/ui/MicroLabel";
import { krw } from "@/lib/budget/format";
import type { LedgerSummary } from "@/lib/budget/summary";

export function BudgetHero({ summary }: { summary: LedgerSummary }) {
  const month = `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  return (
    <div className="relative bg-hero-sky rounded-b-[28px] overflow-hidden pt-[18px] pb-[34px]">
      <div className="px-7 pt-5">
        <MicroLabel className="text-on-blue-faint">Wedding Budget · {month}</MicroLabel>
        <div className="mt-4 text-[28px] font-bold tracking-tightest text-on-blue leading-[1.15]">
          결혼 준비 예산,<br />
          <span className="text-on-blue-mute font-medium">둘이 같이 관리해요.</span>
        </div>
        <div className="mt-6 px-[22px] py-5 rounded-[22px] bg-white/90 backdrop-blur-xl shadow-[0_18px_40px_-18px_rgba(20,40,80,0.30)]">
          <div className="flex items-center justify-between">
            <MicroLabel>Remaining</MicroLabel>
            <span className="text-[11px] text-faint">{month} 기준</span>
          </div>
          <div className="mt-3 text-[34px] font-bold tracking-tightest text-ink tabular-nums">
            {krw(summary.remaining, false)}
            <span className="text-[18px] font-semibold text-mute ml-1">원</span>
          </div>
          <div className="mt-1 text-[11.5px] text-mute">
            총 예산 {krw(summary.totalBudget)} 중 {summary.spentRate}% 사용
          </div>
          <div className="mt-[22px] grid grid-cols-3 gap-3">
            {[
              ["예산", summary.totalBudget, "text-ink-soft"],
              ["지출", summary.expenseTotal, "text-expense"],
              ["저축", summary.incomeTotal, "text-blue-accent"],
            ].map(([label, value, color], i) => (
              <div
                key={String(label)}
                className={i === 0 ? "" : "border-l border-[rgba(120,140,170,0.16)] pl-3"}
              >
                <div className="text-[10.5px] font-bold uppercase tracking-[0.04em] text-mute">
                  {label}
                </div>
                <div className={`mt-1.5 text-[14.5px] font-extrabold tabular-nums whitespace-nowrap ${color as string}`}>
                  {krw(value as number, false)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[18px] h-2 rounded-full bg-pill-idle overflow-hidden">
            <div
              className="h-full rounded-full bg-pill-active"
              style={{ width: `${summary.spentRate}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-mute flex justify-between">
            <span>지출 / 예산</span>
            <span className="font-semibold text-ink-soft tabular-nums">{summary.spentRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
