"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3.5 pb-2.5">
      <Link href="/" className="font-serif text-[22px] font-medium text-ink tracking-tightest italic">
        sinhon<span className="text-coral-500 not-italic">.</span>life
      </Link>
      <div className="flex items-center gap-4 text-ink">
        <Link href="/explore" aria-label="검색" className="active:scale-90 transition-transform">
          <Search size={22} strokeWidth={1.8} />
        </Link>
        <Link href="/my" aria-label="알림" className="relative active:scale-90 transition-transform">
          <Bell size={22} strokeWidth={1.8} />
          <span className="absolute -top-0.5 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-coral-500 flex items-center justify-center text-[9px] font-mono font-bold text-white">
            N
          </span>
        </Link>
      </div>
    </div>
  );
}
