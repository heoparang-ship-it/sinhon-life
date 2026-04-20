"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { chipMorphTransition } from "@/lib/motion";
import { cn } from "./cn";

export interface ChipSelectProps {
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  children: ReactNode;
  size?: "sm" | "md";
}

/**
 * Interactive selectable / dismissible chip. Distinct from
 * `src/components/design/Chip.tsx` (which is a static tag).
 * Morph transition implements RFP §9.1 motion #4.
 */
export default function ChipSelect({
  selected = false,
  onClick,
  onRemove,
  children,
  size = "md",
}: ChipSelectProps) {
  const base =
    "inline-flex items-center gap-3xs rounded-pill font-medium " +
    "transition-colors duration-base ease-standard focus-visible:outline-none focus-visible:shadow-ring-brand";
  const s = size === "sm" ? "text-caption px-sm py-[6px]" : "text-body px-md py-2xs";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        base,
        s,
        selected
          ? "bg-coral-500 text-white"
          : "bg-paper-surface text-ink border border-paper-line hover:border-coral-300",
      )}
      whileTap={{ scale: 0.97 }}
      transition={chipMorphTransition}
    >
      {children}
      {onRemove && (
        <span
          role="button"
          aria-label="제거"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-pill hover:bg-ink/20"
        >
          ×
        </span>
      )}
    </motion.button>
  );
}
