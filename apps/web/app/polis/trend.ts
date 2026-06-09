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
 * - "applicants" 필드는 이름과 달리 "이번 주 조회/관심 클릭 수" 의미입니다.
 *   (정부 API에 실제 신청자 수는 없어요. 그래서 우리 앱 안 클릭 집계로 대체합니다.)
 * - KV(/api/trends) 가 live 면 실측 total/delta 를 그대로 사용
 * - 미연결이면 시뮬 베이스를 0.15배로 축소해 "초기 추정" 으로 표기
 *   (시뮬을 0으로 두면 콜드스타트에 모든 카드가 0 으로 보여 비어 보임)
 */
export function resolveTrend(id: string, tick = 0, live?: TrendsResult): Trend {
  const base = trendFor(id, tick);
  const l = live && live.source === "live" ? live.totals[id] : undefined;
  if (l) {
    // 실집계: KV 가 모은 진짜 클릭 수
    return {
      ...base,
      applicants: l.total,
      delta: l.delta,
      hot: base.capacityPct >= 80 || l.delta >= 7,
      score: Math.round(l.total * (1 + l.delta / 100) * (1 + base.capacityPct / 200))
    };
  }
  // 미연결: 시뮬을 작게 축소한 최소 베이스 (정직하게 "초기 추정" 라벨로 노출)
  const applicants = Math.max(1, Math.round(base.applicants * 0.15));
  return {
    ...base,
    applicants,
    hot: base.capacityPct >= 80 || base.delta >= 7,
    score: Math.round(applicants * (1 + base.delta / 100) * (1 + base.capacityPct / 200))
  };
}
