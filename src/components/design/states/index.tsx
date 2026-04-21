"use client";

// V3.2 S1 · 4 edge states (Empty / Loading / Error / Success).
// Spec: docs/2026-04-21_V3.2_S0_UX_DECISIONS.md §5.
// All four share the same container shape so swapping between them during
// transitions doesn't cause layout shift.

import type { ReactNode } from "react";

interface StateShellProps {
  icon: ReactNode;
  title: string;
  body?: string;
  cta?: ReactNode;
  tone?: "neutral" | "coral" | "mint" | "honey";
}

function StateShell({ icon, title, body, cta, tone = "neutral" }: StateShellProps) {
  const toneBg = {
    neutral: "bg-paper-surface",
    coral: "bg-coral-50",
    mint: "bg-mint-50",
    honey: "bg-honey-50",
  }[tone];

  return (
    <div
      className={`mx-auto flex w-full max-w-[320px] flex-col items-center justify-center gap-3 rounded-2xl px-6 py-10 text-center ${toneBg}`}
    >
      <div className="text-[32px] leading-none" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-ink wb-keep">{title}</h3>
      {body ? <p className="text-[12.5px] leading-relaxed text-ink-soft wb-keep">{body}</p> : null}
      {cta ? <div className="mt-2">{cta}</div> : null}
    </div>
  );
}

// --- Empty --------------------------------------------------------------------

export interface EmptyStateProps {
  title?: string;
  body?: string;
  cta?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title = "아직 여기엔 아무것도 없어요",
  body,
  cta,
  icon = "🫧",
}: EmptyStateProps) {
  return <StateShell icon={icon} title={title} body={body} cta={cta} />;
}

// --- Loading ------------------------------------------------------------------

export interface LoadingStateProps {
  title?: string;
  showDelayedLabel?: boolean; // switch to text after 800ms from parent
}

export function LoadingState({
  title = "잠시만요",
  showDelayedLabel = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-[320px] flex-col items-center justify-center gap-3 rounded-2xl bg-paper-surface px-6 py-10 text-center"
    >
      <div className="flex gap-1" aria-hidden="true">
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-muted [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-muted [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-muted" />
      </div>
      <p className="text-[12.5px] text-ink-soft">
        {showDelayedLabel ? "AI가 준비 중이에요…" : title}
      </p>
    </div>
  );
}

// --- Error --------------------------------------------------------------------

export interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "잠시 다시 시도해 주세요",
  body,
  onRetry,
}: ErrorStateProps) {
  return (
    <StateShell
      icon="⚠️"
      title={title}
      body={body}
      tone="honey"
      cta={
        onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full border border-honey-600 px-4 py-1.5 text-[12.5px] font-semibold text-honey-700 active:scale-95"
          >
            다시 불러오기
          </button>
        ) : undefined
      }
    />
  );
}

// --- Success ------------------------------------------------------------------

export interface SuccessStateProps {
  title?: string;
  body?: string;
  cta?: ReactNode;
}

export function SuccessState({
  title = "결혼 준비 완료 — 수고 많으셨어요!",
  body = "앞으로의 추억도 sinhon.life에서 함께해요.",
  cta,
}: SuccessStateProps) {
  return <StateShell icon="🎉" title={title} body={body} cta={cta} tone="mint" />;
}
