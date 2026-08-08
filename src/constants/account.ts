/* Demo data — backend aane par yahan API data plug karna */

export const ACCOUNT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "addresses", label: "Addresses" },
  { id: "settings", label: "Settings" },
] as const;

export type AccountTabId = (typeof ACCOUNT_TABS)[number]["id"];

export const DEMO_USER = {
  name: "Anisha Singla",
  email: "anishasingla23@gmail.com",
  phone: "+91 98XXX XXXXX",
  since: "June 2026",
};

export const DEMO_ORDERS = [
  { id: "AV-10248", date: "02 Jul 2026", items: "Heavyweight Tee (Black, M) + 1 more", total: 2198, status: "Delivered", productId: "tee-heavy-black" },
  { id: "AV-10197", date: "24 Jun 2026", items: "Oxford Shirt (White, L)", total: 1499, status: "In transit", productId: "oxford-white" },
  { id: "AV-10131", date: "12 Jun 2026", items: "Harrington Jacket (Olive, M)", total: 2899, status: "Delivered", productId: "jacket-harrington" },
];

export const DEMO_ADDRESSES = [
  { label: "Home", lines: ["#204, Sector 21", "Chandigarh, 160022"], default: true },
  { label: "Office", lines: ["Plot 14, IT Park", "Mohali, Punjab 160055"], default: false },
];
