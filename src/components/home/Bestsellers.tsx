import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import type { AppProduct } from "../../types/app";
import { Reveal, SectionHeading } from "../common";
import { ProductCard } from "../product";

/**
 * Bestsellers component — displays high-rated jeans only.
 * Requires real Shopify products. Only rendered from Home when shopifyProducts.length > 0.
 */
export default function Bestsellers({ allProducts }: { allProducts: AppProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    return allProducts
      .filter((p) => p.category === "jeans")
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0))
      .slice(0, 8);
  }, [allProducts]);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth, 640), behavior: "smooth" });
  };

  return (
    <section className="bg-beige py-14 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Bestsellers" title="Rated highest by people who bought them" />
          <div className="flex items-center gap-4">
            <span className="hidden gap-2 md:flex">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Scroll products left"
                className="grid h-10 w-10 place-items-center rounded-full border border-softblack/25 transition-colors hover:bg-softblack hover:text-ivory"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Scroll products right"
                className="grid h-10 w-10 place-items-center rounded-full border border-softblack/25 transition-colors hover:bg-softblack hover:text-ivory"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </span>
            <Link
              to="/category/jeans"
              className="hidden md:inline-block label border-b border-softblack/30 pb-1 text-[11px] transition-colors hover:border-softblack"
            >
              All jeans →
            </Link>
          </div>
        </div>

        {/* Desktop view (md and up): horizontal scroll of high-rated jeans */}
        <div
          ref={trackRef}
          className="mt-12 hidden md:flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.length === 0 ? (
            <p className="py-12 text-[14px] text-warmgray">No jeans found.</p>
          ) : (
            items.map((p, i) => (
              <div key={p.id} className="w-[280px] shrink-0 snap-start">
                <Reveal delay={Math.min(i, 4) * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              </div>
            ))
          )}
        </div>

        {/* Mobile phone responsiveness: 2 rows of 2 (4 items total) with More button linking directly to jeans */}
        <div className="block md:hidden mt-8">
          {items.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-warmgray">No jeans found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 sm:gap-x-3.5 gap-y-5 sm:gap-y-6">
                {items.slice(0, 4).map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 3) * 0.05}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  to="/category/jeans"
                  className="label inline-flex items-center justify-center gap-2 rounded-full border border-softblack/20 bg-ivory px-8 py-3.5 text-[11.5px] font-medium text-softblack transition-all hover:bg-softblack hover:text-ivory shadow-xs active:scale-95 w-full max-w-xs"
                >
                  <span>More</span>
                  <span>→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
