import { Category, PRODUCTS, Product } from "../data/products";

export const byTag = (tag: Product["tags"][number]) => PRODUCTS.filter((p) => p.tags.includes(tag));
export const byCategory = (slug: Category) => PRODUCTS.filter((p) => p.category === slug);
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const byNewest = () => [...PRODUCTS].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
export const searchProducts = (q: string) => {
  const s = q.trim().toLowerCase();
  if (!s) return PRODUCTS;
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.color.name.toLowerCase().includes(s) ||
      p.fabric.toLowerCase().includes(s)
  );
};
