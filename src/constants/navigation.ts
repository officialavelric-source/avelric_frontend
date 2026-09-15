export const NAV_LINKS = [
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "About", to: "/about" },
];

export const FOOTER_COLS = [
  {
    h: "Shop",
    links: [
      { to: "/shop", t: "All products" },
      { to: "/new-arrivals", t: "New arrivals" },
      { to: "/category/shirts", t: "Shirts" },
      { to: "/category/jeans", t: "Jeans" },
    ],
  },
  {
    h: "Help",
    links: [
      { to: "/faq", t: "FAQ" },
      { to: "/policy/returns", t: "Returns & exchange" },
      { to: "/policy/shipping", t: "Shipping & delivery" },
      { to: "/size-guide", t: "Size guide" },
      { to: "/about#contact", t: "Contact us" },
    ],
  },
  {
    h: "Company",
    links: [
      { to: "/about", t: "About us" },
      { to: "/how-we-curate", t: "How we curate" },
      { to: "/reviews", t: "Customer reviews" },
      { to: "/account", t: "Your account" },
    ],
  },
  {
    h: "Legal",
    links: [
      { to: "/policy/privacy", t: "Privacy policy" },
      { to: "/policy/terms", t: "Terms & conditions" },
      { to: "/policy/refund", t: "Refund policy" },
    ],
  },
];
