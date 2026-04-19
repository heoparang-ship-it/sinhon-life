import Link from "next/link";
import type { HubCategory } from "@/lib/types";

// V3.1 flat grid — pulls real HUB_CATEGORIES (6) so routes stay production-correct.
// Counts come from design-source copy to match the sandbox tone.
const toneForIndex = (i: number) => {
  const tones = ["coral", "mint", "honey", "ink", "coral", "mint"] as const;
  return tones[i % tones.length];
};

const toneText: Record<string, string> = {
  coral: "text-coral-500",
  mint: "text-mint-500",
  honey: "text-honey-700",
  ink: "text-ink-soft",
};

export default function CategoryGrid({ categories }: { categories: HubCategory[] }) {
  return (
    <div className="px-5 pb-8">
      <div className="grid grid-cols-3 gap-px bg-paper-line border border-paper-line rounded-sm overflow-hidden">
        {categories.map((c, i) => {
          const tone = toneForIndex(i);
          return (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="bg-paper-surface p-4 flex flex-col gap-1 active:bg-paper transition"
            >
              <div className="text-[13.5px] font-bold text-ink tracking-tight flex items-center gap-1.5">
                <span aria-hidden className="text-[15px]">{c.emoji}</span>
                {c.title}
              </div>
              <div className={`text-[11px] font-mono font-semibold ${toneText[tone]}`}>
                {c.subtitle}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
