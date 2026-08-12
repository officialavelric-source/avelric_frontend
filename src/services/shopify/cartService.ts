import { shopifyFetch } from "./client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION,
  CART_QUERY,
} from "./mutations/cart";
import { mapShopifyCart } from "./mappers/cartMapper";
import type { AppCart } from "../../types/app";
import type { ShopifyCart, ShopifyUserError } from "../../types/shopify";

/* Shopify CartLineInput */
export interface CartLineInput {
  merchandiseId: string; // Shopify variant GID
  quantity: number;
}

/* Shopify CartLineUpdateInput */
export interface CartLineUpdateInput {
  id: string;      // Shopify cart line GID
  quantity: number;
}

export interface CartBuyerIdentityInput {
  customerAccessToken?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  deliveryAddressPreferences?: Array<{
    deliveryAddress: {
      address1?: string;
      address2?: string;
      city?: string;
      company?: string;
      country?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      province?: string;
      zip?: string;
    };
  }>;
}

type CartCreatePayload = {
  cartCreate: { cart: ShopifyCart | null; userErrors: ShopifyUserError[] };
};
type CartLinesAddPayload = {
  cartLinesAdd: { cart: ShopifyCart | null; userErrors: ShopifyUserError[] };
};
type CartLinesUpdatePayload = {
  cartLinesUpdate: { cart: ShopifyCart | null; userErrors: ShopifyUserError[] };
};
type CartLinesRemovePayload = {
  cartLinesRemove: { cart: ShopifyCart | null; userErrors: ShopifyUserError[] };
};
type CartBuyerIdentityUpdatePayload = {
  cartBuyerIdentityUpdate: { cart: ShopifyCart | null; userErrors: ShopifyUserError[] };
};
type CartQueryPayload = { cart: ShopifyCart | null };

function assertCart(cart: ShopifyCart | null, errors: ShopifyUserError[]): ShopifyCart {
  if (errors.length > 0) {
    console.warn("[ShopifyCart] userErrors:", errors.map((e) => e.message).join(", "));
  }
  if (!cart) throw new Error("Shopify cart mutation returned no cart");
  return cart;
}

/** Create a new Shopify cart with one or more lines and optional buyer identity. */
export async function createCart(lines: CartLineInput[], buyerIdentity?: CartBuyerIdentityInput): Promise<AppCart> {
  const data = await shopifyFetch<CartCreatePayload>(CART_CREATE_MUTATION, {
    input: {
      lines,
      ...(buyerIdentity ? { buyerIdentity } : {}),
    },
  });
  const cart = assertCart(data.cartCreate.cart, data.cartCreate.userErrors);
  return mapShopifyCart(cart);
}

/** Add lines to an existing cart. */
export async function addCartLines(
  cartId: string,
  lines: CartLineInput[]
): Promise<AppCart> {
  const data = await shopifyFetch<CartLinesAddPayload>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines }
  );
  const cart = assertCart(data.cartLinesAdd.cart, data.cartLinesAdd.userErrors);
  return mapShopifyCart(cart);
}

/** Update quantities on existing cart lines. */
export async function updateCartLines(
  cartId: string,
  lines: CartLineUpdateInput[]
): Promise<AppCart> {
  const data = await shopifyFetch<CartLinesUpdatePayload>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines }
  );
  const cart = assertCart(
    data.cartLinesUpdate.cart,
    data.cartLinesUpdate.userErrors
  );
  return mapShopifyCart(cart);
}

/** Remove lines from a cart. */
export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<AppCart> {
  const data = await shopifyFetch<CartLinesRemovePayload>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds }
  );
  const cart = assertCart(
    data.cartLinesRemove.cart,
    data.cartLinesRemove.userErrors
  );
  return mapShopifyCart(cart);
}

/** Update buyer identity on an existing cart (e.g. upon customer login). */
export async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentity: CartBuyerIdentityInput
): Promise<AppCart> {
  const data = await shopifyFetch<CartBuyerIdentityUpdatePayload>(
    CART_BUYER_IDENTITY_UPDATE_MUTATION,
    { cartId, buyerIdentity }
  );
  const cart = assertCart(
    data.cartBuyerIdentityUpdate.cart,
    data.cartBuyerIdentityUpdate.userErrors
  );
  return mapShopifyCart(cart);
}

/** Fetch an existing cart (e.g., on page load to get checkoutUrl). */
export async function fetchCart(cartId: string): Promise<AppCart | null> {
  const data = await shopifyFetch<CartQueryPayload>(CART_QUERY, { cartId });
  if (!data.cart) return null;
  return mapShopifyCart(data.cart);
}

