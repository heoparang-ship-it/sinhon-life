"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import { cn } from "./cn";

export interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, id, checked, className, ...props },
  ref,
) {
  const auto = useId();
  const tid = id ?? auto;
  return (
    <label htmlFor={tid} className="inline-flex items-center gap-xs cursor-pointer select-none">
      {label && <span className="text-body text-ink">{label}</span>}
      <span className="relative inline-flex">
        <input ref={ref} id={tid} type="checkbox" checked={checked} className="peer sr-only" {...props} />
        <span
          aria-hidden
          className={cn(
            "w-11 h-6 rounded-pill transition-colors duration-base ease-standard " +
              "peer-focus-visible:shadow-ring-brand",
            checked ? "bg-coral-500" : "bg-paper-line",
            className,
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-pill bg-paper-surface shadow-xs " +
              "transition-transform duration-base ease-standard",
            checked && "translate-x-5",
          )}
        />
      </span>
    </label>
  );
});

export default Toggle;
