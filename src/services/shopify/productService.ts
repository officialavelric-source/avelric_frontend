import { shopifyFetch } from "./client";
import { PRODUCTS_QUERY } from "./queries/products";
import { PRODUCT_BY_HANDLE_QUERY } from "./queries/product";
import {
  mapShopifyProduct,
  mapShopifyProducts,
} from "./mappers/productMapper";
import type { AppProduct } from "../../types/app";
import type {
  ShopifyProduct,
  ShopifyProductConnection,
} from "../../types/shopify";

/* ——— Module-level product cache ——— */
const productCache = new Map<string, AppProduct>();

/** Return cached product without a network request (or undefined if not cached). */
export function getCachedProduct(handle: string): AppProduct | undefined {
  return productCache.get(handle);
}

/** Return all currently cached products as an array. */
export function getAllCachedProducts(): AppProduct[] {
  return Array.from(productCache.values());
}

/** Store a product in cache manually (used by ProductDetails on load). */
export function setCachedProduct(product: AppProduct): void {
  productCache.set(product.handle, product);
}

export type ProductsResult = {
  products: AppProduct[];
  pageInfo: { hasNextPage: boolean; endCursor?: string };
};

/**
 * Fetch products from Shopify with optional filtering/pagination.
 *
 * @param first  - Number of products to fetch (max 250 per Shopify limit)
 * @param after  - Pagination cursor
 * @param query  - Shopify product filter string (e.g. "product_type:shirts" or tag:new)
 */
export async function getProducts(
  first = 20,
  after?: string,
  query?: string
): Promise<ProductsResult> {
  const data = await shopifyFetch<{ products: ShopifyProductConnection }>(
    PRODUCTS_QUERY,
    {
      first,
      after: after ?? null,
      query: query ?? null,
      sortKey: null,
      reverse: false,
    }
  );

  const products = mapShopifyProducts(data.products.nodes);
  products.forEach((p) => productCache.set(p.handle, p));

  return {
    products,
    pageInfo: {
      hasNextPage: data.products.pageInfo.hasNextPage,
      endCursor: data.products.pageInfo.endCursor,
    },
  };
}

/**
 * Fetch a single product by its Shopify handle.
 * Returns null if the product does not exist.
 * Uses cache to avoid redundant network requests.
 */
export async function getProductByHandle(
  handle: string
): Promise<AppProduct | null> {
  const cached = productCache.get(handle);
  if (cached) return cached;

  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );

  if (!data.product) return null;

  const product = mapShopifyProduct(data.product);
  productCache.set(product.handle, product);
  return product;
}
