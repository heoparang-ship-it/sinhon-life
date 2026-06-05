import { AppFrame } from "@sinhon-os/ui/server";
import { PolicyMatcherClient } from "./policy-matcher-client";

export default function PoliciesPage() {
  return (
    <AppFrame
      eyebrow="로그인 없는 정책 안내"
      title="정책 톡"
      description="거주지, 결혼 시기, 소득 구간을 고르면 맞을 가능성이 높은 정책을 카카오톡 대화처럼 안내합니다."
    >
      <PolicyMatcherClient />
    </AppFrame>
  );
}
