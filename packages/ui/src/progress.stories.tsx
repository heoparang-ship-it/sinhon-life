import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress, Stepper } from "./progress";

const meta = {
  tags: ["autodocs"],
  title: "UI/Progress"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ProgressStory: Story = {
  name: "Progress",
  render: () => <Progress label="공동 온보딩 진행률" value={62} />
};

export const StepperStory: Story = {
  name: "Stepper",
  render: () => (
    <Stepper
      steps={[
        { description: "기본 계정과 커플 공간을 만들었습니다.", label: "가입", status: "complete" },
        {
          description: "예산과 주거 정보를 구간으로 입력합니다.",
          label: "공동 온보딩",
          status: "current"
        },
        {
          description: "정책과 가격 비교는 온보딩 이후 시작합니다.",
          label: "비교 시작",
          status: "upcoming"
        }
      ]}
    />
  )
};
