/**
 * /gov/[id]
 *
 * 정부 공고 상세 페이지 — sinhon.life 플랫폼 스타일 렌더링
 * 공식 정부 신청 링크는 페이지 맨 하단에만 표시합니다.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, MessageCircle, ExternalLink, Building2 } from "lucide-react";
import type { GovPolicy } from "@/app/api/gov-policies/route";

const SITE_URL = "https://sinhon.life";

// ── 카테고리 메타 ────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  string,
  { emoji: string; label: string; colorBar: string; tint: string; textColor: string }
> = {
  housing: {
    emoji: "🏠",
    label: "주거 지원",
    colorBar: "bg-coral",
    tint: "bg-coral-50",
    textColor: "text-coral-700",
  },
  baby: {
    emoji: "👶",
    label: "출산·육아",
    colorBar: "bg-mint",
    tint: "bg-mint-50",
    textColor: "text-mint-700",
  },
  finance: {
    emoji: "💰",
    label: "금융 혜택",
    colorBar: "bg-coral-400",
    tint: "bg-coral-50",
    textColor: "text-coral-700",
  },
  tax: {
    emoji: "📋",
    label: "세금 혜택",
    colorBar: "bg-mint-600",
    tint: "bg-mint-50",
    textColor: "text-mint-700",
  },
};

const SOURCE_LABEL: Record<GovPolicy["source"], string> = {
  mois: "행정안전부",
  "ssis-local": "사회보장정보원",
  myhome: "국토교통부 마이홈",
};

// ── 데이터 fetch ─────────────────────────────────────────────────────────────

async function fetchGovPolicy(id: string): Promise<GovPolicy | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/gov-policies`, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { policies: GovPolicy[] };
    return data.policies?.find((p) => p.id === id) ?? null;
  } catch {
    return null;
  }
}

// ── 타입 ─────────────────────────────────────────────────────────────────────

interface Props {
  params: { id: string };
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const policy = await fetchGovPolicy(decodeURIComponent(params.id));
  if (!policy) return {};
  return {
    title: `${policy.title} | 신혼생활`,
    description: policy.summary,
    openGraph: {
      title: `${policy.title} · 신혼생활`,
      description: policy.summary,
      url: `${SITE_URL}/gov/${params.id}`,
      siteName: "신혼생활",
      locale: "ko_KR",
      type: "article",
    },
  };
}

// ── 페이지 ───────────────────────────────────────────────────────────────────

export default async function GovDetailPage({ params }: Props) {
  const policy = await fetchGovPolicy(decodeURIComponent(params.id));
  if (!policy) notFound();

  const meta = CATEGORY_META[policy.category] ?? CATEGORY_META.housing;

  // 친근한 인트로 문구 생성
  const introMap: Record<GovPolicy["category"], string> = {
    housing: "내 집 마련이 꿈인 신혼부부를 위해 정부가 직접 지원하는 주거 혜택이에요 🏠",
    baby:    "아이를 맞이하는 신혼부부를 위해 정부가 세심하게 챙겨주는 지원이에요 👶",
    finance: "신혼생활 초반 경제적 부담을 덜어주는 금융 혜택을 소개해요 💰",
    tax:     "신혼부부라면 놓치면 아까운 절세 혜택이에요 📋",
  };
  const intro = introMap[policy.category] ?? introMap.baby;

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-warm-border/50 sticky top-0 z-10">
        <Link
          href="/explore"
          className="text-warm-text-secondary active:scale-90 transition-transform"
          aria-label="탐색으로"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold truncate flex-1">{policy.title}</h1>
        <span className="text-[10px] font-bold text-white bg-coral px-2.5 py-1 rounded-full flex-shrink-0">
          정부 공고
        </span>
      </header>

      {/* 카테고리 컬러 바 */}
      <div className={`h-1.5 ${meta.colorBar}`} />

      <article className="px-5 py-6 space-y-5 max-w-lg mx-auto">
        {/* 인트로 카드 */}
        <div className={`${meta.tint} rounded-2xl p-4 space-y-2`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            <span className={`text-[11px] font-bold ${meta.textColor}`}>{meta.label}</span>
          </div>
          <p className="text-[13px] text-warm-text leading-relaxed">{intro}</p>
        </div>

        {/* 정책명 */}
        <div>
          <h2 className="text-xl font-extrabold leading-tight tracking-tight">{policy.title}</h2>
          <p className="text-sm text-warm-text-secondary leading-relaxed mt-2">{policy.summary}</p>
        </div>

        {/* 신청 대상 */}
        {policy.targetDesc && (
          <section className="bg-white border border-warm-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">👥</span>
              <h3 className="text-[13px] font-bold">신청 대상</h3>
            </div>
            <p className="text-[13px] text-warm-text leading-relaxed">{policy.targetDesc}</p>
          </section>
        )}

        {/* 지원 내용 */}
        {policy.supportDesc && (
          <section className="bg-white border border-warm-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">💝</span>
              <h3 className="text-[13px] font-bold">지원 내용</h3>
            </div>
            <p className="text-[13px] text-warm-text leading-relaxed">{policy.supportDesc}</p>
          </section>
        )}

        {/* 담당 기관 */}
        {policy.ministry && (
          <div className="flex items-center gap-2 text-[11px] text-warm-text-muted">
            <Building2 size={12} />
            <span>담당: {policy.ministry}</span>
            <span>·</span>
            <span>출처: {SOURCE_LABEL[policy.source] ?? policy.source}</span>
          </div>
        )}

        {/* 안내 문구 */}
        <div className="bg-warm-bg border border-warm-border/70 rounded-xl p-4">
          <p className="text-[12px] text-warm-text-muted leading-relaxed">
            💡 <strong>자세한 신청 방법</strong>은 AI에게 물어보거나, 아래 공식 페이지에서 확인하세요.
            자격 요건·서류·기간 등 세부 조건이 매년 변경될 수 있어요.
          </p>
        </div>
      </article>

      {/* CTA 섹션 */}
      <div className="px-5 pb-24 space-y-3 max-w-lg mx-auto">
        {/* 1순위: AI에게 묻기 */}
        <Link
          href={`/chat?q=${encodeURIComponent(policy.title + " 신청 방법과 자격 요건을 알려주세요")}`}
          className="flex items-center justify-center gap-2 w-full bg-coral text-white py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-coral/20"
        >
          <MessageCircle size={18} />
          이 혜택 AI에게 자세히 묻기
        </Link>

        {/* 2순위: 더 보기 */}
        <Link
          href="/explore"
          className="flex items-center justify-center gap-1.5 bg-white border border-warm-border text-warm-text py-3 rounded-xl font-bold text-[13px] active:scale-[0.98] transition-transform w-full"
        >
          다른 혜택 더 보기
        </Link>

        {/* 3순위 (맨 마지막): 공식 정부 신청 링크 */}
        {policy.applyUrl && (
          <div className="pt-4 border-t border-warm-border/50">
            <p className="text-[11px] text-warm-text-muted text-center mb-2.5">
              직접 신청하시려면 공식 정부 사이트로 이동해요
            </p>
            <a
              href={policy.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full border border-warm-border/80 text-warm-text-secondary bg-white py-3 rounded-xl text-[13px] active:scale-[0.98] transition-transform hover:bg-warm-bg"
            >
              <ExternalLink size={13} className="opacity-60" />
              공식 신청 페이지 바로가기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
