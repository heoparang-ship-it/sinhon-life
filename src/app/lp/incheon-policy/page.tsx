import type { Metadata } from "next";
import { Suspense } from "react";
import { IncheonPolicyLP } from "@/components/lp/IncheonPolicyLP";

export const metadata: Metadata = {
  title: "인천 신혼이면 받는 정책 11개 | 무료 확인",
  description:
    "인천 신혼·청년이라면 천원주택, 신생아 특례대출, 전세보증료, 산후조리비까지. 공식 출처 검증된 정책 11개를 1분 만에 확인하세요. 무료.",
  alternates: { canonical: "https://sinhon.life/lp/incheon-policy" },
  openGraph: {
    title: "인천 신혼이면 받는 정책 11개 — 1분 무료 확인",
    description: "천원주택·신생아 대출·전세보증료·산후조리비. 공식 출처 검증.",
    url: "https://sinhon.life/lp/incheon-policy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "인천 신혼이면 받는 정책 11개 — 1분 무료 확인",
    description: "천원주택·신생아 대출·전세보증료·산후조리비.",
  },
  robots: { index: true, follow: true },
};

export default function IncheonPolicyLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <IncheonPolicyLP />
    </Suspense>
  );
}
