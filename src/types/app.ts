import type { Category, ColorGroup } from "../data/products";

/**
 * Normalized application-level variant — wraps Shopify variant data.
 * The UI never touches raw Shopify GQL shapes.
 */
export interface AppVariant {
  id: string;              // Shopify GID: gid://shopify/ProductVariant/...
  title: string;           // e.g. "M" or "32"
  sku: string | null;
  price: number;           // in INR (parsed from Shopify amount string)
  compareAtPrice: number | null;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  image: string | null;    // image URL
}

/**
 * Normalized application-level product.
 * Structurally compatible with the existing Product interface in data/products.ts
 * so all existing UI components (ProductCard, CartItemRow etc.) work without changes.
 */
export interface AppProduct {
  // Fields shared with existing Product type
  id: string;              // = handle (for URL routing)
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  fabric: string;
  fit: string;
  description: string;
  sizes: string[];
  outOfStockSizes?: string[];
  soldOut?: boolean;
  images: string[];
  tags: string[];
  addedAt: string;
  rating: number;
  reviews: number;
  color: { name: string; hex: string; group: ColorGroup };
  // Shopify-specific extras
  handle: string;
  shopifyId: string;       // raw Shopify GID
  variants: AppVariant[];
  options: Array<{ id: string; name: string; values: string[] }>;
}

/* ——— Cart ——— */

export interface AppCartLine {
  id: string;              // Shopify cart line GID
  variantId: string;       // Shopify variant GID
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  sku: string | null;
  image: string | null;
  price: number;
  quantity: number;
}

export interface AppCart {
  id: string;              // Shopify cart GID
  checkoutUrl: string;
  lines: AppCartLine[];
  subtotal: number;
  total: number;
  totalQuantity: number;
}
