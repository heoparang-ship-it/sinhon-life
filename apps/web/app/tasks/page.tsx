import { AppFrame } from "@sinhon-os/ui/server";
import { TasksClient } from "./tasks-client";

export default function TasksPage() {
  return (
    <AppFrame
      eyebrow="할 일"
      title="공동 할 일"
      description="정책 서류와 준비 작업을 담당자와 마감일 기준으로 관리합니다."
    >
      <TasksClient />
    </AppFrame>
  );
}
