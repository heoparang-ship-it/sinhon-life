"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { getProfile, type Profile } from "@/lib/profile";
import HeroCard from "@/components/v4/HeroCard";
import ComicScroll from "@/components/v4/ComicScroll";
import DeadlineList from "@/components/v4/DeadlineList";
import PopularList from "@/components/v4/PopularList";

// V4 home structure (2026-04-25 — white-first, blue primary):
//   TopSearchBar (rendered in page.tsx)
//     ↓
//   HeroCard (30초 진단 CTA)
//     ↓
//   ComicScroll (4컷만화 가로스크롤)
//     ↓
//   DeadlineList (마감 임박)
//     ↓
//   PopularList (많이 저장한)

export default function PersonalizedHome() {
  const [, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProfile(getProfile());
  }, []);

  if (!mounted) {
    return <div className="pt-6 pb-24 px-5 text-[#667085] text-sm">불러오는 중…</div>;
  }

  return (
    <div className="pb-4">
      <HeroCard />
      <ComicScroll />
      <DeadlineList />
      <PopularList />

      <section className="mx-4 mt-8 mb-2 pt-4 border-t border-[#F0F4F8] text-center">
        <a
          href={BRAND.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-[#98A2B3] active:text-blue-500 transition"
        >
          @sinhon.life — 신혼부부를 위한 매일의 혜택·팁
        </a>
      </section>
    </div>
  );
}
