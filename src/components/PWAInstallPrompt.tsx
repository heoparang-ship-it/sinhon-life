"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui";
import { sheetVariants } from "@/lib/motion";

const DISMISSED_KEY = "sinhon-pwa-dismissed-v1";
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

function wasRecentlyDismissed() {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  const t = Number(raw);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < DISMISS_DAYS * 86400 * 1000;
}

/**
 * PWA install prompt — listens for `beforeinstallprompt`, shows a
 * dismissible bottom card after 20s of active session.
 * Respects "don't ask again" for 14 days.
 */
export default function PWAInstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (wasRecentlyDismissed()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      const t = setTimeout(() => setOpen(true), 20000);
      return () => clearTimeout(t);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    try {
      await evt.userChoice;
    } finally {
      setEvt(null);
      setOpen(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && evt && (
        <motion.div
          variants={sheetVariants()}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed left-0 right-0 bottom-0 z-sheet px-md pb-md"
          role="dialog"
          aria-labelledby="pwa-install-title"
        >
          <div className="mx-auto max-w-sm rounded-xl bg-paper-surface border border-paper-line shadow-lg p-md">
            <div className="flex items-start gap-xs">
              <div className="flex-shrink-0 h-10 w-10 rounded-pill bg-coral-100 text-coral-700 flex items-center justify-center">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="pwa-install-title" className="text-body font-semibold text-ink">
                  홈 화면에 추가하기
                </h3>
                <p className="text-caption text-ink-soft mt-3xs">
                  신혼생활을 앱처럼 빠르게 열어볼 수 있어요.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="닫기"
                className="p-xs -mr-xs -mt-xs rounded-full hover:bg-paper-line/60"
              >
                <X className="h-4 w-4 text-ink-muted" />
              </button>
            </div>
            <div className="flex gap-xs mt-sm">
              <Button variant="ghost" onClick={dismiss} className="flex-1">
                나중에
              </Button>
              <Button onClick={install} className="flex-1">
                설치
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
