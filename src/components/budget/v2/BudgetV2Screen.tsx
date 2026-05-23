"use client";

/**
 * 신혼생활 가계부 v2 — 결혼 누적 비용 + 축의금 트래커
 *
 * public/wedding-budget.html(standalone React+Babel)을 Next.js/TSX 로 포팅한 본판.
 * /budget 페이지에서 iframe 대신 이 컴포넌트를 마운트한다.
 *
 * 데이터 흐름:
 *   초기 → storage_v2.loadV2()         (로컬 SSOT)
 *   로그인 → sync_v2.fetchV2Remote()    (원격으로 덮어쓰기)
 *   변경 → setState + storage_v2.saveV2 + (로그인 시) sync_v2.push*Remote
 *
 * 단일 파일 안에 sub-component(Header / Hero / NLInput / GiftTracker /
 * ForecastCard / CategoryX / ParseSheet / EditModal) 모두 둠.
 * 분리하기보다 HTML 원본 1:1 대응을 우선했다.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES_V2, CATEGORY_BY_ID } from "@/lib/budget/categories_v2";
import {
  calcDDay,
  fmt만,
  fmtKRW,
  formatWeddingDate,
  labelToDate,
  parseNL,
  recentSubLabel,
  type Parsed,
} from "@/lib/budget/format_v2";
import { defaultV2State, loadV2, saveV2 } from "@/lib/budget/storage_v2";
import {
  fetchV2Remote,
  pushExpenseRemote,
  pushGiftsRemote,
  pushRecentExpenseRemote,
  deleteRecentExpenseRemote,
} from "@/lib/budget/sync_v2";
import type {
  BudgetV2State,
  CategoryId,
  Expense,
  GiftGroupId,
  Gifts,
  RecentExpense,
} from "@/lib/budget/types_v2";
import { useSession } from "@/lib/supabase/useSession";
import "./wedding-budget-v2.css";

// ════════════════════════════════════════════════════════════════════════
// Sub-components
// ════════════════════════════════════════════════════════════════════════

/**
 * 만원 단위 입력 헬퍼.
 * - 표시는 만원 (예: 150)
 * - 외부 value/onChange 는 원 단위 (예: 1,500,000)
 * - 오른쪽에 "만원" suffix 표시
 * 가계부 전체 금액 입력칸에서 공용으로 사용.
 */
function ManwonInput({
  value,
  onChange,
  placeholder = "0",
  className,
  suffixLabel = "만원",
  min,
  max,
}: {
  value: number; // 원 단위
  onChange: (won: number) => void;
  placeholder?: string;
  className?: string;
  suffixLabel?: string;
  min?: number; // 만 단위
  max?: number; // 만 단위
}) {
  const display = value === 0 ? "" : String(Math.round(value / 10000));
  return (
    <div className={`manwon-input-wrap ${className ?? ""}`}>
      <input
        type="number"
        inputMode="numeric"
        className="manwon-input"
        value={display}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={(e) => {
          const raw = e.target.value.trim();
          if (raw === "") {
            onChange(0);
            return;
          }
          const man = Number(raw);
          if (!Number.isFinite(man)) return;
          onChange(Math.max(0, Math.round(man)) * 10000);
        }}
      />
      <span className="manwon-input-suffix">{suffixLabel}</span>
    </div>
  );
}

function Header({ dDay, weddingDate }: { dDay: number | null; weddingDate: string | null }) {
  const dDayLabel = dDay == null ? "결혼식 날짜 미설정" : dDay >= 0 ? `D−${dDay}` : `D+${-dDay}`;
  const dateLabel = weddingDate
    ? (() => {
        const d = new Date(weddingDate + "T00:00:00");
        return ` · ${d.getMonth() + 1}/${d.getDate()}`;
      })()
    : "";
  return (
    <div className="m-header">
      <div className="m-header-left">
        <div className="brand-mark">신</div>
        <div>
          <div className="m-greeting" style={{ color: "var(--ink-400)", fontWeight: 600 }}>
            로그인하고 부부 이름 표시
          </div>
          <div className="m-name">
            {dDayLabel}
            {dateLabel}
          </div>
        </div>
      </div>
      <div className="m-header-actions">
        <div className="m-icon-btn">
          🔔<span className="dot" />
        </div>
        <div className="m-icon-btn">⚙</div>
      </div>
    </div>
  );
}

