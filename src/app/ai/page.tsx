import type { Metadata } from "next";
import { Suspense } from "react";
import { AiTalkScreen } from "@/components/ai/AiTalkScreen";

export const metadata: Metadata = {
  title: "AI톡",
  description:
    "신혼부부가 받을 수 있는 정부·지자체 혜택을 쉽게 찾아주는 AI 정책 챗봇",
};

export default function AiPage() {
  return (
    <Suspense fallback={null}>
      <AiTalkScreen />
    </Suspense>
  );
}
