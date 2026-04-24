"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function TopSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <div className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled ? "bg-white/98 backdrop-blur-xl shadow-sm" : "bg-white/95 backdrop-blur-md"
    }`}>
      <div className="max-w-lg mx-auto px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">신</span>
            </div>
            {!isScrolled && <span className="font-bold text-sm text-ink">신혼생활</span>}
          </div>
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="궁금한 거 뭐든 물어보세요"
                className="w-full bg-white border border-[#E6ECF2] rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 placeholder:text-ink-muted transition-shadow"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
