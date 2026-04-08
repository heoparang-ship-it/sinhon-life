"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, MessageCircle, BookOpen, ExternalLink, Heart, Sparkles } from "lucide-react";
import { BRAND, POLICIES } from "@/lib/constants";
import { getSavedIds } from "@/lib/storage";

export default function MyPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedIds());
  }, []);

  const savedPolicies = POLICIES.filter((p) => savedIds.includes(p.slug));

  return (
    <div className="px-5 pt-14 pb-4 space-y-6">
      {/* 프로필 */}
      <section className="bg-white rounded-2xl p-5 border border-warm-border opacity-0 animate-fade-up stagger-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-coral to-coral-400 flex items-center justify-center shadow-lg shadow-coral/20">
            <span className="text-white text-xl">👋</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">반가워요!</h2>
            <p className="text-[11px] text-warm-text-muted mt-0.5">로그인하면 나에게 딱 맞는 혜택을 찾아줘요</p>
          </div>
        </div>
        <button disabled className="w-full mt-4 bg-warm-bg text-warm-text-muted py-2.5 rounded-xl text-sm font-medium">
          로그인 (곧 오픈!)
        </button>
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
          <h3 className="font-bold text-sm">놓치고 있는 혜택이 있어요</h3>
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
        <Link href="/" className="flex items-center justify-between px-5 py-4 active:bg-warm-bg transition-colors">
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
        <p className="text-[11px] text-warm-text-muted">신혼생활 v2.0 real</p>
        <p className="text-[10px] text-warm-text-muted">문의: sinhon.life@gmail.com</p>
      </section>
    </div>
  );
}
