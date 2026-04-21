"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { getProfile, type Profile } from "@/lib/profile";
import TopBar from "@/components/home/TopBar";
import HeroSlider from "@/components/home/HeroSlider";
import HundredMillionGuide from "@/components/home/HundredMillionGuide";
import AIHub from "@/components/home/AIHub";
import SectionTitle from "@/components/design/SectionTitle";

// V3.2 home structure (2026-04-21 — Hero Slider 패턴 채택):
//   TopBar
//     ↓
//   HeroSlider (3 slides: 1억 내러티브 / 이번 주 마감 임박 / AI 1차 점검)
//     ↓
//   HundredMillionGuide (상세표 — Hero 아래 스크롤 섹션으로 이동)
//     ↓
//   SectionTitle "우리 둘을 위한 AI 도구"
//     ↓
//   AIHub (AI톡 + 체크리스트 + 가계부)
//
// Prior layout put `Headline` + `HundredMillionGuide` directly under TopBar.
// Slide 1 of HeroSlider now carries the 1억 narrative, so the old Headline is
// retired. The detail guide stays for users who scroll.
//
// Spec: docs/2026-04-21_V3.2_S0_UX_DECISIONS.md §1 D1 + §3 Hero Slider 구현 스펙.

export default function PersonalizedHome() {
  const [, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProfile(getProfile());
  }, []);

  if (!mounted) {
    return <div className="pt-6 pb-24 px-5 text-ink-muted text-sm">불러오는 중…</div>;
  }

  return (
    <div>
      <TopBar />

      {/* ① Hero Slider — 3 슬라이드 rotate */}
      <HeroSlider />

      {/* ② 1억원 지원금 상세표 (Hero 아래 스크롤 섹션) */}
      <div className="mt-6">
        <HundredMillionGuide />
      </div>

      {/* ③ AI 허브 (AI톡 + 체크리스트 + 가계부) */}
      <SectionTitle title="우리 둘을 위한 AI 도구" accent="mint" />
      <AIHub />

      <section className="mx-5 mt-10 mb-2 pt-5 border-t border-paper-line text-center">
        <a
          href={BRAND.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted font-mono active:text-coral-500 transition"
        >
          @sinhon.life — 신혼부부를 위한 매일의 혜택·팁
        </a>
      </section>
    </div>
  );
}
