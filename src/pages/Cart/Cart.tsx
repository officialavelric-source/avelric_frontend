import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { getProduct } from "../../services/productService";
import { FREE_SHIP_AT } from "../../constants/shipping";
import { Reveal } from "../../components/common";
import { CartItemRow, FreeShippingBar, MobileCheckoutBar, OrderSummary, SavedItemRow } from "../../components/cart";

export default function Cart() {
  const { items, saved, updateQty, remove, saveForLater, moveToCart, removeSaved, subtotal, mrpTotal, count } = useCart();
  const { push } = useToast();
  const navigate = useNavigate();

  const shipping = subtotal >= FREE_SHIP_AT || subtotal === 0 ? 0 : 79;
  const discount = mrpTotal - subtotal;
  const total = subtotal + shipping;

  if (items.length === 0 && saved.length === 0)
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 stroke-warmgray" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" />
        </svg>
        <h1 className="mt-6 font-display text-[32px]">Your cart is empty</h1>
        <p className="mt-3 text-warmgray">The weekly finds are the best place to start.</p>
        <Link to="/shop" className="label mt-8 inline-block rounded-full bg-softblack px-8 py-4 text-[12px] text-ivory">
          Explore the collection
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 md:px-6 md:py-16 lg:pb-16">
      <Reveal>
        <h1 className="font-display text-[32px] md:text-[40px]">
          Cart {count > 0 && <span className="text-[20px] text-warmgray md:text-[24px]">({count} item{count === 1 ? "" : "s"})</span>}
        </h1>
      </Reveal>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div>
          {/* free shipping progress */}
          {items.length > 0 && <FreeShippingBar subtotal={subtotal} shipping={shipping} />}

          {/* item rows */}
          <ul className="mt-5 divide-y divide-softblack/10 rounded-2xl border border-softblack/10 bg-ivory px-5 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)]">
            {items.map((item) => {
              const p = getProduct(item.productId);
              if (!p) return null;
              return (
                <CartItemRow
                  key={p.id + item.size}
                  product={p}
                  item={item}
                  onUpdateQty={(qty) => updateQty(p.id, item.size, qty)}
                  onSaveForLater={() => { saveForLater(p.id, item.size); push({ message: `Saved "${p.name}" for later` }); }}
                  onRemove={() => { remove(p.id, item.size); push({ message: `Removed "${p.name}" from cart` }); }}
                />
              );
            })}
            {items.length === 0 && (
              <li className="py-10 text-center text-warmgray">
                Cart is empty — your saved items are below.
              </li>
            )}
          </ul>

          {/* saved for later */}
          {saved.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-[22px]">Saved for later ({saved.length})</h2>
              <ul className="mt-4 divide-y divide-softblack/10 rounded-2xl border border-softblack/10 bg-beige/40 px-5">
                {saved.map((item) => {
                  const p = getProduct(item.productId);
                  if (!p) return null;
                  return (
                    <SavedItemRow
                      key={p.id + item.size}
                      product={p}
                      item={item}
                      onMoveToCart={() => { moveToCart(p.id, item.size); push({ message: `Moved "${p.name}" to cart`, action: { label: "Cart", to: "/cart" } }); }}
                      onRemove={() => removeSaved(p.id, item.size)}
                    />
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* ---------- ORDER SUMMARY ---------- */}
        <aside className="lg:sticky" style={{ top: 96 }}>
          <OrderSummary
            count={count}
            mrpTotal={mrpTotal}
            discount={discount}
            shipping={shipping}
            total={total}
            checkoutDisabled={items.length === 0}
            onCheckout={() => navigate("/checkout")}
          />
        </aside>
      </div>

      {items.length > 0 && (
        <MobileCheckoutBar total={total} discount={discount} onCheckout={() => navigate("/checkout")} />
      )}
    </div>
  );
}
