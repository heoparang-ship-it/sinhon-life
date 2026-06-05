import { AppFrame } from "@sinhon-os/ui/server";
import { NotificationsClient } from "./notifications-client";

export default function NotificationsPage() {
  return (
    <AppFrame eyebrow="알림" title="알림함" description="문서와 할 일 마감 알림을 확인합니다.">
      <NotificationsClient />
    </AppFrame>
  );
}
