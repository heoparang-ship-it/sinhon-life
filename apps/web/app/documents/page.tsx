import { AppFrame } from "@sinhon-os/ui/server";
import { DocumentsClient } from "./documents-client";

export default function DocumentsPage() {
  return (
    <AppFrame
      eyebrow="문서함"
      title="문서 준비"
      description="정책, 상담, 결혼 준비에 필요한 서류 상태와 첨부 선택을 관리합니다."
    >
      <DocumentsClient />
    </AppFrame>
  );
}
