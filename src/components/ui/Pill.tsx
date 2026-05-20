"use client";
import type { CSSProperties, ReactNode } from "react";

type PillProps = {
  children: ReactNode;
  active?: boolean;
  onWhite?: boolean;
  onClick?: () => void;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function Pill({
  children,
  active = false,
  onWhite = false,
  onClick,
  size = 36,
  className = "",
  style,
}: PillProps) {
  const baseStyle: CSSProperties = {
    height: size,
    padding: "0 14px",
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 750,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
    cursor: onClick ? "pointer" : "default",
    border: 0,
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: active ? "#FFFFFF" : onWhite ? "#3A4A5E" : "#FFFFFF",
    background: active
      ? "linear-gradient(90deg, #4A9BE0 0%, #6FB1EA 55%, #9CC8F2 100%)"
      : onWhite
        ? "linear-gradient(90deg, #E6F0FA 0%, #EEF5FC 60%, #F2F7FC 100%)"
        : "rgba(255,255,255,0.20)",
    boxShadow: active ? "0 10px 24px -16px rgba(74,155,224,0.55)" : "none",
    ...style,
  };
  return (
    <button type="button" onClick={onClick} className={className} style={baseStyle}>
      {children}
    </button>
  );
}
