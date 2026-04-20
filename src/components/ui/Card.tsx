import { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "default" | "selectable" | "feature" | "list-row";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  as?: "div" | "article" | "section" | "li";
  selected?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  default: "bg-paper-surface border border-paper-line rounded-lg p-md shadow-xs",
  selectable:
    "bg-paper-surface border-2 rounded-lg p-md transition-all duration-base ease-standard " +
    "hover:border-coral-300 cursor-pointer",
  feature:
    "bg-paper-surface border border-paper-line rounded-xl p-lg shadow-sm overflow-hidden",
  "list-row":
    "bg-paper-surface border-b border-paper-line last:border-b-0 px-md py-sm flex items-center gap-sm",
};

export default function Card({
  variant = "default",
  as: Tag = "div",
  selected,
  className,
  children,
  ...props
}: CardProps) {
  const isSelectable = variant === "selectable";
  return (
    <Tag
      className={cn(
        variants[variant],
        isSelectable && (selected ? "border-coral-500 bg-coral-50" : "border-paper-line"),
        className,
      )}
      aria-pressed={isSelectable ? selected : undefined}
      {...(props as HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}
