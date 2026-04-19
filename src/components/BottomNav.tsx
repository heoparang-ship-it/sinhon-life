"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Sparkles, CheckSquare, Wallet, User } from "lucide-react";

// V3.1 redesign — 5 tabs. "탐색"은 MY 탭 하위 허브로 흡수됐으므로 여기서 제외.
const tabs = [
  { id: "home", href: "/", icon: Home, label: "홈" },
  { id: "chat", href: "/chat", icon: Sparkles, label: "AI톡" },
  { id: "checklist", href: "/checklist", icon: CheckSquare, label: "체크" },
  { id: "budget", href: "/budget", icon: Wallet, label: "가계부" },
  { id: "my", href: "/my", icon: User, label: "MY" },
] as const;

// Routes that render their own chrome (onboarding flow) or take the full viewport
// and therefore hide the bottom nav.
const HIDE_ON_PATHS = ["/onboarding"];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDE_ON_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  const getActiveTab = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/policy")) return "home";
    if (pathname.startsWith("/chat")) return "chat";
    if (pathname.startsWith("/checklist")) return "checklist";
    if (pathname.startsWith("/budget")) return "budget";
    if (pathname.startsWith("/my")) return "my";
    // Routes folded into MY hub (explore/category/vendor) keep MY active.
    if (
      pathname.startsWith("/explore") ||
      pathname.startsWith("/category") ||
      pathname.startsWith("/vendor")
    ) {
      return "my";
    }
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-paper-surface/95 backdrop-blur-xl border-t border-paper-line pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 py-1 transition-all duration-200 ${
                isActive ? "text-coral-700" : "text-ink-muted"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
              </div>
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-normal"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
