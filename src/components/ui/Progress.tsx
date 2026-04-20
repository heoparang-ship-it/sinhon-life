import { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0..100
  label?: string;
  tone?: "coral" | "mint";
}

const toneFill = {
  coral: "bg-coral-500",
  mint: "bg-mint-500",
} as const;

export default function Progress({ value, label, tone = "coral", className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", className)} {...props}>
      {label && (
        <div className="flex items-center justify-between mb-3xs">
          <span className="text-caption text-ink-soft">{label}</span>
          <span className="text-caption font-semibold text-ink">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 rounded-pill bg-paper-line overflow-hidden"
      >
        <div
          className={cn("h-full rounded-pill transition-[width] duration-slow ease-decelerate", toneFill[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
