import { AppFrame } from "@sinhon-os/ui/server";
import { ScenarioBuilderClient } from "./scenario-builder-client";

export default function ScenariosPage() {
  return (
    <AppFrame
      eyebrow="시나리오"
      title="예상 비용 만들기"
      description="예식, 주거, 월 부담을 나눠 보고 샘플 항목과 부족 금액을 확인합니다."
    >
      <ScenarioBuilderClient />
    </AppFrame>
  );
}
