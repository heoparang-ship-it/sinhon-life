import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageCircle, Sparkles, Store } from "lucide-react";
import { HUB_CATEGORIES, POLICIES, VENDORS, FEATURE_FLAGS } from "@/lib/constants";

const COLOR_BAR: Record<string, string> = {
  housing: "bg-coral",
  finance: "bg-mint",
  baby: "bg-coral-400",
  tax: "bg-mint-600",
};

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return HUB_CATEGORIES.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: Props) {
  const hub = HUB_CATEGORIES.find((c) => c.id === params.id);
  if (!hub) return {};
  return {
    title: `${hub.title} | 신혼생활`,
    description: hub.description,
    openGraph: {
      title: `${hub.title} · 신혼생활`,
      description: hub.description,
      url: `https://sinhon.life/category/${hub.id}`,
    },
  };
}

export default function CategoryHubPage({ params }: Props) {
  const hub = HUB_CATEGORIES.find((c) => c.id === params.id);
  if (!hub) notFound();

  const relatedPolicies = POLICIES.filter((p) =>
    hub.policyCategories.includes(p.category)
  );
  // 광고주(웨딩업체) 노출은 FEATURE_FLAGS.SHOW_VENDORS 제어
  const relatedVendors =
    FEATURE_FLAGS.SHOW_VENDORS && hub.id === "wedding"
      ? VENDORS.slice(0, 4)
      : [];
  const isEmpty = relatedPolicies.length === 0;

  const bgGradient =
    hub.color === "coral"
      ? "from-coral-50 via-coral-100/30 to-white"
      : "from-mint-50 via-mint-100/30 to-white";

  const accentBtn =
    hub.color === "coral" ? "bg-coral text-white" : "bg-mint text-white";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-warm-border/50 sticky top-0 z-10">
        <Link
          href="/"
          className="text-warm-text-secondary active:scale-90 transition-transform"
          aria-label="홈으로"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold truncate flex-1 text-center px-3">
          {hub.title}
        </h1>
        <div className="w-5" />
      </header>

      {/* Hero */}
      <section className={`bg-gradient-to-br ${bgGradient} px-5 pt-8 pb-10`}>
        <div className="text-5xl mb-3" aria-hidden>
          {hub.emoji}
        </div>
        <h2 className="text-2xl font-extrabold leading-tight tracking-tight">
          {hub.title}
        </h2>
        <p className="text-[13px] text-warm-text-muted mt-1 font-medium">
          {hub.subtitle}
        </p>
        <p className="text-sm text-warm-text-secondary mt-4 leading-relaxed">
          {hub.description}
        </p>
        <div className="flex gap-2 mt-5">
          <Link
            href={`/chat?q=${encodeURIComponent(hub.title + "에 대해 알려주세요")}`}
            className={`${accentBtn} flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[13px] active:scale-[0.97] transition-transform`}
          >
            <MessageCircle size={15} /> AI에게 묻기
          </Link>
          <Link
            href="/explore"
            className="flex-1 bg-white text-warm-text border border-warm-border flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[13px] active:scale-[0.97] transition-transform"
          >
            전체 탐색
          </Link>
        </div>
      </section>

      {/* 꿀정보 */}
      <section className="px-5 py-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles
              size={15}
              className={hub.color === "coral" ? "text-coral" : "text-mint"}
            />
            <h3 className="text-[15px] font-extrabold">관련 꿀정보</h3>
          </div>
          <span className="text-[11px] text-warm-text-muted">
            {relatedPolicies.length}개
          </span>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-2xl border border-warm-border p-6 text-center">
            <p className="text-3xl mb-2">✍️</p>
            <p className="font-bold text-[14px]">콘텐츠 준비 중이에요</p>
            <p className="text-[12px] text-warm-text-muted mt-1 leading-relaxed">
              {hub.title} 분야의 꿀정보를 열심히 만들고 있어요.
              <br />
              먼저 AI 비서에게 물어보시겠어요?
            </p>
            <Link
              href={`/chat?q=${encodeURIComponent(hub.title + " 관련 꿀팁 알려주세요")}`}
              className={`${accentBtn} inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs mt-4 active:scale-[0.97] transition-transform`}
            >
              <MessageCircle size={14} /> AI에게 묻기
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {relatedPolicies.map((policy) => (
              <Link
                key={policy.slug}
                href={`/policy/${policy.slug}`}
                className="flex items-center gap-3.5 bg-white rounded-xl p-4 border border-warm-border active:scale-[0.99] transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`w-1 h-10 rounded-full flex-shrink-0 ${
                    COLOR_BAR[policy.category] || "bg-coral"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[13px] leading-tight truncate">
                    {policy.title}
                  </h4>
                  <p className="text-[11px] text-warm-text-muted mt-1 line-clamp-1">
                    {policy.summary}
                  </p>
                </div>
                {policy.highlight && (
                  <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-1 rounded-lg flex-shrink-0">
                    {policy.highlight}
                  </span>
                )}
                <ArrowRight
                  size={13}
                  className="text-warm-text-muted flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 웨딩 카테고리에서만 업체 노출 */}
      {relatedVendors.length > 0 && (
        <section className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Store size={15} className="text-coral" />
            <h3 className="text-[15px] font-extrabold">추천 업체</h3>
          </div>
          <div className="space-y-2.5">
            {relatedVendors.map((v) => (
              <Link
                key={v.slug}
                href={`/vendor/${v.slug}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-warm-border active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-lg bg-coral-50 flex items-center justify-center text-2xl">
                  🏛️
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[13px]">{v.name}</h4>
                  <p className="text-[11px] text-warm-text-muted mt-0.5">
                    {v.location} · {v.priceRange}
                  </p>
                </div>
                <ArrowRight size={13} className="text-warm-text-muted" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 다른 카테고리 둘러보기 */}
      <section className="px-5 py-6 pb-20">
        <h3 className="text-[13px] font-bold text-warm-text-secondary mb-3">
          다른 카테고리 둘러보기
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {HUB_CATEGORIES.filter((c) => c.id !== hub.id).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="bg-white border border-warm-border rounded-xl p-3 text-center active:scale-[0.97] transition-transform"
            >
              <div className="text-xl" aria-hidden>
                {c.emoji}
              </div>
              <p className="text-[11px] font-bold mt-1">{c.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
