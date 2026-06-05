import { productName } from "@sinhon-os/config";
import { AppFrame, Card } from "@sinhon-os/ui/server";
import Link from "next/link";

const featureLinks = [
  {
    description: "거주지, 결혼 시기, 소득·주거·예식 조건을 고르면 정책별 점수와 부족 조건을 안내합니다.",
    href: "/policies",
    label: "정책 톡 시작",
    title: "정책 톡"
  },
  {
    description: "신혼생활 인스타 피드와 릴스를 한 곳에 모아 최신 콘텐츠를 바로 확인합니다.",
    href: "/archive",
    label: "아카이브 보기",
    title: "인스타 아카이브"
  }
];

export default function WebHomePage() {
  return (
    <AppFrame
      eyebrow="신혼생활 v1"
      title={productName}
      description="신혼 준비에 바로 쓰는 정책 안내와 공식 인스타 아카이브만 남긴 미니멀 홈입니다."
    >
      <section className="quick-grid home-feature-grid" aria-label="주요 동선">
        {featureLinks.map((link) => (
          <Card description={link.description} key={link.href} title={link.title}>
            <Link className="button-link" href={link.href}>
              {link.label}
            </Link>
          </Card>
        ))}
      </section>
    </AppFrame>
  );
}
