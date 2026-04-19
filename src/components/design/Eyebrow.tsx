import { ReactNode } from "react";

type Tone = "ink" | "coral" | "mint" | "honey" | "paper";

const toneClass: Record<Tone, string> = {
  ink: "text-ink-muted",
  coral: "text-coral-700",
  mint: "text-mint-700",
  honey: "text-honey-700",
  paper: "text-paper-line",
};

export default function Eyebrow({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`font-mono uppercase tracking-[0.12em] text-[10.5px] font-bold ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
