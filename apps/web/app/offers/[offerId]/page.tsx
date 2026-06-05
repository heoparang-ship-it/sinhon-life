import { AppFrame } from "@sinhon-os/ui/server";
import { OfferDetailClient } from "./offer-detail-client";

type OfferDetailPageProps = {
  params: Promise<{
    offerId: string;
  }>;
};

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { offerId } = await params;

  return (
    <AppFrame
      eyebrow="상품 상세"
      title="가격 버전 확인"
      description="대표 가격과 포함 항목, 필수 옵션, 가격 이력을 함께 확인합니다."
    >
      <OfferDetailClient offerId={offerId} />
    </AppFrame>
  );
}
