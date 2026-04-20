"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { fadeInOut, prefersReducedMotion } from "@/lib/motion";
import { cn } from "./cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const reduced = prefersReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-modal flex items-center justify-center p-md"
          variants={fadeInOut(reduced)}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative w-full max-w-sm bg-paper-surface rounded-xl shadow-lg overflow-hidden",
              className,
            )}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            transition={{ duration: 0.22 }}
          >
            {title && (
              <header className="flex items-center justify-between px-md py-sm border-b border-paper-line">
                <h2 className="text-subtitle text-ink font-semibold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="닫기"
                  className="p-2xs rounded-pill hover:bg-paper-line/60"
                >
                  <X className="h-5 w-5 text-ink-soft" />
                </button>
              </header>
            )}
            <div className="px-md py-md text-body text-ink">{children}</div>
            {footer && (
              <footer className="px-md py-sm border-t border-paper-line flex items-center justify-end gap-2xs">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
