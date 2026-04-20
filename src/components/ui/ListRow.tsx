import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "./cn";

export interface ListRowProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  chevron?: boolean;
}

/**
 * Polymorphic list row — renders an <a> if `href`, <button> if `onClick`,
 * <div> otherwise. Single 44px+ hit target per RFP §9.2.
 */
export default function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  href,
  onClick,
  className,
  chevron = true,
}: ListRowProps) {
  const content = (
    <>
      {leading && <span className="flex-shrink-0">{leading}</span>}
      <span className="flex-1 min-w-0">
        <span className="block text-body text-ink truncate">{title}</span>
        {subtitle && <span className="block text-caption text-ink-soft truncate">{subtitle}</span>}
      </span>
      {trailing && <span className="flex-shrink-0 text-caption text-ink-soft">{trailing}</span>}
      {chevron && (href || onClick) && (
        <ChevronRight className="h-4 w-4 text-ink-muted flex-shrink-0" aria-hidden />
      )}
    </>
  );

  const shared = cn(
    "w-full flex items-center gap-xs min-h-[44px] px-md py-sm bg-paper-surface",
    "border-b border-paper-line last:border-b-0",
    (href || onClick) && "hover:bg-paper-line/40 transition-colors duration-quick text-left",
    className,
  );

  if (href) {
    return (
      <a href={href} className={shared}>
        {content}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shared}>
        {content}
      </button>
    );
  }
  return <div className={shared}>{content}</div>;
}
