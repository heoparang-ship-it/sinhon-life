"use client";

// V3.2 S1 · single Hero slide card.
// Three visual variants (five-icons / dday / chat-preview) keyed off `slide.visual`.
// Color rules: tone → bg-{tone}-50, CTA → bg-{tone}-500, text → text-ink.
// Each slide is a <button> so keyboard focus and click both trigger CTA navigation.

import Link from "next/link";
import type {
  HeroSlide as HeroSlideType,
  HeroSlideTone,
} from "@/lib/design/heroSlides";

interface Props {
  slide: HeroSlideType;
  slideIndex: number; // 1-based for aria-label/analytics
  totalSlides: number;
  onClick?: () => void;
}

const BG_BY_TONE: Record<HeroSlideTone, string> = {
  blue: "bg-[#EAF6FF]",
  coral: "bg-coral-50",
  honey: "bg-honey-50",
  mint: "bg-[#EAFBF4]",
};

const CTA_BG_BY_TONE: Record<HeroSlideTone, string> = {
  blue: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
  coral: "bg-coral-500 hover:bg-coral-600 active:bg-coral-700",
  honey: "bg-honey-600 hover:bg-honey-700 active:bg-honey-800",
  mint: "bg-mint-600 hover:bg-mint-700 active:bg-mint-800",
};

const EYEBROW_COLOR_BY_TONE: Record<HeroSlideTone, string> = {
  blue: "text-blue-700",
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
      className={`relative flex h-full w-full flex-col justify-between px-5 py-3.5 ${BG_BY_TONE[slide.tone]}`}
    >
      {/* Eyebrow */}
      <p className={`font-mono text-[10px] tracking-[0.08em] ${EYEBROW_COLOR_BY_TONE[slide.tone]}`}>
        {slide.eyebrow}
      </p>

      {/* Headline + Subcopy — 컴팩트 */}
      <div className="flex-1 mt-1.5">
        <h2 className="font-serif text-[18px] leading-[1.25] tracking-tightest text-ink wb-keep">
          {slide.headlineLines[0]}{" "}
          <span className="font-bold">{slide.headlineLines[1]}</span>
        </h2>
        <p className="mt-1 text-[11.5px] leading-snug text-ink-soft line-clamp-2 wb-keep">
          {slide.subcopy}
        </p>
      </div>

      {/* CTA + index */}
      <div className="flex items-end justify-between mt-2">
        <Link
          href={slide.ctaHref}
          onClick={onClick}
          className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[12px] font-semibold text-white transition-transform active:scale-95 ${CTA_BG_BY_TONE[slide.tone]}`}
        >
          {slide.ctaLabel}
          <span aria-hidden="true">→</span>
        </Link>
        <p className="font-mono text-[10px] text-ink-muted" aria-hidden="true">
          {slideIndex} / {totalSlides}
        </p>
      </div>
    </article>
  );
}
