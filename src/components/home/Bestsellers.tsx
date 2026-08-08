import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Category } from "../../data/products";
import { PRODUCTS } from "../../data/products";
import { Reveal, SectionHeading } from "../common";
import { ProductCard } from "../product";

const TABS: { key: string; label: string; categories: Category[] }[] = [
  { key: "tops", label: "Tops", categories: ["shirts", "t-shirts"] },
  { key: "bottoms", label: "Bottoms", categories: ["jeans", "trousers"] },
  { key: "outerwear", label: "Outerwear", categories: ["jackets"] },
];

export default function Bestsellers() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const cats = TABS[active].categories;
    return [...PRODUCTS]
      .filter((p) => cats.includes(p.category))
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, 6);
  }, [active]);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth, 640), behavior: "smooth" });
  };

  return (
    <section className="bg-beige py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Bestsellers" title="Rated highest by people who bought them" />
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
        </div>

        {/* tabs */}
        <div className="relative mt-9 flex gap-8 border-b border-softblack/10" role="tablist" aria-label="Bestseller category">
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`relative pb-3.5 text-[13px] transition-colors ${active === i ? "text-softblack" : "text-warmgray hover:text-softblack"}`}
            >
              {tab.label}
              {active === i && (
                <motion.span
                  layoutId="bestseller-tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-softblack"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          ))}
        </div>

        <div
          ref={trackRef}
          key={active}
          className="mt-9 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p, i) => (
            <div key={p.id} className="w-[220px] shrink-0 snap-start sm:w-[250px] md:w-[280px]">
              <Reveal delay={Math.min(i, 4) * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
