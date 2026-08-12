import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { COLLECTIONS } from "../../data/collections";
import { Reveal } from "../../components/common";
import { ProductCard, ProductCardSkeleton } from "../../components/product";
import { getCachedProduct, getProducts } from "../../services/shopify/productService";
import type { AppProduct } from "../../types/app";

/**
 * Collections page — curated, theme-based product edits.
 *
 * PRODUCTION NOTE:
 * Collections are defined in data/collections.ts with Shopify product handles.
 * Products are resolved from the Shopify product cache.
 *
 * To add a product to a collection:
 * 1. Set the product's handle in Shopify Admin
 * 2. Update COLLECTIONS in data/collections.ts with that handle
 *
 * The collection banners and copy are editorial — managed in code.
 */
export default function Collections() {
  const [, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Pre-warm the product cache so collection products can be resolved
    getProducts(50)
      .then(() => {
        if (!cancelled) { setLoaded(true); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[Collections] Shopify fetch failed:", err);
          setLoadError("Unable to load products. Please try again.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <Reveal>
        <p className="label text-warmgray">
          <Link to="/" className="hover:text-softblack">Home</Link> / Collections
        </p>
        <h1 className="mt-3 font-display text-[32px] md:text-[40px]">Collections</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-warmgray">
          Curated edits, not endless scrolling. Each collection is a small story — picked around a
          season, a fabric, or the pieces people keep re-ordering.
        </p>
      </Reveal>

      {/* Quick jump chips */}
      <Reveal className="mt-8">
        <div className="flex flex-wrap gap-2.5">
          {COLLECTIONS.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="label rounded-full border border-softblack/25 px-4 py-2.5 text-[10.5px] transition-colors hover:border-softblack hover:bg-softblack hover:text-ivory"
            >
              {c.title}
            </a>
          ))}
        </div>
      </Reveal>

      {/* Error state */}
      {loadError && (
        <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 px-8 py-20 text-center">
          <p className="font-display text-2xl text-softblack">Something went wrong</p>
          <p className="mt-3 text-[14px] text-warmgray">{loadError}</p>
        </div>
      )}

      <div className="mt-14 space-y-20 md:space-y-24">
        {COLLECTIONS.map((c, ci) => {
          // Resolve products from Shopify cache by handle
          const products: AppProduct[] = loading
            ? []
            : c.productIds
                .map((handle) => getCachedProduct(handle))
                .filter((p): p is AppProduct => Boolean(p));

          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-32">
              <Reveal>
                <div className="relative overflow-hidden rounded-[24px] bg-softblack">
                  <img
                    src={c.image}
                    alt=""
                    aria-hidden="true"
                    loading={ci === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-softblack/80 via-softblack/40 to-transparent" />
                  <div className="relative px-7 py-14 md:px-12 md:py-20">
                    <p className="label text-ivory/60">{c.eyebrow}</p>
                    <h2 className="mt-3 max-w-lg font-display text-[28px] leading-tight text-ivory md:text-[36px]">
                      {c.title}
                    </h2>
                    <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-ivory/75">{c.story}</p>
                  </div>
                </div>
              </Reveal>

              {/* Loading skeleton */}
              {loading && !loadError && (
                <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              )}

              {/* Products found */}
              {!loading && products.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
                  {products.map((p, i) => (
                    <Reveal key={p.id} delay={Math.min(i, 3) * 0.06}>
                      <ProductCard product={p} />
                    </Reveal>
                  ))}
                </div>
              )}

              {/* Products not found in Shopify */}
              {!loading && !loadError && products.length === 0 && (
                <p className="mt-6 text-[14px] text-warmgray">
                  Products in this collection are coming soon.{" "}
                  <Link to="/shop" className="border-b border-softblack/30 hover:border-softblack">
                    Browse all →
                  </Link>
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
