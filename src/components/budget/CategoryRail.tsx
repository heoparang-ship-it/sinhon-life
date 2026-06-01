"use client";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { Pill } from "@/components/ui/Pill";
import { LEDGER_CATEGORIES } from "@/lib/budget/categories";

export function CategoryRail({
  activeCategory,
  onSelect,
}: {
  activeCategory: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-8">
      <div className="px-7"><MicroLabel>Categories</MicroLabel></div>
      <div className="mt-[14px] flex gap-2 overflow-x-auto px-7 pt-1 pb-2 scrollbar-none">
        <Pill onWhite active={activeCategory === "all"} size={34} onClick={() => onSelect("all")}>
          전체
        </Pill>
        {LEDGER_CATEGORIES.map((c) => (
          <Pill
            key={c.id}
            onWhite
            active={activeCategory === c.id}
            size={34}
            onClick={() => onSelect(c.id)}
          >
            {c.name}
          </Pill>
        ))}
      </div>
    </div>
  );
}
