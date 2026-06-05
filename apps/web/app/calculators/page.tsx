import { AppFrame, Card } from "@sinhon-os/ui/server";
import Link from "next/link";
import { CalculatorStartTracker } from "./calculator-start-tracker";

const calculatorLinks = [
  {
    description: "예식, 주거, 가전, 입주 비용을 항목별로 쌓아 총액과 부족 금액을 확인합니다.",
    href: "/scenarios",
    label: "예산 계산",
    title: "신혼 예산 계산기"
  },
  {
    description: "온보딩에 저장된 조건과 샘플 정책 룰을 비교해 가능성과 필요 서류를 봅니다.",
    href: "/policies",
    label: "정책 확인",
    title: "정책 가능성 계산"
  },
  {
    description: "검증된 가격 버전을 비교방에 담고 둘의 승인 상태를 남깁니다.",
    href: "/offers",
    label: "상품 비교",
    title: "파트너 가격 비교"
  }
];

export default function CalculatorsPage() {
  return (
    <AppFrame
      eyebrow="계산기"
      title="신혼 준비 계산기"
      description="예산, 정책, 파트너 상품을 하나의 흐름으로 이어서 확인합니다."
    >
      <CalculatorStartTracker />
      <section className="calculator-grid" aria-label="계산기 목록">
        {calculatorLinks.map((item) => (
          <Card description={item.description} key={item.href} title={item.title}>
            <Link className="button-link" href={item.href}>
              {item.label}
            </Link>
          </Card>
        ))}
      </section>
    </AppFrame>
  );
}
