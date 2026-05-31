import type { Metadata } from "next";
import { ProfileEditScreen } from "@/components/my/ProfileEditScreen";

export const metadata: Metadata = {
  title: "내 정보 · 신혼생활",
};

export default function ProfileEditPage() {
  return <ProfileEditScreen />;
}
