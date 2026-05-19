"use client";

import Link from "next/link";
import { ChevronLeft, ExternalLink, AlertCircle } from "lucide-react";
import { useArchiveDetail } from "@/lib/instagram/client";

/**
 * /archive/[id] — 단건 상세.
 *
 *  - VIDEO/REELS  : <video controls> 로 인라인 재생, 인스타 permalink 폴백 노출
 *  - IMAGE        : 전체 폭 이미지
 *  - CAROUSEL_ALBUM : 첫 미디어만 표시 (Worker 단계에서 children 미수집 — 후속 작업 시 확장)
 */
export default function ArchiveDetailClient({ id }: { id: string }) {
  const { data, error, loading } = useArchiveDetail(id);

  return (
    <main className="min-h-screen pb-[100px]" style={{ background: "var(--background, #FFFFFF)" }}>
      {/* 헤더 (뒤로가기) */}
      <header className="sticky top-0 z-20 px-3 py-3 backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid var(--design-line, #E6ECF2)" }}>
        <Link
          href="/archive"
          className="inline-flex items-center gap-1 text-[14px] font-semibold"
          style={{ color: "var(--navy, #1E2A3A)" }}
        >
          <ChevronLeft size={20} />
          아카이브
        </Link>
      </header>

      {error && (
        <div className="py-20 flex flex-col items-center text-center px-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: "var(--peach-card, #FFF0E8)" }}
          >
            <AlertCircle size={24} style={{ color: "var(--coral-deep, #C8453D)" }} />
          </div>
          <p className="text-[15px] font-semibold" style={{ color: "var(--navy, #1E2A3A)" }}>
            게시물을 찾을 수 없어요
          </p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--twilight, #4A5568)" }}>
            삭제됐거나 비공개로 전환된 게시물일 수 있어요.
          </p>
          <Link
            href="/archive"
            className="mt-4 px-4 py-2 rounded-full text-[13px] font-semibold"
            style={{ background: "var(--coral, #F97066)", color: "white" }}
          >
            아카이브로 돌아가기
          </Link>
        </div>
      )}

      {!error && (loading || !data) && (
        <div className="px-5 pt-5">
          <div className="aspect-[3/4] rounded-2xl animate-pulse" style={{ background: "#EEF1F4" }} />
          <div className="mt-4 space-y-2 animate-pulse">
            <div className="h-4 w-3/4 rounded" style={{ background: "#EEF1F4" }} />
            <div className="h-4 w-1/2 rounded" style={{ background: "#EEF1F4" }} />
          </div>
        </div>
      )}

      {data && (
        <article className="px-5 pt-5">
          <MediaBlock item={data.item} />
          {data.item.caption && (
            <p
              className="mt-4 whitespace-pre-line text-[14px] leading-[1.7]"
              style={{ color: "var(--navy, #1E2A3A)" }}
            >
              {data.item.caption}
            </p>
          )}
          {data.item.tags.length > 0 && (
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {data.item.tags.map((t) => (
                <Link
                  key={t}
                  href={`/archive?tag=${encodeURIComponent(t)}`}
                  className="text-[12px] px-2 py-1 rounded-full"
                  style={{ background: "var(--peach-card, #FFF0E8)", color: "var(--coral-deep, #C8453D)" }}
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-5 flex items-center gap-2 text-[12px]" style={{ color: "var(--twilight, #4A5568)" }}>
            <span>{new Date(data.item.timestamp).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <a
            href={data.item.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: "var(--primary, #2196F3)" }}
          >
            인스타에서 보기 <ExternalLink size={14} />
          </a>
        </article>
      )}
    </main>
  );
}

function MediaBlock({ item }: { item: import("@/lib/instagram/types").ArchiveItem }) {
  const isVideo = item.media_type === "VIDEO" || item.media_type === "REELS";

  if (isVideo && item.media_url) {
    return (
      <div className="rounded-2xl overflow-hidden bg-black">
        <video
          src={item.media_url}
          poster={item.thumbnail_url ?? undefined}
          controls
          playsInline
          className="w-full h-auto max-h-[80vh]"
        />
      </div>
    );
  }

  // IMAGE 또는 CAROUSEL 첫 이미지
  const src = item.media_url ?? item.thumbnail_url;
  if (src) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sky-card, #EAF6FF)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={item.caption?.slice(0, 40) ?? "sinhon.life 아카이브"} className="w-full h-auto" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl aspect-[3/4]" style={{ background: "var(--sky-card, #EAF6FF)" }} />
  );
}
