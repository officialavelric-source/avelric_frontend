import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionHeading } from "../common";
import { ProductCard } from "../product";
import { getAllCachedProducts, getProducts } from "../../services/shopify/productService";
import { PRODUCTS } from "../../data/products";
import type { AppProduct } from "../../types/app";

interface ScrollRowProps {
  eyebrow: string;
  title: string;
  sub?: string;
  categorySlug: string;
  ctaText: string;
  items: AppProduct[];
}

function CartProductScrollRow({
  eyebrow,
  title,
  sub,
  categorySlug,
  ctaText,
  items,
}: ScrollRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [items]);

  const handleScroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const distance = Math.min(el.clientWidth * 0.75, 600);
    el.scrollBy({ left: dir * distance, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="mt-14 md:mt-20">
      {/* Row Header with SectionHeading and Left/Right Arrows */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-softblack/10 pb-4">
        <SectionHeading eyebrow={eyebrow} title={title} sub={sub} />

        <div className="flex items-center gap-3">
          {/* Scroll arrow buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll(-1)}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-softblack/20 bg-ivory text-softblack transition-all ${
                canScrollLeft
                  ? "hover:bg-softblack hover:text-ivory hover:border-softblack active:scale-95 cursor-pointer"
                  : "opacity-35 cursor-not-allowed"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => handleScroll(1)}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-softblack/20 bg-ivory text-softblack transition-all ${
                canScrollRight
                  ? "hover:bg-softblack hover:text-ivory hover:border-softblack active:scale-95 cursor-pointer"
                  : "opacity-35 cursor-not-allowed"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* View Category link */}
          <Link
            to={`/category/${categorySlug}`}
            className="label ml-2 border-b border-softblack/30 pb-0.5 text-[11px] font-medium transition-colors hover:border-softblack text-softblack"
          >
            {ctaText} →
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
      >
        {items.map((p, idx) => (
          <div
            key={p.id}
            className="w-[200px] shrink-0 snap-start sm:w-[260px] md:w-[290px]"
          >
            <Reveal delay={Math.min(idx, 4) * 0.05}>
              <ProductCard product={p} eager={idx < 3} />
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EmptyCartView() {
  const [products, setProducts] = useState<AppProduct[]>(() => {
    const cached = getAllCachedProducts();
    return cached.length > 0 ? cached : (PRODUCTS as unknown as AppProduct[]);
  });

  useEffect(() => {
    let cancelled = false;
    getProducts(50)
      .then(({ products: fetched }) => {
        if (!cancelled && fetched.length > 0) {
          setProducts(fetched);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const shirts = useMemo(
    () => products.filter((p) => p.category === "shirts"),
    [products]
  );

  const jeans = useMemo(
    () => products.filter((p) => p.category === "jeans"),
    [products]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      {/* Top Empty Cart Banner */}
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-softblack/5 text-softblack/70 mb-5">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 stroke-current"
            fill="none"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" />
          </svg>
        </div>

        <h1 className="font-display text-[32px] sm:text-[40px] tracking-tight text-softblack">
          Your cart is empty
        </h1>

        <p className="mt-3 text-[15px] text-warmgray">
          Add something from the collection.
        </p>

        {/* Quick action pill links */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/category/shirts"
            className="label rounded-full border border-softblack/20 bg-ivory px-6 py-2.5 text-[11px] font-medium text-softblack transition-all hover:bg-softblack hover:text-ivory hover:border-softblack active:scale-95"
          >
            Explore Shirts →
          </Link>
          <Link
            to="/category/jeans"
            className="label rounded-full border border-softblack/20 bg-ivory px-6 py-2.5 text-[11px] font-medium text-softblack transition-all hover:bg-softblack hover:text-ivory hover:border-softblack active:scale-95"
          >
            Explore Jeans →
          </Link>
        </div>
      </div>

      {/* Row 1: Shirts Slider */}
      <CartProductScrollRow
        eyebrow="Tops"
        title="Curated Shirts"
        sub="Structured oxfords, linens and everyday casuals"
        categorySlug="shirts"
        ctaText="All shirts"
        items={shirts}
      />

      {/* Row 2: Jeans Slider */}
      <CartProductScrollRow
        eyebrow="Bottoms"
        title="Curated Jeans"
        sub="Vintage washes, relaxed fits & premium denim"
        categorySlug="jeans"
        ctaText="All jeans"
        items={jeans}
      />
    </div>
  );
}
