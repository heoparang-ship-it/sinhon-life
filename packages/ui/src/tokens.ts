import type { CSSProperties } from "react";

export const colors = {
  accent: "#315c45",
  accentSoft: "#e7f1ea",
  background: "#f7f8f5",
  border: "#dfe6db",
  danger: "#b42318",
  dangerSoft: "#fee4e2",
  info: "#2563eb",
  infoSoft: "#dbeafe",
  muted: "#5d665e",
  mutedSoft: "#eef2ec",
  panel: "#ffffff",
  success: "#167447",
  successSoft: "#dcfae6",
  text: "#171717",
  warning: "#b54708",
  warningSoft: "#fef0c7"
} as const;

export const radii = {
  control: 8,
  panel: 8,
  round: 999
} as const;

export const shadows = {
  floating: "0 18px 48px rgba(18, 32, 24, 0.18)",
  soft: "0 8px 28px rgba(18, 32, 24, 0.08)"
} as const;

export const typography = {
  body: {
    fontSize: 15,
    lineHeight: 1.6
  },
  caption: {
    fontSize: 13,
    lineHeight: 1.45
  },
  heading: {
    fontSize: 22,
    lineHeight: 1.25
  },
  label: {
    fontSize: 14,
    fontWeight: 800,
    lineHeight: 1.35
  }
} satisfies Record<string, CSSProperties>;

export const controlBaseStyle: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: radii.control,
  color: colors.text,
  font: "inherit",
  fontSize: 15,
  minHeight: 44,
  outlineOffset: 3
};

export function mergeStyles(...styles: Array<CSSProperties | undefined>): CSSProperties {
  return Object.assign({}, ...styles);
}
