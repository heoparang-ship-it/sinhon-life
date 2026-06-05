import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Drawer, Modal, Toast } from "./overlays";

const meta = {
  tags: ["autodocs"],
  title: "UI/Overlays"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ModalStory: Story = {
  name: "Modal",
  render: function ModalExample() {
    const [open, setOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setOpen(true)}>모달 열기</Button>
        <Modal
          description="상담 신청 전 배우자와 가격, 유효기간, 개인정보 제공 범위를 함께 확인합니다."
          footer={<Button fullWidth>확인했습니다</Button>}
          onClose={() => setOpen(false)}
          open={open}
          title="상담 신청 확인"
        >
          <p style={{ margin: 0 }}>확인 후 신청하면 파트너에게 최소한의 연락 정보만 전달됩니다.</p>
        </Modal>
      </>
    );
  }
};

export const DrawerStory: Story = {
  name: "Drawer",
  render: function DrawerExample() {
    const [open, setOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setOpen(true)} variant="secondary">
          상세 패널 열기
        </Button>
        <Drawer
          description="출처와 검증 시점, 가격 유효기간을 한곳에서 확인합니다."
          footer={<Button fullWidth>비교함에 담기</Button>}
          onClose={() => setOpen(false)}
          open={open}
          title="가격 상세"
        >
          <p style={{ margin: 0 }}>주말 비용과 취소 정책은 파트너 확인 후 확정됩니다.</p>
        </Drawer>
      </>
    );
  }
};

export const ToastStory: Story = {
  name: "Toast",
  render: () => (
    <Toast
      action={<Button variant="ghost">보기</Button>}
      description="배우자에게 초대 링크가 전달되었습니다."
      title="초대 완료"
      tone="success"
    />
  )
};
