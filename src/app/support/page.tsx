import type { Metadata } from "next";
import { Suspense } from "react";
import { SupportFlow } from "@/components/support/SupportFlow";
import { POLICIES } from "@/lib/policy/data";

export const metadata: Metadata = {
  title: `인천 신혼이면 챙길 수 있는 ${POLICIES.length}가지 | 신혼생활`,
  description:
    "인천 신혼·청년이라면 천원주택, 신생아 특례대출, 전세보증료, 산후조리비 등 정부·인천 공식 정책을 1분 만에 체크하세요. 무료 · 가입 없음.",
  alternates: { canonical: "https://sinhon.life/support" },
  openGraph: {
    title: `인천 신혼이면 챙길 수 있는 ${POLICIES.length}가지`,
    description: "정부·인천 공식 정책 — 내가 챙길 수 있는 걸 1분 만에 체크.",
    url: "https://sinhon.life/support",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `인천 신혼이면 챙길 수 있는 ${POLICIES.length}가지`,
    description: "정부·인천 공식 정책 — 1분 체크.",
  },
  robots: { index: true, follow: true },
};

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SupportFlow />
    </Suspense>
  );
}
