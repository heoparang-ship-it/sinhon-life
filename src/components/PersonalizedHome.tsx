"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star,
  MapPin,
  Store,
  ExternalLink,
  Compass,
} from "lucide-react";
import {
  HUB_CATEGORIES,
  POLICIES,
  BRAND,
  VENDORS,
  FEATURE_FLAGS,
} from "@/lib/constants";
import {
  getProfile,
  hasCompletedOnboarding,
  scorePolicies,
  getGreetingName,
  type Profile,
} from "@/lib/profile";
const COLOR_BAR: Record<string, string> = {
  housing: "bg-coral",
  finance: "bg-mint",
  baby: "bg-coral-400",
  tax: "bg-mint-600",
};

export default function PersonalizedHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProfile(getProfile());
  }, []);

  const onboarded = mounted && hasCompletedOnboarding();
  const greetingName = profile ? getGreetingName(profile) : "";

  // 프로필 기반 정렬. 온보딩 안 한 경우 기본 정책 리스트 사용.
  const scoredPolicies = mounted && profile
    ? scorePolicies(POLICIES, profile)
    : POLICIES.map((p) => ({ item: p, score: 0, reason: "" }));

  const top3 = scoredPolicies.slice(0, 3);
  const rest = scoredPolicies.slice(3);

  // 벤토 그리드: 빅카드 1 + 스몰 6
  const bentoBig = rest[0]?.item;
  const bentoSmall = rest.slice(1, 7).map((r) => r.item);

  return (
    <div>
      <div className="px-5 pt-5 space-y-7">
        {/* ① 히어로 / 온보딩 CTA or 개인화 배너 */}
        <section className="opacity-0 animate-fade-up stagger-1">
          {!onboarded ? (
            // 온보딩 미완료 → 온보딩 유도
            <div className="bg-gradient-to-br from-coral to-coral-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/8 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles size={14} className="opacity-80" />
                  <span className="text-xs font-medium opacity-80">
                    30초 진단
                  </span>
                </div>
                <h2 className="text-[22px] font-bold leading-snug tracking-tight">
                  지금 어떤 상황이세요?
                </h2>
                <p className="text-xs opacity-80 mt-1.5 leading-relaxed">
                  3가지 질문에 답하면 내 상황에 딱 맞는
                  <br />
                  혜택만 정리해서 보여드려요
                </p>
                <Link
                  href="/onboarding"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-white text-coral px-3 py-3 rounded-xl font-bold text-[14px] active:scale-[0.98] transition-transform shadow-lg"
                >
                  내 맞춤 혜택 찾기 <ArrowRight size={15} />
                </Link>
                <div className="mt-2 flex items-center justify-center gap-2 text-[11px] opacity-80">
                  <span>30초 소요 · 회원가입 불필요</span>
                </div>
              </div>
            </div>
          ) : (
            // 온보딩 완료 → 개인화 인사
            <div className="bg-gradient-to-br from-coral-50 via-white to-mint-50 rounded-2xl p-5 border border-warm-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={13} className="text-coral" />
                <span className="text-[11px] font-bold text-coral">
                  {greetingName}님 맞춤 추천
                </span>
              </div>
              <h2 className="text-[18px] font-extrabold leading-snug tracking-tight">
                오늘 꼭 챙겨야 할
                <br />
                혜택 Top 3예요
              </h2>
              <Link
                href="/onboarding"
                className="mt-3 inline-flex items-center gap-1 text-[11px] text-warm-text-muted hover:text-coral"
              >
                프로필 수정 <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </section>

        {/* ② 개인화 Top 3 슬롯 */}
        {onboarded && (
          <section className="opacity-0 animate-fade-up stagger-2">
            <div className="grid grid-cols-3 gap-2.5">
              {top3.map((scored, idx) => {
                const p = scored.item;
                return (
                  <Link
                    key={p.slug}
                    href={`/policy/${p.slug}`}
                    className="bg-white rounded-2xl border-2 border-coral/30 p-3 text-center active:scale-[0.97] transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="w-7 h-7 mx-auto rounded-full bg-coral flex items-center justify-center text-[11px] font-bold text-white mb-2">
                      {idx + 1}
                    </div>
                    <p className="text-[11px] font-bold leading-tight line-clamp-2">
                      {p.title}
                    </p>
                    {p.highlight && (
                      <span className="inline-block mt-1.5 text-[9px] font-bold text-coral bg-coral-50 px-1.5 py-0.5 rounded">
                        {p.highlight}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ③ 6개 카테고리 그리드 */}
        <section className="opacity-0 animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Compass size={14} className="text-coral" />
              <h2 className="text-[14px] font-extrabold">분야별 둘러보기</h2>
            </div>
            <Link
              href="/explore"
              className="text-[11px] text-warm-text-muted"
            >
              전체
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {HUB_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="bg-white border border-warm-border rounded-2xl p-3.5 text-center active:scale-[0.97] transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-2xl mb-1" aria-hidden>
                  {cat.emoji}
                </div>
                <p className="text-[12px] font-bold">{cat.title}</p>
                <p className="text-[9.5px] text-warm-text-muted mt-0.5 leading-tight">
                  {cat.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ④ 스탯 3박스 (개인화 or 기본) */}
        <section className="opacity-0 animate-fade-up stagger-3">
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-warm-border">
              <p className="text-2xl font-extrabold text-coral tracking-tight">
                15+
              </p>
              <p className="text-[10px] text-warm-text-muted mt-1">
                받을 수 있는 혜택
              </p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-warm-border">
              <p className="text-2xl font-extrabold text-mint tracking-tight">
                1.1%
              </p>
              <p className="text-[10px] text-warm-text-muted mt-1">
                최저 대출금리
              </p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-warm-border">
              <p className="text-2xl font-extrabold text-coral tracking-tight">
                200만
              </p>
              <p className="text-[10px] text-warm-text-muted mt-1">
                출산 바우처
              </p>
            </div>
          </div>
        </section>

        {/* ⑤ 벤토 그리드 — 이번 주 꿀정보 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-coral" />
              <h2 className="text-[16px] font-extrabold tracking-tight">
                이번 주 꿀정보
              </h2>
            </div>
            <span className="text-[11px] text-warm-text-muted">
              {POLICIES.length}개
            </span>
          </div>

          {/* 벤토 레이아웃: 빅카드 1개 + 스몰 6개 (2x3) */}
          {bentoBig && (
            <Link
              href={`/policy/${bentoBig.slug}`}
              className="block bg-white rounded-2xl overflow-hidden border border-warm-border active:scale-[0.99] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`h-1.5 ${COLOR_BAR[bentoBig.category] || "bg-coral"}`}
              />
              <div className="p-5">
                {bentoBig.highlight && (
                  <span className="inline-block text-[10px] font-bold text-coral bg-coral-50 px-2.5 py-1 rounded-lg mb-2.5">
                    {bentoBig.highlight}
                  </span>
                )}
                <h3 className="text-base font-bold leading-snug tracking-tight">
                  {bentoBig.title}
                </h3>
                <p className="text-[13px] text-warm-text-secondary mt-2 leading-relaxed line-clamp-2">
                  {bentoBig.summary}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-border/50">
                  <div className="flex gap-1.5">
                    {bentoBig.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-warm-text-muted bg-warm-bg px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight size={14} className="text-warm-text-muted" />
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            {bentoSmall.map((p) => (
              <Link
                key={p.slug}
                href={`/policy/${p.slug}`}
                className="bg-white rounded-xl p-3 border border-warm-border active:scale-[0.98] transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`h-1 ${
                    COLOR_BAR[p.category] || "bg-coral"
                  } rounded-full mb-2`}
                />
                <h4 className="text-[12px] font-bold leading-tight line-clamp-2">
                  {p.title}
                </h4>
                {p.highlight && (
                  <span className="inline-block mt-1.5 text-[9px] font-bold text-coral bg-coral-50 px-1.5 py-0.5 rounded">
                    {p.highlight}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* ⑥ 웨딩 업체 — FEATURE_FLAGS.SHOW_VENDORS 가 true일 때만 노출 */}
        {FEATURE_FLAGS.SHOW_VENDORS && (
        <section className="space-y-3 opacity-0 animate-fade-up stagger-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store size={15} className="text-coral" />
              <h2 className="text-[16px] font-extrabold tracking-tight">
                추천 웨딩업체
              </h2>
            </div>
            <Link
              href="/category/wedding"
              className="text-[11px] text-warm-text-muted"
            >
              더 보기
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
            {VENDORS.map((vendor) => (
              <Link
                key={vendor.slug}
                href={`/vendor/${vendor.slug}`}
                className="flex-shrink-0 w-[260px] bg-white rounded-2xl border border-warm-border overflow-hidden active:scale-[0.98] transition-transform hover:shadow-md"
              >
                <div className="h-24 bg-gradient-to-br from-coral-50 to-coral-100 flex items-center justify-center">
                  <span className="text-4xl">🏛️</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-0.5 rounded-md">
                      {vendor.categoryLabel}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Star
                        size={10}
                        className="text-amber-400 fill-amber-400"
                      />
                      <span className="text-[11px] font-bold">
                        {vendor.rating}
                      </span>
                      <span className="text-[10px] text-warm-text-muted">
                        ({vendor.reviewCount})
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-[15px] mt-1">{vendor.name}</h3>
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin size={10} className="text-warm-text-muted" />
                    <span className="text-[11px] text-warm-text-secondary">
                      {vendor.location}
                    </span>
                    <span className="text-[11px] text-warm-text-muted mx-1">·</span>
                    <span className="text-[11px] font-bold text-mint">
                      {vendor.priceRange}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            <a
              href={BRAND.kakaoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[260px] bg-gradient-to-br from-warm-bg to-warm-border/30 rounded-2xl border border-dashed border-warm-border flex flex-col items-center justify-center gap-3 p-6 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-coral-50 flex items-center justify-center">
                <Store size={20} className="text-coral" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">우리 업체도 등록하고 싶어요</p>
                <p className="text-[11px] text-warm-text-muted mt-1">
                  카톡으로 입점 문의하기
                </p>
              </div>
            </a>
          </div>
        </section>
        )}

        {/* ⑦ 커뮤니티 */}
        <section className="bg-white rounded-2xl p-4 border border-warm-border flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-sm">선배 부부한테 직접 물어보기</h3>
            <p className="text-[11px] text-warm-text-secondary mt-0.5">
              카톡방에서 실시간 꿀팁 공유 중!
            </p>
          </div>
          <a
            href={BRAND.kakaoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-mint text-white px-4 py-2.5 rounded-xl font-bold text-xs active:scale-[0.97] transition-transform"
          >
            참여하기
          </a>
        </section>

        <section className="flex items-center justify-center gap-2 py-1">
          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-warm-text-muted hover:text-coral transition-colors flex items-center gap-1"
          >
            <ExternalLink size={12} />
            @sinhon.life 팔로우하고 매주 꿀정보 받기
          </a>
        </section>
      </div>
    </div>
  );
}
