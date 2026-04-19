import { formatWon, type BudgetSummary, type TxnCategory } from "@/lib/design/budget";

// 9-wedding-category color map — reused by SummaryCard bars and legend.
const CATEGORY_COLORS: Record<TxnCategory, string> = {
  예식장: "bg-coral-500",
  스드메: "bg-coral-300",
  예복: "bg-mint-500",
  예물예단: "bg-mint-300",
  혼수가전: "bg-honey-300",
  신혼집: "bg-honey-500",
  신혼여행: "bg-mint-700",
  본식현금: "bg-coral-700",
  기타: "bg-white/30",
};

const VISIBLE_CATEGORIES: TxnCategory[] = [
  "예식장",
  "스드메",
  "예복",
  "예물예단",
  "혼수가전",
  "신혼집",
  "신혼여행",
  "본식현금",
  "기타",
];

export default function SummaryCard({ summary }: { summary: BudgetSummary }) {
  const { totalSpent, byCategory } = summary;
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
          결혼 누적 지출
        </div>
        <div className="font-serif text-[36px] font-semibold leading-none tracking-tightest">
          {formatWon(spentWon)}
          {remainder > 0 && <span className="text-white/45">,{remainder}</span>}
        </div>
        <p className="text-[11.5px] text-white/70 mt-2">
          예산 목표 없이 누적만 추적 · 카테고리 비율로 우리 돈이 어디로 가는지 보세요.
        </p>

        <div className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden flex">
          {VISIBLE_CATEGORIES.map((k) => {
            const pct = totalSpent > 0 ? (byCategory[k] / totalSpent) * 100 : 0;
            if (pct === 0) return null;
            return <div key={k} className={CATEGORY_COLORS[k]} style={{ width: `${pct}%` }} />;
          })}
        </div>

        <div className="flex gap-3 mt-2.5 text-[10.5px] text-white/80 flex-wrap font-mono">
          {VISIBLE_CATEGORIES.map((k) => {
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
