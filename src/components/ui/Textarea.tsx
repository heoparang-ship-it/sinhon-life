"use client";

import { forwardRef, TextareaHTMLAttributes, useId } from "react";
import { cn } from "./cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
}

const base =
  "w-full min-h-[96px] rounded-md border bg-paper-surface p-sm text-body text-ink " +
  "placeholder:text-ink-muted transition-colors duration-quick focus-visible:outline-none " +
  "disabled:opacity-50 resize-y";

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helper, error, id, className, ...props },
  ref,
) {
  const auto = useId();
  const tid = id ?? auto;
  const describedBy = error ? `${tid}-err` : helper ? `${tid}-help` : undefined;
  return (
    <label htmlFor={tid} className="block">
      {label && <span className="block text-caption font-semibold text-ink mb-3xs">{label}</span>}
      <textarea
        ref={ref}
        id={tid}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          base,
          error
            ? "border-coral-700 focus:border-coral-700 focus:shadow-ring-brand"
            : "border-paper-line focus:border-coral-500 focus:shadow-ring-brand",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={`${tid}-err`} className="mt-3xs block text-caption text-coral-700">
          {error}
        </span>
      ) : helper ? (
        <span id={`${tid}-help`} className="mt-3xs block text-caption text-ink-soft">
          {helper}
        </span>
      ) : null}
    </label>
  );
});

export default Textarea;
