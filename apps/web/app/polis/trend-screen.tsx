"use client";

import { useMemo } from "react";
import type { PolisPolicy } from "./polis-data";
import { formatCount, hourlySeries, sparkPath, trendFor, useLiveTick, useTrends } from "./trend";

const CAT_COLOR: Record<string, string> = {
  "주거/청약": "#3182f6",
  "전세/대출": "#15a85a",
  출산: "#8b5cf6",
  육아: "#ff7a00",
  "혼인/세제": "#f04452",
  "건강/난임": "#0bb5d6"
};
const CATS = Object.keys(CAT_COLOR);
const BUCKETS = ["아침", "낮", "저녁", "밤"];

function colorOf(cat: string): string {
  return CAT_COLOR[cat] ?? "#3182f6";
}

export function TrendScreen({
  policies,
  onBack,
  onOpenSheet
}: {
  policies: PolisPolicy[];
  onBack: () => void;
  onOpenSheet: (id: string) => void;
}) {
  const tick = useLiveTick(2000);
  const ids = useMemo(() => policies.map((p) => p.id), [policies]);
  const live = useTrends(ids);

  const rows = useMemo(() => {
    return policies
      .map((p) => {
        const t = trendFor(p.id, tick);
        const l = live.source === "live" ? live.totals[p.id] : undefined;
        const applicants = l ? l.total : t.applicants;
        const delta = l ? l.delta : t.delta;
        return { p, t, applicants, delta, score: applicants * (1 + delta / 100) };
      })
      .sort((a, b) => b.score - a.score);
  }, [policies, tick, live]);

  const gauges = useMemo(
    () =>
      policies
        .filter((p) => p.dday !== null && p.dday !== undefined)
        .map((p) => ({ p, t: trendFor(p.id, tick) }))
        .sort((a, b) => (a.p.dday ?? 999) - (b.p.dday ?? 999))
        .slice(0, 4),
    [policies, tick]
  );

  // 히트맵: 카테고리 × 시간대(4)
  const heat = useMemo(() => {
    const grid: Record<string, number[]> = {};
    CATS.forEach((c) => (grid[c] = [0, 0, 0, 0]));
    policies.forEach((p) => {
      if (!grid[p.cat]) return;
      const hs = hourlySeries(p.id);
      const b = [0, 0, 0, 0];
      hs.forEach((v, h) => {
        const idx = h < 6 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3;
        b[idx] = (b[idx] ?? 0) + v;
      });
      const row = grid[p.cat] ?? [0, 0, 0, 0];
      for (let i = 0; i < 4; i++) row[i] = (row[i] ?? 0) + (b[i] ?? 0);
      grid[p.cat] = row;
    });
    let max = 1;
    Object.values(grid).forEach((r) => r.forEach((v) => (max = Math.max(max, v))));
    return { grid, max };
  }, [policies]);

  // 버블: hash 로 안정 위치, applicants 로 크기
  const bubbles = useMemo(() => {
    return rows.slice(0, 12).map(({ p, applicants, delta }) => {
      let h = 0;
      for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
      const x = 8 + (h % 84);
      const y = 10 + ((h >> 8) % 76);
      const max = rows[0]?.applicants ?? 1;
      const size = 30 + Math.round((applicants / max) * 46);
      return { p, x, y, size, delta };
    });
  }, [rows]);

  const maxScore = rows[0]?.score ?? 1;

  return (
    <div className="cal-screen">
      <div className="cal-head">
        <button type="button" className="cal-back" onClick={onBack} aria-label="뒤로">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>정책 트렌드</h2>
        <span className={`tr-src ${live.source}`}>{live.source === "live" ? "LIVE" : "시뮬"}</span>
      </div>

      {/* 1) 티커 스트립 */}
      <div className="ticker">
        <div className="ticker-track">
          {[...rows, ...rows].map(({ p, applicants, delta }, i) => (
            <span className="tick" key={`${p.id}-${i}`}>
              <i className="tick-dot" style={{ background: colorOf(p.cat) }} />
              {p.short}
              <b className="mono">{formatCount(applicants)}</b>
              <em className={delta >= 0 ? "up" : "down"}>
                {delta >= 0 ? "▲" : "▼"}
                {Math.abs(delta)}%
              </em>
            </span>
          ))}
        </div>
      </div>

      {/* 2) 버블 인기 */}
      <div className="pad block" style={{ marginTop: 18 }}>
        <h3 className="tr-sec">관심 버블</h3>
        <p className="tr-cap">크기 = 지원자 수, 색 = 분야. 누르면 상세로 가요.</p>
        <div className="bubble-box">
          {bubbles.map(({ p, x, y, size, delta }) => (
            <button
              key={p.id}
              type="button"
              className="bubble"
              onClick={() => onOpenSheet(p.id)}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                background: colorOf(p.cat),
                marginLeft: -size / 2,
                marginTop: -size / 2
              }}
            >
              <span style={{ fontSize: Math.max(9, size / 6) }}>{p.short.slice(0, 4)}</span>
              {delta >= 8 && <i className="bubble-hot" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3) 카테고리 × 시간대 히트맵 */}
      <div className="pad block" style={{ marginTop: 22 }}>
        <h3 className="tr-sec">분야별 관심 시간대</h3>
        <p className="tr-cap">진할수록 그 시간대에 많이 봐요.</p>
        <div className="heat">
          <div className="heat-corner" />
          {BUCKETS.map((b) => (
            <div key={b} className="heat-colh">
              {b}
            </div>
          ))}
          {CATS.map((c) => {
            const row = heat.grid[c] ?? [0, 0, 0, 0];
            return <FragmentRow key={c} cat={c} row={row} max={heat.max} />;
          })}
        </div>
      </div>

      {/* 4) 마감 게이지 */}
      {gauges.length > 0 && (
        <div className="pad block" style={{ marginTop: 22 }}>
          <h3 className="tr-sec">마감 임박 게이지</h3>
          <div className="gauge-row">
            {gauges.map(({ p, t }) => (
              <button key={p.id} type="button" className="gauge" onClick={() => onOpenSheet(p.id)}>
                <Donut pct={t.capacityPct} color={colorOf(p.cat)} dday={p.dday ?? 0} />
                <span className="gauge-t">{p.short}</span>
                <span className="gauge-s">{t.capacityPct}% 소진</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5) 지원 많은 순 랭킹 */}
      <div className="pad block" style={{ marginTop: 22 }}>
        <h3 className="tr-sec">지원 많은 순</h3>
        <div className="rank-list">
          {rows.slice(0, 10).map(({ p, applicants, delta, t }, i) => (
            <button
              key={p.id}
              type="button"
              className="rank-item"
              onClick={() => onOpenSheet(p.id)}
            >
              <span className="rank-no">{i + 1}</span>
              <span className="rank-tx">
                <b>{p.title}</b>
                <span>{p.cat}</span>
              </span>
              <span className="rank-spark">
                <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d={sparkPath(t.series, 100, 24)}
                    fill="none"
                    stroke={delta >= 0 ? "var(--red)" : "var(--blue)"}
                    strokeWidth={2}
                  />
                </svg>
              </span>
              <span className="rank-rt">
                <b className="mono">{formatCount(applicants)}</b>
                <em className={delta >= 0 ? "up" : "down"}>
                  {delta >= 0 ? "▲" : "▼"}
                  {Math.abs(delta)}%
                </em>
              </span>
            </button>
          ))}
        </div>
        <p className="tr-foot">
          {live.source === "live"
            ? "실시간 사용자 클릭·신청 집계 기준"
            : "집계 서버 연결 전 — 시뮬레이션 값입니다"}
          {` · 점수 상한 ${formatCount(Math.round(maxScore))}`}
        </p>
      </div>
    </div>
  );
}

function FragmentRow({ cat, row, max }: { cat: string; row: number[]; max: number }) {
  const color = colorOf(cat);
  return (
    <>
      <div className="heat-rowh">{cat}</div>
      {row.map((v, i) => {
        const op = 0.12 + (v / max) * 0.88;
        return (
          <div
            key={i}
            className="heat-cell"
            style={{ background: color, opacity: op }}
            title={`${cat} ${BUCKETS[i]}: ${v}`}
          />
        );
      })}
    </>
  );
}

function Donut({ pct, color, dday }: { pct: number; color: string; dday: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  return (
    <svg className="donut" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--g200)" strokeWidth="7" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="30" textAnchor="middle" className="donut-d">
        D-{dday}
      </text>
      <text x="32" y="42" textAnchor="middle" className="donut-p">
        {pct}%
      </text>
    </svg>
  );
}
