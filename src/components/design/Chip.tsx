import { ReactNode } from "react";

type Variant = "tag" | "solid-coral" | "solid-ink" | "outline" | "honey";

const variantClass: Record<Variant, string> = {
  tag: "bg-honey-100 text-honey-800",
  "solid-coral": "bg-coral-500 text-white",
  "solid-ink": "bg-ink text-white",
  outline: "border border-paper-line text-ink",
  honey: "bg-honey-300 text-ink",
};

export default function Chip({
  children,
  variant = "tag",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide font-mono uppercase ${variantClass[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
