import type { Metadata } from "next";
import { BudgetV2Screen } from "@/components/budget/v2/BudgetV2Screen";

export const metadata: Metadata = {
  title: "가계부 · 신혼생활",
  description: "결혼 준비 누적 비용과 축의금을 한 화면에서 — 자연어 한 줄로 기록",
};

export default function BudgetPage() {
  // v2 — wedding-budget.html iframe 제거하고 React 컴포넌트로 직접 렌더.
  // root layout 의 폰 패널 안 BottomNav(높이 88px) 만큼 빼고 자체 스크롤.
  return (
    <main className="absolute inset-0 bg-white" style={{ height: "calc(100% - 88px)" }}>
      <BudgetV2Screen />
    </main>
  );
}
