"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import { cn } from "./cn";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, id, checked, className, ...props },
  ref,
) {
  const auto = useId();
  const rid = id ?? auto;
  return (
    <label htmlFor={rid} className="inline-flex items-start gap-2xs cursor-pointer select-none">
      <span className="relative inline-flex">
        <input ref={ref} id={rid} type="radio" checked={checked} className="peer sr-only" {...props} />
        <span
          aria-hidden
          className={cn(
            "w-5 h-5 rounded-pill border-2 bg-paper-surface transition-colors duration-quick " +
              "peer-focus-visible:shadow-ring-brand",
            checked ? "border-coral-500" : "border-paper-line peer-hover:border-coral-300",
            className,
          )}
        />
        {checked && (
          <span
            aria-hidden
            className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-pill bg-coral-500 pointer-events-none"
          />
        )}
      </span>
      {label && <span className="text-body text-ink leading-snug">{label}</span>}
    </label>
  );
});

export default Radio;
