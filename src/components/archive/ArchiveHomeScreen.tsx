"use client";
import { useEffect, useState } from "react";
import { ARCHIVE_API, T, G } from "@/lib/design/tokens";
import { useDragScroll } from "@/lib/hooks/useDragScroll";
import {
  MicroLabel,
  Pill,
  GlassBubble,
  CharacterBubble,
  VideoCard,
} from "@/components/legacy/Primitives";

type ArchiveItem = {
  id: string;
  caption?: string | null;
  media_type?: string;
  media_url?: string | null;
  thumbnail_url?: string | null;
  permalink?: string | null;
  tags?: string[];
};
type TagItem = { tag: string; count: number };

function useArchiveData() {
  const [items, setItems] = useState<ArchiveItem[] | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(ARCHIVE_API + "/api/media?limit=24").then((r) => {
        if (!r.ok) throw new Error("media " + r.status);
        return r.json();
      }),
      fetch(ARCHIVE_API + "/api/tags?limit=20").then((r) => {
        if (!r.ok) throw new Error("tags " + r.status);
        return r.json();
      }),
    ])
      .then(([m, t]) => {
        if (cancelled) return;
        setItems(m.items || []);
        setTags(t.tags || []);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { items, tags, error };
}

function ArchiveHero() {
  return (
    <div
      style={{
        position: "relative",
        background: G.heroSky,
        paddingTop: 18,
        paddingBottom: 44,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: "hidden",
      }}
    >
      <GlassBubble
        size={64}
        top={120}
        right={-14}
        opacity={0.22}
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 9a3 3 0 013-3h8a3 3 0 013 3v6a3 3 0 01-3 3H8a3 3 0 01-3-3V9z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M5 13H3M21 13h-2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        }
      />
      <GlassBubble
        size={42}
        top={-10}
        left={-18}
        opacity={0.18}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
        }
      />
      <div style={{ padding: "20px 28px 0" }}>
        <MicroLabel color={T.onBlueFaint}>The Newlywed Archive · 01</MicroLabel>
        <div
          style={{
            marginTop: 24,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: "-0.045em",
            color: T.onBlue,
            lineHeight: 1.1,
          }}
        >
          신혼의 모든 순간,
          <br />
          <span style={{ color: T.onBlueMute, fontWeight: 500 }}>
            해시태그로 펼쳐보다.
          </span>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 13.5,
            color: T.onBlueMute,
            lineHeight: 1.7,
            letterSpacing: "-0.01em",
            maxWidth: 270,
          }}
        >
          인스타에 흩어진 신혼 영상을 한 곳에 모았어요.
          <br />
          태그 하나로 원하는 장면만 골라 보세요.
        </div>
      </div>
      <div style={{ position: "absolute", right: 18, bottom: 18 }}>
        <CharacterBubble size={108} />
      </div>
    </div>
  );
}

function ArchiveTagRail({
  tags,
  total,
  activeTag,
  onSelect,
}: {
  tags: TagItem[];
  total: number | null;
  activeTag: string | null;
  onSelect: (t: string | null) => void;
}) {
  const allCount = total != null ? String(total) : "...";
  return (
    <div style={{ marginTop: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "0 28px",
        }}
      >
        <MicroLabel>Popular Tags</MicroLabel>
        <span
          style={{ fontSize: 11, color: T.faint, letterSpacing: "-0.01em" }}
        >
          실시간
        </span>
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: "4px 28px 8px",
        }}
        className="scrollbar-hide"
      >
        <Pill onWhite active={activeTag === null} onClick={() => onSelect(null)}>
          # 전체
          <span
            style={{
              marginLeft: 10,
              opacity: 0.85,
              fontSize: 11,
              fontWeight: 400,
            }}
          >
            {allCount}
          </span>
        </Pill>
        {tags.map((t) => (
          <Pill
            key={t.tag}
            onWhite
            active={activeTag === t.tag}
            onClick={() => onSelect(t.tag)}
          >
            # {t.tag}
            <span
              style={{
                marginLeft: 10,
                opacity: 0.85,
                fontSize: 11,
                fontWeight: 400,
              }}
            >
              {t.count}
            </span>
          </Pill>
        ))}
      </div>
    </div>
  );
}

