import type { Category, ColorGroup } from "../../../data/products";
import type {
  ShopifyProduct,
  ShopifyProductVariant,
} from "../../../types/shopify";
import type { AppProduct, AppVariant } from "../../../types/app";

/* ——— Helpers ——— */

const VALID_CATEGORIES: Category[] = [
  "shirts",
  "t-shirts",
  "jeans",
  "trousers",
  "jackets",
];

const CATEGORY_MAP: Record<string, Category> = {
  shirt: "shirts",
  shirts: "shirts",
  "button-up": "shirts",
  oxford: "shirts",
  linen: "shirts",
  flannel: "shirts",
  "t-shirt": "t-shirts",
  "t-shirts": "t-shirts",
  tshirt: "t-shirts",
  tee: "t-shirts",
  tops: "shirts",
  jean: "jeans",
  jeans: "jeans",
  denim: "jeans",
  trouser: "trousers",
  trousers: "trousers",
  chino: "trousers",
  pants: "trousers",
  cargo: "trousers",
  jacket: "jackets",
  jackets: "jackets",
  harrington: "jackets",
};

function normalizeCategory(productType: string): Category {
  const lower = productType.toLowerCase().trim();
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  const found = VALID_CATEGORIES.find((c) => lower.includes(c.slice(0, -1)));
  return found ?? "shirts";
}

const VALID_COLOR_GROUPS: ColorGroup[] = [
  "black",
  "white",
  "beige",
  "olive",
  "blue",
  "grey",
  "rust",
];

const COLOR_MAP: Record<string, { hex: string; group: ColorGroup }> = {
  black: { hex: "#1A1A1A", group: "black" },
  "jet black": { hex: "#1A1A1A", group: "black" },
  white: { hex: "#F5F2EA", group: "white" },
  "off-white": { hex: "#EFEAE0", group: "white" },
  "off white": { hex: "#EFEAE0", group: "white" },
  ivory: { hex: "#F0EBE0", group: "white" },
  ecru: { hex: "#EDE6D6", group: "white" },
  cream: { hex: "#EDE6D6", group: "white" },
  beige: { hex: "#D8C9A8", group: "beige" },
  sand: { hex: "#D8C9A8", group: "beige" },
  khaki: { hex: "#8A7B5C", group: "beige" },
  stone: { hex: "#C9BFA8", group: "beige" },
  tan: { hex: "#C9A87C", group: "beige" },
  camel: { hex: "#C9A87C", group: "beige" },
  olive: { hex: "#7A7A5C", group: "olive" },
  "olive green": { hex: "#7A7A5C", group: "olive" },
  green: { hex: "#5A7A5C", group: "olive" },
  forest: { hex: "#4A6A4C", group: "olive" },
  blue: { hex: "#40536E", group: "blue" },
  indigo: { hex: "#2E3A59", group: "blue" },
  navy: { hex: "#1E2A45", group: "blue" },
  slate: { hex: "#4A5A72", group: "blue" },
  cobalt: { hex: "#2A4A7E", group: "blue" },
  grey: { hex: "#5A5A5A", group: "grey" },
  gray: { hex: "#5A5A5A", group: "grey" },
  charcoal: { hex: "#3C3C3C", group: "grey" },
  "light grey": { hex: "#9A9A9A", group: "grey" },
  rust: { hex: "#A65E3F", group: "rust" },
  brown: { hex: "#7B4F2E", group: "rust" },
  chocolate: { hex: "#6B3F2E", group: "rust" },
  burgundy: { hex: "#7B2E3F", group: "rust" },
};

