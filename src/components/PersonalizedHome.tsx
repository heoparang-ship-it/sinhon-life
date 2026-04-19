"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  HUB_CATEGORIES,
  POLICIES,
  BRAND,
} from "@/lib/constants";
import {
  getProfile,
  hasCompletedOnboarding,
  scorePolicies,
  type Profile,
} from "@/lib/profile";
import TopBar from "@/components/home/TopBar";
import FeedTabs, { type TabId } from "@/components/home/FeedTabs";
import Headline from "@/components/home/Headline";
import HundredMillionGuide from "@/components/home/HundredMillionGuide";
import UrgentList from "@/components/home/UrgentList";
import CategoryGrid from "@/components/home/CategoryGrid";
import GuidesRail from "@/components/home/GuidesRail";
import AIBanner from "@/components/home/AIBanner";
import HomeTours from "@/components/home/HomeTours";
import ExpertCTA from "@/components/home/ExpertCTA";
import SectionTitle from "@/components/design/SectionTitle";
import { URGENT_BENEFITS, HOME_TOURS } from "@/lib/design/home";

// V3.1 visual reskin — keeps production scoring/personalization intact but swaps
// the entire presentation layer to the Fraunces/Hearth-Coral language. POLICIES
// and HUB_CATEGORIES still drive content; Placeholder SVGs fill image slots.

export default function PersonalizedHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("now");

  useEffect(() => {
    setMounted(true);
    setProfile(getProfile());
  }, []);

  const onboarded = mounted && hasCompletedOnboarding();

  const scoredPolicies =
    mounted && profile
      ? scorePolicies(POLICIES, profile)
      : POLICIES.map((p) => ({ item: p, score: 0, reason: "" }));

  const railPolicies = scoredPolicies.slice(0, 8).map((s) => s.item);

  return (
    <div>
      <TopBar />
      <FeedTabs active={activeTab} onChange={setActiveTab} />

      {!onboarded && (
        <section className="px-5 pb-5">
          <Link
            href="/onboarding"
            className="block p-5 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-700 text-white relative overflow-hidden active:scale-[0.99] transition"
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono uppercase tracking-wider text-white/80 font-bold">
                <Sparkles size={12} />
                onboarding · 30s
              </div>
              <h2 className="font-serif text-[22px] font-semibold tracking-tightest leading-snug mb-2 wb-keep">
                먼저 30초만 · 우리 부부 정보를 맞춰볼게요
              </h2>
              <p className="text-[12.5px] opacity-85 mb-4 wb-keep">
                소득·거주·결혼일 3가지만 답해주세요. 혜택이 Top3로 정렬돼요.
              </p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-coral-700 text-[12.5px] font-bold rounded-full">
                온보딩 시작 <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </section>
      )}

      <Headline />

      <HundredMillionGuide />

      <SectionTitle title="마감 임박 혜택" accent="coral" href="/explore" />
      <UrgentList items={URGENT_BENEFITS} />

      <SectionTitle title="카테고리로 둘러보기" accent="mint" href="/explore" />
      <CategoryGrid categories={HUB_CATEGORIES} />

      <SectionTitle title="이번 주 추천 가이드" accent="honey" href="/explore" />
      <GuidesRail policies={railPolicies} />

      <AIBanner />

      <SectionTitle title="오늘의 신혼집" accent="coral" />
      <HomeTours tours={HOME_TOURS} />

      <ExpertCTA />

      <section className="mx-5 mt-7 mb-2 pt-5 border-t border-paper-line text-center">
        <a
          href={BRAND.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted font-mono active:text-coral-500 transition"
        >
          @sinhon.life — 매주 금요일 꿀정보 뉴스레터
        </a>
      </section>
    </div>
  );
}