function CumulativeHero({
  spent,
  gifts,
  dDay,
  weddingDate,
}: {
  spent: number;
  gifts: number;
  dDay: number | null;
  weddingDate: string | null;
}) {
  const net = spent - gifts;
  const isSurplus = net < 0;
  return (
    <div className="cum-hero">
      <div className="cum-hero-label">{gifts > 0 ? "최종 결산" : "결혼 비용 누적"}</div>
      <div className={`cum-hero-num ${isSurplus ? "surplus" : ""}`}>
        <span>{fmtKRW(Math.abs(net))}</span>
        <span className="unit">원</span>
      </div>
      {isSurplus && <div className="cum-hero-badge">✨ 흑자 — 축의금이 지출보다 많음</div>}
      <div className="cum-hero-row">
        <span>
          <span className="dot" style={{ background: "var(--sky-500)" }} />
          지출 {fmt만(spent)}
        </span>
        <span>
          <span className="dot" style={{ background: "var(--ink-300)" }} />
          축의금 {gifts > 0 ? fmt만(gifts) : "—"}
        </span>
      </div>
      <div className="cum-hero-foot">
        <span>
          결혼식까지{" "}
          <b style={{ color: "var(--sky-700)" }}>
            {dDay == null ? "—" : dDay >= 0 ? `D−${dDay}` : `D+${-dDay}`}
          </b>
        </span>
        <span>{formatWeddingDate(weddingDate)}</span>
      </div>
    </div>
  );
}

function NLInput({ onParsed }: { onParsed: (p: Parsed & { original: string }) => void }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    const parsed = parseNL(text);
    onParsed({ ...parsed, original: text });
    setText("");
  };
  const onMic = () => {
    alert(
      "🎙️ 음성 입력 — 곧 출시\n\n" +
        "마이크 길게 눌러 자연스럽게 말하면 AI가 자동 정리:\n" +
        '"오늘 스드메 175만 카드로, 어제 청첩장 18만 썼어"\n' +
        "→ 항목 2건 자동 분리 + 카테고리 매칭 + 저장\n\n" +
        "기술: GPT-4o-mini-transcribe (한국어 STT) + Claude 파싱\n" +
        "비용: 1회 ≈ 3원 (사용자 부담 없음)\n" +
        "현재 일정: v2 후속 스프린트",
    );
  };
  return (
    <div>
      <div className="nl-input">
        <div className="nl-input-ic">AI</div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="오늘 뭐 썼어요? 예: 스드메 175만"
        />
        <div className="nl-mic" onClick={onMic} title="음성 입력 (출시 예정)">
          🎙️<span className="nl-mic-soon">SOON</span>
        </div>
        <button className="nl-input-go" onClick={submit} disabled={!text.trim()}>
          저장
        </button>
      </div>
      <div className="nl-hint">
        💡 &quot;어제 다이아 커플링 240만 카드&quot; 같이 자연스럽게 · 🎙️ 곧 음성 입력 출시
      </div>
    </div>
  );
}

