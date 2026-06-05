import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Card, PriceCard } from "./card";

const meta = {
  tags: ["autodocs"],
  title: "UI/Cards"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CardStory: Story = {
  name: "Card",
  render: () => (
    <Card
      description="공동 온보딩, 비교방, 상담 신청처럼 하나의 작업 단위를 감싸는 기본 카드입니다."
      footer={<Button variant="secondary">자세히 보기</Button>}
      title="오늘 해야 할 일"
    >
      <p style={{ margin: 0 }}>배우자 초대가 아직 완료되지 않았습니다.</p>
    </Card>
  )
};

export const PriceCardStory: Story = {
  name: "PriceCard",
  render: () => (
    <PriceCard
      approvalStatus="pending"
      description="스튜디오, 드레스, 메이크업 기본 패키지입니다. 주말 촬영은 추가 비용이 있을 수 있습니다."
      includedItems={["스튜디오 촬영 1회", "기본 보정 20장", "드레스 2벌", "메이크업 1회"]}
      priceAmount={1900000}
      sourceLabel="파트너 제공가"
      sourceUpdatedAt="2026. 6. 1."
      title="본식 전 스튜디오 패키지"
      validUntil="2026. 8. 31."
      vendorName="그린웨딩 스튜디오"
      verifiedAt="2026. 6. 3."
    />
  )
};
