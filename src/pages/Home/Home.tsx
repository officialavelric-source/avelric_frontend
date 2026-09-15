import { useEffect, useState } from "react";
import { getProducts } from "../../services/shopify/productService";
import type { AppProduct } from "../../types/app";
import {
  Hero,
  Lookbook,
  ProductRow,
  Bestsellers,
  Instagram,
} from "../../components/home";

/**
 * Home page — all product sections use Shopify data only.
 *
 * PRODUCTION RULE: No mock fallback. If Shopify returns empty:
 *   - New Arrivals section: hidden (no empty state shown on home page)
 *   - Bestsellers section: hidden
 * The hero and non-product sections always render.
 */
export default function Home() {
  const [shopifyProducts, setShopifyProducts] = useState<AppProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProducts(50)
      .then(({ products }) => {
        if (!cancelled) setShopifyProducts(products);
      })
      .catch((err) => {
        console.error("[Home] Shopify products fetch failed:", err);
        if (!cancelled) setShopifyProducts([]); // treat error as empty — home page stays functional
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only show product sections when Shopify has returned data
  const hasProducts = (shopifyProducts?.length ?? 0) > 0;

  const newArrivals = hasProducts
    ? shopifyProducts!
      .filter((p) => p.category === "shirts")
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      .slice(0, 8)
    : [];

  return (
    <>
      <Hero />
      <Lookbook allProducts={shopifyProducts ?? undefined} />

      {hasProducts && (
        <ProductRow
          eyebrow="New arrivals"
          title="Just listed"
          sub="This week's arrivals — reviewed twice before they were allowed to ship."
          items={newArrivals}
          cta="All shirts"
          ctaTo="/category/shirts"
          layout="scroll"
        />
      )}
      <img src="/poster.png" alt="discount poster" className="w-full" />
      {hasProducts && <Bestsellers allProducts={shopifyProducts!} />}
      <Instagram />
    </>
  );
}
