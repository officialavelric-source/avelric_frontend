import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { PosterBanner, Reveal } from "../../components/common";
import { ProductCard, ProductCardSkeleton } from "../../components/product";
import { ShopFilterBar } from "../../components/forms";
import { useShopFilters } from "../../hooks/useShopFilters";
import { getProducts } from "../../services/shopify/productService";
import { analyticsService, mapAppProductToGA4Item } from "../../services/analytics";
import type { AppProduct } from "../../types/app";

export default function Shop({ preset }: { preset?: "new" }) {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Shopify product data — null = loading, [] = empty, array = loaded
  const [shopifyProducts, setShopifyProducts] = useState<AppProduct[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastTrackedList = useRef<string>("");

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

  useEffect(() => {
    if (!loading && items.length > 0) {
      const listKey = `${slug || "all"}-${q}-${items.length}`;
      if (lastTrackedList.current !== listKey) {
        lastTrackedList.current = listKey;
        analyticsService.trackViewItemList({
          item_list_id: slug || "clothing_collection",
          item_list_name: title,
          items: items.map((p, idx) => mapAppProductToGA4Item(p, idx + 1, title)),
        });
      }
    }
  }, [loading, items, slug, q, title]);

  const crumb = preset === "new" ? "New Arrivals" : category ? category.name : "Shop";

  const isSearchRoute = location.pathname === "/search";
  const hasSearchParam = searchParams.get("search") === "true" || searchParams.get("focus") === "search";
  const isSearchMode = Boolean(isSearchRoute || hasSearchParam || q.trim());
  const showHeader = !category && isSearchMode;

  return (
    <div>
      {showHeader && <ShopFilterBar filters={filters} showCategoryPill={!category} />}

      <div className={`mx-auto max-w-7xl px-3 sm:px-4 ${showHeader ? "py-6 sm:py-8 md:py-10" : "py-6 sm:py-8 md:py-12"}`}>
        {showHeader && q.trim() && (
          <Reveal>
            <h1 className="mt-2 font-display text-[22px] sm:text-[26px] md:text-[32px]">{title}</h1>
            {!loading && !loadError && (
              <p className="mt-1.5 max-w-xl text-[13.5px] sm:text-[14px] text-warmgray">
                {items.length} result{items.length === 1 ? "" : "s"} found
              </p>
            )}
          </Reveal>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className={`${showHeader ? "mt-8 sm:mt-10" : "mt-2"} grid grid-cols-2 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* API error state */}
        {!loading && loadError && (
          <div className={`${showHeader ? "mt-10" : "mt-2"} rounded-2xl border border-red-100 bg-red-50 px-8 py-20 text-center`}>
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
          <div className={`${showHeader ? "mt-10" : "mt-2"} rounded-2xl bg-beige px-8 py-20 text-center`}>
            <p className="font-display text-2xl">No products available</p>
            <p className="mt-3 text-warmgray">
              We're preparing the collection. Check back soon.
            </p>
          </div>
        )}

        {/* Filter/search returned 0 results (products exist but nothing matches) */}
        {!loading && !loadError && items.length === 0 && (shopifyProducts?.length ?? 0) > 0 && (
          <div className={`${showHeader ? "mt-10" : "mt-2"} rounded-2xl bg-beige px-8 py-20 text-center`}>
            <p className="font-display text-2xl">
              {q ? `Nothing matches "${q.trim()}"` : "Nothing matches these filters"}
            </p>
            <p className="mt-3 text-warmgray">
              {q ? "Try a category — shirts or jeans — or clear the search." : "Widen the price range or clear a size to see more."}
            </p>
            <button onClick={clearAll} className="label mt-8 rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">
              Clear filters
            </button>
          </div>
        )}

        {/* Product grid — only rendered when we have actual Shopify products */}
        {!loading && !loadError && items.length > 0 && (
          <div className={`${showHeader ? "mt-8 sm:mt-10" : "mt-2"} grid grid-cols-2 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4`}>
            {items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
                <ProductCard product={p} eager={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Poster banner before footer */}
      <PosterBanner />
    </div>
  );
}

function activeCount(filters: ReturnType<typeof useShopFilters>["filters"]): number {
  return filters.activeCount;
}
