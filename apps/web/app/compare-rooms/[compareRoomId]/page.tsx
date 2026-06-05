import { AppFrame } from "@sinhon-os/ui/server";
import { CompareRoomDetailClient } from "./compare-room-detail-client";

type CompareRoomDetailPageProps = {
  params: Promise<{
    compareRoomId: string;
  }>;
};

export default async function CompareRoomDetailPage({ params }: CompareRoomDetailPageProps) {
  const { compareRoomId } = await params;

  return (
    <AppFrame
      eyebrow="비교방 상세"
      title="공동 승인"
      description="상품 카드, 댓글, 승인 상태, 결정 로그를 함께 확인합니다."
    >
      <CompareRoomDetailClient compareRoomId={compareRoomId} />
    </AppFrame>
  );
}
