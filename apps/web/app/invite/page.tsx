import { AppFrame } from "@sinhon-os/ui/server";
import { InviteCreateClient } from "./invite-create-client";

export default function InvitePage() {
  return (
    <AppFrame
      eyebrow="초대"
      title="배우자 초대"
      description="커플 공간에 함께 들어올 초대 링크를 만듭니다."
    >
      <InviteCreateClient />
    </AppFrame>
  );
}
