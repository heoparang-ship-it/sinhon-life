import { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  label?: string;
  variant?: "line" | "dotted";
}

export default function Divider({ label, variant = "line", className, ...props }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-xs", className)} role="separator">
        <span className="flex-1 h-px bg-paper-line" aria-hidden />
        <span className="text-caption text-ink-muted">{label}</span>
        <span className="flex-1 h-px bg-paper-line" aria-hidden />
      </div>
    );
  }
  return (
    <hr
      className={cn(
        "border-0 h-px bg-paper-line",
        variant === "dotted" && "bg-[linear-gradient(to_right,transparent_50%,#F0E4D2_50%)] bg-[length:8px_1px] bg-repeat-x h-px bg-paper-surface",
        className,
      )}
      {...props}
    />
  );
}
