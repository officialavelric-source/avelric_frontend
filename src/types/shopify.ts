/** Shopify Storefront API response TypeScript types. */

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  price: ShopifyMoneyV2;
  compareAtPrice: ShopifyMoneyV2 | null;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyProductVariant[] };
  options: Array<{ id: string; name: string; values: string[] }>;
}

export interface ShopifyProductConnection {
  nodes: ShopifyProduct[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

/* ——— Cart ——— */

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    sku: string | null;
    selectedOptions: ShopifySelectedOption[];
    price: ShopifyMoneyV2;
    compareAtPrice: ShopifyMoneyV2 | null;
    image: ShopifyImage | null;
    product: { id: string; handle: string; title: string };
  };
  cost: {
    totalAmount: ShopifyMoneyV2;
    compareAtAmountPerQuantity: ShopifyMoneyV2 | null;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { nodes: ShopifyCartLine[] };
  cost: {
    subtotalAmount: ShopifyMoneyV2;
    totalAmount: ShopifyMoneyV2;
    totalTaxAmount: ShopifyMoneyV2 | null;
  };
}

export interface ShopifyUserError {
  field: string[] | null;
  message: string;
  code?: string;
}
