import { AppFrame } from "@sinhon-os/ui/server";
import { InviteAcceptClient } from "./invite-accept-client";

type InviteTokenPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InviteTokenPage({ params }: InviteTokenPageProps) {
  const { token } = await params;

  return (
    <AppFrame
      eyebrow="초대 링크"
      title="커플 공간 초대"
      description="초대한 커플 공간을 확인하고 합류합니다."
    >
      <InviteAcceptClient token={token} />
    </AppFrame>
  );
}
