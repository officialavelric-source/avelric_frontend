import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon from "../common/Icon";
import { NAV_LINKS } from "../../constants/navigation";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

/* Mobile drawer — rendered via Portal to document.body so transforms/fixed contexts in header don't clip it */

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const { isAuthenticated, customer } = useCustomerAuth();
  const { pathname } = useLocation();

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (open) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.nav
            aria-label="Mobile Navigation"
            className="relative z-10 flex h-full w-[85%] max-w-[340px] flex-col overflow-y-auto bg-softblack p-6 text-ivory shadow-2xl sm:p-8"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Brand + Close */}
            <div className="flex items-center justify-between border-b border-ivory/10 pb-5">
              <span className="font-display text-xl tracking-[0.28em] text-ivory">AVELRIC</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ivory/80 transition-colors hover:bg-ivory/10 hover:text-ivory focus:outline-none"
              >
                <Icon label="Close" path="M6 6l12 12M18 6L6 18" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="mt-8 flex flex-col gap-5 sm:gap-6">
              {[{ label: "Home", to: "/" }, ...NAV_LINKS, { label: "FAQ", to: "/faq" }].map((n, i) => {
                const isActive = pathname === n.to;
                return (
                  <motion.div
                    key={n.label}
                    initial={reduce ? {} : { x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={n.to}
                      onClick={onClose}
                      className={`font-display text-2xl tracking-wide transition-colors ${isActive ? "text-ivory font-medium" : "text-ivory/70 hover:text-ivory"
                        }`}
                    >
                      {n.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer / Account */}
            <div className="mt-auto border-t border-ivory/10 pt-6 space-y-3">
              <Link
                to="/account"
                onClick={onClose}
                className="label flex items-center justify-between text-[11px] text-ivory/85 transition-colors hover:text-ivory"
              >
                <span>{isAuthenticated ? `Account (${customer?.displayName || "Active"})` : "Sign In / Account"}</span>
                <span aria-hidden="true">→</span>
              </Link>
              {isAuthenticated && (
                <Link
                  to="/account/orders"
                  onClick={onClose}
                  className="label flex items-center justify-between text-[10.5px] text-ivory/50 transition-colors hover:text-ivory/80"
                >
                  <span>Order History & Tracking</span>
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
