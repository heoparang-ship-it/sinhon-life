"use client";

import { formatWon, type BudgetSummary } from "@/lib/design/budget";
import { useCoupleProfile } from "@/lib/design/useCoupleProfile";

// Role-keyed access — labels come from useCoupleProfile so a MY-tab edit
// instantly propagates (storage + custom event fan-out).
export default function SpendSplit({ summary }: { summary: BudgetSummary }) {
  const { partnerA, partnerB } = useCoupleProfile();

  const a = summary.byWho["A"];
  const b = summary.byWho["B"];
  const solo = a + b;
  const aPct = solo > 0 ? Math.round((a / solo) * 100) : 0;
  const bPct = solo > 0 ? 100 - aPct : 0;

  const cards = [
    {
      who: partnerA,
      amount: a,
      pct: aPct,
      bg: "bg-gradient-to-br from-coral-200 to-coral-500/30",
      text: "text-coral-700",
      chip: "bg-gradient-to-br from-coral-500 to-coral-700",
    },
    {
      who: partnerB,
      amount: b,
      pct: bPct,
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
