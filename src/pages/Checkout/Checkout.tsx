import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { CustomerAuthService } from "../../services/shopify/customerAuthService";
import { formatINR } from "../../utils/format";
import { createCart, fetchCart, updateCartBuyerIdentity } from "../../services/shopify/cartService";
import type { CartLineInput, CartBuyerIdentityInput } from "../../services/shopify/cartService";

export default function Checkout() {
  const { items, count, subtotal, shopifyCart, checkoutUrl: contextCheckoutUrl } = useCart();
  const { isAuthenticated, customer } = useCustomerAuth();
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const handleRedirect = async () => {
    setResolving(true);
    setResolveError(null);
    try {
      const lines: CartLineInput[] = items
        .filter((i) => i.variantId)
        .map((i) => ({ merchandiseId: i.variantId!, quantity: i.qty }));

      if (lines.length === 0) {
        setResolveError(
          items.length === 0
            ? "Your cart is empty. Add items from the shop to proceed."
            : "Some items in your cart are missing Shopify variant data. Please re-add them from the product page."
        );
        setResolving(false);
        return;
      }

      // Build buyer identity if customer is authenticated
      const token = (isAuthenticated && customer) ? await CustomerAuthService.getValidAccessToken() : null;
      const buyerIdentity: CartBuyerIdentityInput | undefined = (isAuthenticated && customer) ? {
        customerAccessToken: token ?? undefined,
        email: customer.email ?? undefined,
        phone: customer.phone ?? undefined,
        deliveryAddressPreferences: customer.defaultAddress ? [{
          deliveryAddress: {
            firstName: customer.defaultAddress.firstName ?? undefined,
            lastName: customer.defaultAddress.lastName ?? undefined,
            address1: customer.defaultAddress.address1 ?? undefined,
            address2: customer.defaultAddress.address2 ?? undefined,
            city: customer.defaultAddress.city ?? undefined,
            province: customer.defaultAddress.province ?? undefined,
            zip: customer.defaultAddress.zip ?? undefined,
            country: customer.defaultAddress.country ?? undefined,
            phone: customer.defaultAddress.phone ?? undefined,
          }
        }] : undefined
      } : undefined;

      let finalCheckoutUrl: string | null = null;

      // 1. If we already have a valid shopifyCart in context
      if (shopifyCart?.id) {
        try {
          if (buyerIdentity) {
            const updated = await updateCartBuyerIdentity(shopifyCart.id, buyerIdentity);
            finalCheckoutUrl = updated.checkoutUrl;
          } else {
            const fetched = await fetchCart(shopifyCart.id);
            finalCheckoutUrl = fetched?.checkoutUrl ?? shopifyCart.checkoutUrl;
          }
        } catch (err) {
          console.warn("[Checkout] Failed updating existing cart, creating new:", err);
          const newCart = await createCart(lines, buyerIdentity);
          finalCheckoutUrl = newCart.checkoutUrl;
        }
      } else {
        // 2. No shopifyCart in context — create new
        const newCart = await createCart(lines, buyerIdentity);
        finalCheckoutUrl = newCart.checkoutUrl;
      }

      if (finalCheckoutUrl) {
        window.location.href = finalCheckoutUrl;
      } else {
        setResolveError("Unable to create checkout session. Please try again.");
      }
    } catch (err) {
      console.error("[Checkout] failed to create Shopify cart:", err);
      setResolveError("Unable to reach checkout. Please check your connection and try again.");
    } finally {
      setResolving(false);
    }
  };

  const itemsWithVariants = items.filter((i) => i.variantId);
  const itemsMissingVariants = items.filter((i) => !i.variantId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-28 text-center">
      <p className="label text-warmgray">Checkout</p>
      <h1 className="mt-4 font-display text-[32px] leading-tight md:text-[38px]">
        Ready to complete your order?
      </h1>
      <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-warmgray">
        {count > 0
          ? `Your cart has ${count} item${count === 1 ? "" : "s"} totalling ${formatINR(subtotal)}.`
          : "Your cart is empty."}{" "}
        Clicking below will take you to Shopify's secure checkout — UPI, cards, and Cash on Delivery accepted.
      </p>

      {/* Warning: items without variantIds can't checkout */}
      {itemsMissingVariants.length > 0 && (
        <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-5 py-3 text-[13px] text-amber-800">
          {itemsMissingVariants.length} item{itemsMissingVariants.length > 1 ? "s" : ""} could not be verified with Shopify.
          Please re-add them from the product page to include them in checkout.
        </p>
      )}

      {resolveError && (
        <p className="mt-4 rounded-xl bg-beige px-5 py-3 text-[13.5px] text-softblack">
          {resolveError}
        </p>
      )}

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <button
          id="checkout-btn"
          onClick={handleRedirect}
          disabled={resolving || itemsWithVariants.length === 0}
          className="label rounded-full bg-softblack px-10 py-4 text-[12px] text-ivory transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resolving ? "Creating secure checkout…" : "Proceed to Shopify checkout →"}
        </button>
        <Link
          to="/shop"
          className="label rounded-full border border-softblack/25 px-8 py-4 text-[12px] transition-colors hover:border-softblack"
        >
          Continue shopping
        </Link>
      </div>

      <ul className="mt-10 space-y-2 text-[13px] text-warmgray">
        <li>🔒 Payments secured by Shopify Payments</li>
        <li>📦 COD available on orders up to ₹5,000</li>
        <li>↩ 7-day easy size exchange</li>
      </ul>
    </div>
  );
}
