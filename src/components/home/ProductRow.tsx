import { useRef } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../data/products";
import type { AppProduct } from "../../types/app";
import { Reveal, SectionHeading } from "../common";
import { ProductCard } from "../product";

/* layout="scroll" → horizontal snap-scroll row with arrow controls on desktop,
   mobile phone responsiveness: 2 rows of 2 items (4 items total) with More button linking directly to component */

type AnyProduct = Product | AppProduct;

export default function ProductRow({
  eyebrow,
  title,
  sub,
  items,
  cta,
  ctaTo = "/shop",
  layout = "grid",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  items: AnyProduct[];
  cta?: string;
  ctaTo?: string;
  layout?: "grid" | "scroll";
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth, 640), behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />
        <Reveal className="flex items-center gap-4">
          {layout === "scroll" && (
            <span className="hidden gap-2 md:flex">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Scroll products left"
                className="grid h-10 w-10 place-items-center rounded-full border border-softblack/25 transition-colors hover:bg-softblack hover:text-ivory"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Scroll products right"
                className="grid h-10 w-10 place-items-center rounded-full border border-softblack/25 transition-colors hover:bg-softblack hover:text-ivory"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </span>
          )}
          {cta && (
            <Link to={ctaTo} className="hidden md:inline-block label border-b border-softblack/30 pb-1 text-[11px] transition-colors hover:border-softblack">
              {cta} →
            </Link>
          )}
        </Reveal>
      </div>

      {/* Desktop view (md and up) */}
      <div className="hidden md:block">
        {layout === "scroll" ? (
          <div
            ref={trackRef}
            className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((p, i) => (
              <div key={p.id} className="w-[280px] shrink-0 snap-start">
                <Reveal delay={Math.min(i, 4) * 0.06}>
                  <ProductCard product={p as AppProduct} />
                </Reveal>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-4 gap-x-5 gap-y-10">
            {items.slice(0, 4).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
                <ProductCard product={p as AppProduct} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Mobile phone responsiveness: 2 rows of 2 (4 items total) with More button linking directly to component */}
      <div className="block md:hidden mt-8">
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-3.5 gap-y-5 sm:gap-y-6">
          {items.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 3) * 0.05}>
              <ProductCard product={p as AppProduct} />
            </Reveal>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to={ctaTo}
            className="label inline-flex items-center justify-center gap-2 rounded-full border border-softblack/20 bg-ivory px-8 py-3.5 text-[11.5px] font-medium text-softblack transition-all hover:bg-softblack hover:text-ivory shadow-xs active:scale-95 w-full max-w-xs"
          >
            <span>More</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
