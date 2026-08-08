export type Sort = "relevance" | "newest" | "price-asc" | "price-desc" | "rating";

export const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38"];

export const PRICE_BANDS = [
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 1999 },
  { label: "₹2,000 – ₹3,000", min: 2000, max: 2999 },
  { label: "₹3,000 & above", min: 3000, max: Infinity },
];

export const SORT_LABELS: Record<Sort, string> = {
  relevance: "Relevance",
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Customer rating",
};
