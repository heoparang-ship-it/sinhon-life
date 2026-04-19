import { formatWon, type Upcoming } from "@/lib/design/budget";

const ICON_BG = ["bg-coral-200", "bg-mint-200", "bg-honey-300"];

export default function UpcomingList({ items }: { items: Upcoming[] }) {
  return (
    <div className="mx-4 mb-6 bg-paper-surface border border-paper-line rounded-2xl overflow-hidden">
      {items.map((u, i) => (
        <div
          key={u.id}
          className={`px-4 py-3 flex items-center gap-3 ${
            i !== 0 ? "border-t border-paper-line" : ""
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-[16px] ${
              ICON_BG[i % ICON_BG.length]
            }`}
          >
            {u.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold text-ink tracking-tight">
              {u.name}
            </div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {u.when} · {u.method}
            </div>
          </div>
          <div className="font-serif text-[14px] font-semibold text-ink">
            {formatWon(u.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
