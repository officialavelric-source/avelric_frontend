/**
 * Shopify configuration.
 * Reads public environment variables — safe for browser bundles.
 *
 * Security rules:
 * - NEVER place Admin API tokens, client secrets, or private keys here.
 * - VITE_ prefix exposes variables to the browser bundle — only public values.
 * - The Shopify Customer Account Client ID is a public identifier (not a secret).
 *   It is safe to include in the browser bundle.
 *
 * OAuth endpoints for Customer Account API are NOT hardcoded here.
 * They are dynamically discovered via:
 *   https://{domain}/.well-known/openid-configuration
 *   https://{domain}/.well-known/customer-account-api
 * See: src/services/shopify/customerAccountDiscovery.ts
 */

const domain             = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const storefrontToken    = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion         = import.meta.env.VITE_SHOPIFY_API_VERSION;
const customerClientId   = import.meta.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;

/* ——— Storefront API validation ——— */
if (!domain || !storefrontToken || !apiVersion) {
  console.error(
    "[AVELRIC] Missing Shopify Storefront API configuration.\n" +
    "Add to .env.local:\n" +
    "  VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com\n" +
    "  VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_public_storefront_token\n" +
    "  VITE_SHOPIFY_API_VERSION=2026-07"
  );
}

/* ——— Customer Account API validation ——— */
if (!customerClientId) {
  console.warn(
    "[AVELRIC] VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID is not set.\n" +
    "Customer login will be unavailable.\n" +
    "Find the Client ID in Shopify Admin → Headless → Customer Account API → Credentials."
  );
}

/* ——— Exported config ——— */
export const shopifyConfig = {
  /** Store domain, e.g. "avelric-2.myshopify.com" */
  domain: domain ?? "",

  /** Public Storefront API token */
  storefrontAccessToken: storefrontToken ?? "",

  /** Shopify API version, e.g. "2026-07" */
  apiVersion: apiVersion ?? "2026-07",

  /**
   * Customer Account API Client ID.
   * Public identifier — not a secret.
   * Obtained from Shopify Admin → Headless → Customer Account API → Credentials.
   */
  customerAccountClientId: customerClientId ?? "",

  /** Storefront API GraphQL endpoint */
  get endpoint(): string {
    return `https://${this.domain}/api/${this.apiVersion}/graphql.json`;
  },
} as const;
