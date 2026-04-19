import { formatWon, type Transaction } from "@/lib/design/budget";

export default function TransactionList({ txns }: { txns: Transaction[] }) {
  return (
    <div className="mx-4 bg-paper-surface border border-paper-line rounded-2xl overflow-hidden">
      {txns.map((t, i) => (
        <div
          key={t.id}
          className={`px-4 py-3 flex items-center gap-3 ${
            i !== 0 ? "border-t border-paper-line" : ""
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-paper-alt flex items-center justify-center text-[15px]">
            {t.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-ink tracking-tight truncate">
              {t.name}
            </div>
            <div className="text-[10.5px] text-ink-muted mt-px">
              {t.category} · {t.who}
            </div>
          </div>
          <div className="text-right">
            <div className="font-serif text-[13px] font-bold text-ink">
              − {formatWon(t.amount).replace("₩ ", "")}
            </div>
            <div className="text-[10px] text-ink-muted">{t.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
