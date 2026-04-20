"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Heart } from "lucide-react";
import { EmptyState, ListRow, Segmented, Button } from "@/components/ui";
import { POLICIES } from "@/lib/constants";

const SAVED_KEY = "sinhon-saved-policies-v1";
const LIKED_KEY = "sinhon-liked-policies-v1";

function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * /my/saved — lists policies the user bookmarked or hearted.
 * Segmented toggle switches between bookmark and heart lists.
 */
export default function MySavedPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"saved" | "liked">("saved");
  const [saved, setSaved] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(Array.from(loadSet(SAVED_KEY)));
    setLiked(Array.from(loadSet(LIKED_KEY)));
  }, []);

  const slugs = tab === "saved" ? saved : liked;
  const items = slugs
    .map((s) => POLICIES.find((p) => p.slug === s))
    .filter((x): x is (typeof POLICIES)[number] => Boolean(x));

  return (
    <main className="min-h-screen bg-paper pb-2xl">
      <div className="sticky top-0 z-nav bg-paper/95 backdrop-blur border-b border-paper-line">
        <div className="flex items-center gap-xs px-md py-sm">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로"
            className="p-xs -ml-xs rounded-full hover:bg-paper-line/60"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
          </button>
          <h1 className="text-subtitle font-semibold text-ink">보관함</h1>
        </div>
        <div className="px-md pb-xs">
          <Segmented
            items={[
              { id: "saved", label: "저장" },
              { id: "liked", label: "좋아요" },
            ]}
            value={tab}
            onChange={(v) => setTab(v as "saved" | "liked")}
          />
        </div>
      </div>

      {mounted && items.length === 0 ? (
        <EmptyState
          flavor="first-time"
          title={tab === "saved" ? "아직 저장한 정책이 없어요" : "아직 좋아요한 정책이 없어요"}
          body="마음에 드는 정책 상세 페이지에서 북마크나 하트를 눌러보세요."
          illustration={tab === "saved" ? <Bookmark className="h-8 w-8" /> : <Heart className="h-8 w-8" />}
          action={<Button onClick={() => router.push("/")}>홈에서 둘러보기</Button>}
        />
      ) : (
        <ul className="divide-y divide-paper-line bg-paper-surface">
          {items.map((p) => (
            <li key={p.slug}>
              <ListRow
                href={`/policy/${p.slug}`}
                title={p.title}
                subtitle={p.summary}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
