import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./tabs";

const meta = {
  component: Tabs,
  tags: ["autodocs"],
  title: "UI/Tabs"
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "비교 정보",
    items: [
      {
        content: "가격 출처와 유효기간을 먼저 확인합니다.",
        label: "가격",
        value: "price"
      },
      {
        content: "필수 서류와 신청 기간을 확인합니다.",
        label: "정책",
        value: "policy"
      },
      {
        content: "배우자의 승인 여부와 반려 사유를 확인합니다.",
        label: "승인",
        value: "approval"
      }
    ]
  }
};
