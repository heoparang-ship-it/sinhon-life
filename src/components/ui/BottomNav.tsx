"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  icon: (active: boolean) => React.ReactNode;
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "홈",
    match: (p) => p === "/",
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="26" height="26" fill={active ? "#3B8BCF" : "none"} stroke={active ? "#3B8BCF" : "#A9B4C0"} strokeWidth={active ? 0 : 1.9}>
        <path
          d="M11.3 3.3a1 1 0 0 1 1.4 0l8 7.1c.2.2.3.5.3.8V20a1 1 0 0 1-1 1h-4.6v-4.8a3.4 3.4 0 0 0-6.8 0V21H4a1 1 0 0 1-1-1v-8.8c0-.3.1-.6.3-.8z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/my",
    label: "MY",
    match: (p) => p === "/my" || p.startsWith("/my/") || p === "/budget" || p.startsWith("/budget/"),
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="none"
        stroke={active ? "#3B8BCF" : "#A9B4C0"}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  const aiActive = pathname === "/ai" || pathname.startsWith("/ai/");

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-30 mx-auto flex h-[82px] max-w-[480px] items-start justify-around border-t border-[#EEF2F6] bg-white/95 pt-[11px] backdrop-blur-md lg:absolute"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      {/* 홈 */}
      <Link
        href={TABS[0].href}
        className="flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap"
      >
        {TABS[0].icon(TABS[0].match(pathname))}
        <span
          className={`text-[11.5px] font-bold ${TABS[0].match(pathname) ? "text-blue-accent" : "text-[#A9B4C0]"}`}
        >
          홈
        </span>
      </Link>

      {/* 가운데 떠있는 AI톡 */}
      <Link
        href="/ai"
        className="flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap"
        aria-label="AI톡"
      >
        <span
          className="-mt-[28px] mb-1 grid h-[60px] w-[60px] place-items-center rounded-full text-white"
          style={{
            background: "linear-gradient(150deg,#4F9CDB,#2F77BE)",
            boxShadow: "0 12px 24px rgba(47,119,190,0.42), 0 0 0 5px #fff",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 4v-4H6a2 2 0 0 1-2-2z" />
            <circle cx="9" cy="10" r=".4" fill="#fff" strokeWidth="1.4" />
            <circle cx="12" cy="10" r=".4" fill="#fff" strokeWidth="1.4" />
            <circle cx="15" cy="10" r=".4" fill="#fff" strokeWidth="1.4" />
          </svg>
        </span>
        <span
          className={`text-[11.5px] font-bold ${aiActive ? "text-blue-accent" : "text-blue-accent"}`}
        >
          AI톡
        </span>
      </Link>

      {/* MY */}
      <Link
        href={TABS[1].href}
        className="flex flex-1 flex-col items-center gap-1.5 whitespace-nowrap"
      >
        {TABS[1].icon(TABS[1].match(pathname))}
        <span
          className={`text-[11.5px] font-bold ${TABS[1].match(pathname) ? "text-blue-accent" : "text-[#A9B4C0]"}`}
        >
          MY
        </span>
      </Link>
    </nav>
  );
}
