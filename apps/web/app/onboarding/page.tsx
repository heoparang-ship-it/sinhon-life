import { AppFrame } from "@sinhon-os/ui/server";
import { OnboardingClient } from "./onboarding-client";

export default function OnboardingPage() {
  return (
    <AppFrame
      eyebrow="공동 온보딩"
      title="둘의 기준 맞추기"
      description="예산, 주거, 결혼 준비 상태를 구간 중심으로 저장합니다."
    >
      <OnboardingClient />
    </AppFrame>
  );
}
