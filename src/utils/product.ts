import { Product } from "../data/products";

export const discountPct = (p: Product) =>
  p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
