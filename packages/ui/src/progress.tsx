import { useId } from "react";
import { colors, radii, typography } from "./tokens";

export type ProgressProps = {
  label?: string;
  max?: number;
  showValue?: boolean;
  value: number;
};

export function Progress({ label, max = 100, showValue = true, value }: ProgressProps) {
  const progressId = useId();
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = Math.round((normalizedValue / max) * 100);

  return (
    <div aria-labelledby={label ? progressId : undefined} style={{ display: "grid", gap: 8 }}>
      {label || showValue ? (
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 12,
            justifyContent: "space-between"
          }}
        >
          {label ? (
            <span id={progressId} style={{ ...typography.label }}>
              {label}
            </span>
          ) : null}
          {showValue ? (
            <span style={{ color: colors.muted, ...typography.caption }}>{percentage}%</span>
          ) : null}
        </div>
      ) : null}
      <div
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={normalizedValue}
        role="progressbar"
        style={{
          background: colors.mutedSoft,
          borderRadius: radii.round,
          height: 10,
          overflow: "hidden"
        }}
      >
        <span
          style={{
            background: colors.accent,
            borderRadius: radii.round,
            display: "block",
            height: "100%",
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  );
}

export type StepStatus = "complete" | "current" | "upcoming";

export type StepperStep = {
  description?: string;
  label: string;
  status: StepStatus;
};

export type StepperProps = {
  steps: StepperStep[];
};

const stepColors: Record<StepStatus, { background: string; border: string; color: string }> = {
  complete: {
    background: colors.successSoft,
    border: colors.success,
    color: colors.success
  },
  current: {
    background: colors.accentSoft,
    border: colors.accent,
    color: colors.accent
  },
  upcoming: {
    background: colors.panel,
    border: colors.border,
    color: colors.muted
  }
};

export function Stepper({ steps }: StepperProps) {
  return (
    <ol style={{ display: "grid", gap: 10, listStyle: "none", margin: 0, padding: 0 }}>
      {steps.map((step, index) => {
        const tone = stepColors[step.status];

        return (
          <li
            aria-current={step.status === "current" ? "step" : undefined}
            key={`${step.label}-${index}`}
            style={{
              alignItems: "flex-start",
              background: tone.background,
              border: `1px solid ${tone.border}`,
              borderRadius: radii.panel,
              display: "flex",
              gap: 12,
              minHeight: 52,
              padding: 12
            }}
          >
            <span
              aria-hidden="true"
              style={{
                alignItems: "center",
                background: tone.color,
                borderRadius: radii.round,
                color: colors.panel,
                display: "inline-flex",
                flex: "0 0 auto",
                fontSize: 13,
                fontWeight: 800,
                height: 28,
                justifyContent: "center",
                width: 28
              }}
            >
              {index + 1}
            </span>
            <span>
              <strong style={{ display: "block", fontSize: 15 }}>{step.label}</strong>
              {step.description ? (
                <span style={{ color: colors.muted, ...typography.caption }}>
                  {step.description}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
