import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { ArrowLeft, MessageCircle, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import { POLICIES, BRAND } from "@/lib/constants";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import {
  ProductComparisonTable,
  RateBonuses,
  DocumentChecklist,
  HowToSteps,
  OfficialLinks,
  FaqAccordion,
  SourcesFooter,
} from "@/components/policy/RichPolicySections";

const SITE_URL = "https://sinhon.life";

const COLOR_BAR: Record<string, string> = {
  housing: "bg-coral", finance: "bg-mint", baby: "bg-coral-400", tax: "bg-mint-600",
};

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const policy = POLICIES.find((p) => p.slug === params.slug);
  if (!policy) return {};
  const url = `${SITE_URL}/policy/${policy.slug}`;
  const title = `${policy.title} | 신혼생활 — 신혼부부 정책·혜택`;
  const description = `${policy.summary} · 신혼부부·신랑신부가 꼭 알아야 할 2026 ${policy.title}. 신혼생활(sinhon.life)에서 AI가 맞춤으로 안내합니다.`;
  const keywords = [
    "신혼생활",
    "신혼부부",
    "신랑",
    "신부",
    policy.title,
    ...policy.tags,
    "2026 신혼부부 혜택",
    "신혼부부 지원금",
    policy.category === "housing"
      ? "신혼부부 청약"
      : policy.category === "finance"
      ? "신혼부부 절약"
      : policy.category === "baby"
      ? "출산지원금"
      : "신혼부부 세금",
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${policy.title} · 신혼생활`,
      description,
      url,
      siteName: "신혼생활",
      locale: "ko_KR",
      type: "article",
      publishedTime: policy.updatedAt ? new Date(policy.updatedAt).toISOString() : undefined,
      modifiedTime: policy.updatedAt ? new Date(policy.updatedAt).toISOString() : undefined,
      authors: ["신혼생활"],
      tags: policy.tags,
      images: [
        {
          url: "/icon-1024.png",
          width: 1024,
          height: 1024,
          alt: policy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: policy.title,
      description: policy.summary,
      images: ["/icon-1024.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function PolicyPage({ params }: Props) {
  const policy = POLICIES.find((p) => p.slug === params.slug);
  if (!policy) notFound();

  const paragraphs = policy.content.split(/\n\n+/);

  // Rich 모드: 확장 필드 중 하나라도 있으면 활성화
  const isRich = !!(
    policy.products ||
    policy.calculator ||
    policy.rateBonuses ||
    policy.documents ||
    policy.howToSteps ||
    policy.externalLinks ||
    policy.faqs
  );

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

  // 정책 페이지 구조화 데이터 — Article + BreadcrumbList
  const url = `${SITE_URL}/policy/${policy.slug}`;
  const datePublished = policy.updatedAt
    ? new Date(policy.updatedAt).toISOString()
    : new Date().toISOString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: policy.title,
        description: policy.summary,
        url,
        datePublished,
        dateModified: datePublished,
        author: { "@type": "Organization", name: "신혼생활", url: SITE_URL },
        publisher: {
          "@type": "Organization",
          name: "신혼생활",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-1024.png` },
        },
        keywords: ["신혼생활", "신혼부부", "신랑", "신부", policy.title, ...policy.tags].join(
          ", "
        ),
        articleSection: policy.category,
        inLanguage: "ko-KR",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: [`${SITE_URL}/icon-1024.png`],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "혜택정책",
            item: `${SITE_URL}/category/policy`,
          },
          { "@type": "ListItem", position: 3, name: policy.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <Script
        id={`ld-policy-${policy.slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-warm-border/50 sticky top-0 z-10">
        <Link href="/" className="text-warm-text-secondary active:scale-90 transition-transform" aria-label="홈으로"><ArrowLeft size={20} /></Link>
        <h1 className="text-sm font-bold truncate flex-1 text-center px-3">{policy.title}</h1>
        <div className="flex items-center gap-1">
          <SaveButton id={policy.slug} />
          <ShareButton title={policy.title} description={policy.summary} slug={policy.slug} />
        </div>
      </header>

      <div className={`h-1.5 ${COLOR_BAR[policy.category] || "bg-coral"}`} />

      <article className="px-5 py-6 space-y-5">
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

        {/* 레거시 모드: content를 풀 렌더. Rich 모드: TL;DR만 짧게 */}
        {!isRich ? (
          <div className="space-y-5 pt-2">
            {paragraphs.map((para, i) => {
              const trimmed = para.trim();
              if (trimmed.length < 30 && !trimmed.includes("원") && !trimmed.includes("%")) {
                return (
                  <h3
                    key={i}
                    className="text-[15px] font-bold text-coral mt-8 first:mt-0"
                  >
                    {trimmed}
                  </h3>
                );
              }
              return (
                <p key={i} className="text-[14px] leading-[1.8] text-warm-text">
                  {trimmed}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="pt-2 space-y-6">
            {/* 1. 상품 비교표 (2개 이상이면 렌더) */}
            {policy.products && policy.products.length >= 2 && (
              <ProductComparisonTable products={policy.products} />
            )}

            {/* 3. 우대금리 조건 */}
            {policy.rateBonuses && policy.rateBonuses.length > 0 && (
              <RateBonuses bonuses={policy.rateBonuses} />
            )}

            {/* 4. 필요서류 체크리스트 */}
            {policy.documents && policy.documents.length > 0 && (
              <DocumentChecklist slug={policy.slug} documents={policy.documents} />
            )}

            {/* 5. 신청 절차 */}
            {policy.howToSteps && policy.howToSteps.length > 0 && (
              <HowToSteps steps={policy.howToSteps} />
            )}

            {/* 6. 공식 신청처 */}
            {policy.externalLinks && policy.externalLinks.length > 0 && (
              <OfficialLinks links={policy.externalLinks} />
            )}

            {/* 7. FAQ */}
            {policy.faqs && policy.faqs.length > 0 && <FaqAccordion faqs={policy.faqs} />}

            {/* 8. 출처 */}
            {policy.sources && policy.sources.length > 0 && (
              <SourcesFooter sources={policy.sources} />
            )}
          </div>
        )}

      </article>

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
