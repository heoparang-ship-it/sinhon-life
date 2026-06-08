"use client";

import { useEffect, useRef, useState } from "react";

export { formatCount, hourlySeries, sparkPath, trendFor, type Trend } from "./trend-core";

/** 일정 간격으로 1씩 증가하는 tick — 실시간 카운트업 트리거 */
export function useLiveTick(intervalMs = 2500): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return tick;
}

/* ---------------- 텔레메트리 ---------------- */
export type TrackKind = "view" | "bookmark" | "apply" | "search";

/** 클릭/관심 이벤트 전송 (fire-and-forget). KV 미설정 시 서버가 무시. */
export function track(kind: TrackKind, policyId: string, region?: string) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ kind, policyId, region });
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/track", blob)) return;
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true
    });
  } catch {
    /* ignore */
  }
}

export type ApiTrend = { total: number; delta: number };
export type TrendsResult = { source: "live" | "synthetic"; totals: Record<string, ApiTrend> };

/** 실집계 트렌드 조회. live 면 실데이터, synthetic 이면 클라 trendFor 로 폴백. */
export function useTrends(ids: string[]): TrendsResult {
  const [result, setResult] = useState<TrendsResult>({ source: "synthetic", totals: {} });
  const key = ids.slice().sort().join(",");
  const lastKey = useRef("");

  useEffect(() => {
    if (!key || key === lastKey.current) return;
    lastKey.current = key;
    let cancel = false;
    fetch(`/api/trends?ids=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((j: TrendsResult) => {
        if (!cancel && j && j.source) setResult(j);
      })
      .catch(() => {
        /* keep synthetic */
      });
    return () => {
      cancel = true;
    };
  }, [key]);

  return result;
}
