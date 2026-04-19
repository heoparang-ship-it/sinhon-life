"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import Eyebrow from "@/components/design/Eyebrow";
import {
  BENEFITS_BY_REGION,
  BENEFIT_CATEGORIES,
  REGION_LABELS,
  formatMan,
  sumCategory,
  sumRegion,
  type BenefitCategoryId,
  type BenefitItem,
  type RegionId,
} from "@/lib/design/benefits100m";
import { getProfile, type Region } from "@/lib/profile";

const REGION_ORDER: RegionId[] = ["seoul", "incheon", "gyeonggi", "busan", "daegu", "etc"];

function mapRegion(r?: Region): RegionId {
  if (r === "incheon" || r === "seoul" || r === "gyeonggi" || r === "busan" || r === "daegu") return r;
  return "etc";
}

export default function HundredMillionGuidePage() {
  const [region, setRegion] = useState<RegionId>("seoul");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = getProfile();
    setRegion(mapRegion(p?.region));
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="pt-6 pb-24 px-4 text-ink-muted text-sm">불러오는 중…</div>;
  }

  const total = sumRegion(region);
  const data = BENEFITS_BY_REGION[region];

  return (
    <div className="pt-5 pb-24">
      <div className="px-5 mb-2 flex items-center gap-2">
        <Link
          href="/"
          aria-label="뒤로"
          className="text-ink-soft active:scale-90 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <Eyebrow tone="coral">benefit guide · 100m</Eyebrow>
      </div>

      <div className="px-5 mb-5">
        <h1 className="font-serif text-[30px] leading-tight tracking-tightest text-ink wb-keep text-balance">
          신혼부부 지원금
          <br />
          <span className="text-coral-500">1억원</span> 받는 법
        </h1>
        <p className="text-[13px] text-ink-soft mt-2 wb-keep">
          5개 카테고리에서 조건 맞추면 여기까지 가능해요. 지역에 따라 받는 금액이 크게 달라져요.
        </p>
      </div>

      {/* Region tabs */}
      <div className="px-3 mb-5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-2 pb-1">
          {REGION_ORDER.map((r) => {
            const active = r === region;
            return (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] font-bold tracking-tight transition ${
                  active
                    ? "bg-ink text-paper"
                    : "bg-paper-surface text-ink-soft border border-paper-line"
                }`}
              >
                {REGION_LABELS[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Total hero */}
      <div className="mx-4 mb-6 rounded-3xl p-5 bg-gradient-to-br from-ink to-[#0F1823] text-white relative overflow-hidden">
        <span
          aria-hidden
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full"
          style={{ background: "radial-gradient(circle, #F9706655, transparent 65%)" }}
        />
        <div className="relative">
          <div className="text-[11px] font-mono uppercase tracking-wider text-honey-300 font-bold mb-1">
            {REGION_LABELS[region]} 부부 기준 · 최대 누적
          </div>
          <div className="font-serif text-[38px] font-semibold leading-none tracking-tightest">
            {formatMan(total)}원
          </div>
          <p className="text-[11.5px] text-white/70 mt-2.5">
            조건 충족 시 추정치. 이자차액·세금절감은 현금이 아닌 비용 절감입니다.
          </p>
        </div>
      </div>

      {/* Categories */}
      {BENEFIT_CATEGORIES.map((c) => {
        const items = data[c.id as BenefitCategoryId];
        if (!items || items.length === 0) {
          return (
            <section key={c.id} className="mx-4 mb-5 p-4 rounded-2xl bg-paper-surface border border-paper-line">
              <CategoryHeader emoji={c.emoji} title={c.title} total={0} summary={c.summary} empty />
              <p className="text-[12px] text-ink-muted mt-2">
                {REGION_LABELS[region]} 지역 특화 혜택은 추가 예정이에요. 국가 정책만 표시돼요.
              </p>
            </section>
          );
        }
        const catTotal = sumCategory(region, c.id as BenefitCategoryId);
        return (
          <section key={c.id} className="mx-4 mb-5 p-4 rounded-2xl bg-paper-surface border border-paper-line">
            <CategoryHeader
              emoji={c.emoji}
              title={c.title}
              total={catTotal}
              summary={c.summary}
            />
            <div className="mt-3 space-y-2">
              {items.map((it, i) => (
                <BenefitRow key={`${c.id}-${i}`} item={it} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="mx-4 mt-2 p-4 rounded-2xl bg-honey-100 border border-honey-300 text-[11.5px] text-ink-soft leading-relaxed">
        ※ 위 금액은 모든 조건을 만족하는 경우의 <strong className="text-ink">최대 누적치</strong>예요.
        실제 수령액은 소득·자산·혼인시점·출산 여부에 따라 크게 달라져요. 대출 이자차액·세금 절감은 현금이 아닌 비용 절감입니다.
        각 정책은 링크에서 최신 공고를 반드시 확인하세요.
      </div>
    </div>
  );
}

function CategoryHeader({
  emoji,
  title,
  total,
  summary,
  empty,
}: {
  emoji: string;
  title: string;
  total: number;
  summary: string;
  empty?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[20px]" aria-hidden>
            {emoji}
          </span>
          <h2 className="font-serif text-[20px] font-semibold text-ink tracking-tight">
            {title}
          </h2>
        </div>
        {!empty && (
          <span className="font-mono text-[13.5px] font-bold text-coral-700">
            {formatMan(total)}
          </span>
        )}
      </div>
      <p className="text-[11.5px] text-ink-muted mt-0.5">{summary}</p>
    </div>
  );
}

function BenefitRow({ item }: { item: BenefitItem }) {
  const body = (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-paper border border-paper-line active:bg-paper-surface/60 transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <h3 className="text-[13.5px] font-bold text-ink tracking-tight wb-keep">
            {item.title}
          </h3>
          {item.condition && (
            <span className="text-[10px] text-ink-muted font-mono">[{item.condition}]</span>
          )}
        </div>
        <div className="text-[11px] text-ink-muted mt-0.5 font-mono">{item.agency}</div>
        <div className="text-[12.5px] text-coral-700 font-bold mt-1">{item.amount}</div>
        {item.note && (
          <p className="text-[11px] text-ink-soft mt-1 leading-relaxed wb-keep">{item.note}</p>
        )}
      </div>
      {item.policySlug || item.externalUrl ? (
        <div className="shrink-0 text-ink-muted">
          {item.externalUrl && !item.policySlug ? (
            <ExternalLink size={14} />
          ) : (
            <ArrowRight size={14} />
          )}
        </div>
      ) : null}
    </div>
  );

  if (item.policySlug) {
    return (
      <Link href={`/policy/${item.policySlug}`} className="block">
        {body}
      </Link>
    );
  }
  if (item.externalUrl) {
    return (
      <a
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {body}
      </a>
    );
  }
  return <div className="block">{body}</div>;
}
