"use client";

// V3.2 S1 · single Hero slide card.
// Three visual variants (five-icons / dday / chat-preview) keyed off `slide.visual`.
// Color rules: tone → bg-{tone}-50, CTA → bg-{tone}-500, text → text-ink.
// Each slide is a <button> so keyboard focus and click both trigger CTA navigation.

import Link from "next/link";
import type {
  HeroSlide as HeroSlideType,
  HeroSlideDDay,
  HeroSlideFiveIcons,
  HeroSlideChatPreview,
  HeroSlideTone,
} from "@/lib/design/heroSlides";

interface Props {
  slide: HeroSlideType;
  slideIndex: number; // 1-based for aria-label/analytics
  totalSlides: number;
  onClick?: () => void;
}

const BG_BY_TONE: Record<HeroSlideTone, string> = {
  coral: "bg-coral-50",
  honey: "bg-honey-50",
  mint: "bg-mint-50",
};

const CTA_BG_BY_TONE: Record<HeroSlideTone, string> = {
  coral: "bg-coral-500 hover:bg-coral-600 active:bg-coral-700",
  honey: "bg-honey-600 hover:bg-honey-700 active:bg-honey-800", // honey-500 fails AA on white, step up
  mint: "bg-mint-600 hover:bg-mint-700 active:bg-mint-800", // same
};

const EYEBROW_COLOR_BY_TONE: Record<HeroSlideTone, string> = {
  coral: "text-coral-700",
  honey: "text-honey-700",
  mint: "text-mint-700",
};

export default function HeroSlide({ slide, slideIndex, totalSlides, onClick }: Props) {
  return (
    <article
      role="group"
      aria-roledescription="slide"
      aria-label={slide.ariaLabel}
      className={`relative flex h-full w-full flex-col justify-between px-6 py-8 ${BG_BY_TONE[slide.tone]}`}
    >
      {/* Eyebrow */}
      <p className={`font-mono text-[11px] tracking-[0.08em] ${EYEBROW_COLOR_BY_TONE[slide.tone]}`}>
        {slide.eyebrow}
      </p>

      {/* Headline + Subcopy */}
      <div className="mt-3 flex-1">
        <h2 className="font-serif text-[28px] leading-[1.2] tracking-tightest text-ink wb-keep">
          {slide.headlineLines[0]}
          <br />
          <span className="font-bold">{slide.headlineLines[1]}</span>
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-soft wb-keep">{slide.subcopy}</p>
      </div>

      {/* Visual */}
      <div className="my-5 flex-shrink-0">{renderVisual(slide)}</div>

      {/* CTA + index */}
      <div className="flex items-end justify-between">
        <Link
          href={slide.ctaHref}
          onClick={onClick}
          className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[14px] font-semibold text-white transition-transform active:scale-95 ${CTA_BG_BY_TONE[slide.tone]}`}
        >
          {slide.ctaLabel}
          <span aria-hidden="true">→</span>
        </Link>
        <p className="font-mono text-[11px] text-ink-muted" aria-hidden="true">
          {slideIndex} / {totalSlides}
        </p>
      </div>
    </article>
  );
}

function renderVisual(slide: HeroSlideType) {
  switch (slide.visual) {
    case "five-icons":
      return <FiveIcons slide={slide} />;
    case "dday":
      return <DDayVisual slide={slide} />;
    case "chat-preview":
      return <ChatPreview slide={slide} />;
  }
}

// --- Visual 1: five icons (Slide 1 — 1억 내러티브) --------------------------

function FiveIcons({ slide }: { slide: HeroSlideFiveIcons }) {
  return (
    <ul className="grid grid-cols-5 gap-2" aria-label="신혼부부 지원금 5개 영역">
      {slide.icons.map((icon) => (
        <li key={icon.label} className="flex flex-col items-center gap-1">
          <span
            role="img"
            aria-label={icon.label}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-coral-500 text-[20px]"
          >
            {icon.emoji}
          </span>
          <span className="text-[10.5px] font-medium text-ink">{icon.label}</span>
          {icon.subtext ? (
            <span className="font-mono text-[9.5px] text-ink-muted">{icon.subtext}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

// --- Visual 2: D-Day counter (Slide 2 — 이번 주 마감 임박) -----------------

function DDayVisual({ slide }: { slide: HeroSlideDDay }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <span className="font-serif text-[48px] font-bold leading-none text-honey-700">
          D-{slide.daysLeft}
        </span>
        <span className="mt-1 font-mono text-[10px] text-ink-muted">마감일</span>
      </div>
      <div className="flex-1">
        <span className="inline-block rounded-full bg-mint-100 px-2.5 py-0.5 text-[11px] font-medium text-mint-700">
          {slide.region}
        </span>
        <p className="mt-2 text-[13px] leading-snug text-ink wb-keep">
          {slide.maxBenefitLabel}
          <br />
          <span className="text-ink-soft">{slide.deadlineLabel}</span>
        </p>
      </div>
    </div>
  );
}

// --- Visual 3: chat bubble (Slide 3 — AI 1차 점검) ------------------------

function ChatPreview({ slide }: { slide: HeroSlideChatPreview }) {
  return (
    <div className="flex items-start gap-3">
      <span
        role="img"
        aria-label="AI 말풍선"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mint-500 text-[18px]"
      >
        💬
      </span>
      <div className="relative flex-1 rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm">
        <ul className="space-y-1">
          {slide.previewItems.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-[12.5px] text-ink">
              <span className="text-mint-600" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-coral-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
          +{slide.extraCount}개 더
        </span>
      </div>
    </div>
  );
}
