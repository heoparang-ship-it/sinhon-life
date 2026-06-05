import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { colors, controlBaseStyle, mergeStyles, radii } from "./tokens";

export type ButtonVariant = "danger" | "ghost" | "primary" | "secondary";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  iconAfter?: ReactNode;
  iconBefore?: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
};

const buttonStyles: Record<ButtonVariant, CSSProperties> = {
  danger: {
    background: colors.danger,
    borderColor: colors.danger,
    color: colors.panel
  },
  ghost: {
    background: "transparent",
    borderColor: "transparent",
    color: colors.accent
  },
  primary: {
    background: colors.accent,
    borderColor: colors.accent,
    color: colors.panel
  },
  secondary: {
    background: colors.panel,
    borderColor: "#b9c7b7",
    color: colors.accent
  }
};

export function Button({
  children,
  disabled,
  fullWidth = false,
  iconAfter,
  iconBefore,
  isLoading = false,
  style,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      type={type}
      style={mergeStyles(controlBaseStyle, {
        alignItems: "center",
        borderRadius: radii.control,
        cursor: isDisabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        gap: 8,
        fontSize: 15,
        fontWeight: 700,
        justifyContent: "center",
        minHeight: 44,
        opacity: isDisabled ? 0.58 : 1,
        padding: "0 18px",
        textAlign: "center",
        width: fullWidth ? "100%" : undefined,
        ...buttonStyles[variant],
        ...style
      })}
      {...props}
    >
      {isLoading ? <span aria-hidden="true">...</span> : iconBefore}
      {children}
      {iconAfter}
    </button>
  );
}
