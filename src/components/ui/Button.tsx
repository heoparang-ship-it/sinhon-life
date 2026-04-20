"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "floating";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2xs font-semibold rounded-lg " +
  "transition-all duration-base ease-standard select-none " +
  "focus-visible:outline-none focus-visible:shadow-ring-brand " +
  "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700",
  secondary: "bg-mint-500 text-white hover:bg-mint-600 active:bg-mint-700",
  ghost: "bg-transparent text-ink hover:bg-paper-line/70",
  destructive: "bg-coral-700 text-white hover:bg-coral-800",
  floating:
    "bg-paper-surface text-ink shadow-md hover:shadow-lg border border-paper-line",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-sm text-caption",
  md: "h-11 px-md text-body",
  lg: "h-13 px-lg text-body-lg min-h-[48px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        leftIcon
      )}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
