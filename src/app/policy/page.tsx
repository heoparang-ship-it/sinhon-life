import type { Metadata } from "next";
import { PolicyHubScreen } from "@/components/policy/PolicyHubScreen";

export const metadata: Metadata = {
  title: "인천 신혼부부 정책 — 천원주택·신생아 대출·전세보증료",
  description:
    "인천 신혼부부·청년이 바로 신청할 수 있는 검증된 정책 모음. 천원주택, 신생아 특례 디딤돌·버팀목 대출, 전세보증금 반환보증 보증료, 맘편한 산후조리비까지 1분 자가진단으로 매칭.",
  keywords: [
    "인천 신혼부부 정책",
    "천원주택",
    "신생아 특례 디딤돌대출",
    "신생아 버팀목대출",
    "인천 전세보증금 반환보증",
    "인천 청년 임차보증금 이자지원",
    "맘편한 산후조리비",
    "인천 신혼 지원금",
  ],
  alternates: { canonical: "/policy" },
  openGraph: {
    title: "인천 신혼부부가 받을 수 있는 정책, 1분 자가진단",
    description: "천원주택·신생아 특례대출·전세보증료·산후조리비 — 인천 신혼 정책을 한 곳에서.",
    url: "https://sinhon.life/policy",
  },
};

export default function PolicyPage() {
  return <PolicyHubScreen />;
}
