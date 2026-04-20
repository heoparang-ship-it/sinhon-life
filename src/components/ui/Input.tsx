"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import { cn } from "./cn";

type Variant = "resting" | "error" | "success";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  variant?: Variant;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

const fieldBase =
  "w-full h-11 rounded-md border bg-paper-surface px-sm text-body text-ink " +
  "placeholder:text-ink-muted transition-colors duration-quick " +
  "focus-visible:outline-none disabled:opacity-50";

const variantClass: Record<Variant, string> = {
  resting: "border-paper-line focus:border-coral-500 focus:shadow-ring-brand",
  error: "border-coral-700 focus:border-coral-700 focus:shadow-ring-brand",
  success: "border-mint-500 focus:border-mint-500",
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, variant = "resting", leftSlot, rightSlot, id, className, ...props },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const describedBy = error ? `${inputId}-err` : helper ? `${inputId}-help` : undefined;
  const v: Variant = error ? "error" : variant;
  return (
    <label htmlFor={inputId} className="block">
      {label && <span className="block text-caption font-semibold text-ink mb-3xs">{label}</span>}
      <span className="relative inline-flex items-center w-full">
        {leftSlot && (
          <span className="absolute left-xs text-ink-muted pointer-events-none">{leftSlot}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={v === "error" || undefined}
          aria-describedby={describedBy}
          className={cn(
            fieldBase,
            variantClass[v],
            leftSlot ? "pl-2xl" : undefined,
            rightSlot ? "pr-2xl" : undefined,
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-xs text-ink-muted">{rightSlot}</span>
        )}
      </span>
      {error ? (
        <span id={`${inputId}-err`} className="mt-3xs block text-caption text-coral-700">
          {error}
        </span>
      ) : helper ? (
        <span id={`${inputId}-help`} className="mt-3xs block text-caption text-ink-soft">
          {helper}
        </span>
      ) : null}
    </label>
  );
});

export default Input;
