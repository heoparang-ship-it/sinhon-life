"use client";

import { useEffect, useState } from "react";

/* ============================================================
   정책 트렌드 엔진 — 실시간 인기/지원 시각화용 데이터
   백엔드 분석이 아직 없으므로 정책 id 로 seed 한 결정론적 값 +
   시간 기반 모멘텀으로 "주식 차트처럼" 움직이는 느낌을 만든다.
   ============================================================ */

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Trend = {
  /** 누적 지원자 수 (실시간으로 증가) */
  applicants: number;
  /** 14포인트 추이 (스파크라인용) */
  series: number[];
  /** 전일 대비 변동률 % */
  delta: number;
  /** 분당 증가 속도 */
  rate: number;
  /** 예산 소진률 % */
  capacityPct: number;
  /** 마감 임박 or 급상승 */
  hot: boolean;
};

const EPOCH = Date.UTC(2026, 0, 1);

/** tick 은 useLiveTick 으로 들어오는 증가값 — 실시간 카운트업에 사용 */
export function trendFor(id: string, tick = 0): Trend {
  const r = mulberry32(hashId(id));
  const base = 180 + Math.floor(r() * 3600);

  const series: number[] = [];
  let v = base * 0.55;
  for (let i = 0; i < 14; i++) {
    v += (r() - 0.38) * base * 0.09;
    series.push(Math.max(1, Math.round(v)));
  }
  const last = series[13] ?? base;
  const prev = series[12] ?? last;
  const delta = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;

  const rate = 1 + Math.floor(r() * 6);
  // 페이지 머문 시간(tick) + 실제 경과 분 일부를 섞어 항상 살아있게
  const minutesSinceEpoch = Math.floor((Date.now() - EPOCH) / 60000);
  const drift = (minutesSinceEpoch % 500) * rate;
  const applicants = last + drift + tick * rate;

  const capacityPct = Math.min(99, 28 + Math.floor(r() * 66));
  const hot = capacityPct >= 80 || delta >= 7;

  return { applicants, series, delta, rate, capacityPct, hot };
}

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

export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

/** 스파크라인 SVG path (0~100 viewBox) */
export function sparkPath(series: number[], w = 100, h = 28): string {
  if (series.length === 0) return "";
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const step = w / (series.length - 1);
  return series
    .map((val, i) => {
      const x = i * step;
      const y = h - ((val - min) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
