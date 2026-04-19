import Link from "next/link";
import type { ReactNode } from "react";

export interface MenuItem {
  icon: ReactNode;
  label: string;
  right?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

export default function MenuGroup({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <div className="mx-4 mb-4">
      <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-2 px-1">
        {title}
      </div>
      <div className="bg-paper-surface border border-paper-line rounded-2xl overflow-hidden">
        {items.map((it, i) => {
          const body = (
            <div
              className={`px-4 py-3.5 flex items-center gap-3 active:bg-paper transition ${
                i !== 0 ? "border-t border-paper-line" : ""
              }`}
            >
              <span className="text-[18px] w-6 flex items-center justify-center" aria-hidden>
                {it.icon}
              </span>
              <span className="flex-1 text-[13.5px] text-ink font-medium tracking-tight">
                {it.label}
              </span>
              {it.right && <span className="text-[11px] text-ink-muted">{it.right}</span>}
              <span className="text-ink-muted text-[16px]">›</span>
            </div>
          );

          if (it.external && it.href) {
            return (
              <a
                key={i}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {body}
              </a>
            );
          }
          if (it.href) {
            return (
              <Link key={i} href={it.href} className="block">
                {body}
              </Link>
            );
          }
          return (
            <button
              key={i}
              onClick={it.onClick}
              type="button"
              className="block w-full text-left"
            >
              {body}
            </button>
          );
        })}
      </div>
    </div>
  );
}
