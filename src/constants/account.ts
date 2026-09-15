/**
 * Account constants — Production Shopify Customer Account API integration.
 */

export const ACCOUNT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "settings", label: "Settings" },
] as const;

export type AccountTabId = (typeof ACCOUNT_TABS)[number]["id"];
