import { AppFrame, LoadingState } from "@sinhon-os/ui/server";
import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <AppFrame
      eyebrow="가입"
      title="신혼OS 시작"
      description="커플 공간을 만들거나 초대받은 공간에 합류합니다."
    >
      <Suspense fallback={<LoadingState description="가입 화면을 준비하고 있습니다." />}>
        <SignupForm />
      </Suspense>
    </AppFrame>
  );
}
