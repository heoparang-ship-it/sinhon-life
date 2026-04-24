"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, MessageCircle, CheckSquare, User } from "lucide-react";

// V4 redesign — 4 tabs: 홈 / AI톡 / 체크리스트 / MY
const tabs = [
  { id: "home", href: "/", icon: Home, label: "홈" },
  { id: "ai", href: "/chat", icon: MessageCircle, label: "AI톡" },
  { id: "checklist", href: "/checklist", icon: CheckSquare, label: "체크리스트" },
  { id: "my", href: "/my", icon: User, label: "MY" },
] as const;

const HIDE_ON_PATHS = ["/onboarding", "/quiz"];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDE_ON_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  const getActiveTab = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/policy")) return "home";
    if (pathname.startsWith("/explore") || pathname.startsWith("/category")) return "home";
    if (pathname.startsWith("/chat")) return "ai";
    if (pathname.startsWith("/checklist")) return "checklist";
    if (pathname.startsWith("/my") || pathname.startsWith("/vendor")) return "my";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t border-design-line pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around h-[78px] pt-2.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-all duration-200 ${
                isActive ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2 : 1.6} />
              <span
                className={`text-[11px] tracking-tight whitespace-nowrap ${
                  isActive ? "font-extrabold" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
