"use client";

/**
 * 가벼운 분석 헬퍼.
 * - GA4: NEXT_PUBLIC_GA_ID 가 있으면 layout 의 Script 가 자동 로드. window.gtag 사용.
 * - PostHog: NEXT_PUBLIC_POSTHOG_KEY 가 있으면 init() 한 번 호출 후 capture.
 *
 * 키가 없으면 모두 노옵(no-op). 로컬에서 콘솔 로그만.
 */

type EventName =
  | "onboarding_shown"
  | "onboarding_complete"
  | "decision_card_click"
  | "decision_toggle"
  | "chat_send"
  | "chat_intent"
  | "lead_card_shown"
  | "lead_submitted"
  | "feedback_click";

type EventProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posthog?: any;
  }
}

let posthogReady = false;

async function ensurePosthog() {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (window.posthog && posthogReady) return window.posthog;
  try {
    const mod = await import("posthog-js");
    const posthog = mod.default;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      capture_pageview: true,
      autocapture: false,
    });
    window.posthog = posthog;
    posthogReady = true;
    return posthog;
  } catch {
    return null;
  }
}

export function initAnalytics() {
  if (typeof window === "undefined") return;
  void ensurePosthog();
}

export function track(event: EventName, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  // GA4
  try {
    window.gtag?.("event", event, props);
  } catch {
    /* noop */
  }
  // PostHog
  ensurePosthog()
    .then((p) => p?.capture?.(event, props))
    .catch(() => {});
  // 로컬 디버그
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, props);
  }
}
