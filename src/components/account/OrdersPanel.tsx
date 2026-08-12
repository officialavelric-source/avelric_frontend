import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomerAuthService } from "../../services/shopify/customerAuthService";
import type { CustomerOrder } from "../../types/customer";

export default function OrdersPanel() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    CustomerAuthService.getCustomerOrders(20)
      .then((data) => {
        if (active) {
          setOrders(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("[OrdersPanel] Failed to fetch orders:", err);
          setError("Unable to load order history from Shopify.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-softblack/20 border-t-softblack" />
        <p className="mt-4 text-[13px] text-warmgray">Fetching orders from Shopify...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-softblack/10 bg-beige p-8 text-center">
        <p className="font-display text-[18px] text-softblack">Order History Unavailable</p>
        <p className="mt-2 text-[13.5px] text-warmgray">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-softblack/10 bg-ivory px-7 py-12 text-center shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)]">
          <svg viewBox="0 0 24 24" className="mx-auto h-10 w-10 stroke-warmgray" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" />
          </svg>
          <p className="mt-5 font-display text-[20px]">No orders found</p>
          <p className="mt-2.5 max-w-sm mx-auto text-[13.5px] leading-relaxed text-warmgray">
            You haven't placed any orders with this Shopify Customer Account yet.
          </p>
          <Link to="/shop" className="label mt-6 inline-block rounded-full bg-softblack px-7 py-3 text-[10.5px] text-ivory">
            Explore the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display text-[20px] text-softblack">Order History ({orders.length})</h3>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-softblack/10 bg-ivory p-6 shadow-[0_2px_14px_-6px_rgba(26,26,26,0.06)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-softblack/10 pb-4">
              <div>
                <p className="font-display text-[17px] text-softblack">{order.name}</p>
                <p className="mt-0.5 text-[12px] text-warmgray">
                  Placed on {new Date(order.processedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-softblack/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-wider text-softblack">
                  {order.financialStatus}
                </span>
                <span className="rounded-full bg-softblack px-3 py-1 text-[10.5px] font-medium uppercase tracking-wider text-ivory">
                  {order.fulfillmentStatus}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="divide-y divide-softblack/5 py-3">
              {order.lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.imageAlt || item.title} className="h-12 w-12 rounded-lg object-cover bg-beige" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-beige flex items-center justify-center text-[10px] text-warmgray">Item</div>
                    )}
                    <div>
                      <p className="text-[13.5px] font-medium text-softblack">{item.title}</p>
                      {item.variantTitle && <p className="text-[11.5px] text-warmgray">{item.variantTitle}</p>}
                      <p className="text-[11.5px] text-warmgray">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-[13.5px] font-medium text-softblack">
                    {item.currencyCode} {parseFloat(item.priceAmount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t border-softblack/10 pt-3 text-[14px]">
              <span className="label text-warmgray">Order Total</span>
              <span className="font-display text-[16px] text-softblack">
                {order.currencyCode} {parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
