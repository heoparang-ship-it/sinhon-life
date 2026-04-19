import type { UrgentBenefit } from "@/lib/design/home";

export default function UrgentList({ items }: { items: UrgentBenefit[] }) {
  return (
    <div className="px-5 mb-7">
      {items.map((b, i) => {
        const Row = (
          <div className="py-4 flex items-start gap-3.5 border-b border-paper-line active:bg-paper/60 transition">
            <div
              className={`min-w-[42px] font-serif text-[20px] font-bold tracking-tight leading-none ${
                b.urgent ? "text-coral-500" : "text-ink-muted"
              }`}
            >
              {b.dday}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] text-ink-muted font-mono tracking-wider uppercase mb-1">
                {b.agency}
              </div>
              <div className="text-[14.5px] font-bold text-ink tracking-tightest leading-tight mb-1 wb-keep">
                {b.title}
              </div>
              <div className="text-[12px] text-ink-soft wb-keep">{b.req}</div>
            </div>
            <div className="font-serif text-[15px] font-bold text-coral-700 whitespace-nowrap shrink-0">
              {b.amount}
            </div>
          </div>
        );

        return b.link ? (
          <a key={i} href={b.link} target="_blank" rel="noopener noreferrer" className="block">
            {Row}
          </a>
        ) : (
          <div key={i}>{Row}</div>
        );
      })}
    </div>
  );
}
