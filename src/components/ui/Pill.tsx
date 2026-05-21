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
      ? "linear-gradient(90deg, #2B7BC5 0%, #3B8BCF 55%, #5AA3DC 100%)"
      : onWhite
        ? "linear-gradient(90deg, #E6F0FA 0%, #EEF5FC 60%, #F2F7FC 100%)"
        : "rgba(255,255,255,0.20)",
    boxShadow: active
      ? "0 6px 14px -4px rgba(43,123,197,0.45), 0 2px 4px -1px rgba(43,123,197,0.30)"
      : "none",
    ...style,
  };
  return (
    <button type="button" onClick={onClick} className={className} style={baseStyle}>
      {children}
    </button>
  );
}
