import type { Metadata } from "next";
import ArchiveClient from "./ArchiveClient";

export const metadata: Metadata = {
  title: "아카이브 — sinhon.life",
  description: "신혼생활 인스타그램에 올라온 영상·콘텐츠 모음. 신혼집·혼수·웨딩·정책 영상을 한곳에서.",
  alternates: { canonical: "https://sinhon.life/archive" },
};

// 동적 컨텐츠 (Worker 가 매 10분 갱신) — 정적 빌드 시 캐시하지 않음
export const dynamic = "force-dynamic";

export default function ArchivePage() {
  return <ArchiveClient />;
}
