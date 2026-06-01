import type { Metadata } from "next";
import { ChecklistScreen } from "@/components/checklist/ChecklistScreen";

export const metadata: Metadata = {
  title: "체크리스트 · 신혼생활",
  description: "결혼 준비 9그룹 95개 항목을 부부가 함께 체크하는 결혼 체크리스트",
};

export default function ChecklistPage() {
  return <ChecklistScreen />;
}
