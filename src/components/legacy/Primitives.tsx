"use client";
import type { CSSProperties, ReactNode } from "react";
import { T, G } from "@/lib/design/tokens";

export function MicroLabel({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: T.font,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: color || T.faint,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Pill({
  children,
  active,
  onWhite,
  style,
  size = 36,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onWhite?: boolean;
  style?: CSSProperties;
  size?: number;
  onClick?: () => void;
}) {
  const base: CSSProperties = onWhite
    ? {
        background: active ? G.pillActiveOnWhite : G.pillIdleOnWhite,
        color: active ? "#FFFFFF" : T.accentDeep,
      }
    : {
        background: active ? G.pillActiveOnBlue : T.glass,
        color: active ? T.ink : T.onBlue,
        backdropFilter: active ? "none" : "blur(8px)",
        WebkitBackdropFilter: active ? "none" : "blur(8px)",
        boxShadow: active ? "0 6px 18px -10px rgba(20,40,80,0.35)" : "none",
      };
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: size,
        padding: "0 16px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        WebkitUserSelect: "none",
        ...base,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function GlassBubble({
  size,
  top,
  left,
  right,
  bottom,
  opacity = 0.22,
  icon,
}: {
  size: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  opacity?: number;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,${opacity + 0.18}) 0%, rgba(255,255,255,${opacity}) 55%, rgba(255,255,255,${opacity * 0.4}) 100%)`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.78)",
        pointerEvents: "none",
      }}
    >
      {icon}
    </div>
  );
}

export function CharacterBubble({
  size = 108,
  label = "3D\ncharacter",
  style,
}: {
  size?: number;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.32) 55%, rgba(255,255,255,0.14) 100%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
          "0 22px 40px -18px rgba(20,40,80,0.40), inset 0 1px 0 rgba(255,255,255,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: T.font,
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.82)",
          textAlign: "center",
          lineHeight: 1.5,
          whiteSpace: "pre-line",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function VideoThumb({
  label,
  imageUrl,
  isVideo,
}: {
  label: string;
  imageUrl?: string | null;
  isVideo?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 5",
        borderRadius: 16,
        overflow: "hidden",
        background: T.surface,
        boxShadow: "0 18px 40px -28px rgba(20,40,80,0.22)",
      }}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={label}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
      {!imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(90,130,180,0.06) 0 1px, transparent 1px 16px)",
          }}
        />
      )}
      <div style={{ position: "absolute", top: 14, left: 16, zIndex: 2 }}>
        <span
          style={{
            fontFamily: T.font,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: imageUrl ? "#FFFFFF" : "#3B8BCF",
            opacity: imageUrl ? 0.95 : 0.65,
            textTransform: "uppercase",
            textShadow: imageUrl ? "0 1px 4px rgba(0,0,0,0.45)" : "none",
          }}
        >
          {label}
        </span>
      </div>
      {isVideo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <defs>
              <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#F0F7FD" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#DCECFA" stopOpacity="0.88" />
              </linearGradient>
            </defs>
            <circle
              cx="22"
              cy="22"
              r="21.5"
              fill="url(#pg)"
              stroke="rgba(59,139,207,0.20)"
              strokeWidth="1"
            />
            <path d="M19 15L28 22L19 29V15Z" fill="#3B8BCF" opacity="0.85" />
          </svg>
        </div>
      )}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.10) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

export function VideoCard({
  tags,
  title,
  dur,
  label,
  onClick,
  imageUrl,
  isVideo,
}: {
  tags: string[];
  title: string;
  dur: string;
  label: string;
  onClick?: () => void;
  imageUrl?: string | null;
  isVideo?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ position: "relative" }}>
        <VideoThumb label={label} imageUrl={imageUrl} isVideo={isVideo} />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            padding: "5px 12px",
            borderRadius: 999,
            background: G.glassChip,
            color: T.accentDeep,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "-0.005em",
            fontVariantNumeric: "tabular-nums",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 4px 12px -6px rgba(20,40,80,0.20)",
          }}
        >
          {dur}
        </div>
      </div>
      <div
        style={{
          padding: "0 4px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 14.5,
            color: T.ink,
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: "-0.02em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: T.mute,
            fontWeight: 400,
            letterSpacing: "-0.005em",
          }}
        >
          {tags.join("  ")}
        </div>
      </div>
    </div>
  );
}
