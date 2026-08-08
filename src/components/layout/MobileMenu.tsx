import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "../common/Icon";
import { NAV_LINKS } from "../../constants/navigation";

/* Mobile drawer — hamesha solid softblack, navbar tone se independent */

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-softblack/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.nav
            aria-label="Mobile"
            className="flex h-full w-[84%] max-w-sm flex-col bg-softblack p-8 text-ivory"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl tracking-[0.28em]">AVELRIC</span>
              <button onClick={onClose} aria-label="Close menu" className="p-2">
                <Icon label="Close" path="M6 6l12 12M18 6L6 18" />
              </button>
            </div>
            <div className="mt-12 flex flex-col gap-7">
              {[{ label: "Home", to: "/" }, ...NAV_LINKS, { label: "FAQ", to: "/faq" }].map((n, i) => (
                <motion.div
                  key={n.label}
                  initial={reduce ? {} : { x: -18, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link to={n.to} onClick={onClose} className="font-display text-2xl">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto border-t border-ivory/10 pt-6">
              <Link to="/account" onClick={onClose} className="label text-[11px] text-ivory/70">
                Account →
              </Link>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
