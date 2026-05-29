import type { Metadata } from "next";
import { PartnersScreen } from "@/components/partners/PartnersScreen";

export const metadata: Metadata = {
  title: "파트너 입점 — 부평·송도 신혼 결정 슬롯",
  description:
    "신혼생활 AI 결정 슬롯에 노출되세요. 인천 부평·송도 신혼부부에게 'Choice Share' 기반으로 매칭. 성과형 송객, 무리한 광고비 없이.",
  openGraph: {
    title: "신혼생활 파트너 — 결정 슬롯 입점",
    description: "성과형 송객. 부평·송도 신혼 결정의 순간에 노출되세요.",
  },
};

export default function PartnersPage() {
  return <PartnersScreen />;
}
