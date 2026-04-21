"use client";

// V3.2 S1 · 체크리스트 검색 결과 리스트.
// Spec: docs/2026-04-21_V3.2_S0_UX_DECISIONS.md §2 + 사용자 F4 피드백.
//
// 두 섹션으로 나눠 렌더:
//   ① 활성 매치 — 탭하면 done 토글. 그룹 문맥(아이콘+제목) 작게 표시.
//   ② 숨긴 매치 — "다시 담기" 버튼으로 restoreItem → item_unhidden 이벤트.
//
// 결과가 0건이면 상위에서 EmptyState를 직접 렌더 (여기는 데이터만).

import { Check, RotateCcw } from "lucide-react";
import type { Assignee, ChecklistItem } from "@/lib/design/checklist";

export interface ActiveMatch {
  item: ChecklistItem;
  groupId: string;
  groupTitle: string;
  groupIcon: string;
}

export interface HiddenMatch extends ActiveMatch {}

interface Props {
  activeMatches: ActiveMatch[];
  hiddenMatches: HiddenMatch[];
  doneMap: Record<string, boolean>;
  onToggle: (itemId: string) => void;
  onRestore: (itemId: string, itemName: string) => void;
}

const assigneeStyle: Record<Assignee, string> = {
  함께: "bg-honey-100 text-honey-800",
  신랑: "bg-mint-200 text-mint-700",
  신부: "bg-coral-200 text-coral-700",
};

export default function ChecklistSearchResults({
  activeMatches,
  hiddenMatches,
  doneMap,
  onToggle,
  onRestore,
}: Props) {
  return (
    <div className="space-y-4">
      {activeMatches.length > 0 ? (
        <section aria-label={`활성 항목 ${activeMatches.length}건`}>
          <h3 className="px-1 mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-muted">
            활성 · {activeMatches.length}건
          </h3>
          <ul className="overflow-hidden rounded-2xl border border-paper-line bg-paper-surface">
            {activeMatches.map((m, idx) => {
              const isDone = !!doneMap[m.item.id];
              return (
                <li
                  key={m.item.id}
                  className={`flex items-center gap-2.5 px-4 py-3 ${
                    idx !== 0 ? "border-t border-paper-line" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggle(m.item.id)}
                    aria-label={isDone ? "완료 해제" : "완료 표시"}
                    className="shrink-0"
                  >
                    <span
                      role="checkbox"
                      aria-checked={isDone}
                      className={`block h-5 w-5 rounded-md border-[1.5px] flex items-center justify-center ${
                        isDone
                          ? "border-coral-500 bg-coral-500 text-white"
                          : "border-paper-line"
                      }`}
                    >
                      {isDone && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[13.5px] tracking-tight ${
                        isDone ? "text-ink-muted line-through" : "text-ink"
                      }`}
                    >
                      {m.item.name}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-ink-muted">
                      <span aria-hidden="true">{m.groupIcon}</span> {m.groupTitle}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                      assigneeStyle[m.item.who]
                    }`}
                    aria-label={`담당 ${m.item.who}`}
                  >
                    {m.item.who}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {hiddenMatches.length > 0 ? (
        <section aria-label={`숨긴 항목 ${hiddenMatches.length}건`}>
          <h3 className="px-1 mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-honey-700">
            숨김 처리됨 · {hiddenMatches.length}건
          </h3>
          <ul className="overflow-hidden rounded-2xl border border-honey-200 bg-honey-50">
            {hiddenMatches.map((m, idx) => (
              <li
                key={m.item.id}
                className={`flex items-center gap-2.5 px-4 py-3 ${
                  idx !== 0 ? "border-t border-honey-200" : ""
                }`}
              >
                <span aria-hidden="true" className="shrink-0 text-[16px]">
                  👀
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] tracking-tight text-ink">
                    {m.item.name}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-ink-muted">
                    <span aria-hidden="true">{m.groupIcon}</span> {m.groupTitle} · 숨겨둔 항목
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRestore(m.item.id, m.item.name)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-full bg-honey-600 px-3 py-1.5 text-[11.5px] font-semibold text-white active:scale-95 transition"
                >
                  <RotateCcw size={11} strokeWidth={2.4} />
                  다시 담기
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