function GiftTracker({ gifts, setGifts }: { gifts: Gifts; setGifts: (g: Gifts) => void }) {
  const tier1Total = gifts.tier1.headcount * gifts.tier1.avgAmount;
  const tier2Total = (Object.values(gifts.tier2) as { count: number; avg: number }[]).reduce(
    (s, g) => s + g.count * g.avg,
    0,
  );
  const currentTotal = gifts.tier === 1 ? tier1Total : gifts.tier === 2 ? tier2Total : gifts.actual;
  const update1 = (patch: Partial<Gifts["tier1"]>) =>
    setGifts({ ...gifts, tier1: { ...gifts.tier1, ...patch } });
  const update2 = (group: GiftGroupId, patch: Partial<{ count: number; avg: number }>) =>
    setGifts({
      ...gifts,
      tier2: { ...gifts.tier2, [group]: { ...gifts.tier2[group], ...patch } },
    });
  const groupKeys = Object.keys(gifts.tier2) as GiftGroupId[];
  const groupHeadcount = groupKeys.reduce((s, k) => s + gifts.tier2[k].count, 0);

  return (
    <div className="gift">
      <div className="gift-head">
        <div className="gift-title">축의금 예상</div>
        <div
          className={`gift-toggle ${gifts.sideSplit ? "on" : ""}`}
          onClick={() => setGifts({ ...gifts, sideSplit: !gifts.sideSplit })}
        >
          {gifts.sideSplit ? "신랑·신부 분리 ✓" : "신랑+신부 합산"}
        </div>
      </div>
      <div className="gift-total">
        {fmt만(currentTotal)}
        <span className="unit">원</span>
      </div>
      <div className="gift-sub">
        {gifts.tier === 1 && `${gifts.tier1.headcount}명 × 평균 ${fmt만(gifts.tier1.avgAmount)}원`}
        {gifts.tier === 2 && `그룹별 합계 (${groupHeadcount}명)`}
        {gifts.tier === 3 && "실수령 입력"}
      </div>
      <div className="gift-tier-tabs">
        {([1, 2, 3] as const).map((t) => (
          <div
            key={t}
            className={`gift-tier-tab ${gifts.tier === t ? "active" : ""}`}
            onClick={() => setGifts({ ...gifts, tier: t })}
          >
            {t === 1 ? "총 슬라이더" : t === 2 ? "그룹별" : "실수령"}
          </div>
        ))}
      </div>
      {gifts.tier === 1 && (
        <div>
          <div className="gift-slider-row">
            <span>총 하객 수</span>
            <span className="v">{gifts.tier1.headcount}명</span>
          </div>
          <input
            type="range"
            className="gift-slider"
            min={20}
            max={400}
            step={10}
            value={gifts.tier1.headcount}
            onChange={(e) => update1({ headcount: +e.target.value })}
          />
          <div className="gift-slider-row">
            <span>1인당 평균 축의금</span>
            <span className="v">{fmt만(gifts.tier1.avgAmount)}원</span>
          </div>
          <input
            type="range"
            className="gift-slider"
            min={30000}
            max={200000}
            step={5000}
            value={gifts.tier1.avgAmount}
            onChange={(e) => update1({ avgAmount: +e.target.value })}
          />
        </div>
      )}
      {gifts.tier === 2 && (
        <div>
          {groupKeys.map((group) => {
            const g = gifts.tier2[group];
            return (
              <div key={group} className="gift-group-row">
                <div className="gift-group-name">{group}</div>
                <div>
                  <input
                    className="gift-group-input"
                    type="number"
                    value={g.count}
                    onChange={(e) => update2(group, { count: +e.target.value || 0 })}
                  />
                  명 ×{" "}
                  <ManwonInput
                    className="gift-group-manwon"
                    value={g.avg}
                    onChange={(won) => update2(group, { avg: won })}
                    suffixLabel="만원"
                  />
                </div>
                <div className="gift-group-amt">{fmt만(g.count * g.avg)}</div>
              </div>
            );
          })}
        </div>
      )}
      {gifts.tier === 3 && (
        <div className="gift-tier3-input">
          <span style={{ fontSize: 11, color: "var(--ink-500)", fontWeight: 700 }}>실제 받은 총액</span>
          <ManwonInput
            value={gifts.actual}
            onChange={(won) => setGifts({ ...gifts, actual: won })}
          />
        </div>
      )}
      {gifts.sideSplit && (
        <div className="gift-side-row">
          <div className="gift-side-cell">
            <div className="k">신랑측</div>
            <div className="v">{fmt만(currentTotal * gifts.sideBreakdown.신랑)}원</div>
          </div>
          <div className="gift-side-cell">
            <div className="k">신부측</div>
            <div className="v">{fmt만(currentTotal * gifts.sideBreakdown.신부)}원</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ForecastCard({
  spent,
  plannedTotal,
  expectedGifts,
}: {
  spent: number;
  plannedTotal: number;
  expectedGifts: number;
}) {
  const expectedSpent = Math.max(spent, plannedTotal);
  const net = expectedSpent - expectedGifts;
  const isSurplus = net < 0;
  return (
    <div className="forecast">
      <div className="forecast-head">
        <div className="forecast-title">결혼식 후 예상</div>
        <div style={{ fontSize: 11, color: "var(--ink-400)", fontWeight: 700 }}>
          ↑ 축의금 슬라이더 편집
        </div>
      </div>
      <div className={`forecast-num ${isSurplus ? "surplus" : ""}`}>
        {fmt만(Math.abs(net))}원
        <span className="lbl-after">{isSurplus ? "여유" : "부족"}</span>
      </div>
      <div className="forecast-sub">
        예상 지출 <b>{fmt만(expectedSpent)}</b> − 예상 축의금 <b>{fmt만(expectedGifts)}</b>
        <br />
        {isSurplus ? "축의금으로 결혼 비용 다 충당 가능" : "더 모으거나 줄이는 쪽 검토 추천"}
      </div>
    </div>
  );
}

function CategoryX({
  expenses,
  onClickRow,
}: {
  expenses: Expense[];
  onClickRow: (e: Expense) => void;
}) {
  const spentList = expenses.filter((e) => e.spent > 0);
  const emptyList = expenses.filter((e) => e.spent === 0);
  const totalSpent = spentList.reduce((s, c) => s + c.spent, 0);
  const sorted = [...spentList].sort((a, b) => b.spent - a.spent);

  const row = (e: Expense, isEmpty: boolean) => {
    const meta = CATEGORY_BY_ID[e.categoryId];
    if (!meta) return null;
    const avg = meta.avg;
    return (
      <div
        key={e.categoryId}
        className={`catx-row ${isEmpty ? "empty" : ""}`}
        onClick={() => onClickRow(e)}
        style={{ cursor: "pointer" }}
      >
        <div className="catx-ic" style={{ background: meta.color }}>
          {meta.icon}
        </div>
        <div>
          <div className="catx-name">{meta.name}</div>
          <div className="catx-avg">
            {avg ? `평균 ${fmt만(avg)}원` : "평균 ───"}
            {avg && e.spent > avg * 1.2 && (
              <span style={{ color: "var(--expense)", marginLeft: 4 }}>
                {" "}
                · 평균 대비 +{Math.round((e.spent / avg - 1) * 100)}%
              </span>
            )}
            {avg && e.spent < avg * 0.6 && e.spent > 0 && (
              <span style={{ color: "var(--sky-600)", marginLeft: 4 }}>
                {" "}
                · 평균 대비 −{Math.round((1 - e.spent / avg) * 100)}%
              </span>
            )}
          </div>
        </div>
        <div className={`catx-amt ${isEmpty ? "zero" : ""}`}>
          {e.spent === 0 ? "—" : `${fmt만(e.spent)}원`}
        </div>
      </div>
    );
  };

  return (
    <div className="catx">
      <div className="catx-head">
        <div className="catx-title">어디에 얼마 썼나</div>
        <div className="catx-total">누적 {fmt만(totalSpent)}원</div>
      </div>
      {totalSpent > 0 && (
        <div className="catx-stack">
          {sorted.map((e) => {
            const meta = CATEGORY_BY_ID[e.categoryId];
            return (
              <div
                key={e.categoryId}
                style={{ width: `${(e.spent / totalSpent) * 100}%`, background: meta?.color }}
              />
            );
          })}
        </div>
      )}
      {sorted.map((e) => row(e, false))}
      {emptyList.length > 0 && (
        <>
          <div className="catx-divider">아직 안 쓴 카테고리</div>
          {emptyList.map((e) => row(e, true))}
        </>
      )}
    </div>
  );
}

type ParsedDraft = Parsed & { original: string };

function ParseSheet({
  parsed,
  onClose,
  onSave,
}: {
  parsed: ParsedDraft;
  onClose: () => void;
  onSave: (p: ParsedDraft) => void;
}) {
  const [data, setData] = useState<ParsedDraft>(parsed);
  const [editing, setEditing] = useState<null | "amount" | "category" | "date" | "method">(null);

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-title">이렇게 저장할까요?</div>
        <div className="sheet-orig">{data.original}</div>
        <div className="sheet-chips">
          <div
            className={`chip chip-amount ${editing === "amount" ? "active" : ""}`}
            onClick={() => setEditing(editing === "amount" ? null : "amount")}
          >
            {fmt만(data.amount)}원
          </div>
          <div
            className={`chip ${editing === "category" ? "active" : ""}`}
            onClick={() => setEditing(editing === "category" ? null : "category")}
          >
            <span className="chip-label">카테고리</span> {CATEGORY_BY_ID[data.category].name}
          </div>
          <div
            className={`chip ${editing === "date" ? "active" : ""}`}
            onClick={() => setEditing(editing === "date" ? null : "date")}
          >
            <span className="chip-label">날짜</span> {data.dateLabel}
          </div>
          <div
            className={`chip ${editing === "method" ? "active" : ""}`}
            onClick={() => setEditing(editing === "method" ? null : "method")}
          >
            <span className="chip-label">결제</span> {data.method}
          </div>
        </div>
        {editing === "amount" && (
          <div className="picker">
            <div className="picker-label">금액 정정</div>
            <ManwonInput
              className="picker-manwon"
              value={data.amount}
              onChange={(won) => setData({ ...data, amount: won })}
            />
          </div>
        )}
        {editing === "category" && (
          <div className="picker">
            <div className="picker-label">카테고리 변경</div>
            <div className="picker-row">
              {CATEGORIES_V2.map((c) => (
                <div
                  key={c.id}
                  className={`picker-opt ${data.category === c.id ? "selected" : ""}`}
                  onClick={() => {
                    setData({ ...data, category: c.id });
                    setEditing(null);
                  }}
                >
                  {c.icon} {c.name}
                </div>
              ))}
            </div>
          </div>
        )}
        {editing === "date" && (
          <div className="picker">
            <div className="picker-label">날짜</div>
            <div className="picker-row">
              {["오늘", "어제", "그제"].map((d) => (
                <div
                  key={d}
                  className={`picker-opt ${data.dateLabel === d ? "selected" : ""}`}
                  onClick={() => {
                    setData({ ...data, dateLabel: d });
                    setEditing(null);
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}
        {editing === "method" && (
          <div className="picker">
            <div className="picker-label">결제수단</div>
            <div className="picker-row">
              {(["카드", "현금", "이체"] as const).map((m) => (
                <div
                  key={m}
                  className={`picker-opt ${data.method === m ? "selected" : ""}`}
                  onClick={() => {
                    setData({ ...data, method: m });
                    setEditing(null);
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}
        <button className="sheet-save" onClick={() => onSave(data)}>
          저장하기
        </button>
      </div>
    </div>
  );
}

type EditTarget =
  | { source: "category"; categoryId: CategoryId; amount: number }
  | { source: "recent"; entry: RecentExpense };

function EditModal({
  target,
  onSave,
  onDelete,
  onClose,
}: {
  target: EditTarget;
  onSave: (amount: number, categoryId: CategoryId) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const initialAmount = target.source === "category" ? target.amount : target.entry.amount;
  const initialCat: CategoryId =
    target.source === "category" ? target.categoryId : target.entry.categoryId;
  const [amount, setAmount] = useState<number>(initialAmount);
  const [category, setCategory] = useState<CategoryId>(initialCat);
  const title =
    target.source === "category" ? `${CATEGORY_BY_ID[initialCat].name} 누적` : target.entry.title;

  return (
    <div
      className="edit-modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="edit-modal">
        <h3>{title} 수정</h3>
        <div className="edit-field">
          <div className="edit-field-label">금액</div>
          <ManwonInput
            className="edit-field-manwon"
            value={amount}
            onChange={setAmount}
          />
        </div>
        <div className="edit-field">
          <div className="edit-field-label">카테고리</div>
          <div className="picker-row" style={{ maxHeight: 120, overflowY: "auto" }}>
            {CATEGORIES_V2.map((c) => (
              <div
                key={c.id}
                className={`picker-opt ${category === c.id ? "selected" : ""}`}
                onClick={() => setCategory(c.id)}
              >
                {c.icon} {c.name}
              </div>
            ))}
          </div>
        </div>
        <div className="edit-actions">
          <button className="edit-btn delete" onClick={onDelete}>
            삭제
          </button>
          <button className="edit-btn save" onClick={() => onSave(amount, category)}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Main screen
// ════════════════════════════════════════════════════════════════════════

export function BudgetV2Screen() {
  const session = useSession();
  const userId = session.user?.id ?? null;
  const isAuthed = session.status === "authenticated";

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<BudgetV2State>(defaultV2State);
  const [parsedDraft, setParsedDraft] = useState<ParsedDraft | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  // 초기 로딩: localStorage
  useEffect(() => {
    setState(loadV2());
    setMounted(true);
  }, []);

  // 로그인 후 원격 데이터로 덮어쓰기 (last-write-wins)
  useEffect(() => {
    if (!isAuthed || !userId) return;
    let cancelled = false;
    void (async () => {
      const remote = await fetchV2Remote(userId);
      if (!cancelled && remote) setState(remote);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, userId]);

  // 변경 시 로컬 저장
  useEffect(() => {
    if (mounted) saveV2(state);
  }, [state, mounted]);

  // ─── 파생값 ─────────────────────────────────────────────────────────
  const totalSpent = useMemo(() => state.expenses.reduce((s, c) => s + c.spent, 0), [state.expenses]);
  const plannedTotal = useMemo(
    () => state.expenses.reduce((s, c) => s + c.planned, 0),
    [state.expenses],
  );
  const expectedGifts = useMemo(() => {
    const g = state.gifts;
    if (g.tier === 1) return g.tier1.headcount * g.tier1.avgAmount;
    if (g.tier === 2)
      return (Object.values(g.tier2) as { count: number; avg: number }[]).reduce(
        (s, x) => s + x.count * x.avg,
        0,
      );
    return g.actual;
  }, [state.gifts]);
  const dDay = useMemo(() => calcDDay(state.weddingDate), [state.weddingDate]);

  // ─── 액션 ───────────────────────────────────────────────────────────
  const updateExpense = useCallback(
    async (categoryId: CategoryId, patch: Partial<Pick<Expense, "spent" | "planned">>) => {
      let updated: Expense | null = null;
      setState((prev) => {
        const expenses = prev.expenses.map((e) => {
          if (e.categoryId !== categoryId) return e;
          const next = { ...e, ...patch };
          updated = next;
          return next;
        });
        return { ...prev, expenses };
      });
      if (isAuthed && userId && updated) await pushExpenseRemote(userId, updated);
    },
    [isAuthed, userId],
  );

  const setGifts = useCallback(
    async (gifts: Gifts) => {
      setState((prev) => ({ ...prev, gifts }));
      if (isAuthed && userId) await pushGiftsRemote(userId, gifts);
    },
    [isAuthed, userId],
  );

  const saveParsed = useCallback(
    async (p: ParsedDraft) => {
      // 1) recentExpenses 에 추가
      const entry: RecentExpense = {
        id: `local-${Date.now()}`,
        title: p.title,
        date: labelToDate(p.dateLabel),
        categoryId: p.category,
        amount: p.amount,
        method: p.method,
      };
      let saved = entry;
      if (isAuthed && userId) {
        const remote = await pushRecentExpenseRemote(userId, entry);
        if (remote) saved = remote;
      }

      // 2) 카테고리 spent 누적
      setState((prev) => {
        const expenses = prev.expenses.map((e) =>
          e.categoryId === p.category ? { ...e, spent: e.spent + p.amount } : e,
        );
        const recentExpenses = [saved, ...prev.recentExpenses].slice(0, 12);
        return { ...prev, expenses, recentExpenses };
      });
      if (isAuthed && userId) {
        const updated = state.expenses.find((e) => e.categoryId === p.category);
        if (updated) {
          await pushExpenseRemote(userId, { ...updated, spent: updated.spent + p.amount });
        }
      }
      setParsedDraft(null);
    },
    [isAuthed, userId, state.expenses],
  );

  const editCategorySpent = useCallback(
    async (categoryId: CategoryId, newAmount: number) => {
      await updateExpense(categoryId, { spent: Math.max(0, newAmount) });
    },
    [updateExpense],
  );

  const editRecent = useCallback(
    async (entry: RecentExpense, newAmount: number, newCategory: CategoryId) => {
      const diff = newAmount - entry.amount;
      const oldCat = entry.categoryId;
      // recentExpenses 업데이트
      setState((prev) => {
        const recentExpenses = prev.recentExpenses.map((r) =>
          r.id === entry.id ? { ...r, amount: newAmount, categoryId: newCategory } : r,
        );
        const expenses = prev.expenses.map((e) => {
          if (newCategory === oldCat) {
            return e.categoryId === oldCat ? { ...e, spent: Math.max(0, e.spent + diff) } : e;
          }
          // 카테고리 이동: 기존 차감, 신규 가산
          if (e.categoryId === oldCat) return { ...e, spent: Math.max(0, e.spent - entry.amount) };
          if (e.categoryId === newCategory) return { ...e, spent: e.spent + newAmount };
          return e;
        });
        return { ...prev, expenses, recentExpenses };
      });
      if (isAuthed && userId) {
        await pushRecentExpenseRemote(userId, {
          ...entry,
          amount: newAmount,
          categoryId: newCategory,
        });
        // 영향받은 카테고리만 원격에도 push
        const after = (
          newCategory === oldCat
            ? [
                state.expenses.find((e) => e.categoryId === oldCat),
              ]
            : [
                state.expenses.find((e) => e.categoryId === oldCat),
                state.expenses.find((e) => e.categoryId === newCategory),
              ]
        ).filter(Boolean) as Expense[];
        for (const e of after) {
          const next =
            e.categoryId === oldCat && newCategory === oldCat
              ? { ...e, spent: Math.max(0, e.spent + diff) }
              : e.categoryId === oldCat
                ? { ...e, spent: Math.max(0, e.spent - entry.amount) }
                : { ...e, spent: e.spent + newAmount };
          await pushExpenseRemote(userId, next);
        }
      }
    },
    [isAuthed, userId, state.expenses],
  );

  const deleteRecent = useCallback(
    async (entry: RecentExpense) => {
      setState((prev) => {
        const recentExpenses = prev.recentExpenses.filter((r) => r.id !== entry.id);
        const expenses = prev.expenses.map((e) =>
          e.categoryId === entry.categoryId ? { ...e, spent: Math.max(0, e.spent - entry.amount) } : e,
        );
        return { ...prev, expenses, recentExpenses };
      });
      if (isAuthed && userId) {
        await deleteRecentExpenseRemote(userId, entry.id);
        const target = state.expenses.find((e) => e.categoryId === entry.categoryId);
        if (target)
          await pushExpenseRemote(userId, {
            ...target,
            spent: Math.max(0, target.spent - entry.amount),
          });
      }
    },
    [isAuthed, userId, state.expenses],
  );

  if (!mounted) {
    return (
      <div className="wbv2">
        <div className="m-scroll" style={{ padding: 24, color: "var(--ink-500)", fontSize: 13 }}>
          불러오는 중…
        </div>
      </div>
    );
  }

  return (
    <div className="wbv2">
      <Header dDay={dDay} weddingDate={state.weddingDate} />
      <div className="m-scroll">
        <CumulativeHero
          spent={totalSpent}
          gifts={0}
          dDay={dDay}
          weddingDate={state.weddingDate}
        />
        <NLInput onParsed={setParsedDraft} />
        <GiftTracker gifts={state.gifts} setGifts={setGifts} />
        <ForecastCard
          spent={totalSpent}
          plannedTotal={plannedTotal}
          expectedGifts={expectedGifts}
        />
        <CategoryX
          expenses={state.expenses}
          onClickRow={(e) =>
            setEditTarget({ source: "category", categoryId: e.categoryId, amount: e.spent })
          }
        />
        <div className="m-card">
          <div className="m-card-title">
            최근 지출<span className="link">{state.recentExpenses.length}건</span>
          </div>
          {state.recentExpenses.length === 0 && (
            <div style={{ padding: "12px 0", fontSize: 12, color: "var(--ink-400)" }}>
              아직 기록된 지출이 없어요. 위 입력창에 한 줄로 적어보세요.
            </div>
          )}
          {state.recentExpenses.map((t) => {
            const meta = CATEGORY_BY_ID[t.categoryId];
            return (
              <div
                key={t.id}
                className="recent-row"
                onClick={() => setEditTarget({ source: "recent", entry: t })}
              >
                <div className="recent-ic" style={{ background: meta?.color }}>
                  {meta?.icon}
                </div>
                <div className="recent-body">
                  <div className="recent-title">{t.title}</div>
                  <div className="recent-sub">{recentSubLabel(t)}</div>
                </div>
                <div className="recent-amt">−{fmt만(t.amount)}원</div>
              </div>
            );
          })}
        </div>
      </div>

      {parsedDraft && (
        <ParseSheet
          parsed={parsedDraft}
          onClose={() => setParsedDraft(null)}
          onSave={saveParsed}
        />
      )}
      {editTarget && (
        <EditModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(amount, category) => {
            if (editTarget.source === "category") {
              void editCategorySpent(editTarget.categoryId, amount);
            } else {
              void editRecent(editTarget.entry, amount, category);
            }
            setEditTarget(null);
          }}
          onDelete={() => {
            if (editTarget.source === "recent") {
              void deleteRecent(editTarget.entry);
            } else {
              void editCategorySpent(editTarget.categoryId, 0);
            }
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}
