"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bookmark } from "lucide-react";
import SinhonLogo from "@/components/v4/SinhonLogo";

const QUICK_TAGS = ["전세대출", "디딤돌", "신혼특공", "출산지원금", "첫만남이용권"];

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
      isScrolled ? "bg-white/[.98] backdrop-blur-xl shadow-sm" : "bg-white"
    }`}>
      <div className="max-w-lg mx-auto">
        {/* Logo bar */}
        <div className="flex items-center px-4 pt-2 pb-3">
          <SinhonLogo size={16} />
          <div className="flex-1" />
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600">
            <Bookmark size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 h-[46px] px-3.5 bg-[#F8FAFC] rounded-[14px]">
              <Search size={18} className="text-blue-500 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="정책, 조건, 용어로 검색해보세요"
                className="flex-1 bg-transparent border-0 text-[13.5px] outline-none text-[#172033] placeholder:text-[#667085]"
              />
            </div>
          </form>

          {/* Quick tag chips */}
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-hide pb-0.5">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/chat?q=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1.5 rounded-full bg-white border border-[#E6ECF2] text-[12px] font-medium text-[#2E3A52] whitespace-nowrap hover:border-blue-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
