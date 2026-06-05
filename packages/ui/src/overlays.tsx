import { useEffect, useId, type CSSProperties, type ReactNode } from "react";
import { Button } from "./button";
import { colors, mergeStyles, radii, shadows, typography } from "./tokens";

type OverlayProps = {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

function useEscapeToClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);
}

const backdropStyle: CSSProperties = {
  alignItems: "center",
  background: "rgba(18, 32, 24, 0.42)",
  display: "flex",
  inset: 0,
  justifyContent: "center",
  padding: 16,
  position: "fixed",
  zIndex: 1000
};

export function Modal({
  children,
  closeLabel = "닫기",
  description,
  footer,
  onClose,
  open,
  title
}: OverlayProps) {
  const titleId = useId();
  const descriptionId = useId();
  useEscapeToClose(open, onClose);

  if (!open) return null;

  return (
    <div style={backdropStyle}>
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        style={{
          background: colors.panel,
          borderRadius: radii.panel,
          boxShadow: shadows.floating,
          maxWidth: 520,
          padding: 24,
          width: "100%"
        }}
      >
        <header
          style={{
            alignItems: "flex-start",
            display: "flex",
            gap: 16,
            justifyContent: "space-between"
          }}
        >
          <div>
            <h2 id={titleId} style={{ ...typography.heading, margin: 0 }}>
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                style={{ color: colors.muted, ...typography.body, margin: "8px 0 0" }}
              >
                {description}
              </p>
            ) : null}
          </div>
          <Button aria-label={closeLabel} onClick={onClose} variant="ghost">
            닫기
          </Button>
        </header>
        <div style={{ marginTop: 18 }}>{children}</div>
        {footer ? <footer style={{ marginTop: 20 }}>{footer}</footer> : null}
      </section>
    </div>
  );
}

export function Drawer({
  children,
  closeLabel = "닫기",
  description,
  footer,
  onClose,
  open,
  title
}: OverlayProps) {
  const titleId = useId();
  const descriptionId = useId();
  useEscapeToClose(open, onClose);

  if (!open) return null;

  return (
    <div
      style={mergeStyles(backdropStyle, {
        alignItems: "stretch",
        justifyContent: "flex-end",
        padding: 0
      })}
    >
      <aside
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        style={{
          background: colors.panel,
          boxShadow: shadows.floating,
          display: "flex",
          flexDirection: "column",
          maxWidth: 420,
          minHeight: "100%",
          padding: 24,
          width: "min(100%, 420px)"
        }}
      >
        <header
          style={{
            alignItems: "flex-start",
            display: "flex",
            gap: 16,
            justifyContent: "space-between"
          }}
        >
          <div>
            <h2 id={titleId} style={{ ...typography.heading, margin: 0 }}>
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                style={{ color: colors.muted, ...typography.body, margin: "8px 0 0" }}
              >
                {description}
              </p>
            ) : null}
          </div>
          <Button aria-label={closeLabel} onClick={onClose} variant="ghost">
            닫기
          </Button>
        </header>
        <div style={{ flex: 1, marginTop: 18 }}>{children}</div>
        {footer ? <footer style={{ marginTop: 20 }}>{footer}</footer> : null}
      </aside>
    </div>
  );
}

export type ToastProps = {
  action?: ReactNode;
  description?: string;
  title: string;
  tone?: "danger" | "info" | "success" | "warning";
};

const toastTones: Record<NonNullable<ToastProps["tone"]>, CSSProperties> = {
  danger: {
    borderColor: "#fecdca"
  },
  info: {
    borderColor: "#bfdbfe"
  },
  success: {
    borderColor: "#abefc6"
  },
  warning: {
    borderColor: "#fedf89"
  }
};

export function Toast({ action, description, title, tone = "info" }: ToastProps) {
  return (
    <section
      aria-live={tone === "danger" ? "assertive" : "polite"}
      role={tone === "danger" ? "alert" : "status"}
      style={mergeStyles(
        {
          alignItems: "flex-start",
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.panel,
          boxShadow: shadows.soft,
          display: "flex",
          gap: 14,
          justifyContent: "space-between",
          maxWidth: 420,
          padding: 16
        },
        toastTones[tone]
      )}
    >
      <div>
        <strong style={{ display: "block", fontSize: 15 }}>{title}</strong>
        {description ? (
          <p style={{ color: colors.muted, ...typography.caption, margin: "6px 0 0" }}>
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </section>
  );
}
