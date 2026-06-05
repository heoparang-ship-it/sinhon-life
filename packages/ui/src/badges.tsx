import type { CSSProperties, ReactNode } from "react";
import { colors, mergeStyles, radii, typography } from "./tokens";

type BadgeTone = "danger" | "info" | "neutral" | "success" | "warning";

type BadgeProps = {
  children: ReactNode;
  style?: CSSProperties;
  tone?: BadgeTone;
};

const badgeToneStyles: Record<BadgeTone, CSSProperties> = {
  danger: {
    background: colors.dangerSoft,
    color: colors.danger
  },
  info: {
    background: colors.infoSoft,
    color: colors.info
  },
  neutral: {
    background: colors.mutedSoft,
    color: colors.muted
  },
  success: {
    background: colors.successSoft,
    color: colors.success
  },
  warning: {
    background: colors.warningSoft,
    color: colors.warning
  }
};

function Badge({ children, style, tone = "neutral" }: BadgeProps) {
  return (
    <span
      style={mergeStyles(
        {
          alignItems: "center",
          borderRadius: radii.round,
          display: "inline-flex",
          fontSize: 13,
          fontWeight: 800,
          gap: 6,
          lineHeight: 1,
          minHeight: 28,
          padding: "0 10px",
          whiteSpace: "normal"
        },
        badgeToneStyles[tone],
        style
      )}
    >
      {children}
    </span>
  );
}

export type TrustBadgeProps = {
  label?: string;
  verifiedAt?: Date | string;
};

export function TrustBadge({ label = "검증됨", verifiedAt }: TrustBadgeProps) {
  const dateText =
    typeof verifiedAt === "string" ? verifiedAt : verifiedAt?.toLocaleDateString("ko-KR");

  return (
    <Badge tone="success">
      {label}
      {dateText ? <span style={{ ...typography.caption, fontWeight: 700 }}>{dateText}</span> : null}
    </Badge>
  );
}

export type SourceBadgeProps = {
  sourceLabel: string;
  sourceUpdatedAt?: Date | string;
};

export function SourceBadge({ sourceLabel, sourceUpdatedAt }: SourceBadgeProps) {
  const dateText =
    typeof sourceUpdatedAt === "string"
      ? sourceUpdatedAt
      : sourceUpdatedAt?.toLocaleDateString("ko-KR");

  return (
    <Badge tone="info">
      출처 {sourceLabel}
      {dateText ? <span style={{ ...typography.caption, fontWeight: 700 }}>{dateText}</span> : null}
    </Badge>
  );
}

type ApprovalStatus = "approved" | "pending" | "rejected";

export type ApprovalBadgeProps = {
  status: ApprovalStatus;
};

const approvalLabels: Record<ApprovalStatus, string> = {
  approved: "승인",
  pending: "대기",
  rejected: "반려"
};

const approvalTones: Record<ApprovalStatus, BadgeTone> = {
  approved: "success",
  pending: "warning",
  rejected: "danger"
};

export function ApprovalBadge({ status }: ApprovalBadgeProps) {
  return <Badge tone={approvalTones[status]}>{approvalLabels[status]}</Badge>;
}
