import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, MapPin, Check, MessageCircle, ExternalLink } from "lucide-react";
import { VENDORS, VENDOR_CATEGORIES, BRAND } from "@/lib/constants";

export function generateStaticParams() {
  return VENDORS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = VENDORS.find((v) => v.slug === slug);
  if (!vendor) return {};
  return {
    title: `${vendor.name} - ${vendor.categoryLabel} | 신혼생활`,
    description: `${vendor.name} ${vendor.location} ${vendor.priceRange}. ${vendor.description.slice(0, 80)}`,
  };
}

export default async function VendorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = VENDORS.find((v) => v.slug === slug);
  if (!vendor) notFound();

  const emoji = VENDOR_CATEGORIES.find((c) => c.id === vendor.category)?.emoji || "🏛️";

  return (
    <div className="min-h-screen bg-warm-bg pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-coral to-coral-600 text-white">
        <div className="max-w-lg mx-auto px-5 pt-4 pb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-4 active:opacity-70">
            <ArrowLeft size={18} />
            <span>홈</span>
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">{emoji}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium bg-white/20 px-2 py-0.5 rounded-md">{vendor.categoryLabel}</span>
              <h1 className="text-[22px] font-bold mt-1.5 leading-tight">{vendor.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-amber-300 fill-amber-300" />
                  <span className="text-sm font-bold">{vendor.rating}</span>
                  <span className="text-xs opacity-70">({vendor.reviewCount}개 리뷰)</span>
                </div>
                <div className="flex items-center gap-1 opacity-80">
                  <MapPin size={12} />
                  <span className="text-xs">{vendor.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-3 space-y-4">
        {/* 가격 + 태그 */}
        <div className="bg-white rounded-2xl p-5 border border-warm-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-warm-text-secondary">예상 가격대</span>
            <span className="text-lg font-extrabold text-coral">{vendor.priceRange}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {vendor.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-medium bg-coral-50 text-coral px-2.5 py-1 rounded-lg">#{tag}</span>
            ))}
          </div>
        </div>

        {/* 소개 */}
        <div className="bg-white rounded-2xl p-5 border border-warm-border">
          <h2 className="font-bold text-[15px] mb-3">업체 소개</h2>
          <p className="text-[13px] text-warm-text-secondary leading-relaxed">{vendor.description}</p>
        </div>

        {/* 하이라이트 */}
        <div className="bg-white rounded-2xl p-5 border border-warm-border">
          <h2 className="font-bold text-[15px] mb-3">이런 점이 좋아요</h2>
          <div className="space-y-2.5">
            {vendor.highlights.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-mint-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={12} className="text-mint" />
                </div>
                <p className="text-[13px] text-warm-text leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 비서로 비교하기 */}
        <Link
          href={`/chat?q=${encodeURIComponent(vendor.name + " 가격이랑 후기 알려줘")}`}
          className="block bg-gradient-to-br from-mint-50 to-mint-100/50 rounded-2xl p-5 border border-mint-200/30 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center">
              <MessageCircle size={18} className="text-mint" />
            </div>
            <div>
              <p className="font-bold text-[14px]">AI 비서에게 물어보기</p>
              <p className="text-[11px] text-warm-text-secondary mt-0.5">&ldquo;{vendor.name} 어때요?&rdquo; 비교·후기·꿀팁까지</p>
            </div>
          </div>
        </Link>

        {/* CTA 버튼 */}
        <div className="fixed bottom-16 left-0 right-0 z-40 px-5 pb-2">
          <div className="max-w-lg mx-auto">
            <a
              href={vendor.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-coral text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-coral/25 active:scale-[0.98] transition-transform"
            >
              <ExternalLink size={16} />
              상담 문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
