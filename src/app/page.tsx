import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  Star,
  MapPin,
  Store,
} from "lucide-react";
import { BRAND, VENDORS, VENDOR_CATEGORIES } from "@/lib/constants";
import TopSearchBar from "@/components/TopSearchBar";
import CategoryPolicySection from "@/components/CategoryPolicySection";

export default function HomePage() {
  return (
    <div className="pb-4">
      <TopSearchBar />
      <div className="px-5 pt-6 space-y-8">

        {/* 개인화 히어로 */}
        <section className="opacity-0 animate-fade-up stagger-1">
          <div className="bg-gradient-to-br from-coral to-coral-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/8 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={14} className="opacity-80" />
                <span className="text-xs font-medium opacity-80">나에게 맞는 혜택 찾기</span>
              </div>
              <h1 className="text-[22px] font-bold leading-snug tracking-tight">
                신혼생활, 어떤 혜택 받을 수 있을까?
              </h1>
              <p className="text-xs opacity-70 mt-1.5 leading-relaxed">
                신혼부부 맞춤 정책·지원금을 AI가 찾아드려요
              </p>
              <div className="flex gap-2.5 mt-5">
                <Link href="/chat?q=결혼 준비 중인데 뭐부터 해야 해요?" className="flex-1 bg-white text-coral px-3 py-3 rounded-xl font-bold text-[13px] text-center active:scale-[0.96] transition-transform shadow-lg">
                  결혼 준비 중이에요
                </Link>
                <Link href="/chat?q=신혼부부인데 받을 수 있는 혜택 알려주세요" className="flex-1 bg-white/15 text-white border border-white/30 px-3 py-3 rounded-xl font-bold text-[13px] text-center active:scale-[0.96] transition-transform">
                  신혼 생활 중이에요
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리 + 정책 목록 (클라이언트 컴포넌트) */}
        <CategoryPolicySection />

        {/* 하이라이트 숫자 */}
        <section className="opacity-0 animate-fade-up stagger-3">
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-warm-border">
              <p className="text-2xl font-extrabold text-coral tracking-tight">15+</p>
              <p className="text-[10px] text-warm-text-muted mt-1">받을 수 있는 혜택</p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-warm-border">
              <p className="text-2xl font-extrabold text-mint tracking-tight">1.1%</p>
              <p className="text-[10px] text-warm-text-muted mt-1">최저 대출금리</p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-warm-border">
              <p className="text-2xl font-extrabold text-coral tracking-tight">200만</p>
              <p className="text-[10px] text-warm-text-muted mt-1">출산 바우처</p>
            </div>
          </div>
        </section>

        {/* 웨딩 업체 섹션 */}
        <section className="space-y-4 opacity-0 animate-fade-up stagger-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-coral" />
              <h2 className="text-[17px] font-extrabold tracking-tight">인기 웨딩업체</h2>
            </div>
            <span className="text-[11px] text-warm-text-muted">{VENDORS.length}개 업체</span>
          </div>

          {/* 카테고리 칩 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {VENDOR_CATEGORIES.map((cat) => (
              <span
                key={cat.id}
                className="flex-shrink-0 text-[12px] font-medium bg-white border border-warm-border px-3 py-1.5 rounded-full text-warm-text-secondary"
              >
                {cat.emoji} {cat.label}
              </span>
            ))}
          </div>

          {/* 업체 카드 가로 스크롤 */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
            {VENDORS.map((vendor) => (
              <Link
                key={vendor.slug}
                href={`/vendor/${vendor.slug}`}
                className="flex-shrink-0 w-[260px] bg-white rounded-2xl border border-warm-border overflow-hidden active:scale-[0.98] transition-transform hover:shadow-md"
              >
                {/* 컬러 바 */}
                <div className="h-24 bg-gradient-to-br from-coral-50 to-coral-100 flex items-center justify-center">
                  <span className="text-4xl">{VENDOR_CATEGORIES.find((c) => c.id === vendor.category)?.emoji}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-0.5 rounded-md">{vendor.categoryLabel}</span>
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold">{vendor.rating}</span>
                      <span className="text-[10px] text-warm-text-muted">({vendor.reviewCount})</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-[15px] mt-1">{vendor.name}</h3>
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin size={10} className="text-warm-text-muted" />
                    <span className="text-[11px] text-warm-text-secondary">{vendor.location}</span>
                    <span className="text-[11px] text-warm-text-muted mx-1">·</span>
                    <span className="text-[11px] font-bold text-mint">{vendor.priceRange}</span>
                  </div>
                  <div className="flex gap-1 mt-2.5">
                    {vendor.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] text-warm-text-muted bg-warm-bg px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}

            {/* 입점 문의 카드 */}
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
                <p className="text-[11px] text-warm-text-muted mt-1">카톡으로 입점 문의하기</p>
              </div>
            </a>
          </div>
        </section>

        {/* 정부 혜택 섹션 */}
        <section className="opacity-0 animate-fade-up stagger-6">
          <div className="bg-gradient-to-br from-mint-50 to-mint-100/50 rounded-2xl p-5 border border-mint-200/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center">
                <Sparkles size={16} className="text-mint" />
              </div>
              <div>
                <h3 className="font-bold text-[15px]">신혼생활 정부 지원금 총정리</h3>
                <p className="text-[11px] text-warm-text-secondary">2026년 기준 최신 정보</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Link href="/policy/birth-benefits-2026" className="bg-white rounded-xl p-3 active:scale-[0.97] transition-transform">
                <p className="text-lg font-extrabold text-coral">200만원+</p>
                <p className="text-[11px] text-warm-text-secondary mt-0.5">출산 지원금</p>
              </Link>
              <Link href="/policy/jeonse-loan-guide" className="bg-white rounded-xl p-3 active:scale-[0.97] transition-transform">
                <p className="text-lg font-extrabold text-mint">연 1.1%~</p>
                <p className="text-[11px] text-warm-text-secondary mt-0.5">전세대출 최저금리</p>
              </Link>
              <Link href="/policy/tax-reduction-newlywed" className="bg-white rounded-xl p-3 active:scale-[0.97] transition-transform">
                <p className="text-lg font-extrabold text-coral">200만원</p>
                <p className="text-[11px] text-warm-text-secondary mt-0.5">취득세 감면</p>
              </Link>
              <Link href="/policy/happy-housing" className="bg-white rounded-xl p-3 active:scale-[0.97] transition-transform">
                <p className="text-lg font-extrabold text-mint">시세 60%</p>
                <p className="text-[11px] text-warm-text-secondary mt-0.5">행복주택 월세</p>
              </Link>
            </div>
          </div>
        </section>

        {/* 커뮤니티 */}
        <section className="bg-white rounded-2xl p-4 border border-warm-border flex items-center gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-sm">선배 부부한테 직접 물어보기</h3>
            <p className="text-[11px] text-warm-text-secondary mt-0.5">카톡방에서 실시간 꿀팁 공유 중!</p>
          </div>
          <a href={BRAND.kakaoLink} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 bg-mint text-white px-4 py-2.5 rounded-xl font-bold text-xs active:scale-[0.97] transition-transform">
            참여하기
          </a>
        </section>

        <section className="flex items-center justify-center gap-2 py-1">
          <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="text-[11px] text-warm-text-muted hover:text-coral transition-colors flex items-center gap-1">
            <ExternalLink size={12} />
            @sinhon.life 팔로우하고 매주 꿀정보 받기
          </a>
        </section>
      </div>
    </div>
  );
}
