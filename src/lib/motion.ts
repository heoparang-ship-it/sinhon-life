/**
 * Motion presets — RFP §9.1 signature set.
 *
 * Eight named motions with consistent duration + easing tokens that
 * map to tailwind.config.ts transition values. Each preset returns
 * framer-motion variant / transition objects so screen-level code
 * never hard-codes durations.
 *
 * All presets honour `prefers-reduced-motion: reduce` via the
 * `reducedMotion` helper below — call it once at the top of a screen
 * component and pass the result into the preset factories.
 */

import type { Transition, Variants } from "framer-motion";

/* --------------------------------------------------------------
 * Duration / easing tokens — keep in sync with tailwind.config.ts
 * -------------------------------------------------------------- */
export const DUR = {
  instant: 0.08,
  quick: 0.14,
  base: 0.22,
  slow: 0.36,
  page: 0.5,
} as const;

export const EASE = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.3, 0, 0, 1.2] as [number, number, number, number],
  decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
  accelerate: [0.4, 0, 1, 1] as [number, number, number, number],
};

/* --------------------------------------------------------------
 * Reduced-motion detection — SSR-safe.
 * -------------------------------------------------------------- */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* --------------------------------------------------------------
 * 1. Onboarding stage → result reveal (warm, confident).
 * -------------------------------------------------------------- */
export function onboardingRevealVariants(reduced = false): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reduced ? DUR.quick : DUR.slow,
        ease: EASE.emphasized,
        when: "beforeChildren",
        staggerChildren: reduced ? 0 : 0.06,
      },
    },
  };
}

/* --------------------------------------------------------------
 * 2. Save heart fill — pops in, settles. Used by SaveButton.
 * -------------------------------------------------------------- */
export const heartSaveTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 14,
  mass: 0.7,
};

/* --------------------------------------------------------------
 * 3. Home feed stagger fade-up on first paint.
 * -------------------------------------------------------------- */
export function feedStaggerContainer(reduced = false): Variants {
  return {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : 0.07,
        delayChildren: 0.04,
      },
    },
  };
}

export function feedStaggerItem(reduced = false): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? DUR.quick : DUR.base, ease: EASE.decelerate },
    },
  };
}

/* --------------------------------------------------------------
 * 4. Category chip selection — morph, not flash.
 * -------------------------------------------------------------- */
export const chipMorphTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
};

/* --------------------------------------------------------------
 * 5. AI "thinking" indicator — sinhon-specific (warm ember pulse
 *    not generic 3-dot). Duration long enough to read as "warm
 *    deliberation" rather than "loading spinner".
 * -------------------------------------------------------------- */
export const aiThinkingKeyframes = {
  opacity: [0.45, 1, 0.45],
  scale: [0.9, 1.05, 0.9],
} as const;

export const aiThinkingTransition: Transition = {
  duration: 1.4,
  ease: "easeInOut",
  repeat: Infinity,
};

/* --------------------------------------------------------------
 * 6. Policy page hero → body reveal (editorial).
 * -------------------------------------------------------------- */
export function policyHeroVariants(reduced = false): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? DUR.quick : DUR.page,
        ease: EASE.decelerate,
      },
    },
  };
}

/* --------------------------------------------------------------
 * 7. Bottom sheet open / close with gesture inertia.
 *    Used with drag + dragConstraints by the Sheet component.
 * -------------------------------------------------------------- */
export const sheetSpring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

export function sheetVariants(reduced = false): Variants {
  return {
    closed: { y: "100%", transition: reduced ? { duration: DUR.quick } : sheetSpring },
    open: { y: 0, transition: reduced ? { duration: DUR.quick } : sheetSpring },
  };
}

/* --------------------------------------------------------------
 * 8. Pull-to-refresh on Home — bespoke. The container tracks drag
 *    distance, and at threshold reveals the refresh indicator.
 * -------------------------------------------------------------- */
export const PULL_THRESHOLD_PX = 72;

export const pullIndicatorTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 22,
};

/* --------------------------------------------------------------
 * Misc utility — used by Toast/Modal fades.
 * -------------------------------------------------------------- */
export function fadeInOut(reduced = false): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: reduced ? DUR.quick : DUR.base, ease: EASE.standard },
    },
    exit: {
      opacity: 0,
      transition: { duration: DUR.quick, ease: EASE.accelerate },
    },
  };
}
