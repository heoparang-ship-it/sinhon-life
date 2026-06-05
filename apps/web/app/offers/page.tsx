import { AppFrame } from "@sinhon-os/ui/server";
import { OffersClient } from "./offers-client";

export default function OffersPage() {
  return (
    <AppFrame
      eyebrow="상품"
      title="파트너 상품"
      description="검증된 가격 버전과 포함 항목, 필수 옵션을 기준으로 신혼 준비 상품을 비교합니다."
    >
      <OffersClient />
    </AppFrame>
  );
}
