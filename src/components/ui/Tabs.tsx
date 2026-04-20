"use client";

import { ReactNode, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { chipMorphTransition } from "@/lib/motion";
import { cn } from "./cn";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: ReadonlyArray<TabItem>;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  variant?: "underline" | "pill";
  className?: string;
  children?: (activeId: string) => ReactNode;
}

export default function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = "underline",
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;
  const setActive = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  return (
    <div className={cn("w-full", className)}>
      <LayoutGroup id="tabs-indicator">
        <div
          role="tablist"
          className={cn(
            "flex items-center",
            variant === "underline" ? "border-b border-paper-line gap-md" : "gap-2xs p-3xs bg-paper-line/60 rounded-pill",
          )}
        >
          {items.map((item) => {
            const selected = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(item.id)}
                className={cn(
                  "relative transition-colors duration-quick focus-visible:outline-none",
                  variant === "underline"
                    ? "py-xs text-body font-medium"
                    : "px-sm py-3xs text-caption rounded-pill",
                  selected
                    ? variant === "underline"
                      ? "text-ink"
                      : "text-ink"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
                {selected && variant === "underline" && (
                  <motion.span
                    layoutId="tabs-underline"
                    className="absolute left-0 right-0 -bottom-px h-[2px] bg-coral-500"
                    transition={chipMorphTransition}
                  />
                )}
                {selected && variant === "pill" && (
                  <motion.span
                    layoutId="tabs-pill"
                    className="absolute inset-0 bg-paper-surface rounded-pill shadow-xs -z-10"
                    transition={chipMorphTransition}
                  />
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      {children && <div className="mt-md">{children(active)}</div>}
    </div>
  );
}
