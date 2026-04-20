"use client";

import { motion, LayoutGroup } from "framer-motion";
import { chipMorphTransition } from "@/lib/motion";
import { cn } from "./cn";

export interface SegmentedItem {
  id: string;
  label: string;
}

export interface SegmentedProps {
  items: ReadonlyArray<SegmentedItem>;
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Segmented({ items, value, onChange, className }: SegmentedProps) {
  return (
    <LayoutGroup id="segmented">
      <div
        role="tablist"
        className={cn(
          "inline-flex items-center p-3xs rounded-pill bg-paper-line/70",
          className,
        )}
      >
        {items.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative px-md py-3xs text-caption font-medium rounded-pill transition-colors duration-quick focus-visible:outline-none",
                selected ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="segmented-indicator"
                  className="absolute inset-0 bg-paper-surface rounded-pill shadow-xs -z-10"
                  transition={chipMorphTransition}
                />
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
