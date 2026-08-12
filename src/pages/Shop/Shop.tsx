import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CATEGORIES } from "../../data/products";
import { Reveal } from "../../components/common";
import { ProductCard, ProductCardSkeleton } from "../../components/product";
import { ShopFilterBar } from "../../components/forms";
import { useShopFilters } from "../../hooks/useShopFilters";
import { getProducts } from "../../services/shopify/productService";
import type { AppProduct } from "../../types/app";

export default function Shop({ preset }: { preset?: "new" }) {
  const { slug } = useParams<{ slug?: string }>();

  // Shopify product data — null = loading, [] = empty, array = loaded
  const [shopifyProducts, setShopifyProducts] = useState<AppProduct[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setShopifyProducts(null);
    setLoadError(null);

    getProducts(50)
      .then(({ products }) => {
        if (!cancelled) setShopifyProducts(products);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[Shop] Shopify product fetch failed:", err);
          setLoadError("Unable to load products. Please try again.");
          setShopifyProducts([]); // trigger non-loading state
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = shopifyProducts === null;

  const { category, filters } = useShopFilters({
    preset,
    categorySlug: slug,
    // Production rule: allProducts is Shopify data only.
    // undefined while loading → useShopFilters returns [] → skeleton shown
    // [] from Shopify → empty state shown
    // [products] → product grid shown
    allProducts: shopifyProducts ?? undefined,
  });
  const { q, items, clearAll } = filters;

  const title = q.trim()
    ? `Results for "${q.trim()}"`
    : preset === "new"
      ? "New Arrivals"
      : category
        ? category.name
        : "The Collection";

  const crumb = preset === "new" ? "New Arrivals" : category ? category.name : "Shop";

  return (
    <div>
      <ShopFilterBar filters={filters} showCategoryPill={!category} />

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <Reveal>
          <p className="label text-warmgray">
            <Link to="/" className="hover:text-softblack">Home</Link> / {crumb}
          </p>
          <h1 className="mt-3 font-display text-[30px] md:text-[38px]">{title}</h1>
          {!loading && !loadError && (
            <p className="mt-2.5 max-w-xl text-[15px] text-warmgray">
              {items.length} piece{items.length === 1 ? "" : "s"}
              {items.length > 0 && " — every one reviewed in person before listing."}
            </p>
          )}
        </Reveal>

        {/* Category quick tiles — only on all-products view */}
        {!category && !q && preset !== "new" && (
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="group relative h-24 w-40 shrink-0 overflow-hidden rounded-2xl"
              >
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-softblack/70 to-transparent" aria-hidden="true" />
                <span className="label absolute bottom-2.5 left-3.5 text-[10.5px] text-ivory">{c.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* API error state */}
        {!loading && loadError && (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 px-8 py-20 text-center">
            <p className="font-display text-2xl text-softblack">Something went wrong</p>
            <p className="mt-3 text-[14px] text-warmgray">{loadError}</p>
            <button
              onClick={() => { setShopifyProducts(null); setLoadError(null); }}
              className="label mt-8 rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory"
            >
              Try again
            </button>
          </div>
        )}

        {/* Shopify returned 0 products (store has no products yet) */}
        {!loading && !loadError && shopifyProducts?.length === 0 && !q && activeCount(filters) === 0 && (
          <div className="mt-10 rounded-2xl bg-beige px-8 py-20 text-center">
            <p className="font-display text-2xl">No products available</p>
            <p className="mt-3 text-warmgray">
              We're preparing the collection. Check back soon.
            </p>
          </div>
        )}

        {/* Filter/search returned 0 results (products exist but nothing matches) */}
        {!loading && !loadError && items.length === 0 && (shopifyProducts?.length ?? 0) > 0 && (
          <div className="mt-10 rounded-2xl bg-beige px-8 py-20 text-center">
            <p className="font-display text-2xl">
              {q ? `Nothing matches "${q.trim()}"` : "Nothing matches these filters"}
            </p>
            <p className="mt-3 text-warmgray">
              {q ? "Try a category — shirts, jeans, jackets — or clear the search." : "Widen the price range or clear a size to see more."}
            </p>
            <button onClick={clearAll} className="label mt-8 rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">
              Clear filters
            </button>
          </div>
        )}

        {/* Product grid — only rendered when we have actual Shopify products */}
        {!loading && !loadError && items.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
                <ProductCard product={p} eager={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function activeCount(filters: ReturnType<typeof useShopFilters>["filters"]): number {
  return filters.activeCount;
}
