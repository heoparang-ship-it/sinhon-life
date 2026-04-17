"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MessageCircle,
  BookOpen,
  ExternalLink,
  Heart,
  Sparkles,
  Settings,
  RotateCcw,
} from "lucide-react";
import { BRAND, POLICIES } from "@/lib/constants";
import { getSavedIds } from "@/lib/storage";
import {
  getProfile,
  getGreetingName,
  hasCompletedOnboarding,
  resetProfile,
  type Profile,
} from "@/lib/profile";

const STAGE_LABEL: Record<string, string> = {
  planning: "결혼 준비 중",
  newly: "신혼부부",
  parenting: "임신·출산·육아",
};

const REGION_LABEL: Record<string, string> = {
  seoul: "서울",
  incheon: "인천",
  gyeonggi: "경기",
  busan: "부산",
  daegu: "대구",
  etc: "그 외",
};

const INTEREST_LABEL: Record<string, string> = {
  housing: "신혼집·청약",
  finance: "대출·재테크",
  tax: "세금·연말정산",
  baby: "출산·육아",
  wedding: "예식·스드메",
  honeymoon: "신혼여행",
};

export default function MyPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    setSavedIds(getSavedIds());
    setProfile(getProfile());
    setOnboarded(hasCompletedOnboarding());
    setMounted(true);
  }, []);

  const savedPolicies = POLICIES.filter((p) => savedIds.includes(p.slug));
  const greetingName = profile ? getGreetingName(profile) : "";

  const handleResetProfile = () => {
    if (confirm("프로필을 초기화할까요? 다시 온보딩을 진행해야 해요.")) {
      resetProfile();
      setProfile(null);
      setOnboarded(false);
    }
  };

  return (
    <div className="px-5 pt-14 pb-4 space-y-6">
      {/* 프로필 */}
      <section className="bg-white rounded-2xl p-5 border border-warm-border opacity-0 animate-fade-up stagger-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-coral to-coral-400 flex items-center justify-center shadow-lg shadow-coral/20">
            <span className="text-white text-xl">
              {mounted && onboarded ? "💑" : "👋"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">
              {mounted && onboarded && greetingName
                ? `${greetingName}님,`
                : "반가워요!"}
            </h2>
            <p className="text-[11px] text-warm-text-muted mt-0.5">
              {mounted && onboarded
                ? "나에게 맞는 혜택 중심으로 보여드리고 있어요"
                : "30초 온보딩으로 나에게 딱 맞는 혜택 찾기"}
            </p>
          </div>
        </div>

        {mounted && onboarded && profile ? (
          <div className="mt-4 space-y-2.5">
            {/* 프로필 요약 칩 */}
            <div className="flex flex-wrap gap-1.5">
              {profile.stage && (
                <span className="text-[11px] font-bold text-coral bg-coral-50 px-2.5 py-1 rounded-lg">
                  {STAGE_LABEL[profile.stage]}
                </span>
              )}
              {profile.region && (
                <span className="text-[11px] font-bold text-mint-700 bg-mint-50 px-2.5 py-1 rounded-lg">
                  📍 {REGION_LABEL[profile.region]}
                </span>
              )}
              {profile.interests.slice(0, 3).map((i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium text-warm-text bg-warm-bg px-2.5 py-1 rounded-lg"
                >
                  {INTEREST_LABEL[i] || i}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <span className="text-[11px] font-medium text-warm-text-muted bg-warm-bg px-2.5 py-1 rounded-lg">
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Link
                href="/onboarding?next=/my"
                className="flex-1 flex items-center justify-center gap-1.5 bg-warm-bg text-warm-text py-2.5 rounded-xl text-xs font-bold active:scale-[0.98] transition-transform"
              >
                <Settings size={13} /> 프로필 수정
              </Link>
              <button
                onClick={handleResetProfile}
                className="flex items-center justify-center gap-1 bg-white border border-warm-border text-warm-text-muted px-3 py-2.5 rounded-xl text-xs font-medium active:scale-[0.98] transition-transform"
                aria-label="초기화"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/onboarding?next=/my"
            className="block text-center w-full mt-4 bg-coral text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform shadow-lg shadow-coral/20"
          >
            30초 온보딩 시작하기
          </Link>
        )}
      </section>

      {/* 저장한 정책 */}
      {savedPolicies.length > 0 && (
        <section className="opacity-0 animate-fade-up stagger-2">
          <div className="flex items-center gap-1.5 mb-3">
            <Heart size={14} className="text-coral" />
            <h3 className="font-bold text-sm">저장한 혜택 ({savedPolicies.length})</h3>
          </div>
          <div className="space-y-2">
            {savedPolicies.map((p) => (
              <Link key={p.slug} href={`/policy/${p.slug}`} className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-warm-border active:scale-[0.99] transition-transform">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[13px] truncate">{p.title}</h4>
                  <p className="text-[11px] text-warm-text-muted mt-0.5 line-clamp-1">{p.summary}</p>
                </div>
                <ChevronRight size={14} className="text-warm-text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 혜택 요약 */}
      <section className="bg-gradient-to-br from-coral-50 via-white to-mint-50 rounded-2xl p-4 border border-warm-border opacity-0 animate-fade-up stagger-2">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={14} className="text-coral" />
          <h3 className="font-bold text-sm">
            {mounted && onboarded
              ? "내 상황에 맞는 혜택"
              : "놓치고 있는 혜택이 있어요"}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xl font-bold text-coral">6+</p>
            <p className="text-[10px] text-warm-text-muted mt-0.5">새집 마련</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xl font-bold text-mint">4+</p>
            <p className="text-[10px] text-warm-text-muted mt-0.5">이자 절약</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xl font-bold text-coral">5+</p>
            <p className="text-[10px] text-warm-text-muted mt-0.5">출산 머니</p>
          </div>
        </div>
      </section>

      {/* 메뉴 */}
      <section className="bg-white rounded-2xl border border-warm-border divide-y divide-warm-border overflow-hidden opacity-0 animate-fade-up stagger-3">
        <Link href="/chat" className="flex items-center justify-between px-5 py-4 active:bg-warm-bg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-coral-50 flex items-center justify-center"><MessageCircle size={16} className="text-coral" /></div>
            <span className="text-sm font-medium">AI한테 물어보기</span>
          </div>
          <ChevronRight size={16} className="text-warm-text-muted" />
        </Link>
        <Link href="/explore" className="flex items-center justify-between px-5 py-4 active:bg-warm-bg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-mint-50 flex items-center justify-center"><BookOpen size={16} className="text-mint" /></div>
            <span className="text-sm font-medium">꿀정보 모아보기</span>
          </div>
          <ChevronRight size={16} className="text-warm-text-muted" />
        </Link>
        <a href={BRAND.kakaoLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 active:bg-warm-bg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center"><ExternalLink size={16} className="text-yellow-600" /></div>
            <span className="text-sm font-medium">카톡방 들어가기</span>
          </div>
          <ChevronRight size={16} className="text-warm-text-muted" />
        </a>
        <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 active:bg-warm-bg transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center"><Heart size={16} className="text-pink-500" /></div>
            <span className="text-sm font-medium">인스타 팔로우</span>
          </div>
          <ChevronRight size={16} className="text-warm-text-muted" />
        </a>
      </section>

      <section className="text-center space-y-1 pt-2">
        <p className="text-[11px] text-warm-text-muted">신혼생활 v2.1 personalized</p>
        <p className="text-[10px] text-warm-text-muted">문의: sinhon.life@gmail.com</p>
      </section>
    </div>
  );
}
