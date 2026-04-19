import { formatWon, type BudgetSummary } from "@/lib/design/budget";

const MONTHLY_BUDGET = 5_000_000;

const CATEGORY_COLORS: Record<string, string> = {
  식비: "bg-coral-500",
  생활: "bg-mint-500",
  고정비: "bg-honey-300",
  혼수: "bg-coral-300",
  기타: "bg-white/30",
};

export default function SummaryCard({ summary }: { summary: BudgetSummary }) {
  const { totalSpent, byCategory } = summary;
  const diff =
    MONTHLY_BUDGET > 0
      ? Math.round(((totalSpent - MONTHLY_BUDGET) / MONTHLY_BUDGET) * 100)
      : 0;

  const spentWon = Math.floor(totalSpent / 1000) * 1000;
  const remainder = totalSpent - spentWon;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 mx-4 mb-4 bg-gradient-to-br from-ink to-[#0F1823] text-white">
      <span
        aria-hidden
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full"
        style={{ background: "radial-gradient(circle, #F9706655, transparent 65%)" }}
      />
      <span
        aria-hidden
        className="absolute -bottom-8 right-10 w-24 h-24 rounded-full"
        style={{ background: "radial-gradient(circle, #5EC9A855, transparent 70%)" }}
      />
      <div className="relative">
        <div className="text-[11.5px] text-honey-300 mb-2 font-mono uppercase tracking-wider font-semibold">
          이달 지출
        </div>
        <div className="font-serif text-[36px] font-semibold leading-none tracking-tightest">
          {formatWon(spentWon)}
          {remainder > 0 && <span className="text-white/45">,{remainder}</span>}
        </div>
        <div className="text-[12px] text-white/75 mt-2 flex gap-3 flex-wrap">
          <span>예산 {formatWon(MONTHLY_BUDGET)}</span>
          <span
            className={diff < 0 ? "text-honey-300 font-bold" : "text-coral-300 font-bold"}
          >
            {diff < 0 ? "↓" : "↑"} 예산 대비 {diff > 0 ? "+" : ""}
            {diff}%
          </span>
        </div>

        <div className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden flex">
          {(["식비", "생활", "고정비", "혼수"] as const).map((k) => {
            const pct = totalSpent > 0 ? (byCategory[k] / totalSpent) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={k}
                className={CATEGORY_COLORS[k]}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>

        <div className="flex gap-3.5 mt-2.5 text-[10.5px] text-white/80 flex-wrap font-mono">
          {(["식비", "생활", "고정비", "혼수"] as const).map((k) => {
            const pct =
              totalSpent > 0 ? Math.round((byCategory[k] / totalSpent) * 100) : 0;
            if (pct === 0) return null;
            return (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-sm ${CATEGORY_COLORS[k]}`} />
                {k} {pct}%
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
