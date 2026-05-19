import type { Metadata } from "next";
import ArchiveDetailClient from "./ArchiveDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `아카이브 — sinhon.life`,
    description: "신혼생활 인스타그램 게시물",
    alternates: { canonical: `https://sinhon.life/archive/${params.id}` },
  };
}

export default function ArchiveDetailPage({ params }: { params: { id: string } }) {
  return <ArchiveDetailClient id={params.id} />;
}
