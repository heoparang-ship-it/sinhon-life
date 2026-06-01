"use client";

import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/profile/useUserProfile";
import { initAnalytics, track } from "@/lib/analytics/track";
import { OnboardingFlow } from "./OnboardingFlow";

/**
 * 첫 방문 1회만 헤이딜러 스타일 온보딩을 띄운다.
 * - onboardedAt 이 있으면 다시 뜨지 않음
 * - 건너뛰기/완료 모두 onboardedAt 을 채워 재노출 방지
 */
export function OnboardingMount() {
  const { profile, hydrated } = useUserProfile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!profile.onboardedAt) {
      setOpen(true);
      track("onboarding_shown");
    }
  }, [hydrated, profile.onboardedAt]);

  if (!open) return null;
  return <OnboardingFlow onClose={() => setOpen(false)} />;
}
