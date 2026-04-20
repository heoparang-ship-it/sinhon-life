import { ReactNode } from "react";
import { cn } from "./cn";

type Flavor = "first-time" | "no-results" | "error" | "offline";

export interface EmptyStateProps {
  flavor?: Flavor;
  title: string;
  body?: string;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}

const flavorAccent: Record<Flavor, string> = {
  "first-time": "bg-coral-50 text-coral-700",
  "no-results": "bg-paper-alt text-honey-800",
  error: "bg-coral-100 text-coral-700",
  offline: "bg-navy-100 text-ink-soft",
};

/**
 * Four-flavor empty state — RFP §8.2. Copy tone follows the RFP
 * voice guide ("소중한 XX가 아직 없어요. ~부탁드려요.").
 */
export default function EmptyState({
  flavor = "first-time",
  title,
  body,
  action,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-sm py-2xl px-md",
        className,
      )}
      role="status"
    >
      <div
        className={cn(
          "h-20 w-20 rounded-pill flex items-center justify-center",
          flavorAccent[flavor],
        )}
      >
        {illustration ?? <span aria-hidden className="text-3xl">✦</span>}
      </div>
      <h3 className="text-subtitle font-semibold text-ink">{title}</h3>
      {body && <p className="text-caption text-ink-soft max-w-[28ch]">{body}</p>}
      {action && <div className="mt-xs">{action}</div>}
    </div>
  );
}
