"use client";

// V3.2 S1 · F4 체크리스트 검색 입력창.
// Spec: docs/2026-04-21_V3.2_S0_UX_DECISIONS.md §2 + 사용자 F4 피드백.
//
// 동작:
//   - 검색어 비어있을 때: 기본 placeholder "추가할 항목 검색 · 숨긴 N개 포함"
//   - N = 숨긴(removedCount) 항목 수. 0이면 "추가할 항목 검색"만 노출.
//   - onChange 즉시 상위 state 갱신 (필터는 실시간).
//   - 분석 이벤트 `checklist_search_input`는 300ms 디바운스로 상위에서 발화.
//   - 44×44 hit area, 명확한 clear 버튼.

import { useId } from "react";

interface Props {
  value: string;
  onChange: (next: string) => void;
  hiddenCount: number;
}

export default function ChecklistSearch({ value, onChange, hiddenCount }: Props) {
  const inputId = useId();
  const placeholder =
    hiddenCount > 0
      ? `추가할 항목 검색 · 숨긴 ${hiddenCount}개 포함`
      : "추가할 항목 검색";

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        체크리스트 항목 검색
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
      >
        🔍
      </span>
      <input
        id={inputId}
        type="search"
        inputMode="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-paper-line bg-paper-surface py-3 pl-11 pr-11 text-[14px] text-ink placeholder:text-ink-muted focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-200"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted active:bg-paper-alt"
        >
          <span aria-hidden="true" className="text-[13px]">
            ✕
          </span>
        </button>
      ) : null}
    </div>
  );
}
