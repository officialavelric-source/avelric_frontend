import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../../components/common";
import { ProductCard, ProductCardSkeleton } from "../../components/product";
import { getProducts } from "../../services/shopify/productService";
import { u } from "../../data/products";
import type { AppProduct } from "../../types/app";

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function NewArrivals() {
  const [products, setProducts] = useState<AppProduct[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProducts(50)
      .then(({ products: all }) => {
        if (cancelled) return;
        // Sort by createdAt descending — newest first
        const sorted = [...all].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
        setProducts(sorted);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[NewArrivals] Shopify fetch failed:", err);
          setLoadError("Unable to load new arrivals. Please try again.");
          setProducts([]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const loading = products === null;
  const justInCutoff = products?.[0]?.addedAt ?? "";

  return (
    <div>
      {/* Banner header */}
      <div className="relative overflow-hidden bg-softblack">
        <img
          src={u("photo-1445205170230-053b83016050", 1920)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-softblack/80 via-softblack/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 text-ivory md:py-24">
          <Reveal>
            <p className="label text-ivory/60">
              <Link to="/" className="hover:text-ivory">Home</Link> / New Arrivals
            </p>
            <h1 className="mt-3 font-display text-[32px] md:text-[44px]">Just In</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ivory/75">
              Every Friday we list the pieces that survived that week's market visits. Latest first —
              small batches, so the newest drop is also the fullest size run.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && loadError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-8 py-20 text-center">
            <p className="font-display text-2xl text-softblack">Something went wrong</p>
            <p className="mt-3 text-[14px] text-warmgray">{loadError}</p>
          </div>
        )}

        {/* Empty state — store has no products */}
        {!loading && !loadError && products?.length === 0 && (
          <div className="rounded-2xl bg-beige px-8 py-20 text-center">
            <p className="font-display text-2xl">No new arrivals yet</p>
            <p className="mt-3 text-warmgray">Check back Friday for the latest additions.</p>
            <Link to="/shop" className="label mt-8 inline-block rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">
              Browse all products
            </Link>
          </div>
        )}

        {/* Products grid */}
        {!loading && !loadError && products && products.length > 0 && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
                <div>
                  <p className="label mb-2.5 flex items-center gap-2 text-[9.5px] text-warmgray">
                    {p.addedAt === justInCutoff && (
                      <span className="rounded-full bg-softblack px-2.5 py-1 text-ivory">Just In</span>
                    )}
                    Listed {fmtDate(p.addedAt)}
                  </p>
                  <ProductCard product={p} eager={i < 4} />
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
