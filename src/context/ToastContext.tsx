import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export interface Toast {
  id: number;
  message: string;
  image?: string;
  action?: { label: string; to: string };
}

interface ToastCtx {
  push: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2800);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-softblack px-4 py-3 text-ivory shadow-xl shadow-softblack/25"
              role="status"
            >
              {t.image && (
                <img src={t.image} alt="" className="h-11 w-9 shrink-0 rounded-lg object-cover" />
              )}
              <p className="flex-1 text-[13.5px] leading-snug">{t.message}</p>
              {t.action && (
                <Link to={t.action.to} className="label shrink-0 rounded-full bg-ivory px-3.5 py-2 text-[10px] text-softblack">
                  {t.action.label}
                </Link>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
