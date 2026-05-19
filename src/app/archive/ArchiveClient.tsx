"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Image as ImageIcon, AlertCircle, Inbox } from "lucide-react";
import { useArchiveList, useArchiveTags } from "@/lib/instagram/client";
import type { ArchiveItem } from "@/lib/instagram/types";

/**
 * /archive — 인스타 미러 리스트.
 *
 * 디자인 원칙
 *  - 톤은 기존 ShortsCard 와 동일한 sky-card 배경 + ink navy 텍스트
 *  - 4탭 BottomNav 와 겹치지 않게 pb-[100px]
 *  - 해시태그 pill 클릭 시 같은 화면에서 필터 적용 (라우트 이동 X)
 */
export default function ArchiveClient() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { data: list, loading, error } = useArchiveList({ tag: activeTag });
  const { data: tagsRes } = useArchiveTags(20);

  const items = list?.items ?? [];

  return (
    <main className="min-h-screen pb-[100px]" style={{ background: "var(--background, #FFFFFF)" }}>
      {/* 헤더 */}
      <header className="px-5 pt-8 pb-4">
        <p className="text-[12px] font-medium tracking-tight" style={{ color: "var(--twilight, #4A5568)" }}>
          @sinhon.life
        </p>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-tight" style={{ color: "var(--navy, #1E2A3A)" }}>
          아카이브
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--twilight, #4A5568)" }}>
          인스타에 올라온 신혼 콘텐츠를 한 곳에서.
        </p>
      </header>

      {/* 태그 pill — 가로 스크롤 */}
      {tagsRes && tagsRes.tags.length > 0 && (
        <div className="px-5 mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
            <TagPill
              label="전체"
              active={activeTag === null}
              onClick={() => setActiveTag(null)}
            />
            {tagsRes.tags.map((t) => (
              <TagPill
                key={t.tag}
                label={`#${t.tag}`}
                count={t.count}
                active={activeTag === t.tag}
                onClick={() => setActiveTag(t.tag)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 본문 */}
      <section className="px-5">
        {error && <ErrorState message={error.message} />}
        {!error && loading && items.length === 0 && <LoadingGrid />}
        {!error && !loading && items.length === 0 && <EmptyState tag={activeTag} />}
        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <ArchiveCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function TagPill({
  label, count, active, onClick,
}: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
      style={{
        background: active ? "var(--coral, #F97066)" : "#F4F6F9",
        color: active ? "white" : "var(--navy, #1E2A3A)",
      }}
    >
      {label}
      {count !== undefined && (
        <span className="ml-1.5 opacity-70 text-[10px] font-medium">{count}</span>
      )}
    </button>
  );
}

function ArchiveCard({ item }: { item: ArchiveItem }) {
  const isVideo = item.media_type === "VIDEO" || item.media_type === "REELS";
  const cover = item.thumbnail_url ?? item.media_url ?? null;
  const caption = item.caption?.replace(/\s+/g, " ").trim() ?? "";
  const short = caption.length > 50 ? caption.slice(0, 50) + "…" : caption;

  return (
    <Link
      href={`/archive/${encodeURIComponent(item.id)}`}
      className="block rounded-2xl overflow-hidden bg-white"
      style={{ border: "1px solid var(--design-line, #E6ECF2)" }}
    >
      <div
        className="relative aspect-[3/4]"
        style={{ background: "var(--sky-card, #EAF6FF)" }}
      >
        {cover ? (
          // 인스타 CDN — Next.js Image 대신 <img>. 도메인 등록 안 해도 되고
          // 어차피 캐시는 SW + Cloudflare 가 한다.
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cover}
            alt={short || "sinhon.life 아카이브"}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-white/80" />
          </div>
        )}
        {isVideo && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent 60%)" }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "var(--coral, #F97066)" }}
            >
              <Play size={18} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--navy, #1E2A3A)" }}>
          {short || "@sinhon.life"}
        </p>
        {item.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {item.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "var(--peach-card, #FFF0E8)", color: "var(--coral-deep, #C8453D)" }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse"
          style={{ border: "1px solid var(--design-line, #E6ECF2)" }}
        >
          <div className="aspect-[3/4]" style={{ background: "#EEF1F4" }} />
          <div className="p-3 space-y-2">
            <div className="h-3 rounded" style={{ background: "#EEF1F4", width: "85%" }} />
            <div className="h-3 rounded" style={{ background: "#EEF1F4", width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tag }: { tag: string | null }) {
  return (
    <div className="py-20 flex flex-col items-center text-center px-6">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ background: "var(--sky-card, #EAF6FF)" }}
      >
        <Inbox size={24} style={{ color: "var(--primary, #2196F3)" }} />
      </div>
      <p className="text-[15px] font-semibold" style={{ color: "var(--navy, #1E2A3A)" }}>
        {tag ? `#${tag} 게시물이 아직 없어요` : "아직 올라온 게시물이 없어요"}
      </p>
      <p className="mt-1 text-[13px]" style={{ color: "var(--twilight, #4A5568)" }}>
        {tag
          ? "다른 태그로 둘러보거나, 인스타에 새 게시물이 올라오면 10분 안에 여기에 나타나요."
          : "@sinhon.life 인스타에 새 게시물이 올라오면 10분 안에 여기에 동기화돼요."}
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-20 flex flex-col items-center text-center px-6">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ background: "var(--peach-card, #FFF0E8)" }}
      >
        <AlertCircle size={24} style={{ color: "var(--coral-deep, #C8453D)" }} />
      </div>
      <p className="text-[15px] font-semibold" style={{ color: "var(--navy, #1E2A3A)" }}>
        아카이브를 불러오지 못했어요
      </p>
      <p className="mt-1 text-[12px] font-mono whitespace-pre-wrap break-all" style={{ color: "var(--twilight, #4A5568)" }}>
        {message}
      </p>
    </div>
  );
}
