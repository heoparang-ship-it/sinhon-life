import { AppFrame } from "@sinhon-os/ui/server";
import { PolicyResultDetailClient } from "./policy-result-detail-client";

type PolicyResultDetailPageProps = {
  params: Promise<{
    eligibilityResultId: string;
  }>;
};

export default async function PolicyResultDetailPage({ params }: PolicyResultDetailPageProps) {
  const { eligibilityResultId } = await params;

  return (
    <AppFrame
      eyebrow="정책 결과"
      title="정책 가능성 결과"
      description="저장된 룰 버전과 입력 스냅샷으로 계산된 결과입니다."
    >
      <PolicyResultDetailClient eligibilityResultId={eligibilityResultId} />
    </AppFrame>
  );
}
