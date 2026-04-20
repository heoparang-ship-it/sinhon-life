"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { fadeInOut, prefersReducedMotion, sheetVariants } from "@/lib/motion";
import { cn } from "./cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Pixels from top of the sheet — default leaves 8vh of backdrop visible. */
  insetTopVh?: number;
  className?: string;
}

/**
 * Bottom sheet with drag-to-dismiss. Implements RFP §9.1 motion #7
 * (gesture-aware inertia) via framer-motion spring + onDragEnd.
 */
export default function Sheet({
  open,
  onClose,
  title,
  children,
  insetTopVh = 8,
  className,
}: SheetProps) {
  const reduced = prefersReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-ink/40 z-sheet"
            variants={fadeInOut(reduced)}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "fixed left-0 right-0 bottom-0 z-sheet bg-paper-surface rounded-t-2xl " +
                "shadow-overlay max-h-[92vh] overflow-hidden flex flex-col",
              className,
            )}
            style={{ marginTop: `${insetTopVh}vh` }}
            variants={sheetVariants(reduced)}
            initial="closed"
            animate="open"
            exit="closed"
            drag={reduced ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="flex justify-center pt-xs pb-3xs" aria-hidden>
              <span className="h-1 w-10 rounded-pill bg-paper-line" />
            </div>
            {title && (
              <header className="flex items-center justify-between px-md pb-xs border-b border-paper-line">
                <h2 className="text-subtitle text-ink font-semibold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="닫기"
                  className="p-2xs rounded-pill hover:bg-paper-line/60 transition-colors"
                >
                  <X className="h-5 w-5 text-ink-soft" />
                </button>
              </header>
            )}
            <div className="flex-1 overflow-y-auto px-md py-md">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
