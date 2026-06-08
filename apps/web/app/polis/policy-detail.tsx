"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent
} from "react";
import type { PolisPolicy } from "./polis-data";
import { track } from "./trend";

type CalcResult = [string, string][];
type CalcConfig = {
  label: string;
  min: number;
  max: number;
  step: number;
  def: number;
  fmt: (v: number) => string;
  compute: (v: number) => CalcResult;
};

const CALC: Record<string, CalcConfig> = {
  p1: {
    label: "전세 보증금",
    min: 5000,
    max: 40000,
    step: 1000,
    def: 20000,
    fmt: (v) => (v / 10000).toFixed(1).replace(/\.0$/, "") + "억",
    compute: (v) => {
      const limit = Math.min(Math.round(v * 0.8), 30000);
      const monthly = Math.round((limit * 0.015) / 12);
      return [
        ["대출 가능액", limit.toLocaleString() + "만원"],
        ["예상 월 이자", monthly.toLocaleString() + "만원"]
      ];
    }
  },
  p4: {
    label: "주택 구입가",
    min: 10000,
    max: 90000,
    step: 1000,
    def: 40000,
    fmt: (v) => (v / 10000).toFixed(1).replace(/\.0$/, "") + "억",
    compute: (v) => {
      const limit = Math.min(Math.round(v * 0.7), 50000);
      const monthly = Math.round((limit * 0.016) / 12);
      return [
        ["대출 가능액", limit.toLocaleString() + "만원"],
        ["예상 월 상환 이자", monthly.toLocaleString() + "만원"]
      ];
    }
  },
  p6: {
    label: "예정 시술 횟수",
    min: 1,
    max: 9,
    step: 1,
    def: 3,
    fmt: (v) => v + "회",
    compute: (v) => {
      const support = Math.min(v * 110, 990);
      return [["예상 지원금", support.toLocaleString() + "만원"]];
    }
  }
};

const DOCS_KEY = "sinhon.polis_docs_ready.v1";

