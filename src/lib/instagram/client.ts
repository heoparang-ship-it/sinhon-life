/**
 * sinhon-life-api 호출 + SWR 패턴 인메모리 캐시.
 *
 *  - 같은 키로 들어오면 캐시 즉시 반환 + 백그라운드 갱신
 *  - revalidate 는 60초마다 자동 / focus 복귀 시 1회
 *  - localStorage 까지 가지 않는 단순 메모리 캐시 (PWA는 SW 가 별도로 한 번 더 캐시함)
 */

"use client";

import { useEffect, useState } from "react";
import type {
  ArchiveItem,
  ArchiveListResponse,
  ArchiveDetailResponse,
  ArchiveTagsResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_INSTAGRAM_API_URL?.replace(/\/+$/, "") ??
  "https://sinhon-life-api.999pr.workers.dev";

interface CacheEntry<T> {
  value: T;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const STALE_MS = 60_000; // 60초 지나면 백그라운드 갱신

function cacheGet<T>(key: string): CacheEntry<T> | undefined {
  return cache.get(key) as CacheEntry<T> | undefined;
}
function cacheSet<T>(key: string, value: T): void {
  cache.set(key, { value, fetchedAt: Date.now() });
}

async function fetchJson<T>(path: string): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_INSTAGRAM_API_URL 환경 변수가 비어 있습니다. worker/README.md ❸-1 참고."
    );
  }
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} — ${path}`);
  }
  return (await res.json()) as T;
}

/** SWR 후크 — key 가 같으면 캐시 즉시 반환 + 백그라운드 갱신. */
function useSWR<T>(key: string, fetcher: () => Promise<T>) {
  const cached = cacheGet<T>(key);
  const [data, setData] = useState<T | undefined>(cached?.value);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(!cached);

  useEffect(() => {
    let cancelled = false;
    const isStale = !cached || Date.now() - cached.fetchedAt > STALE_MS;

    if (cached && !isStale) {
      // fresh — 굳이 다시 안 받음
      setData(cached.value);
      setLoading(false);
      return;
    }

    // stale or no cache
    if (!cached) setLoading(true);
    fetcher()
      .then((value) => {
        if (cancelled) return;
        cacheSet(key, value);
        setData(value);
        setError(undefined);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // focus 복귀 시 1회 재검증
    const onFocus = () => {
      fetcher().then((value) => {
        if (cancelled) return;
        cacheSet(key, value);
        setData(value);
      }).catch(() => { /* swallow */ });
    };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
    // 의도적으로 key 만 의존성: fetcher 클로저는 key 에 매여 있음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, error, loading };
}

export function useArchiveList(opts: { tag?: string | null; limit?: number; offset?: number } = {}) {
  const tag = opts.tag ?? null;
  const limit = opts.limit ?? 24;
  const offset = opts.offset ?? 0;
  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));
  if (tag) qs.set("tag", tag);
  const key = `list?${qs.toString()}`;
  return useSWR<ArchiveListResponse>(key, () => fetchJson<ArchiveListResponse>(`/api/media?${qs.toString()}`));
}

export function useArchiveDetail(id: string | null | undefined) {
  const key = id ? `detail:${id}` : "";
  return useSWR<ArchiveDetailResponse>(key, () => {
    if (!id) return Promise.reject(new Error("no id"));
    return fetchJson<ArchiveDetailResponse>(`/api/media/${encodeURIComponent(id)}`);
  });
}

export function useArchiveTags(limit: number = 20) {
  return useSWR<ArchiveTagsResponse>(
    `tags:${limit}`,
    () => fetchJson<ArchiveTagsResponse>(`/api/tags?limit=${limit}`)
  );
}

export type { ArchiveItem };
