"use client";

// V3.2 S1 · Hero Slider rotator.
// Spec: docs/2026-04-21_V3.2_S0_UX_DECISIONS.md §3 + Hero_Slides_Copy.md §공통 레이아웃.
//
// Behavior:
//   - First slide holds for 6s, then rotates every 5s.
//   - Pauses on touchstart / focusin / mouseenter. Resumes 3s after focus/hover leaves.
//   - prefers-reduced-motion → no rotation, stacks vertically.
//   - Keyboard: ← / → between slides, Space toggles play/pause.
//   - Swipe: horizontal threshold 40px, vertical <30px priority so page scroll wins.
//   - Dots are real <button>s with 44×44 hit area, 8pt visual dot.
//   - aria-live="off" (we never want a screen reader to read the carousel spontaneously).
//
// S1 ships slides 1·3 static. Slide 2 dynamic data is wired in S2; the Slider
// already handles 2-vs-3 length without changes.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import HeroSlide from "./HeroSlide";
import {
  getHeroSlides,
  getInitialHeroSlides,
  type HeroSlide as HeroSlideType,
} from "@/lib/design/heroSlides";
import { track } from "@/lib/analytics";

const FIRST_SLIDE_HOLD_MS = 6000;
const ROTATE_INTERVAL_MS = 5000;
const RESUME_DELAY_MS = 3000;
const SWIPE_THRESHOLD_PX = 40;
const VERTICAL_LOCK_PX = 30;

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlideType[]>(() => getInitialHeroSlides());
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Rotate timer ref — always either a number or undefined.
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Pointer tracking for swipe.
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  // Mount-only: pick up prefers-reduced-motion + rehydrate dynamic slides.
  useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);

    // Attempt async hydration for slide 2. S1 returns the same static list,
    // but this wiring is ready for S2 without code churn.
    void getHeroSlides().then((next) => {
      if (next.length !== slides.length) setSlides(next);
    });

    track("home_view", {});

    return () => mq.removeEventListener("change", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire a hero_slide_view each time `current` changes.
  useEffect(() => {
    if (!mounted) return;
    const slide = slides[current];
    if (!slide) return;
    track("hero_slide_view", { slideId: slide.id, autoRotated: !paused });
  }, [current, mounted, paused, slides]);

  // Rotation timer. Clears + re-arms whenever current/paused/reducedMotion change.
  useEffect(() => {
    if (!mounted || reducedMotion || paused) return;
    if (slides.length <= 1) return;
    const delay = current === 0 ? FIRST_SLIDE_HOLD_MS : ROTATE_INTERVAL_MS;
    timerRef.current = setTimeout(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, mounted, reducedMotion, slides.length]);

  const goTo = useCallback(
    (nextIndex: number, reason: "dot" | "swipe" | "keyboard") => {
      setCurrent((prev) => {
        const bounded = ((nextIndex % slides.length) + slides.length) % slides.length;
        if (prev === bounded) return prev;
        if (reason === "dot") {
          track("hero_dot_click", { fromSlide: prev, toSlide: bounded });
        }
        return bounded;
      });
    },
    [slides.length],
  );

  const pause = useCallback(
    (trigger: "touch" | "focus" | "hover") => {
      setPaused(true);
      track("hero_pause", { slideId: slides[current]?.id, trigger });
    },
    [current, slides],
  );

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY_MS);
  }, []);

  // Pointer handlers for swipe.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    pause("touch");
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    scheduleResume();
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dy) > VERTICAL_LOCK_PX) return; // page scroll wins
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    goTo(dx < 0 ? current + 1 : current - 1, "swipe");
  };

  // Keyboard handling.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(current + 1, "keyboard");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(current - 1, "keyboard");
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setPaused((p) => !p);
    }
  };

  const onCTAClick = useCallback(() => {
    const slide = slides[current];
    if (!slide) return;
    track("hero_slide_click", { slideId: slide.id, ctaHref: slide.ctaHref });
  }, [current, slides]);

  // --- Reduced-motion fallback ---------------------------------------------

  if (reducedMotion || !mounted) {
    return (
      <section aria-label={`홈 하이라이트 ${slides.length}개`} className="px-0">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="aspect-[4/5] w-full">
            <HeroSlide
              slide={slide}
              slideIndex={idx + 1}
              totalSlides={slides.length}
              onClick={onCTAClick}
            />
          </div>
        ))}
      </section>
    );
  }

  // --- Active carousel ------------------------------------------------------

  const currentSlide = slides[current];
  if (!currentSlide) return null;

  return (
    <section
      aria-label={`홈 하이라이트 ${slides.length}개`}
      aria-roledescription="carousel"
      className="relative w-full"
      onMouseEnter={() => pause("hover")}
      onMouseLeave={scheduleResume}
      onFocus={() => pause("focus")}
      onBlur={scheduleResume}
    >
      {/* Slide track — one visible slide at a time. We could translateX across
          a flex track for smoother transitions, but for S1 the simpler opacity
          swap avoids layout-shift artifacts while each slide handles its own
          padding. */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden"
        tabIndex={0}
        role="region"
        aria-live="off"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="absolute inset-0 transition-opacity duration-300 ease-out">
          <HeroSlide
            key={currentSlide.id}
            slide={currentSlide}
            slideIndex={current + 1}
            totalSlides={slides.length}
            onClick={onCTAClick}
          />
        </div>
      </div>

      {/* Dots */}
      <div
        role="tablist"
        aria-label="슬라이드 이동"
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2"
      >
        {slides.map((slide, idx) => {
          const active = idx === current;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`슬라이드 ${idx + 1}로 이동`}
              aria-current={active ? "true" : undefined}
              onClick={() => goTo(idx, "dot")}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span
                className={`block h-2 w-2 rounded-full transition-all ${
                  active ? "w-5 bg-ink" : "bg-ink/30"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
