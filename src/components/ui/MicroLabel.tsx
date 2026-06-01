import type { CSSProperties, ReactNode } from "react";

export function MicroLabel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`text-[10.5px] font-bold uppercase tracking-[0.12em] text-mute ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
