import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, DatePicker, Input, Radio, Select } from "./form";

const meta = {
  tags: ["autodocs"],
  title: "UI/Form"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const InputStory: Story = {
  name: "Input",
  render: () => (
    <Input
      description="실명 대신 서비스 안에서 서로 알아볼 수 있는 이름을 권장합니다."
      label="표시 이름"
      placeholder="예: 민지"
    />
  )
};

export const SelectStory: Story = {
  name: "Select",
  render: () => (
    <Select
      description="정책과 가격 표시의 기준 지역으로 사용됩니다."
      label="거주 희망 지역"
      options={[
        { label: "서울", value: "seoul" },
        { label: "경기", value: "gyeonggi" },
        { label: "인천", value: "incheon" }
      ]}
      placeholder="지역 선택"
    />
  )
};

export const CheckboxStory: Story = {
  name: "Checkbox",
  render: () => (
    <Checkbox
      description="상담 신청 전 파트너에게 전달되는 정보와 보관 기간을 다시 확인합니다."
      label="개인정보 제공 내용을 확인했습니다"
    />
  )
};

export const RadioStory: Story = {
  name: "Radio",
  render: function RadioExample() {
    const [value, setValue] = useState("range");

    return (
      <Radio
        description="정확한 금액 저장은 나중에 다시 확인할 수 있습니다."
        label="예산 입력 방식"
        name="budget-input-type"
        onChange={setValue}
        options={[
          {
            description: "민감 정보를 줄이고 빠르게 시작합니다.",
            label: "구간으로 입력",
            value: "range"
          },
          {
            description: "상세 계산이 필요할 때만 선택합니다.",
            label: "정확한 금액 입력",
            value: "amount"
          }
        ]}
        value={value}
      />
    );
  }
};

export const DatePickerStory: Story = {
  name: "DatePicker",
  render: () => (
    <DatePicker description="예식일이 정해지지 않았다면 비워둘 수 있습니다." label="예식 예정일" />
  )
};
