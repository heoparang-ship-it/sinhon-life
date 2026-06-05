import type { HTMLAttributes, ReactNode } from "react";
import { ApprovalBadge, SourceBadge, TrustBadge } from "./badges";
import { colors, mergeStyles, radii, shadows, typography } from "./tokens";

export type CardProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  description?: string;
  footer?: ReactNode;
  title?: string;
};

export function Card({ children, description, footer, style, title, ...props }: CardProps) {
  return (
    <section
      style={mergeStyles(
        {
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.panel,
          boxShadow: shadows.soft,
          padding: 20
        },
        style
      )}
      {...props}
    >
      {title ? <h3 style={{ ...typography.heading, fontSize: 18, margin: 0 }}>{title}</h3> : null}
      {description ? (
        <p style={{ color: colors.muted, ...typography.body, margin: "8px 0 0" }}>{description}</p>
      ) : null}
      {children ? <div style={{ marginTop: title || description ? 16 : 0 }}>{children}</div> : null}
      {footer ? <footer style={{ marginTop: 18 }}>{footer}</footer> : null}
    </section>
  );
}

export type PriceCardProps = {
  approvalStatus?: "approved" | "pending" | "rejected";
  basePriceAmount?: number | null;
  currency?: "KRW";
  description?: string;
  estimatedTotalPriceAmount?: number | null;
  includedItems?: Array<
    | string
    | {
        description?: string;
        key?: string;
        label: string;
        quantity?: number;
        unit?: string;
      }
  >;
  optionalOptions?: PriceCardOption[];
  priceAmount?: number | null;
  priceLabel?: string;
  requiredOptions?: PriceCardOption[];
  sourceLabel: string;
  sourceUpdatedAt?: Date | string;
  title: string;
  validUntil?: Date | string;
  validityStatus?: string;
  vendorName: string;
  verificationStatus?: string;
  verifiedAt?: Date | string;
};

type PriceCardOption = {
  amount?: number;
  includedInEstimatedTotal?: boolean;
  key?: string;
  label: string;
  maxAmount?: number;
  minAmount?: number;
  note?: string;
  pricingType?: "fixed" | "quote_required" | "range" | string;
};

function formatKrw(amount: number) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "KRW"
  }).format(amount);
}

function formatDate(date: Date | string | undefined) {
  if (!date) return undefined;
  if (date instanceof Date) return date.toLocaleDateString("ko-KR");

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString("ko-KR");
}

function formatMaybeKrw(amount: number | null | undefined) {
  return typeof amount === "number" ? formatKrw(amount) : "상담 후 산정";
}

function formatOptionPrice(option: PriceCardOption) {
  if (option.pricingType === "range") {
    if (typeof option.minAmount === "number" && typeof option.maxAmount === "number") {
      return `${formatKrw(option.minAmount)} ~ ${formatKrw(option.maxAmount)}`;
    }

    if (typeof option.minAmount === "number") return `${formatKrw(option.minAmount)}부터`;
    if (typeof option.maxAmount === "number") return `${formatKrw(option.maxAmount)}까지`;
  }

  if (typeof option.amount === "number") return formatKrw(option.amount);
  return "상담 후 산정";
}

function verificationLabel(status: string | undefined) {
  const labels: Record<string, string> = {
    expired: "만료",
    needs_review: "검토 필요",
    rejected: "반려",
    unverified: "검증 대기",
    verified: "검증됨"
  };

  return status ? (labels[status] ?? status) : "검증됨";
}

function validityLabel(status: string | undefined) {
  const labels: Record<string, string> = {
    expired: "만료됨",
    valid: "유효",
    validity_not_recorded: "유효기간 미기록"
  };

  return status ? (labels[status] ?? status) : undefined;
}

function normalizeIncludedItem(item: NonNullable<PriceCardProps["includedItems"]>[number]): {
  description?: string;
  key: string;
  label: string;
  meta?: string;
} {
  if (typeof item === "string") {
    return {
      key: item,
      label: item
    };
  }

  return {
    description: item.description,
    key: item.key ?? item.label,
    label: item.label,
    meta:
      typeof item.quantity === "number"
        ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
        : undefined
  };
}

