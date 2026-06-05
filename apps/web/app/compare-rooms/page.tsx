import { AppFrame } from "@sinhon-os/ui/server";
import { CompareRoomsClient } from "./compare-rooms-client";

export default function CompareRoomsPage() {
  return (
    <AppFrame
      eyebrow="비교방"
      title="공동 비교와 승인"
      description="상품을 2개 이상 담고 각자 승인, 보류, 반려 상태를 남깁니다."
    >
      <CompareRoomsClient />
    </AppFrame>
  );
}
