import { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-10 w-10 text-caption",
  lg: "h-14 w-14 text-subtitle",
} as const;

function initials(name?: string) {
  if (!name) return "신";
  const trimmed = name.trim();
  if (!trimmed) return "신";
  // Korean names: take last 2 characters (surname + given head).
  if (/^[\uAC00-\uD7AF]+$/.test(trimmed)) return trimmed.slice(-2);
  // Latin: first letters of up to 2 words.
  return trimmed.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-pill bg-coral-100 text-coral-700 font-bold overflow-hidden",
        sizes[size],
        className,
      )}
      aria-label={name ? `${name} 프로필` : "프로필"}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