function PriceOptionList({ options }: { options: PriceCardOption[] }) {
  return (
    <ul style={{ display: "grid", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
      {options.map((option) => (
        <li
          key={option.key ?? option.label}
          style={{
            alignItems: "baseline",
            borderTop: `1px solid ${colors.border}`,
            display: "grid",
            gap: 4,
            gridTemplateColumns: "minmax(0, 1fr) auto",
            paddingTop: 8
          }}
        >
          <span style={{ color: colors.text, fontSize: 14, fontWeight: 800 }}>{option.label}</span>
          <strong style={{ fontSize: 14 }}>{formatOptionPrice(option)}</strong>
          {option.note ? (
            <small style={{ color: colors.muted, ...typography.caption, gridColumn: "1 / -1" }}>
              {option.note}
            </small>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function PriceCard({
  approvalStatus,
  basePriceAmount,
  description,
  estimatedTotalPriceAmount,
  includedItems = [],
  optionalOptions = [],
  priceAmount,
  priceLabel = "예상 총액",
  requiredOptions = [],
  sourceLabel,
  sourceUpdatedAt,
  title,
  validUntil,
  validityStatus,
  vendorName,
  verificationStatus = "verified",
  verifiedAt
}: PriceCardProps) {
  const displayAmount = estimatedTotalPriceAmount ?? priceAmount;
  const normalizedIncludedItems = includedItems.map(normalizeIncludedItem);
  const validUntilText = formatDate(validUntil);
  const currentValidityLabel = validityLabel(validityStatus);

  return (
    <Card
      aria-label={`${title} 가격 카드`}
      footer={
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <SourceBadge sourceLabel={sourceLabel} sourceUpdatedAt={sourceUpdatedAt} />
          <TrustBadge label={verificationLabel(verificationStatus)} verifiedAt={verifiedAt} />
          {approvalStatus ? <ApprovalBadge status={approvalStatus} /> : null}
        </div>
      }
      style={{ boxShadow: "none" }}
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <p style={{ color: colors.muted, fontSize: 13, fontWeight: 800, margin: "0 0 6px" }}>
            {vendorName}
          </p>
          <h3 style={{ fontSize: 20, lineHeight: 1.25, margin: 0 }}>{title}</h3>
          {description ? (
            <p style={{ color: colors.muted, ...typography.body, margin: "8px 0 0" }}>
              {description}
            </p>
          ) : null}
        </div>

        <div
          style={{
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.panel,
            padding: 16
          }}
        >
          <p style={{ color: colors.muted, fontSize: 13, fontWeight: 800, margin: "0 0 6px" }}>
            {priceLabel}
          </p>
          <strong style={{ display: "block", fontSize: 28, lineHeight: 1.1 }}>
            {formatMaybeKrw(displayAmount)}
          </strong>
          {typeof basePriceAmount === "number" ? (
            <span
              style={{
                color: colors.muted,
                ...typography.caption,
                display: "block",
                marginTop: 8
              }}
            >
              기준가 {formatKrw(basePriceAmount)}
            </span>
          ) : null}
          {validUntilText || currentValidityLabel ? (
            <span
              style={{
                color: validityStatus === "expired" ? colors.danger : colors.warning,
                ...typography.caption,
                display: "block",
                marginTop: 8
              }}
            >
              {currentValidityLabel ? `${currentValidityLabel} · ` : null}
              {validUntilText ? `유효기간 ${validUntilText}까지` : "유효기간 미기록"}
            </span>
          ) : null}
        </div>

        {normalizedIncludedItems.length ? (
          <section aria-label="포함 항목" style={{ display: "grid", gap: 8 }}>
            <h4 style={{ fontSize: 14, margin: 0 }}>포함 항목</h4>
            <ul style={{ display: "grid", gap: 6, margin: 0, padding: "0 0 0 18px" }}>
              {normalizedIncludedItems.map((item) => (
                <li key={item.key} style={{ color: colors.muted, ...typography.caption }}>
                  {item.label}
                  {item.meta ? ` · ${item.meta}` : null}
                  {item.description ? ` · ${item.description}` : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {requiredOptions.length ? (
          <section aria-label="필수 옵션" style={{ display: "grid", gap: 8 }}>
            <h4 style={{ fontSize: 14, margin: 0 }}>필수 옵션</h4>
            <PriceOptionList options={requiredOptions} />
          </section>
        ) : null}

        {optionalOptions.length ? (
          <section aria-label="선택 옵션" style={{ display: "grid", gap: 8 }}>
            <h4 style={{ fontSize: 14, margin: 0 }}>선택 옵션</h4>
            <PriceOptionList options={optionalOptions} />
          </section>
        ) : null}
      </div>
    </Card>
  );
}
