import type { Metadata } from "next";
import { BudgetV2Screen } from "@/components/budget/v2/BudgetV2Screen";

export const metadata: Metadata = {
  title: "가계부 · 신혼생활",
  description: "결혼 준비 누적 비용과 축의금을 한 화면에서 관리",
};

export default function BudgetPage() {
  // BudgetV2Screen 자체가 .wbv2 { height:100%; display:flex; flex-direction:column } 구조라
  // 부모에 명시적 높이만 잡아주면 됨. 모바일은 100dvh, 데스크탑은 폰 패널 채움.
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white lg:h-full">
      <BudgetV2Screen />
    </div>
  );
}
