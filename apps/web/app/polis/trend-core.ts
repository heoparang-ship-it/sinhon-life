/* ============================================================
   정책 트렌드 코어 — 서버/클라 공용 순수 함수 (no "use client")
   ============================================================ */

export type Trend = {
  applicants: number;
  series: number[];
  delta: number;
  rate: number;
  capacityPct: number;
  hot: boolean;
  /** 인기 점수 = 시각화의 "주가" */
  score: number;
};

export function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EPOCH = Date.UTC(2026, 0, 1);

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
  const minutesSinceEpoch = Math.floor((Date.now() - EPOCH) / 60000);
  const drift = (minutesSinceEpoch % 500) * rate;
  const applicants = last + drift + tick * rate;

  const capacityPct = Math.min(99, 28 + Math.floor(r() * 66));
  const hot = capacityPct >= 80 || delta >= 7;
  const score = Math.round(applicants * (1 + delta / 100) * (1 + capacityPct / 200));

  return { applicants, series, delta, rate, capacityPct, hot, score };
}

/** 24시간 시뮬 시리즈 (히트맵/캔들용) */
export function hourlySeries(id: string): number[] {
  const r = mulberry32(hashId(id) ^ 0x9e3779b9);
  const out: number[] = [];
  let v = 40 + r() * 60;
  for (let h = 0; h < 24; h++) {
    // 출퇴근/저녁 시간대 가중 (실제 사용 패턴 모사)
    const peak = h >= 8 && h <= 9 ? 1.6 : h >= 12 && h <= 13 ? 1.3 : h >= 20 && h <= 22 ? 1.8 : 1;
    v += (r() - 0.45) * 40;
    out.push(Math.max(1, Math.round(Math.abs(v) * peak)));
  }
  return out;
}

export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

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
