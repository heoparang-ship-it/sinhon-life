import { AppFrame } from "@sinhon-os/ui/server";
import { LeadRequestClient } from "./lead-request-client";

type LeadRequestPageProps = {
  params: Promise<{
    compareRoomId: string;
  }>;
};

export default async function LeadRequestPage({ params }: LeadRequestPageProps) {
  const { compareRoomId } = await params;

  return (
    <AppFrame
      eyebrow="상담 신청"
      title="전송 전 확인"
      description="둘 다 승인한 상품만 파트너 상담으로 연결합니다."
    >
      <LeadRequestClient compareRoomId={compareRoomId} />
    </AppFrame>
  );
}
