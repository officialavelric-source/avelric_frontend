import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ANNOUNCEMENT_MESSAGES } from "../../constants/announcements";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export default function AnnouncementBar() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((d: number) => {
    setDir(d);
    setIndex((i) => (i + d + ANNOUNCEMENT_MESSAGES.length) % ANNOUNCEMENT_MESSAGES.length);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [go, reduce]);

  return (
    <div className="relative z-50 bg-softblack text-ivory">
      <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between px-3 md:px-5">
        <button onClick={() => go(-1)} aria-label="Previous announcement" className="p-1.5 text-ivory/70 transition-colors hover:text-ivory">
          <Chevron dir="left" />
        </button>

        <div className="relative h-full flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              initial={reduce ? {} : { y: dir * 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? {} : { y: dir * -14, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="label absolute inset-0 flex items-center justify-center text-center text-[10px] text-ivory/90"
            >
              {ANNOUNCEMENT_MESSAGES[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          <button className="label hidden items-center gap-1 text-[10px] text-ivory/80 transition-colors hover:text-ivory sm:flex" aria-label="Change region, currently India INR">
            India (INR ₹)
          </button>
          <button onClick={() => go(1)} aria-label="Next announcement" className="p-1.5 text-ivory/70 transition-colors hover:text-ivory">
            <Chevron dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}
