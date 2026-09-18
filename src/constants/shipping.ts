/**
 * AVELRIC Shipping Configuration & Business Rules
 *
 * Final Business Rule:
 * - Orders below ₹1,500: ₹79 standard shipping
 * - Orders ₹1,500 or above: FREE shipping
 *
 * Shopify checkout remains the source of truth for actual shipping calculations.
 */

export const FREE_SHIPPING_THRESHOLD = 1500;
export const STANDARD_SHIPPING = 79;

/** Backward compatibility alias for legacy imports */
export const FREE_SHIP_AT = FREE_SHIPPING_THRESHOLD;
