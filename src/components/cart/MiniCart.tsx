import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/format";

/**
 * MiniCart — quick preview dropdown, desktop only.
 * Renders from CartItem.snapshot — no mock product lookup.
 */
export default function MiniCart({ open }: { open: boolean }) {
  const { items, count, subtotal } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full z-50 hidden w-[340px] pt-2 lg:block"
          role="dialog"
          aria-label="Cart preview"
        >
          <div className="overflow-hidden rounded-2xl bg-ivory text-softblack shadow-2xl shadow-softblack/20 ring-1 ring-softblack/10">
            {items.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="font-display text-[18px]">Your cart is empty</p>
                <p className="mt-1.5 text-[13px] text-warmgray">Add something from the collection.</p>
                <Link to="/shop" className="label mt-5 inline-block rounded-full bg-softblack px-6 py-3 text-[10.5px] text-ivory">
                  Start shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] divide-y divide-softblack/8 overflow-y-auto px-5">
                  {items.map((item) => {
                    const snap = item.snapshot;
                    if (!snap) {
                      // Fallback for items without snapshot (legacy, no image to show)
                      return (
                        <div key={item.productId + item.size} className="flex items-center gap-3.5 py-3.5">
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-medium">{item.productId}</span>
                            <span className="label mt-0.5 block text-[9.5px] text-warmgray">Size {item.size} · Qty {item.qty}</span>
                          </span>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.productId + item.size}
                        to={`/product/${item.productId}`}
                        className="flex items-center gap-3.5 py-3.5 transition-opacity hover:opacity-70"
                      >
                        <img src={snap.image} alt="" className="h-14 w-11 shrink-0 rounded-lg object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium">{snap.name}</span>
                          <span className="label mt-0.5 block text-[9.5px] text-warmgray">
                            Size {item.size} · Qty {item.qty}
                          </span>
                        </span>
                        <span className="shrink-0 text-[13.5px] font-medium">{formatINR(snap.price * item.qty)}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-softblack/10 bg-beige/60 px-5 py-4">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-warmgray">Subtotal ({count} item{count === 1 ? "" : "s"})</span>
                    <span className="font-semibold">{formatINR(subtotal)}</span>
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                    <Link to="/cart" className="label rounded-full border border-softblack px-4 py-3 text-center text-[10.5px] transition-colors hover:bg-softblack hover:text-ivory">
                      View cart
                    </Link>
                    <Link to="/checkout" className="label rounded-full bg-softblack px-4 py-3 text-center text-[10.5px] text-ivory transition-transform hover:scale-[1.02]">
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