function ArchiveGrid({
  items,
  activeTag,
  error,
}: {
  items: ArchiveItem[] | null;
  activeTag: string | null;
  error: string | null;
}) {
  const carouselRef = useDragScroll<HTMLDivElement>();
  const all = items || [];
  const filtered = activeTag
    ? all.filter((it) => (it.tags || []).includes(activeTag))
    : all;
  const total = filtered.length;
  const isCarousel = total >= 3;

  const labelFor = (it: ArchiveItem) => {
    const tag0 = (it.tags && it.tags[0]) || "신혼생활";
    const type =
      it.media_type === "VIDEO" || it.media_type === "REELS" ? "reel" : "post";
    return type + " · " + tag0;
  };
  const titleFor = (it: ArchiveItem) => {
    const c = (it.caption || "").replace(/\s+/g, " ").trim();
    return c.length > 60 ? c.slice(0, 60) + "…" : c || "@sinhon.life";
  };
  const tagsFor = (it: ArchiveItem) =>
    (it.tags || []).slice(0, 2).map((t) => "#" + t);

  const openInsta = (it: ArchiveItem) => {
    if (it && it.permalink)
      window.open(it.permalink, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ padding: "44px 22px 180px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "0 6px",
          marginBottom: 24,
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <MicroLabel>This Week</MicroLabel>
          <div
            style={{
              marginTop: 10,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: T.ink,
              whiteSpace: "nowrap",
            }}
          >
            지금, 신혼이 챙겨보는 피드
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            color: T.faint,
            whiteSpace: "nowrap",
            paddingBottom: 4,
          }}
        >
          {items === null ? "불러오는 중…" : "총 " + total + "개"}
        </span>
      </div>

      {error && (
        <div
          style={{
            padding: "40px 6px",
            textAlign: "center",
            color: T.mute,
            fontSize: 13,
          }}
        >
          영상을 불러오지 못했어요.
          <br />
          <span
            style={{ fontSize: 11, fontFamily: "monospace", color: T.faint }}
          >
            {error}
          </span>
        </div>
      )}

      {!error && items === null && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 16,
            rowGap: 32,
          }}
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div
                style={{
                  aspectRatio: "4/5",
                  background: "#EAF2FB",
                  borderRadius: 20,
                  animation: "archivePulse 1.4s ease-in-out infinite",
                }}
              />
              <div
                style={{
                  padding: "0 4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    height: 12,
                    width: "85%",
                    background: "#EAF2FB",
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    height: 10,
                    width: "40%",
                    background: "#EAF2FB",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {!error && items !== null && total === 0 && (
        <div
          style={{
            padding: "60px 6px",
            textAlign: "center",
            color: T.mute,
            fontSize: 13.5,
            letterSpacing: "-0.01em",
          }}
        >
          {activeTag
            ? "#" + activeTag + " 영상이 아직 없어요"
            : "아직 올라온 영상이 없어요"}
          <div style={{ marginTop: 6, fontSize: 11.5, color: T.faint }}>
            @sinhon.life 에 새 게시물이 올라오면 10분 안에 여기에 나타나요.
          </div>
        </div>
      )}

      {!error && total > 0 && !isCarousel && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 16,
            rowGap: 32,
          }}
        >
          {filtered.map((it) => (
            <VideoCard
              key={it.id}
              tags={tagsFor(it)}
              title={titleFor(it)}
              dur={
                it.media_type === "VIDEO" || it.media_type === "REELS"
                  ? "REEL"
                  : "POST"
              }
              label={labelFor(it)}
              imageUrl={it.thumbnail_url || it.media_url}
              isVideo={
                it.media_type === "VIDEO" || it.media_type === "REELS"
              }
              onClick={() => openInsta(it)}
            />
          ))}
        </div>
      )}

      {!error && total > 0 && isCarousel && (
        <div
          ref={carouselRef}
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            padding: "0 0 4px",
            margin: "0 -22px",
            paddingLeft: 22,
            paddingRight: 22,
            userSelect: "none",
            WebkitUserSelect: "none",
            scrollBehavior: "auto",
          }}
          className="scrollbar-hide"
        >
          {filtered.map((it) => (
            <div
              key={it.id}
              style={{
                flex: "0 0 calc(50% - 8px)",
                minWidth: 0,
              }}
            >
              <VideoCard
                tags={tagsFor(it)}
                title={titleFor(it)}
                dur={
                  it.media_type === "VIDEO" || it.media_type === "REELS"
                    ? "REEL"
                    : "POST"
                }
                label={labelFor(it)}
                imageUrl={it.thumbnail_url || it.media_url}
                isVideo={
                  it.media_type === "VIDEO" || it.media_type === "REELS"
                }
                onClick={() => openInsta(it)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ArchiveHomeScreen() {
  const { items, tags, error } = useArchiveData();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const total = items == null ? null : items.length;
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: T.white,
        fontFamily: T.font,
        color: T.ink,
        paddingBottom: 140,
      }}
    >
      <div style={{ paddingTop: 54, background: T.blueSoft }}>
        <ArchiveHero />
      </div>
      <ArchiveTagRail
        tags={tags}
        total={total}
        activeTag={activeTag}
        onSelect={setActiveTag}
      />
      <ArchiveGrid items={items} activeTag={activeTag} error={error} />
    </main>
  );
}
