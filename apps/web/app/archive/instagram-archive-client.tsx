"use client";

import { useEffect, useMemo, useState } from "react";

type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";

type ArchiveItem = {
  caption: string | null;
  first_seen_at?: string;
  id: string;
  media_type: MediaType;
  media_url: string | null;
  permalink: string;
  tags: string[];
  thumbnail_url: string | null;
  timestamp: string;
};

type ArchiveListResponse = {
  items: ArchiveItem[];
  limit: number;
  offset: number;
  tag: string | null;
};

type ArchiveFilter = "all" | "reels" | "feed";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_INSTAGRAM_API_URL?.replace(/\/+$/, "") ??
  "https://sinhon-life-api.999pr.workers.dev";

const archiveFilters: Array<{ label: string; value: ArchiveFilter }> = [
  { label: "전체", value: "all" },
  { label: "릴스", value: "reels" },
  { label: "피드", value: "feed" }
];

function normalizeCaption(caption: string | null) {
  if (!caption) return "@sinhon.life";
  const compact = caption.replace(/\s+/g, " ").trim();
  return compact.length > 92 ? `${compact.slice(0, 92)}...` : compact;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("ko-KR");
}

function isReel(item: ArchiveItem) {
  return (
    item.media_type === "VIDEO" || item.media_type === "REELS" || item.permalink.includes("/reel/")
  );
}

function processInstagramEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
    return;
  }

  if (document.querySelector('script[src="https://www.instagram.com/embed.js"]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.instagram.com/embed.js";
  document.body.appendChild(script);
}

export function InstagramArchiveClient() {
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<ArchiveItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadArchive() {
      try {
        const response = await fetch(`${API_BASE}/api/media?limit=12`, { cache: "no-store" });
        if (!response.ok) throw new Error(`archive ${response.status}`);
        const data = (await response.json()) as ArchiveListResponse;
        if (!cancelled) {
          setItems(data.items ?? []);
          setError(null);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "archive load failed");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadArchive();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (activeFilter === "reels") return items.filter(isReel);
    if (activeFilter === "feed") return items.filter((item) => !isReel(item));
    return items;
  }, [activeFilter, items]);

  useEffect(() => {
    if (!visibleItems.length) return;
    processInstagramEmbeds();
  }, [visibleItems]);

  return (
    <div className="archive-layout">
      <section className="archive-control-row" aria-label="아카이브 필터">
        {archiveFilters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.value}
            className={activeFilter === filter.value ? "archive-filter active" : "archive-filter"}
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </section>

      {isLoading ? (
        <div className="archive-grid" aria-label="아카이브 로딩">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="archive-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="archive-fallback">
          <strong>인스타 아카이브를 불러오지 못했습니다.</strong>
          <p>공식 계정에서 최신 피드와 릴스를 확인할 수 있습니다.</p>
          <a
            className="button-link"
            href="https://www.instagram.com/sinhon.life/"
            rel="noreferrer"
            target="_blank"
          >
            @sinhon.life 열기
          </a>
        </div>
      ) : null}

      {!isLoading && !error && visibleItems.length ? (
        <section className="archive-grid" aria-label="신혼생활 인스타 게시물">
          {visibleItems.map((item, index) => (
            <article className="archive-card" key={item.id}>
              <div className="archive-card-media">
                {item.thumbnail_url || item.media_url ? (
                  <img
                    alt={normalizeCaption(item.caption)}
                    loading="lazy"
                    src={item.thumbnail_url ?? item.media_url ?? ""}
                  />
                ) : (
                  <div className="archive-card-empty">Instagram</div>
                )}
                <strong className="archive-media-title">{normalizeCaption(item.caption)}</strong>
                <span>{isReel(item) ? "Reels" : "Feed"}</span>
              </div>
              <div className="archive-card-body">
                <div className="archive-card-meta">
                  <strong>@sinhon.life</strong>
                  <time dateTime={item.timestamp}>{formatDate(item.timestamp)}</time>
                </div>
                <p>{normalizeCaption(item.caption)}</p>
                {item.tags.length ? (
                  <div className="archive-tag-row">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                ) : null}
                <a className="text-link" href={item.permalink} rel="noreferrer" target="_blank">
                  인스타에서 보기
                </a>
              </div>
              {index < 2 ? (
                <div className="instagram-embed-shell">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-captioned
                    data-instgrm-permalink={item.permalink}
                    data-instgrm-version="14"
                  >
                    <a href={item.permalink} rel="noreferrer" target="_blank">
                      Instagram에서 보기
                    </a>
                  </blockquote>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {!isLoading && !error && !visibleItems.length ? (
        <div className="archive-fallback">
          <strong>선택한 필터에 게시물이 없습니다.</strong>
          <p>다른 필터를 선택하거나 공식 계정을 확인해보세요.</p>
          <a
            className="button-link"
            href="https://www.instagram.com/sinhon.life/"
            rel="noreferrer"
            target="_blank"
          >
            @sinhon.life 열기
          </a>
        </div>
      ) : null}
    </div>
  );
}
