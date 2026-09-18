import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CustomerAuthService } from "../../services/shopify/customerAuthService";
import type { CustomerOrder } from "../../types/customer";

export default function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (cursor?: string | null) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await CustomerAuthService.getCustomerOrders(10, cursor);

      setOrders((prev) => (cursor ? [...prev, ...result.orders] : result.orders));
      setHasNextPage(result.pagination.hasNextPage);
      setEndCursor(result.pagination.endCursor);
    } catch (err) {
      console.error("[OrdersPage] Failed to fetch orders:", err);
      setError("Unable to load orders from your Shopify Customer Account.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-[75vh] bg-ivory text-softblack">
      {/* Header section */}
      <section className="border-b border-softblack/10 bg-beige/40 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-[12px] text-warmgray">
            <Link to="/" className="hover:text-softblack">Home</Link>
            <span>/</span>
            <Link to="/account" className="hover:text-softblack">Account</Link>
            <span>/</span>
            <span className="text-softblack font-medium">Orders</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="label text-warmgray text-[11px] tracking-[0.2em]">PATRON ARCHIVE</p>
              <h1 className="mt-1.5 font-display text-[32px] sm:text-[40px] text-softblack">
                Order History
              </h1>
            </div>
            <Link
              to="/account"
              className="label inline-flex items-center gap-2 text-[11px] text-warmgray transition-colors hover:text-softblack"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Return to Account Overview
            </Link>
          </div>
        </div>
      </section>

      {/* Content section */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-softblack/20 border-t-softblack" />
            <p className="mt-4 font-display text-[16px] text-softblack">AVELRIC</p>
            <p className="mt-1 text-[13px] text-warmgray">Retrieving your verified orders from Shopify...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-softblack/10 bg-beige p-10 text-center">
            <p className="font-display text-[20px] text-softblack">Connection Interrupted</p>
            <p className="mt-2 text-[14px] text-warmgray">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="label mt-6 inline-block rounded-full bg-softblack px-7 py-3 text-[11px] text-ivory transition-transform hover:scale-[1.02]"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-softblack/10 bg-white/70 px-6 py-20 text-center shadow-[0_2px_20px_-8px_rgba(26,26,26,0.06)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-beige">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-warmgray" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="font-display text-[24px] text-softblack">No Orders Yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-warmgray">
              Your Shopify account currently has no purchase records with AVELRIC. Once you place an order, your complete dossier and live dispatch tracking will appear here.
            </p>
            <Link
              to="/shop"
              className="label mt-7 inline-block rounded-full bg-softblack px-8 py-3.5 text-[11px] text-ivory transition-transform hover:scale-[1.02]"
            >
              Explore the Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-warmgray">
                Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            <div className="space-y-6">
              {orders.map((order) => {
                const formattedDate = new Date(order.processedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                // Canonical order param: uses clean numeric ID segment (e.g. 7540138967318)
                const orderParam = order.id.split("/").pop() || encodeURIComponent(order.id);
                const detailPath = `/account/orders/${orderParam}`;

                const isFulfilled =
                  order.fulfillmentStatus?.toUpperCase() === "FULFILLED" ||
                  order.fulfillmentStatus?.toUpperCase() === "DELIVERED";

                const isPaid = order.financialStatus?.toUpperCase() === "PAID";

                return (
                  <div
                    key={order.id}
                    className="group rounded-3xl border border-softblack/10 bg-white/70 p-6 sm:p-8 transition-all hover:border-softblack/20 hover:shadow-[0_4px_24px_-8px_rgba(26,26,26,0.08)]"
                  >
                    {/* Top Row: Order Name, Date, Status Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-softblack/10 pb-5">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="font-display text-[20px] text-softblack">{order.name}</h2>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {order.financialStatus}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              isFulfilled
                                ? "bg-softblack text-ivory"
                                : "bg-softblack/10 text-softblack"
                            }`}
                          >
                            {order.fulfillmentStatus}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] text-warmgray">Ordered on {formattedDate}</p>
                      </div>

                      <div className="text-right">
                        <p className="label text-[11px] text-warmgray">Total</p>
                        <p className="font-display text-[18px] text-softblack">
                          {order.currencyCode} {parseFloat(order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Line items thumbnail strip */}
                    <div className="divide-y divide-softblack/5 py-4">
                      {order.lineItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.imageAlt || item.title}
                                className="h-14 w-14 rounded-xl object-cover bg-beige/60"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-beige/80 text-[11px] text-warmgray">
                                Piece
                              </div>
                            )}
                            <div>
                              <p className="text-[14px] font-medium text-softblack">{item.title}</p>
                              {item.variantTitle && (
                                <p className="text-[12px] text-warmgray">{item.variantTitle}</p>
                              )}
                              <p className="text-[12px] text-warmgray">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-[14px] font-medium text-softblack">
                            {item.currencyCode} {parseFloat(item.priceAmount).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Bottom: Action link to full dossier */}
                    <div className="mt-2 flex items-center justify-end border-t border-softblack/10 pt-4">
                      <Link
                        to={detailPath}
                        className="label inline-flex items-center gap-2 rounded-full border border-softblack/15 bg-transparent px-5 py-2.5 text-[11px] text-softblack transition-all hover:bg-softblack hover:text-ivory"
                      >
                        <span>View Order Dossier & Tracking</span>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load More */}
            {hasNextPage && (
              <div className="pt-8 text-center">
                <button
                  onClick={() => fetchOrders(endCursor)}
                  disabled={loadingMore}
                  className="label inline-flex items-center gap-3 rounded-full border border-softblack/20 bg-ivory px-8 py-3.5 text-[11px] text-softblack transition-all hover:bg-softblack hover:text-ivory disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-softblack/30 border-t-softblack" />
                      <span>Loading Archives...</span>
                    </>
                  ) : (
                    <span>Load Earlier Orders</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
