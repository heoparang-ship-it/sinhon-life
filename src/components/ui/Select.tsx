"use client";

import { forwardRef, SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
  options: ReadonlyArray<SelectOption>;
}

const base =
  "w-full h-11 rounded-md border bg-paper-surface px-sm pr-2xl text-body text-ink " +
  "appearance-none transition-colors duration-quick focus-visible:outline-none disabled:opacity-50";

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helper, error, options, id, className, ...props },
  ref,
) {
  const auto = useId();
  const sid = id ?? auto;
  return (
    <label htmlFor={sid} className="block">
      {label && <span className="block text-caption font-semibold text-ink mb-3xs">{label}</span>}
      <span className="relative inline-block w-full">
        <select
          ref={ref}
          id={sid}
          aria-invalid={error ? true : undefined}
          className={cn(
            base,
            error
              ? "border-coral-700 focus:border-coral-700 focus:shadow-ring-brand"
              : "border-paper-line focus:border-coral-500 focus:shadow-ring-brand",
            className,
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-xs top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none"
          aria-hidden
        />
      </span>
      {error ? (
        <span className="mt-3xs block text-caption text-coral-700">{error}</span>
      ) : helper ? (
        <span className="mt-3xs block text-caption text-ink-soft">{helper}</span>
      ) : null}
    </label>
  );
});

export default Select;
