"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Wallet, Heart, ArrowRight, TrendingUp } from "lucide-react";
import { MEGA_CATEGORIES, POLICIES } from "@/lib/constants";
import type { MegaCategoryId } from "@/lib/types";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Home, Wallet, Heart,
};

const COLOR_BAR: Record<string, string> = {
  housing: "bg-coral",
  finance: "bg-mint",
  baby: "bg-coral-400",
  tax: "bg-mint-600",
};

export default function CategoryPolicySection() {
  const [activeCategory, setActiveCategory] = useState<MegaCategoryId | null>(null);

  const filteredPolicies = activeCategory
    ? POLICIES.filter((p) => {
        const mega = MEGA_CATEGORIES.find((c) => c.id === activeCategory);
        return mega?.policyCategories.includes(p.category);
      })
    : POLICIES;

  const featuredPolicy = filteredPolicies[0];
  const restPolicies = filteredPolicies.slice(1);

  return (
    <>
      {/* 3개 대분류 카테고리 */}
      <section className="opacity-0 animate-fade-up stagger-2">
        <div className="flex gap-2">
          {MEGA_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.iconName] || Home;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-300 active:scale-[0.96] ${
                  isActive
                    ? cat.color === "coral" ? "bg-coral text-white shadow-lg shadow-coral/25" : "bg-mint text-white shadow-lg shadow-mint/25"
                    : "bg-white border border-warm-border text-warm-text"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? "bg-white/20" : cat.color === "coral" ? "bg-coral-50" : "bg-mint-50"
                }`}>
                  <Icon size={20} className={isActive ? "text-white" : cat.color === "coral" ? "text-coral" : "text-mint"} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-bold">{cat.title}</p>
                  <p className={`text-[10px] mt-0.5 ${isActive ? "opacity-80" : "text-warm-text-muted"}`}>{cat.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 추천 카드 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-coral" />
            <h2 className="text-[17px] font-extrabold tracking-tight">
              {activeCategory ? MEGA_CATEGORIES.find((c) => c.id === activeCategory)?.title + " 가이드" : "이번 주 꿀정보"}
            </h2>
          </div>
          <span className="text-[11px] text-warm-text-muted">{filteredPolicies.length}개</span>
        </div>

        {featuredPolicy && (
          <div key={`featured-${featuredPolicy.slug}`} className="crossfade-enter">
            <Link href={`/policy/${featuredPolicy.slug}`} className="block bg-white rounded-2xl overflow-hidden border border-warm-border active:scale-[0.99] transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
              <div className={`h-1.5 ${COLOR_BAR[featuredPolicy.category] || "bg-coral"}`} />
              <div className="p-5">
                {featuredPolicy.highlight && (
                  <span className="inline-block text-[10px] font-bold text-coral bg-coral-50 px-2.5 py-1 rounded-lg mb-2.5">{featuredPolicy.highlight}</span>
                )}
                <h3 className="text-base font-bold leading-snug tracking-tight">{featuredPolicy.title}</h3>
                <p className="text-[13px] text-warm-text-secondary mt-2 leading-relaxed line-clamp-2">{featuredPolicy.summary}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-border/50">
                  <div className="flex gap-1.5">
                    {featuredPolicy.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] text-warm-text-muted bg-warm-bg px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                  <ArrowRight size={14} className="text-warm-text-muted" />
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="space-y-2.5 crossfade-enter">
          {restPolicies.map((policy, index) => (
            <Link
              key={policy.slug}
              href={`/policy/${policy.slug}`}
              className={`flex items-center gap-3.5 bg-white rounded-xl p-4 border border-warm-border active:scale-[0.99] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md opacity-0 animate-fade-up stagger-${Math.min(index + 4, 6)}`}
            >
              <div className={`w-1 h-10 rounded-full flex-shrink-0 ${COLOR_BAR[policy.category] || "bg-coral"}`} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[13px] leading-tight truncate">{policy.title}</h3>
                <p className="text-[11px] text-warm-text-muted mt-1 line-clamp-1">{policy.summary}</p>
              </div>
              {policy.highlight && (
                <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-1 rounded-lg flex-shrink-0">{policy.highlight}</span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
