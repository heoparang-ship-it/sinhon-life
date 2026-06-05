import type { ReactNode } from "react";
import { colors, mergeStyles, radii, typography } from "./tokens";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  tone?: "danger" | "neutral";
  title: string;
};

function StateFrame({ action, description, tone = "neutral", title }: EmptyStateProps) {
  const isDanger = tone === "danger";

  return (
    <section
      aria-live={isDanger ? "assertive" : "polite"}
      style={mergeStyles({
        background: colors.panel,
        border: `1px solid ${isDanger ? "#fecdca" : colors.border}`,
        borderRadius: radii.panel,
        padding: 28
      })}
    >
      <h2 style={{ ...typography.heading, margin: 0 }}>{title}</h2>
      <p style={{ color: colors.muted, ...typography.body, margin: "12px 0 20px" }}>
        {description}
      </p>
      {action}
    </section>
  );
}

export function EmptyState(props: EmptyStateProps) {
  return <StateFrame {...props} />;
}

export function ErrorState(props: Omit<EmptyStateProps, "tone">) {
  return <StateFrame {...props} tone="danger" />;
}

export function LoadingState({
  description = "잠시만 기다려 주세요.",
  title = "불러오는 중입니다"
}: Partial<Pick<EmptyStateProps, "description" | "title">>) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      style={{
        alignItems: "center",
        background: colors.panel,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.panel,
        display: "flex",
        gap: 14,
        padding: 20
      }}
    >
      <span
        aria-hidden="true"
        style={{
          background: colors.accent,
          borderRadius: radii.round,
          display: "inline-block",
          height: 12,
          width: 12
        }}
      />
      <div>
        <strong style={{ display: "block", fontSize: 15 }}>{title}</strong>
        <span style={{ color: colors.muted, ...typography.caption }}>{description}</span>
      </div>
    </section>
  );
}
