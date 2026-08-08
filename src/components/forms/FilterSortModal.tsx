import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, COLOR_FILTERS } from "../../data/products";
import { ALL_SIZES, PRICE_BANDS, SORT_LABELS, Sort } from "../../constants/filters";
import { ShopFilters } from "../../hooks/useShopFilters";
import Icon from "../common/Icon";

/* Filter & Sort — bottom sheet on mobile, centered dialog on md+.
   Category/Size/Price are single- or multi-select pill groups (touch-first,
   no custom range slider); Colour is swatch circles. Everything applies
   live via `filters`, so "Show N results" just closes the sheet. */

const pillClasses = (active: boolean) =>
  `rounded-full border px-3.5 py-2 text-[12.5px] transition-colors ${
    active ? "border-softblack bg-softblack text-ivory" : "border-softblack/20 hover:border-softblack"
  }`;

export default function FilterSortModal({
  open,
  onClose,
  filters,
  showCategories,
}: {
  open: boolean;
  onClose: () => void;
  filters: ShopFilters;
  showCategories: boolean;
}) {
  const { sizes, toggleSize, colors, toggleColor, cats, setCats, priceBand, setPriceBand, sort, setSort, clearAll, items } = filters;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-softblack/50 backdrop-blur-sm md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filter and sort"
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-ivory p-6 pb-8 md:max-w-md md:rounded-3xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Filter &amp; Sort</h2>
              <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-beige">
                <Icon label="Close" path="M6 6l12 12M18 6L6 18" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6">
              <p className="label text-warmgray">Sort by</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(SORT_LABELS) as Sort[]).map((k) => (
                  <button key={k} onClick={() => setSort(k)} aria-pressed={sort === k} className={pillClasses(sort === k)}>
                    {SORT_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>

            {showCategories && (
              <div className="mt-7">
                <p className="label text-warmgray">Category</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setCats([])} aria-pressed={cats.length === 0} className={pillClasses(cats.length === 0)}>
                    All
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => setCats(cats.includes(c.slug) ? [] : [c.slug])}
                      aria-pressed={cats.includes(c.slug)}
                      className={pillClasses(cats.includes(c.slug))}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <p className="label text-warmgray" id="modal-size-label">Size</p>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="modal-size-label">
                {ALL_SIZES.map((s) => (
                  <button key={s} onClick={() => toggleSize(s)} aria-pressed={sizes.includes(s)} className={pillClasses(sizes.includes(s))}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="label text-warmgray" id="modal-colour-label">Colour</p>
              <div className="mt-3 flex flex-wrap gap-3" role="group" aria-labelledby="modal-colour-label">
                {COLOR_FILTERS.map((c) => (
                  <button
                    key={c.group}
                    onClick={() => toggleColor(c.group)}
                    aria-pressed={colors.includes(c.group)}
                    aria-label={c.name}
                    title={c.name}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-ivory transition-all ${
                      colors.includes(c.group) ? "ring-softblack" : "ring-transparent hover:ring-softblack/25"
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="label text-warmgray">Price range</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRICE_BANDS.map((b, i) => (
                  <button key={b.label} onClick={() => setPriceBand(priceBand === i ? null : i)} aria-pressed={priceBand === i} className={pillClasses(priceBand === i)}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-9 flex items-center gap-4 border-t border-softblack/10 pt-6">
              <button onClick={clearAll} className="label shrink-0 text-[11px] text-warmgray underline-offset-4 hover:text-softblack hover:underline">
                Reset
              </button>
              <button onClick={onClose} className="label flex-1 rounded-full bg-softblack py-3.5 text-[11px] text-ivory transition-transform hover:scale-[1.01] active:scale-[0.99]">
                Show {items.length} result{items.length === 1 ? "" : "s"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
