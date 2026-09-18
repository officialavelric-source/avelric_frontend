/**
 * Navigation & Return-to-Store Routing Utilities
 *
 * Ensures all generic and product-specific return flows safely land
 * on the appropriate AVELRIC custom storefront routes, preventing open-redirects
 * and 404 dead-ends.
 */

/** Canonical route for the AVELRIC Clothing / Shop catalog page */
export const CANONICAL_SHOP_ROUTE = "/shop";

/** Canonical prefix for product details routes in the AVELRIC storefront */
export const CANONICAL_PRODUCT_PREFIX = "/products";

export interface ReturnToStoreOptions {
  productHandle?: string | null;
  fallbackRoute?: string;
}

/**
 * Resolves a safe, same-origin return URL for AVELRIC storefront navigation.
 *
 * Requirements:
 * 1. If productHandle exists and is valid -> returns `/products/:handle`.
 * 2. If productHandle is empty/missing/invalid -> returns `/shop` (AVELRIC Clothing/Shop listing).
 * 3. Sanitizes input to prevent open-redirect vulnerabilities (blocks absolute URLs, protocols, path traversal).
 * 4. Normalizes URL encoding and trailing slashes.
 */
export function getReturnToStoreUrl(options?: ReturnToStoreOptions): string {
  const handle = options?.productHandle?.trim();
  const fallback = options?.fallbackRoute || CANONICAL_SHOP_ROUTE;

  if (!handle) {
    return fallback;
  }

  // Prevent protocol injection (e.g. "https://...", "javascript:...", "//evil.com")
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(handle) || handle.startsWith("//")) {
    return fallback;
  }

  // Clean URL-encoded values safely
  let cleanHandle = handle;
  try {
    cleanHandle = decodeURIComponent(cleanHandle);
  } catch {
    // Keep raw string if malformed percent-encoding
  }

  // Strip leading route prefixes if someone passed a full relative path like "/products/xyz" or "/product/xyz"
  cleanHandle = cleanHandle
    .replace(/^(\/?products\/|\/?product\/)/i, "")
    .replace(/[?#].*$/, "")     // strip query string and hash
    .replace(/^\/+|\/+$/g, "") // strip leading and trailing slashes
    .trim();

  // If the resulting handle is empty, contains path traversal (..), or illegal characters, fallback safely
  if (!cleanHandle || cleanHandle.includes("..") || cleanHandle.includes("/")) {
    return fallback;
  }

  return `${CANONICAL_PRODUCT_PREFIX}/${encodeURIComponent(cleanHandle)}`;
}
