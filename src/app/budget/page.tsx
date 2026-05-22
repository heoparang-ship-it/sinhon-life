import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "가계부 · 신혼생활",
  description: "결혼 준비 누적 비용과 축의금을 한 화면에서 — 자연어 한 줄로 기록",
};

export default function BudgetPage() {
  // wedding-budget.html?embed=1 을 iframe으로 풀스크린 임베드.
  // 임베드 모드는 자체 Tabbar/iPhone 프레임을 숨겨 sinhon.life BottomNav와 충돌 안 함.
  return (
    <main className="absolute inset-0 bg-white">
      <iframe
        src="/wedding-budget.html?embed=1"
        title="가계부"
        className="w-full h-full border-0 block"
        style={{ height: "calc(100% - 88px)" }}
      />
    </main>
  );
}
