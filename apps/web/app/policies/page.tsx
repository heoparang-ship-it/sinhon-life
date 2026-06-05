import { AppFrame } from "@sinhon-os/ui/server";
import { PolicyMatcherClient } from "./policy-matcher-client";

export default function PoliciesPage() {
  return (
    <AppFrame
      eyebrow="정책 매칭"
      title="정책·혜택 가능성 확인"
      description="저장된 온보딩 입력과 샘플 정책 룰을 비교해 결과, 사유, 필요 서류를 확인합니다."
    >
      <PolicyMatcherClient />
    </AppFrame>
  );
}
