import { shopifyConfig } from "../../config/env";

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly graphqlErrors?: Array<{ message: string }>
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

interface ShopifyResponse<T> {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown; path?: unknown }>;
}

/**
 * Central Shopify Storefront API GraphQL client.
 * All API calls go through this single function.
 *
 * Error handling:
 *   - HTTP non-2xx → throws ShopifyError
 *   - GraphQL `errors` array → throws ShopifyError
 *   - Empty `data` → throws ShopifyError
 *   - Mutation `userErrors` are returned as-is; callers must check them
 */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(shopifyConfig.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": shopifyConfig.storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new ShopifyError(
      `Shopify API HTTP ${res.status}: ${res.statusText}`
    );
  }

  const result = (await res.json()) as ShopifyResponse<T>;

  if (result.errors && result.errors.length > 0) {
    throw new ShopifyError(
      `Shopify GraphQL: ${result.errors.map((e) => e.message).join(", ")}`,
      result.errors
    );
  }

  if (!result.data) {
    throw new ShopifyError("Shopify returned no data");
  }

  return result.data;
}
