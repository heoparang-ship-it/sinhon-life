import { AppFrame } from "@sinhon-os/ui/server";
import { ScenarioDetailClient } from "./scenario-detail-client";

type ScenarioDetailPageProps = {
  params: Promise<{
    scenarioId: string;
  }>;
};

export default async function ScenarioDetailPage({ params }: ScenarioDetailPageProps) {
  const { scenarioId } = await params;

  return (
    <AppFrame
      eyebrow="시나리오 결과"
      title="예상 비용 확인"
      description="총액, 월 부담, 부족 금액, 위험 신호를 함께 확인합니다."
    >
      <ScenarioDetailClient scenarioId={scenarioId} />
    </AppFrame>
  );
}
