import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES, Category, ColorGroup } from "../data/products";
import { PRICE_BANDS, Sort } from "../constants/filters";
import type { AppProduct } from "../types/app";

export interface ShopFilters {
  q: string;
  setQ: (value: string) => void;
  sizes: string[];
  toggleSize: (s: string) => void;
  colors: ColorGroup[];
  toggleColor: (c: ColorGroup) => void;
  cats: Category[];
  toggleCat: (c: Category) => void;
  setCats: (c: Category[]) => void;
  priceBand: number | null;
  setPriceBand: (i: number | null) => void;
  sort: Sort;
  setSort: (s: Sort) => void;
  activeCount: number;
  clearAll: () => void;
  items: AppProduct[];
}

const toggleIn = <T,>(arr: T[], v: T) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

/**
 * Full filter/sort/search state + filtered list.
 *
 * PRODUCTION RULE: Shopify is the only product source.
 * allProducts MUST be the Shopify product list.
 * When allProducts is undefined (loading) or empty (no Shopify products),
 * items will be empty — no mock fallback.
 *
 * @param allProducts - Shopify products array (undefined = still loading)
 */
export function useShopFilters({
  preset,
  categorySlug,
  allProducts,
}: {
  preset?: "new";
  categorySlug?: string;
  allProducts?: AppProduct[];
}) {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorGroup[]>([]);
  const [priceBand, setPriceBand] = useState<number | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [sort, setSort] = useState<Sort>(preset === "new" ? "newest" : "relevance");

  const setQ = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  // When allProducts is undefined (loading) return empty to avoid rendering mock data.
  // When it is an empty array, show empty state.
  const source = allProducts ?? [];

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = source.filter((p) => {
      if (preset === "new" && !p.tags.includes("new")) return false;
      if (category && p.category !== category.slug) return false;
      if (!category && cats.length && !cats.includes(p.category)) return false;
      if (sizes.length && !sizes.some((x) => p.sizes.includes(x))) return false;
      if (colors.length && !colors.includes(p.color.group)) return false;
      if (priceBand !== null) {
        const band = PRICE_BANDS[priceBand];
        if (p.price < band.min || p.price > band.max) return false;
      }
      if (
        s &&
        !p.name.toLowerCase().includes(s) &&
        !p.category.toLowerCase().includes(s) &&
        !p.color.name.toLowerCase().includes(s) &&
        !p.fabric.toLowerCase().includes(s)
      )
        return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [q, preset, category, cats, sizes, colors, priceBand, sort, source]);

  const activeCount = sizes.length + colors.length + cats.length + (priceBand !== null ? 1 : 0);

  const clearAll = () => {
    setSizes([]);
    setColors([]);
    setCats([]);
    setPriceBand(null);
    setQ("");
  };

  const filters: ShopFilters = {
    q,
    setQ,
    sizes,
    toggleSize: (s) => setSizes((prev) => toggleIn(prev, s)),
    colors,
    toggleColor: (c) => setColors((prev) => toggleIn(prev, c)),
    cats,
    toggleCat: (c) => setCats((prev) => toggleIn(prev, c)),
    setCats,
    priceBand,
    setPriceBand,
    sort,
    setSort,
    activeCount,
    clearAll,
    items,
  };

  return { category, filters };
}