function readDocs(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DOCS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
  } catch {
    return {};
  }
}
function writeDocs(map: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DOCS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function CheckSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartSvg({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type PolicyDetailProps = {
  policy: PolisPolicy | null;
  bookmarked: boolean;
  applied: boolean;
  onToggleBookmark: (id: string) => void;
  onApply: (id: string) => void;
  onClose: () => void;
  onCompare: (id: string) => void;
  onGoMypage?: () => void;
};

export function PolicyDetail({
  policy,
  bookmarked,
  applied,
  onToggleBookmark,
  onApply,
  onClose,
  onCompare,
  onGoMypage
}: PolicyDetailProps) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [docsReady, setDocsReadyState] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const calc = policy ? CALC[policy.id] : undefined;
  const [calcVal, setCalcVal] = useState<number>(calc?.def ?? 0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const id = policy?.id ?? null;

  useEffect(() => {
    if (!policy) return;
    setChecked(new Set());
    const all = readDocs();
    setDocsReadyState(all[policy.id] ?? []);
    setConfirmOpen(false);
    setSuccess(false);
    const c = CALC[policy.id];
    if (c) setCalcVal(c.def);
  }, [policy]);

  useLayoutEffect(() => {
    if (!policy) return;
    setOpen(false);
    const t = window.setTimeout(() => {
      setOpen(true);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 10);
    return () => window.clearTimeout(t);
  }, [policy]);

  function close() {
    setOpen(false);
    window.setTimeout(onClose, 380);
  }

  if (!policy) return null;

  const eligCount = checked.size;
  const eligTotal = policy.eligibility.length;
  const eligPct = eligTotal ? Math.round((eligCount / eligTotal) * 100) : 0;
  const eligStatusCls =
    eligCount === 0 ? "elig-status" : eligCount === eligTotal ? "elig-status ok" : "elig-status partial";
  const eligStatusText =
    eligCount === 0
      ? `해당하는 자격을 확인해보세요 (0/${eligTotal})`
      : eligCount === eligTotal
        ? `✓ 모든 자격을 충족해요! 바로 신청할 수 있어요 (${eligTotal}/${eligTotal})`
        : `예상 자격 충족 ${eligCount}/${eligTotal} · 조금 더 확인해보세요`;

  const docTotal = policy.docs.length;
  const docDone = docsReady.length;
  const docCountCls = docDone === docTotal && docTotal > 0 ? "dt-hint all" : "dt-hint";

  function toggleElig(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }
  function toggleDoc(i: number) {
    if (!id) return;
    setDocsReadyState((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      const all = readDocs();
      all[id] = next;
      writeDocs(all);
      return next;
    });
  }
  function onCalcChange(e: ChangeEvent<HTMLInputElement>) {
    setCalcVal(Number(e.target.value));
  }

  function handleApply() {
    if (!policy) return;
    if (applied) return;
    setConfirmOpen(true);
  }
  function confirmApply() {
    if (!policy) return;
    setConfirmOpen(false);
    track("apply", policy.id);
    onApply(policy.id);
    window.setTimeout(() => setSuccess(true), 240);
  }

  const calcRes: CalcResult = calc ? calc.compute(calcVal) : [];
  const calcPct = calc ? ((calcVal - calc.min) / (calc.max - calc.min)) * 100 : 0;

  return (
    <div className={`detail${open ? " open" : ""}`}>
      <div className="dt-bar">
        <button type="button" className="dt-back" aria-label="뒤로" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="dt-bar-title">{policy.short}</span>
        <button
          type="button"
          className={`dt-heart${bookmarked ? " on" : ""}`}
          aria-label="찜"
          onClick={() => {
            if (!bookmarked) track("bookmark", policy.id);
            onToggleBookmark(policy.id);
          }}
        >
          <HeartSvg filled={bookmarked} />
        </button>
      </div>

      <div className="dt-scroll" ref={scrollRef}>
        <div className="dt-hero">
          <div className="dt-tags">
            <span className={`dt-cat ${policy.icon}`}>{policy.cat}</span>
            <span className="dt-dl">{policy.deadlineTag}</span>
          </div>
          <h1>{policy.title}</h1>
          <div className="dt-dept">{policy.dept}</div>
          <div className="dt-amt">
            <b>{policy.amount}</b>
            <span>{policy.amountSub}</span>
          </div>
          <div className="dt-match">
            <span className="dt-match-bar">
              <i style={{ width: `${open ? policy.match : 0}%` }} />
            </span>
            <em>
              우리 부부 적합도 <b>{policy.match}%</b>
            </em>
          </div>
          <button
            type="button"
            className="dt-compare"
            onClick={() => onCompare(policy.id)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path
                d="M3 6h7M3 12h7M3 18h7M17 4v16M14 7l3-3 3 3M14 17l3 3 3-3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            다른 정책과 비교하기
          </button>
        </div>

        <div className="dt-sec">
          <h2>받는 혜택</h2>
          <div className="dt-kv">
            {policy.benefits.map(([k, v]) => (
              <div key={k} className="kvrow">
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>

        {calc && (
          <div className="dt-sec">
            <h2>
              내 예상 금액 <span className="dt-hint">슬라이드해서 맞춰보세요</span>
            </h2>
            <div className="calc">
              <div className="calc-top">
                <span>{calc.label}</span>
                <b>{calc.fmt(calcVal)}</b>
              </div>
              <input
                type="range"
                className="calc-range"
                min={calc.min}
                max={calc.max}
                step={calc.step}
                value={calcVal}
                onChange={onCalcChange}
                style={{ ["--pct" as string]: `${calcPct}%` }}
              />
              <div className="calc-out">
                {calcRes.map(([k, v], i) => (
                  <div key={k} className={`calc-cell${i === 0 ? " main" : ""}`}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <p className="calc-note">
                실제 한도·금리는 소득·신용·주택 조건에 따라 달라져요. 참고용 추정치예요.
              </p>
            </div>
          </div>
        )}

        <div className="dt-sec">
          <h2>
            신청 자격 <span className="dt-hint">해당하면 눌러보세요</span>
          </h2>
          <div className="elig-bar">
            <i style={{ width: `${eligPct}%` }} />
          </div>
          <div className={eligStatusCls}>{eligStatusText}</div>
          <div className="elig-list">
            {policy.eligibility.map((t, i) => (
              <button
                key={i}
                type="button"
                className={`elig${checked.has(i) ? " on" : ""}`}
                onClick={() => toggleElig(i)}
              >
                <span className="elig-box">
                  <CheckSvg />
                </span>
                <span className="elig-tx">{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dt-sec">
          <h2>
            서류 준비 <span className={docCountCls}>{docDone}/{docTotal} 준비됨</span>
          </h2>
          <p className="doc-note">미리 준비해두면 신청이 빨라져요. 부부가 같이 체크해보세요.</p>
          <div className="doc-list">
            {policy.docs.map((dname, i) => (
              <button
                key={i}
                type="button"
                className={`doc-item${docsReady.includes(i) ? " on" : ""}`}
                onClick={() => toggleDoc(i)}
              >
                <span className="doc-box">
                  <CheckSvg />
                </span>
                <span className="doc-tx">{dname}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dt-sec">
          <h2>신청 방법</h2>
          <ol className="steps">
            {policy.steps.map(([t, d], i) => (
              <li key={i}>
                <span className="step-n">{i + 1}</span>
                <div className="step-tx">
                  <b>{t}</b>
                  <span>{d}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ height: 18 }} />
      </div>

      <div className="dt-cta-bar">
        <button
          type="button"
          className={`dt-cta-heart${bookmarked ? " on" : ""}`}
          aria-label="찜"
          onClick={() => {
            if (!bookmarked) track("bookmark", policy.id);
            onToggleBookmark(policy.id);
          }}
        >
          <HeartSvg filled={bookmarked} />
        </button>
        <button
          type="button"
          className={`dt-apply${applied ? " done" : ""}`}
          onClick={handleApply}
          disabled={applied}
        >
          {applied ? "신청 완료 ✓" : "신청하기"}
        </button>
      </div>

      {confirmOpen && (
        <ApplyConfirm
          policy={policy}
          onConfirm={confirmApply}
          onClose={() => setConfirmOpen(false)}
        />
      )}

      <div className={`dt-success${success ? " show" : ""}`}>
        <div className="dt-success-in">
          <div className="dt-success-check">
            <CheckSvg />
          </div>
          <h2>신청이 접수됐어요</h2>
          <p>
            마이페이지에서 진행 상황을
            <br />
            확인할 수 있어요.
          </p>
          <div className="dt-success-btns">
            <button
              type="button"
              className="btn-cta ghost"
              onClick={() => setSuccess(false)}
            >
              계속 둘러보기
            </button>
            <button
              type="button"
              className="btn-cta"
              onClick={() => {
                setSuccess(false);
                close();
                if (onGoMypage) window.setTimeout(onGoMypage, 280);
              }}
            >
              신청 현황 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplyConfirm({
  policy,
  onConfirm,
  onClose
}: {
  policy: PolisPolicy;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="sheet-scrim open" onClick={onClose} />
      <div className="sheet open">
        <div className="grab" />
        <span className="tag">
          {policy.cat} · {policy.dept}
        </span>
        <h3>
          {policy.title}
          <br />
          신청을 진행할까요?
        </h3>
        <p className="desc">
          두리AI가 필요한 서류 안내와 신청 링크를 준비해 드려요. 실제 제출은 기관 페이지에서 마무리돼요.
        </p>
        <div className="apply-docs">
          <div className="apply-docs-h">미리 준비하면 좋아요</div>
          {policy.docs.map((d) => (
            <div key={d} className="apply-doc">
              <span className="dot" />
              {d}
            </div>
          ))}
        </div>
        <button type="button" className="btn-cta" onClick={onConfirm}>
          네, 신청할게요
        </button>
        <button
          type="button"
          className="btn-cta ghost"
          onClick={onClose}
          style={{ marginTop: 8 }}
        >
          다시 볼게요
        </button>
      </div>
    </>
  );
}
