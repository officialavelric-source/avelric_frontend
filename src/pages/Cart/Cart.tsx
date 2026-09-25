import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "../../constants/shipping";
import { Reveal } from "../../components/common";
import { CartItemRow, EmptyCartView, FreeShippingBar, MobileCheckoutBar, OrderSummary, SavedItemRow } from "../../components/cart";
import { analyticsService } from "../../services/analytics";

/**
 * Cart page — all product data comes from CartItem.snapshot.
 *
 * PRODUCTION RULE: Cart items carry a price/image snapshot set at add-to-cart time.
 * We do NOT call getProduct() (which previously fell back to mock data).
 * The snapshot is always available because ProductDetails.tsx always passes it.
 */
export default function Cart() {
  const { items, saved, updateQty, remove, saveForLater, moveToCart, removeSaved, subtotal, mrpTotal, count } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();
  const lastTrackedCart = useRef<string>("");

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : STANDARD_SHIPPING;
  const discount = mrpTotal - subtotal;
  const total = subtotal + shipping;

  // Track view_cart in GA4
  useEffect(() => {
    if (items.length > 0) {
      const cartKey = `${items.length}-${subtotal}`;
      if (lastTrackedCart.current !== cartKey) {
        lastTrackedCart.current = cartKey;
        analyticsService.trackViewCart({
          value: subtotal,
          free_shipping_gap: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
          items: items.map((it, idx) => ({
            item_id: it.variantId || it.productId,
            item_name: it.snapshot?.name || it.productId,
            item_brand: "AVELRIC",
            item_variant: it.size,
            price: it.snapshot?.price || 0,
            quantity: it.qty,
            currency: "INR",
            index: idx + 1,
          })),
        });
      }
    }
  }, [items, subtotal]);

  const handleCheckoutClick = () => {
    analyticsService.trackBeginCheckout({
      value: subtotal,
      items: items.map((it, idx) => ({
        item_id: it.variantId || it.productId,
        item_name: it.snapshot?.name || it.productId,
        item_brand: "AVELRIC",
        item_variant: it.size,
        price: it.snapshot?.price || 0,
        quantity: it.qty,
        currency: "INR",
        index: idx + 1,
      })),
    });
    navigate("/checkout");
  };

  if (items.length === 0 && saved.length === 0) {
    return <EmptyCartView />;
  }

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 py-6 sm:py-10 pb-32 lg:pb-16">
      <Reveal>
        <h1 className="font-display text-[26px] sm:text-[32px] md:text-[40px]">
          Cart {count > 0 && <span className="text-[18px] sm:text-[20px] text-warmgray md:text-[24px]">({count} item{count === 1 ? "" : "s"})</span>}
        </h1>
      </Reveal>

      <div className="mt-6 sm:mt-8 grid items-start gap-6 sm:gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div>
          {/* Free shipping progress */}
          {items.length > 0 && <FreeShippingBar subtotal={subtotal} shipping={shipping} />}

          {/* Item rows — rendered from CartItem with front images and Shopify sync */}
          <ul className="mt-4 sm:mt-5 divide-y divide-softblack/10 rounded-2xl border border-softblack/10 bg-ivory px-3.5 sm:px-5 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)]">
            {items.map((item) => (
              <CartItemRow
                key={item.productId + item.size}
                item={item}
                onUpdateQty={(qty) => updateQty(item.productId, item.size, qty)}
                onSaveForLater={() => {
                  saveForLater(item.productId, item.size);
                  push({ message: `Saved "${item.snapshot?.name || item.productId}" for later` });
                }}
                onRemove={() => {
                  analyticsService.trackRemoveFromCart({
                    value: (item.snapshot?.price || 0) * item.qty,
                    items: [
                      {
                        item_id: item.variantId || item.productId,
                        item_name: item.snapshot?.name || item.productId,
                        item_brand: "AVELRIC",
                        item_variant: item.size,
                        price: item.snapshot?.price || 0,
                        quantity: item.qty,
                        currency: "INR",
                      },
                    ],
                  });
                  remove(item.productId, item.size);
                  push({ message: `Removed "${item.snapshot?.name || item.productId}" from cart` });
                }}
              />
            ))}
            {items.length === 0 && (
              <li className="py-10 text-center text-warmgray">
                Cart is empty — your saved items are below.
              </li>
            )}
          </ul>

          {/* Saved for later */}
          {saved.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-[22px]">Saved for later ({saved.length})</h2>
              <ul className="mt-4 divide-y divide-softblack/10 rounded-2xl border border-softblack/10 bg-beige/40 px-5">
                {saved.map((item) => (
                  <SavedItemRow
                    key={item.productId + item.size}
                    item={item}
                    onMoveToCart={() => {
                      moveToCart(item.productId, item.size);
                      push({ message: `Moved "${item.snapshot?.name || item.productId}" to cart`, action: { label: "Cart", to: "/cart" } });
                    }}
                    onRemove={() => removeSaved(item.productId, item.size)}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Order Summary */}
        <aside className="lg:sticky" style={{ top: 96 }}>
          <OrderSummary
            count={count}
            mrpTotal={mrpTotal}
            discount={discount}
            shipping={shipping}
            total={total}
            checkoutDisabled={items.length === 0}
            onCheckout={handleCheckoutClick}
          />
        </aside>
      </div>

      {items.length > 0 && (
        <MobileCheckoutBar total={total} discount={discount} onCheckout={handleCheckoutClick} />
      )}
    </div>
  );
}
