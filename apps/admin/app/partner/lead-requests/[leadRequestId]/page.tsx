import { AppFrame } from "@sinhon-os/ui/server";
import { PartnerLeadDetailClient } from "./partner-lead-detail-client";

type PartnerLeadDetailPageProps = {
  params: Promise<{
    leadRequestId: string;
  }>;
};

export default async function PartnerLeadDetailPage({ params }: PartnerLeadDetailPageProps) {
  const { leadRequestId } = await params;

  return (
    <AppFrame
      eyebrow="파트너 리드"
      title="상담 요청 상세"
      description="파트너에게 필요한 최소 범위의 상담 요청 정보를 확인합니다."
    >
      <PartnerLeadDetailClient leadRequestId={leadRequestId} />
    </AppFrame>
  );
}
