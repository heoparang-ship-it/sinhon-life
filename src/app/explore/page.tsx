"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Compass, Store, Sparkles } from "lucide-react";
import { HUB_CATEGORIES, POLICIES, VENDORS, FEATURE_FLAGS } from "@/lib/constants";

export default function ExplorePage() {
  const [query, setQuery] = useState("");

  const filteredPolicies = useMemo(() => {
    if (!query.trim()) return POLICIES.slice(0, 6);
    const q = query.trim().toLowerCase();
    return POLICIES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  const filteredVendors = useMemo(() => {
    if (!query.trim()) return VENDORS;
    const q = query.trim().toLowerCase();
    return VENDORS.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-warm-bg/95 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={18} className="text-coral" />
            <h1 className="text-lg font-extrabold tracking-tight">탐색</h1>
          </div>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-text-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="어떤 정보가 궁금하세요? (예: 전세대출, 출산지원금)"
              className="w-full bg-white border border-warm-border rounded-full pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/40 placeholder:text-warm-text-muted"
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-3 space-y-6">
        {/* 카테고리 6개 */}
        {!query.trim() && (
          <section className="opacity-0 animate-fade-up stagger-1">
            <h2 className="text-[13px] font-bold text-warm-text-secondary mb-3">
              카테고리로 찾기
            </h2>
            <div className="grid grid-cols-3 gap-2.5">
              {HUB_CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.id}`}
                  className="bg-white border border-warm-border rounded-2xl p-4 text-center active:scale-[0.97] transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="text-2xl mb-1" aria-hidden>
                    {c.emoji}
                  </div>
                  <p className="text-[12px] font-bold">{c.title}</p>
                  <p className="text-[9.5px] text-warm-text-muted mt-0.5 leading-tight">
                    {c.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 꿀정보 결과 */}
        <section className="opacity-0 animate-fade-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-coral" />
              <h2 className="text-[13px] font-bold text-warm-text-secondary">
                {query.trim() ? "검색 결과" : "인기 꿀정보"}
              </h2>
            </div>
            <span className="text-[11px] text-warm-text-muted">
              {filteredPolicies.length}개
            </span>
          </div>

          {filteredPolicies.length === 0 ? (
            <div className="bg-white rounded-xl border border-warm-border p-6 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-[13px] font-bold">검색 결과가 없어요</p>
              <p className="text-[11px] text-warm-text-muted mt-1">
                다른 키워드로 다시 찾아보시거나
                <br />
                AI에게 직접 물어보세요!
              </p>
              <Link
                href={`/chat?q=${encodeURIComponent(query)}`}
                className="inline-block mt-3 bg-coral text-white px-4 py-2 rounded-lg font-bold text-xs active:scale-[0.97] transition-transform"
              >
                AI에게 묻기
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPolicies.map((p) => (
                <Link
                  key={p.slug}
                  href={`/policy/${p.slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-warm-border active:scale-[0.99]"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[13px] truncate">{p.title}</h3>
                    <p className="text-[11px] text-warm-text-muted mt-0.5 line-clamp-1">
                      {p.summary}
                    </p>
                  </div>
                  {p.highlight && (
                    <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-1 rounded-lg flex-shrink-0">
                      {p.highlight}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 업체 결과 — FEATURE_FLAGS.SHOW_VENDORS 가 true일 때만 노출 */}
        {FEATURE_FLAGS.SHOW_VENDORS && filteredVendors.length > 0 && (
          <section className="opacity-0 animate-fade-up stagger-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Store size={14} className="text-coral" />
                <h2 className="text-[13px] font-bold text-warm-text-secondary">
                  웨딩 업체
                </h2>
              </div>
              <span className="text-[11px] text-warm-text-muted">
                {filteredVendors.length}개
              </span>
            </div>
            <div className="space-y-2">
              {filteredVendors.map((v) => (
                <Link
                  key={v.slug}
                  href={`/vendor/${v.slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-warm-border active:scale-[0.99]"
                >
                  <div className="w-11 h-11 rounded-lg bg-coral-50 flex items-center justify-center text-xl">
                    🏛️
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[13px]">{v.name}</h3>
                    <p className="text-[11px] text-warm-text-muted mt-0.5">
                      {v.location} · {v.priceRange}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-mint">
                    ★ {v.rating}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
