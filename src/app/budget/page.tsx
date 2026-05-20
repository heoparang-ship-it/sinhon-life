import type { Metadata } from "next";
import { BudgetScreen } from "@/components/budget/BudgetScreen";

export const metadata: Metadata = {
  title: "가계부 · 신혼생활",
  description: "결혼 준비 예산과 지출을 부부가 함께 관리하는 가계부",
};

export default function BudgetPage() {
  return (
    <main className="flex-1 max-w-[480px] mx-auto w-full min-h-[100dvh] bg-white">
      <BudgetScreen />
    </main>
  );
}
