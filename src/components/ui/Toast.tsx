"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "./cn";

type Kind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: Kind;
  message: string;
  action?: { label: string; onClick: () => void };
}

interface ToastCtx {
  show: (opts: Omit<ToastItem, "id">) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be used inside <ToastProvider>");
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show: ToastCtx["show"] = useCallback((opts) => {
    const id = nextId.current++;
    setItems((xs) => [...xs, { id, ...opts }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500);
  }, []);

  const value = useMemo(() => ({ show }), [show]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="알림"
        className="fixed z-toast left-1/2 -translate-x-1/2 bottom-20 flex flex-col gap-2xs w-[92vw] max-w-sm pointer-events-none"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <ToastLine key={t.id} item={t} />
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

function ToastLine({ item }: { item: ToastItem }) {
  const Icon = item.kind === "success" ? CheckCircle2 : item.kind === "error" ? AlertCircle : Info;
  const tone =
    item.kind === "success"
      ? "bg-mint-500 text-white"
      : item.kind === "error"
        ? "bg-coral-700 text-white"
        : "bg-ink text-white";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className={cn(
        "pointer-events-auto rounded-lg px-md py-sm shadow-lg flex items-center gap-2xs",
        tone,
      )}
      role={item.kind === "error" ? "alert" : "status"}
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
      <span className="text-caption flex-1">{item.message}</span>
      {item.action && (
        <button
          type="button"
          onClick={item.action.onClick}
          className="text-caption font-semibold underline underline-offset-2"
        >
          {item.action.label}
        </button>
      )}
    </motion.div>
  );
}

export default ToastProvider;
