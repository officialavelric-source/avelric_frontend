import type { ShopifyCart, ShopifyCartLine } from "../../../types/shopify";
import type { AppCart, AppCartLine } from "../../../types/app";

function mapCartLine(line: ShopifyCartLine): AppCartLine {
  const merch = line.merchandise;
  return {
    id: line.id,
    variantId: merch.id,
    productHandle: merch.product.handle,
    productTitle: merch.product.title,
    variantTitle: merch.title,
    sku: merch.sku,
    image: merch.image?.url ?? null,
    price: parseFloat(merch.price.amount),
    quantity: line.quantity,
  };
}

export function mapShopifyCart(cart: ShopifyCart): AppCart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines: cart.lines.nodes.map(mapCartLine),
    subtotal: parseFloat(cart.cost.subtotalAmount.amount),
    total: parseFloat(cart.cost.totalAmount.amount),
    totalQuantity: cart.totalQuantity,
  };
}
