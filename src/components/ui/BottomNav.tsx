"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const sw = 1.5;
const iconColor = (active: boolean) => (active ? "#1A2433" : "rgba(26,36,51,0.36)");

const TABS: Tab[] = [
  {
    href: "/",
    label: "아카이브",
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11l8-6 8 6v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z"
          stroke={iconColor(a)}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/budget",
    label: "가계부",
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={iconColor(a)} strokeWidth={sw} />
        <path d="M8 10h8M8 14h5" stroke={iconColor(a)} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/my",
    label: "MY",
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="3.5" stroke={iconColor(a)} strokeWidth={sw} />
        <path
          d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"
          stroke={iconColor(a)}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  return (
    <nav
      className="fixed left-3.5 right-3.5 bottom-6 max-w-[452px] mx-auto bg-white rounded-[26px] px-2 py-3 z-30 shadow-[0_18px_40px_-14px_rgba(20,40,80,0.22),0_2px_6px_rgba(20,40,80,0.05)] lg:absolute lg:left-0 lg:right-0 lg:bottom-0 lg:max-w-none lg:mx-0 lg:rounded-none lg:rounded-b-[32px] lg:border-t lg:border-hairline lg:shadow-none lg:px-4 lg:py-4"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-3">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1.5 cursor-pointer select-none"
            >
              {tab.icon(active)}
              <div
                className={`text-[10.5px] tracking-tight ${
                  active ? "font-semibold text-ink" : "font-medium text-[rgba(26,36,51,0.40)]"
                }`}
              >
                {tab.label}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
