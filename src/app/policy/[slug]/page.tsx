import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import { POLICIES, BRAND } from "@/lib/constants";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";

const COLOR_BAR: Record<string, string> = {
  housing: "bg-coral", finance: "bg-mint", baby: "bg-coral-400", tax: "bg-mint-600",
};

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props) {
  const policy = POLICIES.find((p) => p.slug === params.slug);
  if (!policy) return {};
  return {
    title: `${policy.title} | 신혼생활`,
    description: policy.summary,
    openGraph: {
      title: `${policy.title} · 신혼생활`,
      description: policy.summary,
      url: `https://sinhon.life/policy/${policy.slug}`,
    },
  };
}

export default function PolicyPage({ params }: Props) {
  const policy = POLICIES.find((p) => p.slug === params.slug);
  if (!policy) notFound();

  const paragraphs = policy.content.split(/\n\n+/);

  // 관련 정책: 같은 카테고리 우선, 그 다음 태그 겹치는 것, 자기 자신 제외, 최대 3개
  const related = POLICIES
    .filter((p) => p.slug !== policy.slug)
    .map((p) => {
      let score = 0;
      if (p.category === policy.category) score += 10;
      score += p.tags.filter((t) => policy.tags.includes(t)).length * 3;
      return { policy: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.policy);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-warm-border/50 sticky top-0 z-10">
        <Link href="/" className="text-warm-text-secondary active:scale-90 transition-transform"><ArrowLeft size={20} /></Link>
        <h1 className="text-sm font-bold truncate flex-1 text-center px-3">{policy.title}</h1>
        <div className="flex items-center gap-1">
          <SaveButton id={policy.slug} />
          <ShareButton title={policy.title} description={policy.summary} slug={policy.slug} />
        </div>
      </header>

      <div className={`h-1.5 ${COLOR_BAR[policy.category] || "bg-coral"}`} />

      <div className="px-5 py-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-6 rounded-full ${COLOR_BAR[policy.category] || "bg-coral"}`} />
          <div className="flex gap-1.5">
            {policy.tags.map((tag) => (
              <span key={tag} className="text-xs bg-coral-50 text-coral-700 px-2.5 py-1 rounded-full">#{tag}</span>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-extrabold leading-tight tracking-tight">{policy.title}</h2>
        <p className="text-sm text-warm-text-secondary leading-relaxed">{policy.summary}</p>

        <div className="space-y-5 pt-2">
          {paragraphs.map((para, i) => {
            const trimmed = para.trim();
            if (trimmed.length < 30 && !trimmed.includes("원") && !trimmed.includes("%")) {
              return <h3 key={i} className="text-[15px] font-bold text-coral mt-8 first:mt-0">{trimmed}</h3>;
            }
            return <p key={i} className="text-[14px] leading-[1.8] text-warm-text">{trimmed}</p>;
          })}
        </div>

        <p className="text-xs text-warm-text-muted pt-4">마지막 업데이트: {policy.updatedAt}</p>
      </div>

      {/* 관련 정책 추천 */}
      {related.length > 0 && (
        <section className="px-5 pb-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-coral" />
            <h3 className="text-[15px] font-extrabold">함께 보면 좋은 꿀정보</h3>
          </div>
          <div className="space-y-2.5">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/policy/${p.slug}`}
                className="flex items-center gap-3.5 bg-white rounded-xl p-3.5 border border-warm-border active:scale-[0.99] transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`w-1 h-10 rounded-full flex-shrink-0 ${COLOR_BAR[p.category] || "bg-coral"}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[13px] leading-tight truncate">{p.title}</h4>
                  <p className="text-[11px] text-warm-text-muted mt-1 line-clamp-1">{p.summary}</p>
                </div>
                {p.highlight && (
                  <span className="text-[10px] font-bold text-coral bg-coral-50 px-2 py-1 rounded-lg flex-shrink-0">{p.highlight}</span>
                )}
                <ArrowRight size={13} className="text-warm-text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA 3종 */}
      <div className="px-5 pb-24 space-y-2.5">
        <Link
          href={`/chat?q=${encodeURIComponent(policy.title + "에 대해 자세히 알려주세요")}`}
          className="flex items-center justify-center gap-2 w-full bg-coral text-white py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-coral/20"
        >
          <MessageCircle size={18} />
          이 혜택 AI에게 자세히 묻기
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={BRAND.kakaoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-mint-50 text-mint-700 py-3 rounded-xl font-bold text-[13px] active:scale-[0.98] transition-transform"
          >
            <ExternalLink size={14} />
            선배에게 묻기
          </a>
          <Link
            href="/explore"
            className="flex items-center justify-center gap-1.5 bg-white border border-warm-border text-warm-text py-3 rounded-xl font-bold text-[13px] active:scale-[0.98] transition-transform"
          >
            다른 혜택 더 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
