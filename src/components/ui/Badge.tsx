import { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Tone = "coral" | "mint" | "honey" | "ink";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

const tones: Record<Tone, string> = {
  coral: "bg-coral-100 text-coral-700",
  mint: "bg-mint-100 text-mint-700",
  honey: "bg-honey-100 text-honey-800",
  ink: "bg-navy-100 text-ink",
};

export default function Badge({ tone = "coral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3xs rounded-pill px-2xs py-[2px] text-[11px] font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
