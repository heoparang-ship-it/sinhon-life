"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import { Check } from "lucide-react";
import { cn } from "./cn";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className, checked, ...props },
  ref,
) {
  const auto = useId();
  const cid = id ?? auto;
  return (
    <label htmlFor={cid} className="inline-flex items-start gap-2xs cursor-pointer select-none">
      <span className="relative inline-flex">
        <input
          ref={ref}
          id={cid}
          type="checkbox"
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "w-5 h-5 rounded-sm border-2 bg-paper-surface transition-all duration-quick " +
              "peer-focus-visible:shadow-ring-brand",
            checked
              ? "bg-coral-500 border-coral-500"
              : "border-paper-line peer-hover:border-coral-300",
            className,
          )}
        />
        {checked && (
          <Check
            aria-hidden
            className="absolute inset-0 m-auto h-3.5 w-3.5 text-white pointer-events-none"
          />
        )}
      </span>
      {label && <span className="text-body text-ink leading-snug">{label}</span>}
    </label>
  );
});

export default Checkbox;
