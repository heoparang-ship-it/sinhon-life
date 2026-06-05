import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { EmptyState, ErrorState, LoadingState } from "./empty-state";

const meta = {
  tags: ["autodocs"],
  title: "UI/States"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyStateStory: Story = {
  name: "EmptyState",
  render: () => (
    <EmptyState
      action={<Button>첫 비교 만들기</Button>}
      description="아직 비교함에 담긴 상품이 없습니다. 가격 출처가 확인된 상품부터 추가해 보세요."
      title="비교할 항목이 없습니다"
    />
  )
};

export const ErrorStateStory: Story = {
  name: "ErrorState",
  render: () => (
    <ErrorState
      action={<Button variant="secondary">다시 시도</Button>}
      description="네트워크 상태를 확인한 뒤 다시 불러와 주세요."
      title="정보를 불러오지 못했습니다"
    />
  )
};

export const LoadingStateStory: Story = {
  name: "LoadingState",
  render: () => (
    <LoadingState description="정책과 가격 출처를 확인하고 있습니다." title="확인 중입니다" />
  )
};
