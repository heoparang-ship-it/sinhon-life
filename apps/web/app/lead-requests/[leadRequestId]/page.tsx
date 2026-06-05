import { AppFrame } from "@sinhon-os/ui/server";
import { LeadRequestDetailClient } from "./lead-request-detail-client";

type LeadRequestDetailPageProps = {
  params: Promise<{
    leadRequestId: string;
  }>;
};

export default async function LeadRequestDetailPage({ params }: LeadRequestDetailPageProps) {
  const { leadRequestId } = await params;

  return (
    <AppFrame
      eyebrow="상담 신청 완료"
      title="접수 상태"
      description="파트너 상담 신청 상태와 다음 단계를 확인합니다."
    >
      <LeadRequestDetailClient leadRequestId={leadRequestId} />
    </AppFrame>
  );
}
