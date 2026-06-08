"use client";

import { useEffect, useMemo, useState } from "react";
import type { PolisPolicy } from "./polis-data";

type Stage = "pick" | "table";

export function PolicyCompare({
  policies,
  policyAId,
  onBack,
  onOpenSheet
}: {
  policies: PolisPolicy[];
  policyAId: string;
  onBack: () => void;
  onOpenSheet: (id: string) => void;
}) {
  const a = useMemo(() => policies.find((p) => p.id === policyAId), [policies, policyAId]);
  const [bId, setBId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("pick");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 10);
    return () => window.clearTimeout(t);
  }, []);

  function close() {
    setOpen(false);
    window.setTimeout(onBack, 380);
  }

  const others = useMemo(() => {
    if (!a) return [];
    return [...policies]
      .filter((p) => p.id !== a.id)
      .sort((x, y) => Number(y.cat === a.cat) - Number(x.cat === a.cat));
  }, [policies, a]);

  const b = useMemo(() => policies.find((p) => p.id === bId) ?? null, [policies, bId]);

  if (!a) return null;

  return (
    <div className={`compare${open ? " open" : ""}`}>
      <div className="dt-bar">
        <button type="button" className="dt-back" aria-label="뒤로" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="dt-bar-title">정책 비교</span>
        <span style={{ width: 38 }} />
      </div>

      {stage === "pick" || !b ? (
        <div className="dt-scroll">
          <div className="dt-sec" style={{ borderBottom: 0 }}>
            <h2>무엇과 비교할까요?</h2>
            <p className="doc-note">
              <b>{a.short}</b>와 나란히 비교할 정책을 골라주세요.
            </p>
            <div className="cmp-pick">
              {others.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="cmp-pick-row"
                  onClick={() => {
                    setBId(p.id);
                    setStage("table");
                  }}
                >
                  <span className={`ic ${p.icon}`}>
                    <PolicyMiniIcon icon={p.icon} />
                  </span>
                  <span className="tx">
                    <b>{p.short}</b>
                    <span>
                      {p.cat}
                      {p.cat === a.cat ? " · 같은 분야" : ""}
                    </span>
                  </span>
                  <span className="rt">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      width={18}
                      height={18}
                    >
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="dt-scroll">
          <div className="cmp-head">
            <CmpCol p={a} />
            <span className="cmp-vs">VS</span>
            <CmpCol p={b} />
          </div>
          <div className="cmp-table">
            <CmpRow
              label="우리 부부 적합도"
              va={`${a.match}%`}
              vb={`${b.match}%`}
              hi={a.match === b.match ? -1 : a.match > b.match ? 0 : 1}
            />
            <CmpRow
              label="지원 규모"
              va={
                <>
                  {a.amount}
                  <em>{a.amountSub}</em>
                </>
              }
              vb={
                <>
                  {b.amount}
                  <em>{b.amountSub}</em>
                </>
              }
              hi={-1}
            />
            <CmpRow
              label="현금성 지원"
              va={a.cash ? `${a.cash}만원` : "—"}
              vb={b.cash ? `${b.cash}만원` : "—"}
              hi={a.cash === b.cash ? -1 : a.cash > b.cash ? 0 : 1}
            />
            <CmpRow label="마감" va={a.deadline} vb={b.deadline} hi={-1} />
            <CmpRow label="주관" va={a.dept} vb={b.dept} hi={-1} />
            <CmpRow
              label="핵심 자격"
              va={a.eligibility[0] ?? "—"}
              vb={b.eligibility[0] ?? "—"}
              hi={-1}
            />
          </div>
          <div className="cmp-actions">
            <button
              type="button"
              className="btn-cta ghost"
              onClick={() => {
                onOpenSheet(a.id);
                close();
              }}
            >
              {a.short} 보기
            </button>
            <button
              type="button"
              className="btn-cta ghost"
              onClick={() => {
                onOpenSheet(b.id);
                close();
              }}
            >
              {b.short} 보기
            </button>
          </div>
          <div style={{ height: 18 }} />
        </div>
      )}
    </div>
  );
}

function CmpCol({ p }: { p: PolisPolicy }) {
  return (
    <div className="cmp-col">
      <span className={`cmp-cat ${p.icon}`}>{p.cat}</span>
      <b className="cmp-name">{p.short}</b>
      <span className="cmp-dept">{p.dept}</span>
    </div>
  );
}

function CmpRow({
  label,
  va,
  vb,
  hi
}: {
  label: string;
  va: React.ReactNode;
  vb: React.ReactNode;
  hi: number;
}) {
  return (
    <div className="cmp-row">
      <div className="cmp-label">{label}</div>
      <div className="cmp-cells">
        <div className={`cmp-cell${hi === 0 ? " win" : ""}`}>{va}</div>
        <div className={`cmp-cell${hi === 1 ? " win" : ""}`}>{vb}</div>
      </div>
    </div>
  );
}

function PolicyMiniIcon({ icon }: { icon: PolisPolicy["icon"] }) {
  if (icon === "b2")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18" strokeLinecap="round" />
      </svg>
    );
  if (icon === "b3")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 21c0-4 3-7 7-7s7 3 7 7" strokeLinecap="round" />
      </svg>
    );
  if (icon === "b4")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path
          d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (icon === "b5")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="8" cy="8" r="4" />
        <circle cx="16" cy="8" r="4" />
        <path d="M5 21c0-3 2-5 5-5M19 21c0-3-2-5-5-5" strokeLinecap="round" />
      </svg>
    );
  if (icon === "b6")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path
          d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
          strokeLinejoin="round"
        />
        <path d="M9 11h6M12 8v6" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