function resolveColor(
  product: ShopifyProduct
): { name: string; hex: string; group: ColorGroup } {
  // Try "Color" / "Colour" option
  const colorOpt = product.options.find(
    (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
  );

  const colorName =
    colorOpt && colorOpt.values.length > 0
      ? colorOpt.values[0]
      : null;

  if (colorName) {
    const lower = colorName.toLowerCase();
    const exact = COLOR_MAP[lower];
    if (exact) return { name: colorName, hex: exact.hex, group: exact.group };
    // Fuzzy match
    const fuzzy = Object.entries(COLOR_MAP).find(([key]) =>
      lower.includes(key) || key.includes(lower)
    );
    if (fuzzy) return { name: colorName, hex: fuzzy[1].hex, group: fuzzy[1].group };
    // Unknown color — use neutral grey
    return { name: colorName, hex: "#8A8578", group: "grey" };
  }

  // Try tags as fallback
  for (const tag of product.tags) {
    const lower = tag.toLowerCase();
    const match = Object.entries(COLOR_MAP).find(([key]) => lower.includes(key));
    if (match) return { name: tag, hex: match[1].hex, group: match[1].group };
  }

  return { name: "Classic", hex: "#8A8578", group: "grey" };
}

const APP_TAG_MAP: Record<string, string> = {
  new: "new",
  "new arrival": "new",
  "new-arrival": "new",
  trending: "trending",
  "best-find": "best-find",
  "best find": "best-find",
  bestseller: "best-find",
  "best seller": "best-find",
  "best-value": "best-value",
  "best value": "best-value",
};

/* ——— Variant mapper ——— */

function mapVariant(v: ShopifyProductVariant): AppVariant {
  return {
    id: v.id,
    title: v.title,
    sku: v.sku,
    price: parseFloat(v.price.amount),
    compareAtPrice: v.compareAtPrice
      ? parseFloat(v.compareAtPrice.amount)
      : null,
    availableForSale: v.availableForSale,
    selectedOptions: v.selectedOptions,
    image: v.image?.url ?? null,
  };
}

/* ——— Product mapper ——— */

export function mapShopifyProduct(sp: ShopifyProduct): AppProduct {
  const variants = sp.variants.nodes.map(mapVariant);

  // Price: cheapest available variant, or first variant if all sold out
  const available = variants.filter((v) => v.availableForSale);
  const priceVariant = available[0] ?? variants[0];
  const price = priceVariant?.price ?? 0;
  const compareAt =
    priceVariant?.compareAtPrice != null
      ? priceVariant.compareAtPrice
      : undefined;

  // Sizes: from "Size" option, or variant titles
  const sizeOption = sp.options.find(
    (o) => o.name.toLowerCase() === "size"
  );
  const sizes = sizeOption?.values.length
    ? sizeOption.values
    : variants.map((v) => v.title).filter(Boolean);

  // Out-of-stock sizes
  const outOfStockSizes = variants
    .filter((v) => !v.availableForSale)
    .map((v) => {
      const sOpt = v.selectedOptions.find(
        (o) => o.name.toLowerCase() === "size"
      );
      return sOpt ? sOpt.value : v.title;
    })
    .filter(Boolean);

  // Images — at least 2 for the hover effect in ProductCard
  const images = sp.images.nodes.map((img) => img.url);
  if (images.length === 0 && sp.featuredImage) {
    images.push(sp.featuredImage.url);
  }
  if (images.length === 1) images.push(images[0]);

  // Tags mapped to app tag names
  const tags = sp.tags
    .map((t) => APP_TAG_MAP[t.toLowerCase()])
    .filter(Boolean) as string[];

  return {
    // Product interface fields
    id: sp.handle,
    name: sp.title,
    category: normalizeCategory(sp.productType),
    price,
    compareAt,
    fabric: "Premium quality fabric",
    fit: "True to size",
    description: sp.description || sp.title,
    sizes,
    outOfStockSizes,
    soldOut: !sp.availableForSale,
    images,
    tags,
    addedAt: sp.createdAt,
    rating: 4.5,
    reviews: 0,
    color: resolveColor(sp),
    // Shopify extras
    handle: sp.handle,
    shopifyId: sp.id,
    variants,
    options: sp.options,
  };
}

export function mapShopifyProducts(products: ShopifyProduct[]): AppProduct[] {
  return products.map(mapShopifyProduct);
}
