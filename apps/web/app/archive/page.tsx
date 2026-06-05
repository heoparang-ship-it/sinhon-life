import type { Metadata } from "next";
import { AppFrame } from "@sinhon-os/ui/server";
import { InstagramArchiveClient } from "./instagram-archive-client";

export const metadata: Metadata = {
  title: "인스타 아카이브 | 신혼생활",
  description: "신혼생활 공식 인스타그램 피드와 릴스를 모아 보는 아카이브"
};

export default function ArchivePage() {
  return (
    <AppFrame
      eyebrow="@sinhon.life"
      title="인스타 아카이브"
      description="신혼생활 공식 인스타 피드와 릴스를 한 곳에서 확인합니다."
    >
      <InstagramArchiveClient />
    </AppFrame>
  );
}
