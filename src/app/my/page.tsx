import type { Metadata } from "next";
import { MyScreen } from "@/components/my/MyScreen";

export const metadata: Metadata = {
  title: "MY · 신혼생활",
};

export default function MyPage() {
  return <MyScreen />;
}
