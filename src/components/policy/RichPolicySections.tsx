"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  BookOpen,
  TrendingDown,
  ListChecks,
  FileText,
  HelpCircle,
  CalendarCheck,
} from "lucide-react";
import type {
  PolicyProduct,
  PolicyRateBonus,
  PolicyExternalLink,
  PolicyFaq,
  PolicySource,
} from "@/lib/constants";

/** 상품 비교표 — 모바일 가로 스크롤 방식 */
export function ProductComparisonTable({ products }: { products: PolicyProduct[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ListChecks size={16} className="text-coral" />
        <h3 className="text-[15px] font-extrabold">상품 비교 한눈에 보기</h3>
      </div>
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="flex gap-3 min-w-max pb-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="w-64 flex-shrink-0 bg-white rounded-xl border border-warm-border p-4 shadow-sm"
            >
              <div className="font-extrabold text-[14px] leading-tight">{p.name}</div>
              <div className="text-[11px] text-warm-text-muted mt-1 leading-snug">{p.tagline}</div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-coral-50 rounded-lg p-2">
                  <div className="text-warm-text-muted">비율(연)</div>
                  <div className="font-extrabold text-coral mt-0.5">
                    {p.rate[0]}~{p.rate[1]}%
                  </div>
                </div>
                <div className="bg-mint-50 rounded-lg p-2">
                  <div className="text-warm-text-muted">한도</div>
                  <div className="font-extrabold text-mint-700 mt-0.5">
                    {(p.maxAmount / 100_000_000).toFixed(0)}억
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="text-[10px] font-bold text-warm-text-secondary">자격</div>
                {p.eligibility.map((line, i) => (
                  <div key={i} className="text-[11px] leading-snug flex gap-1">
                    <span className="text-coral flex-shrink-0">·</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>

              {p.strength && (
                <div className="mt-3 bg-mint-50 text-mint-700 text-[11px] font-bold px-2 py-1.5 rounded-lg">
                  ✨ {p.strength}
                </div>
              )}
              {p.weakness && (
                <div className="mt-1.5 bg-warm-bg text-warm-text-secondary text-[11px] px-2 py-1.5 rounded-lg">
                  ⚠️ {p.weakness}
                </div>
              )}

              {p.processingTime && (
                <div className="mt-3 flex items-center gap-1 text-[11px] text-warm-text-muted">
                  <CalendarCheck size={11} />
                  심사 {p.processingTime}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 우대금리 박스 */
export function RateBonuses({ bonuses }: { bonuses: PolicyRateBonus[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingDown size={16} className="text-mint-700" />
        <h3 className="text-[15px] font-extrabold">우대금리 최대로 뽑는 법</h3>
      </div>
      <div className="bg-mint-50/60 rounded-xl p-4 space-y-2.5">
        {bonuses.map((b, i) => (
          <div key={i} className="flex items-center justify-between text-[13px]">
            <span className="leading-snug flex-1 pr-2">{b.condition}</span>
            <span className="font-extrabold text-mint-700 flex-shrink-0">{b.effect}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-mint-100 text-[11px] text-warm-text-muted leading-relaxed">
          * 조건이 다르면 중복 적용됩니다. 단, 최종 금리가 연 1.0% 미만으로 내려가지는 않아요.
        </div>
      </div>
    </section>
  );
}

/** 필요서류 체크리스트 — localStorage로 체크 상태 저장 */
export function DocumentChecklist({
  slug,
  documents,
}: {
  slug: string;
  documents: { label: string; hint?: string }[];
}) {
  const storageKey = `policy-docs-${slug}`;
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(new Set(JSON.parse(raw)));
    } catch {}
  }, [storageKey]);

  const toggle = (i: number) => {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
    } catch {}
  };

  const progress = mounted ? Math.round((checked.size / documents.length) * 100) : 0;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-coral" />
          <h3 className="text-[15px] font-extrabold">필요서류 체크리스트</h3>
        </div>
        {mounted && (
          <span className="text-[11px] font-bold text-coral">
            {checked.size}/{documents.length} · {progress}%
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-warm-border overflow-hidden">
        {mounted && (
          <div className="h-1 bg-warm-bg">
            <div
              className="h-full bg-coral transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <ul className="divide-y divide-warm-border/60">
          {documents.map((doc, i) => {
            const isChecked = mounted && checked.has(i);
            return (
              <li key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-start gap-3 p-3.5 text-left active:bg-coral-50/40 transition"
                >
                  <span className="flex-shrink-0 mt-0.5">
                    {isChecked ? (
                      <CheckSquare size={18} className="text-coral" />
                    ) : (
                      <Square size={18} className="text-warm-text-muted" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span
                      className={`text-[13px] font-bold leading-snug block ${
                        isChecked ? "line-through text-warm-text-muted" : ""
                      }`}
                    >
                      {doc.label}
                    </span>
                    {doc.hint && (
                      <span className="text-[11px] text-warm-text-muted mt-0.5 block leading-snug">
                        {doc.hint}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** 신청 단계 */
export function HowToSteps({
  steps,
}: {
  steps: { title: string; detail?: string }[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ListChecks size={16} className="text-mint-700" />
        <h3 className="text-[15px] font-extrabold">신청 절차 5단계</h3>
      </div>
      <ol className="relative space-y-4 pl-7">
        <span className="absolute left-[11px] top-1 bottom-1 w-px bg-warm-border" />
        {steps.map((step, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-7 top-0 w-6 h-6 rounded-full bg-coral text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm">
              {i + 1}
            </span>
            <div className="font-bold text-[13px] leading-snug">{step.title}</div>
            {step.detail && (
              <div className="text-[12px] text-warm-text-secondary leading-relaxed mt-1">
                {step.detail}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 공식 신청처·은행 직링크 */
export function OfficialLinks({ links }: { links: PolicyExternalLink[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 size={16} className="text-coral" />
        <h3 className="text-[15px] font-extrabold">공식 신청처 · 취급은행</h3>
      </div>
      <div className="space-y-2">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-xl border border-warm-border p-3.5 active:scale-[0.99] transition hover:shadow-md"
          >
            <span
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                l.type === "gov"
                  ? "bg-coral-50 text-coral"
                  : l.type === "bank"
                  ? "bg-mint-50 text-mint-700"
                  : "bg-warm-bg text-warm-text-secondary"
              }`}
            >
              {l.type === "gov" ? (
                <ShieldCheck size={16} />
              ) : l.type === "bank" ? (
                <Building2 size={16} />
              ) : (
                <BookOpen size={16} />
              )}
            </span>
            <span className="flex-1">
              <span className="font-bold text-[13px] block leading-tight">{l.label}</span>
              <span className="text-[11px] text-warm-text-muted mt-0.5 block truncate">
                {l.type === "gov" ? "정부 공식" : l.type === "bank" ? "취급은행" : "참고자료"} ·{" "}
                {new URL(l.url).hostname}
              </span>
            </span>
            <ExternalLink size={14} className="text-warm-text-muted flex-shrink-0" />
          </a>
        ))}
      </div>
    </section>
  );
}

/** FAQ 아코디언 */
export function FaqAccordion({ faqs }: { faqs: PolicyFaq[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <HelpCircle size={16} className="text-coral" />
        <h3 className="text-[15px] font-extrabold">자주 묻는 질문</h3>
      </div>
      <div className="bg-white rounded-xl border border-warm-border overflow-hidden divide-y divide-warm-border/60">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center gap-2 p-3.5 text-left active:bg-coral-50/30 transition"
              >
                <span className="flex-1 font-bold text-[13px] leading-snug">{faq.q}</span>
                {isOpen ? (
                  <ChevronDown size={16} className="text-coral flex-shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-warm-text-muted flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-3.5 pb-4 text-[13px] text-warm-text leading-relaxed whitespace-pre-wrap">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** 출처·업데이트 시점 — E-E-A-T 시그널 */
export function SourcesFooter({ sources }: { sources: PolicySource[] }) {
  return (
    <section className="space-y-2 pt-2 border-t border-warm-border/60">
      <div className="flex items-center gap-2">
        <ShieldCheck size={13} className="text-warm-text-muted" />
        <h3 className="text-[11px] font-bold text-warm-text-muted uppercase tracking-wider">
          출처 · 검증 시점
        </h3>
      </div>
      <ul className="space-y-1.5">
        {sources.map((s, i) => (
          <li key={i} className="text-[11px] text-warm-text-muted leading-snug">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted decoration-warm-text-muted hover:text-coral"
            >
              {s.label}
            </a>
            <span className="ml-1.5">· {s.verifiedAt} 확인</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
