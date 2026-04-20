"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search as SearchIcon, X, TrendingUp, Clock } from "lucide-react";
import { Input, EmptyState, Skeleton, Badge, ListRow } from "@/components/ui";
import { POLICIES } from "@/lib/constants";
import { feedStaggerContainer, feedStaggerItem } from "@/lib/motion";

const RECENT_KEY = "sinhon-search-recent-v1";
const SUGGESTED = [
  "신혼부부 특별공급",
  "전세자금대출 한도",
  "출산지원금 서울",
  "디딤돌대출 금리",
  "혼인신고 필요서류",
  "버팀목대출 신청",
];

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 8) : [];
  } catch {
    return [];
  }
}
function saveRecent(q: string) {
  if (typeof window === "undefined" || !q.trim()) return;
  const next = [q, ...loadRecent().filter((x) => x !== q)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

/**
 * Search — resting state (recent + suggested) and results.
 * Matches against POLICIES title/description. No backend call; all client-side.
 * `useSearchParams` requires a Suspense boundary at build time (Next 14 App Router),
 * so we split the hook-using body into SearchContent and wrap it in the default export.
 */
function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setRecent(loadRecent()), []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return POLICIES.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.summary?.toLowerCase().includes(term) ||
        p.tags?.some((t) => t.toLowerCase().includes(term)),
    );
  }, [q]);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [q]);

  const submit = (term: string) => {
    setQ(term);
    saveRecent(term);
    setRecent(loadRecent());
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return (
    <main className="min-h-screen bg-paper">
      {/* Header */}
      <div className="sticky top-0 z-nav bg-paper/95 backdrop-blur border-b border-paper-line">
        <div className="flex items-center gap-xs px-md py-sm">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로"
            className="p-xs -ml-xs rounded-full hover:bg-paper-line/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-ink" />
          </button>
          <div className="flex-1">
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(q);
              }}
              placeholder="정책·혜택 검색"
              leftSlot={<SearchIcon className="h-4 w-4" />}
              rightSlot={
                q ? (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    aria-label="지우기"
                    className="text-ink-muted hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : undefined
              }
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!q.trim() ? (
          <motion.section
            key="resting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-md py-lg space-y-xl"
          >
            {recent.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-sm">
                  <h2 className="text-caption font-medium text-ink-soft flex items-center gap-2xs">
                    <Clock className="h-3.5 w-3.5" /> 최근 검색
                  </h2>
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="text-caption text-ink-muted hover:text-ink"
                  >
                    전체 삭제
                  </button>
                </div>
                <div className="flex flex-wrap gap-2xs">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => submit(r)}
                      className="px-sm py-3xs rounded-pill bg-paper-surface border border-paper-line text-caption text-ink hover:border-coral-300 transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-caption font-medium text-ink-soft mb-sm flex items-center gap-2xs">
                <TrendingUp className="h-3.5 w-3.5" /> 추천 검색어
              </h2>
              <div className="flex flex-wrap gap-2xs">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="px-sm py-3xs rounded-pill bg-coral-50 border border-coral-200 text-caption text-coral-700 hover:bg-coral-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        ) : loading ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-md space-y-sm"
          >
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </motion.section>
        ) : results.length === 0 ? (
          <EmptyState
            flavor="no-results"
            title={`"${q}" 검색 결과가 없어요`}
            body="철자를 확인하거나 더 짧은 키워드로 검색해보세요."
          />
        ) : (
          <motion.ul
            key="results"
            variants={feedStaggerContainer()}
            initial="hidden"
            animate="visible"
            className="divide-y divide-paper-line"
          >
            {results.map((p) => (
              <motion.li key={p.slug} variants={feedStaggerItem()}>
                <ListRow
                  href={`/policy/${p.slug}`}
                  title={p.title}
                  subtitle={p.summary}
                  trailing={p.tags?.[0] ? <Badge tone="mint">{p.tags[0]}</Badge> : undefined}
                />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper" />}>
      <SearchContent />
    </Suspense>
  );
}
