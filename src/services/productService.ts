import { Category, CATEGORIES } from "../data/products";
import { getCachedProduct } from "./shopify/productService";
import type { AppProduct } from "../types/app";

/**
 * Lookup a product by handle.
 * Shopify cache ONLY — no mock fallback.
 * Returns undefined if the product is not in the Shopify cache.
 */
export const getProduct = (id: string): AppProduct | undefined =>
  getCachedProduct(id);

/**
 * Filter cached Shopify products by tag.
 * Returns [] if cache is empty — no mock fallback.
 */
export const byTag = (tag: string, cache: AppProduct[]): AppProduct[] =>
  cache.filter((p) => p.tags.includes(tag));

/**
 * Filter cached Shopify products by category.
 * Returns [] if cache is empty — no mock fallback.
 */
export const byCategory = (slug: Category, cache: AppProduct[]): AppProduct[] =>
  cache.filter((p) => p.category === slug);

/**
 * Sort cached Shopify products newest first.
 */
export const byNewest = (cache: AppProduct[]): AppProduct[] =>
  [...cache].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

/**
 * Search within cached Shopify products.
 * Returns [] if cache is empty.
 */
export const searchProducts = (q: string, cache: AppProduct[]): AppProduct[] => {
  const s = q.trim().toLowerCase();
  if (!s) return cache;
  return cache.filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.color.name.toLowerCase().includes(s) ||
      p.fabric.toLowerCase().includes(s)
  );
};

export { CATEGORIES };
