import { productName } from "@sinhon-os/config";
import { AppFrame, Card } from "@sinhon-os/ui/server";
import Link from "next/link";

const quickLinks = [
  {
    description: "내 계정과 커플 공간을 함께 만듭니다.",
    href: "/signup",
    label: "가입 시작",
    title: "새로 시작"
  },
  {
    description: "가입된 계정으로 배우자 초대 링크를 만듭니다.",
    href: "/invite",
    label: "초대 만들기",
    title: "배우자 초대"
  },
  {
    description: "둘의 예산, 주거, 결혼 준비 기준을 저장합니다.",
    href: "/onboarding",
    label: "온보딩 시작",
    title: "공동 온보딩"
  },
  {
    description: "예식, 주거, 월 부담을 나눠 예상 비용을 만듭니다.",
    href: "/scenarios",
    label: "시나리오 만들기",
    title: "예상 비용"
  },
  {
    description: "예산, 정책, 파트너 비교로 이어지는 계산기 랜딩입니다.",
    href: "/calculators",
    label: "계산기 보기",
    title: "계산기"
  },
  {
    description: "준비 가이드를 읽고 관련 기능으로 바로 이어갑니다.",
    href: "/articles",
    label: "가이드 보기",
    title: "콘텐츠"
  },
  {
    description: "저장된 조건으로 샘플 정책 가능성과 필요 서류를 확인합니다.",
    href: "/policies",
    label: "정책 확인",
    title: "정책·혜택"
  },
  {
    description: "검증된 파트너 상품과 가격 버전을 비교합니다.",
    href: "/offers",
    label: "상품 보기",
    title: "파트너 상품"
  },
  {
    description: "담아둔 상품을 함께 보고 승인 상태를 남깁니다.",
    href: "/compare-rooms",
    label: "비교방 보기",
    title: "비교방"
  },
  {
    description: "필요 서류의 준비 상태와 첨부 선택을 관리합니다.",
    href: "/documents",
    label: "문서함 보기",
    title: "문서함"
  },
  {
    description: "담당자와 마감일을 정하고 완료 상태를 남깁니다.",
    href: "/tasks",
    label: "할 일 보기",
    title: "할 일"
  }
];

export default function WebHomePage() {
  return (
    <AppFrame
      eyebrow="사용자 앱"
      title={productName}
      description="우리 둘의 예산, 정책, 선택지를 함께 정리하는 커플 공간입니다."
    >
      <section className="quick-grid" aria-label="주요 동선">
        {quickLinks.map((link) => (
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
