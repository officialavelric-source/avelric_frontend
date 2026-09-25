import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../../data/products";
import { SORT_LABELS } from "../../constants/filters";
import { NAV_H } from "../../constants/layout";
import { ShopFilters } from "../../hooks/useShopFilters";
import { analyticsService } from "../../services/analytics";
import Icon from "../common/Icon";
import FilterSortModal from "./FilterSortModal";

/* Sticky search + category-pill + filter/sort bar — Shop page ke top par.
   Saara filter state ShopFilters (useShopFilters) se aata hai; category
   pills yahan single-select quick browse hain, baaki (size/colour/price/
   sort) FilterSortModal ke andar. */

export default function ShopFilterBar({
  filters,
  showCategoryPill,
}: {
  filters: ShopFilters;
  showCategoryPill: boolean;
}) {
  const { q, setQ, cats, setCats, sort, activeCount, items } = filters;

  const [modalOpen, setModalOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const modalOpenRef = useRef(modalOpen);
  modalOpenRef.current = modalOpen;

  // Track search queries in GA4 with debounce
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const timer = setTimeout(() => {
      analyticsService.trackSearch({
        search_term: trimmed,
        results_count: items.length,
      });
    }, 750);
    return () => clearTimeout(timer);
  }, [q, items.length]);

  /* navbar search icon se aane par input autofocus */
  useEffect(() => {
    if (params.get("focus") === "search" || params.get("search") === "true") {
      searchRef.current?.focus();
    }
  }, [params]);

  /* Hide when scrolling down, show when scrolling up */
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show near top of page
      if (currentScrollY <= 60) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Keep visible if search is focused or filter modal is open
      if (modalOpenRef.current || document.activeElement === searchRef.current) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Ignore bounces beyond document boundaries
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScrollY > maxScroll) {
        return;
      }

      // Small threshold to prevent jitter on micro-scrolls
      const diff = currentScrollY - lastScrollY.current;
      if (Math.abs(diff) < 8) {
        return;
      }

      if (diff > 0) {
        // Scrolling down -> hide
        setVisible(false);
      } else {
        // Scrolling up -> show
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`sticky z-30 border-b border-softblack/10 bg-ivory/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          top: NAV_H,
          transform: visible ? "translateY(0)" : "translateY(calc(-100% - 72px))",
        }}
      >
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
          {/* search row */}
          <div className="flex items-center gap-2 rounded-full border border-softblack/20 bg-beige/50 px-3.5 py-2 sm:px-4 sm:py-2.5 transition-colors focus-within:border-softblack">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-4 w-4 shrink-0 text-warmgray" aria-hidden="true">
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search — oxford shirt, denim, jacket…"
              aria-label="Search products"
              className="w-full bg-transparent text-[13px] sm:text-[14px] placeholder:text-warmgray/70 focus:outline-none"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="shrink-0 p-1 text-warmgray hover:text-softblack">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            )}
          </div>

          {/* category quick-pills + filter trigger */}
          <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-3 px-3 sm:mx-0 sm:px-0">
              {showCategoryPill && (
                <>
                  <button
                    onClick={() => {
                      setCats([]);
                      analyticsService.trackFilterProducts({
                        filter_category: "all",
                        results_count: items.length,
                      });
                    }}
                    aria-pressed={cats.length === 0}
                    className={`label shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] transition-colors ${cats.length === 0 ? "border-softblack bg-softblack text-ivory" : "border-softblack/20 hover:border-softblack"
                      }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => {
                        const next = cats.includes(c.slug) ? [] : [c.slug];
                        setCats(next);
                        analyticsService.trackFilterProducts({
                          filter_category: next.length > 0 ? c.slug : "all",
                          results_count: items.length,
                        });
                      }}
                      aria-pressed={cats.includes(c.slug)}
                      className={`label shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] transition-colors ${cats.includes(c.slug) ? "border-softblack bg-softblack text-ivory" : "border-softblack/20 hover:border-softblack"
                        }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </>
              )}
            </div>

            <button
              onClick={() => setModalOpen(true)}
              aria-label="Open filters and sort"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-softblack/20 transition-colors hover:border-softblack"
            >
              <Icon label="Filters" path="M4 6h16M7 12h10M10 18h4" className="h-4 w-4" />
              {activeCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-softblack text-[9px] text-ivory">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* count + sort row */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[12.5px] text-warmgray">
              {items.length} product{items.length === 1 ? "" : "s"}
            </p>
            <button onClick={() => setModalOpen(true)} className="label flex items-center gap-1.5 text-[11px] text-warmgray hover:text-softblack">
              Sort: {SORT_LABELS[sort]}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <FilterSortModal open={modalOpen} onClose={() => setModalOpen(false)} filters={filters} showCategories={showCategoryPill} />
    </>
  );
}
