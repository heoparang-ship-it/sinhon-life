import { adminAppName } from "@sinhon-os/config";
import { AppFrame } from "@sinhon-os/ui/server";
import { AdminCrmDashboard } from "./admin-crm-dashboard";

export default function AdminHomePage() {
  return (
    <AppFrame
      eyebrow="운영자 앱"
      title={adminAppName}
      description="파트너, 상품, 가격, 리드, 정책을 한 화면에서 관리합니다."
    >
      <AdminCrmDashboard />
    </AppFrame>
  );
}
