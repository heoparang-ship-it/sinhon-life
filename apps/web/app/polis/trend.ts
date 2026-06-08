"use client";

import { useEffect, useRef, useState } from "react";
import { trendFor, type Trend } from "./trend-core";

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

/** /api/trends 실집계가 살아있나 (KV 연결됨) */
export function isLive(live?: TrendsResult): boolean {
  return !!live && live.source === "live";
}

/**
 * 화면에 쓰는 단일 트렌드 소스.
 * - 기본은 결정론적 시뮬(trendFor) — 콜드스타트에도 앱이 "살아있게" 보이도록
 * - /api/trends 가 live 면 실제 클릭 집계(total)를 시뮬 위에 더하고, 실측 delta 로 덮어씀
 * 이렇게 하면 KV 연결 즉시 화면 숫자가 실제 사용자 관심을 반영함.
 */
export function resolveTrend(id: string, tick = 0, live?: TrendsResult): Trend {
  const base = trendFor(id, tick);
  const l = live && live.source === "live" ? live.totals[id] : undefined;
  if (!l) return base;
  const applicants = base.applicants + l.total;
  const delta = l.total > 0 ? l.delta : base.delta;
  return {
    ...base,
    applicants,
    delta,
    hot: base.capacityPct >= 80 || delta >= 7,
    score: Math.round(applicants * (1 + delta / 100) * (1 + base.capacityPct / 200))
  };
}
