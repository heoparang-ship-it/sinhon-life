import { AppFrame } from "@sinhon-os/ui/server";
import { PolicyMatcherClient } from "./policy-matcher-client";

export default function PoliciesPage() {
  return (
    <AppFrame
      eyebrow="로그인 없는 정책 안내"
      title="정책 톡"
      description="거주지, 결혼 시기, 소득·주거·예식 조건을 고르면 정책별 점수, 맞는 이유, 더 확인할 조건을 대화처럼 정리합니다."
    >
      <PolicyMatcherClient />
    </AppFrame>
  );
}
