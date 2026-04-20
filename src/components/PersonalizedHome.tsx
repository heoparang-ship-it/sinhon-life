"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { getProfile, type Profile } from "@/lib/profile";
import TopBar from "@/components/home/TopBar";
import Headline from "@/components/home/Headline";
import HundredMillionGuide from "@/components/home/HundredMillionGuide";
import AIHub from "@/components/home/AIHub";
import SectionTitle from "@/components/design/SectionTitle";

// V3.1 simplified home — 2 anchored blocks based on UX audit:
//   ① 1억원 지원금 내러티브   (핵심 value prop)
//   ② AI 도구 허브            (AI톡 + 체크리스트 + 가계부)
// Removed: FeedTabs (decorative, no state switch), UrgentList (thin data, now
// inside /guide/hundred-million), CategoryGrid (duplicated in MY hub),
// GuidesRail (POLICIES live at /explore & /policy/[slug]), ExpertCTA (service
// not yet live — promise without product = trust loss), HomeTours (Airbnb-style
// 신혼집 영감 carousel had no owner/upload flow — promise without product).

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

      {/* ① 1억원 지원금 */}
      <Headline />
      <HundredMillionGuide />

      {/* ② AI 허브 (AI톡 + 체크리스트 + 가계부) */}
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
