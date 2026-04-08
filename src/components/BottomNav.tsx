"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, MessageCircle, User } from "lucide-react";

const tabs = [
  { id: "home", href: "/", icon: Home, label: "홈" },
  { id: "chat", href: "/chat", icon: MessageCircle, label: "AI비서" },
  { id: "my", href: "/my", icon: User, label: "MY" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/policy")) return "home";
    if (pathname.startsWith("/chat")) return "chat";
    if (pathname.startsWith("/my")) return "my";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-warm-border/50 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-20 py-1 transition-all duration-200 ${
                isActive ? "text-coral" : "text-warm-text-muted"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
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
