import { formatWon, type BudgetSummary } from "@/lib/design/budget";

export default function SpendSplit({ summary }: { summary: BudgetSummary }) {
  const husband = summary.byWho["지훈"];
  const wife = summary.byWho["서연"];
  const solo = husband + wife;
  const husbandPct = solo > 0 ? Math.round((husband / solo) * 100) : 0;
  const wifePct = solo > 0 ? 100 - husbandPct : 0;

  const cards = [
    {
      who: "지훈",
      amount: husband,
      pct: husbandPct,
      bg: "bg-gradient-to-br from-coral-200 to-coral-500/30",
      text: "text-coral-700",
      chip: "bg-gradient-to-br from-coral-500 to-coral-700",
    },
    {
      who: "서연",
      amount: wife,
      pct: wifePct,
      bg: "bg-gradient-to-br from-mint-200 to-mint-500/30",
      text: "text-mint-700",
      chip: "bg-gradient-to-br from-mint-500 to-mint-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 mx-4 mb-4">
      {cards.map((c) => (
        <div
          key={c.who}
          className={`relative overflow-hidden rounded-2xl px-4 py-3.5 ${c.bg}`}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className={`w-6 h-6 rounded-full shadow-sm ${c.chip}`} />
            <div className={`text-[12.5px] font-bold ${c.text}`}>{c.who}</div>
            <div className={`ml-auto text-[10.5px] font-mono font-bold ${c.text}`}>
              {c.pct}%
            </div>
          </div>
          <div className={`font-serif text-[18px] font-bold tracking-tightest ${c.text}`}>
            {formatWon(c.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
