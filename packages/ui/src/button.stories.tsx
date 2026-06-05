import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta = {
  component: Button,
  tags: ["autodocs"],
  title: "UI/Button"
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "다음 단계로 이동"
  }
};

export const Variants: Story = {
  args: {
    children: "상담 신청"
  },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button>상담 신청</Button>
      <Button variant="secondary">비교함에 담기</Button>
      <Button variant="ghost">나중에 하기</Button>
      <Button variant="danger">삭제</Button>
    </div>
  )
};

export const LongKoreanText: Story = {
  args: {
    children: "배우자에게 초대 링크를 보내고 함께 입력하기",
    fullWidth: true
  }
};
