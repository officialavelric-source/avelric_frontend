import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CustomerAuthService } from "../../services/shopify/customerAuthService";
import type { CustomerOrderDetail } from "../../types/customer";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    let targetId = id;
    try {
      targetId = decodeURIComponent(id);
    } catch {
      targetId = id;
    }

    CustomerAuthService.getOrderById(targetId)
      .then((data) => {
        if (isMounted) {
          if (!data) {
            setError("Order not found or not associated with this customer account.");
          } else {
            setOrder(data);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("[OrderDetails] Failed to load order:", err);
          setError("Failed to retrieve order details from Shopify.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-ivory py-24 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-softblack/20 border-t-softblack" />
        <p className="mt-4 font-display text-[16px] text-softblack">AVELRIC</p>
        <p className="mt-1 text-[13px] text-warmgray">Loading order dossier...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] bg-ivory py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="rounded-3xl border border-softblack/10 bg-beige/60 p-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-beige text-warmgray">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-display text-[22px] text-softblack">Order Dossier Not Found</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-warmgray">
              {error || "We could not find the requested order in your Shopify customer records."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                to="/account/orders"
                className="label rounded-full bg-softblack px-7 py-3 text-[11px] text-ivory transition-transform hover:scale-[1.02]"
              >
                Back to Order History
              </Link>
              <Link
                to="/account"
                className="label rounded-full border border-softblack/15 py-3 text-[11px] text-softblack transition-colors hover:bg-beige"
              >
                Account Overview
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.processedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(order.processedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPaid = order.financialStatus?.toUpperCase() === "PAID";
  const isFulfilled =
    order.fulfillmentStatus?.toUpperCase() === "FULFILLED" ||
    order.fulfillmentStatus?.toUpperCase() === "DELIVERED";

  return (
    <div className="min-h-[75vh] bg-ivory pb-20 text-softblack">
      {/* Header section */}
      <section className="border-b border-softblack/10 bg-beige/40 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-[12px] text-warmgray">
            <Link to="/" className="hover:text-softblack">Home</Link>
            <span>/</span>
            <Link to="/account" className="hover:text-softblack">Account</Link>
            <span>/</span>
            <Link to="/account/orders" className="hover:text-softblack">Orders</Link>
            <span>/</span>
            <span className="text-softblack font-medium">{order.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="font-display text-[24px] sm:text-[30px] md:text-[38px] text-softblack">
                  Order {order.name}
                </h1>
                <span
                  className={`rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-wider ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {order.financialStatus}
                </span>
                <span
                  className={`rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-wider ${
                    isFulfilled
                      ? "bg-softblack text-ivory"
                      : "bg-softblack/10 text-softblack"
                  }`}
                >
                  {order.fulfillmentStatus}
                </span>
              </div>
              <p className="mt-1.5 sm:mt-2 text-[12px] sm:text-[13px] text-warmgray">
                Placed on {formattedDate} at {formattedTime}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {order.statusPageUrl && (
                <a
                  href={order.statusPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label inline-flex items-center gap-1.5 rounded-full border border-softblack/15 bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-[10.5px] sm:text-[11px] text-softblack transition-all hover:bg-softblack hover:text-ivory shadow-xs"
                >
                  <span>Shopify Order Status</span>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
              <Link
                to="/account/orders"
                className="label inline-flex items-center gap-1.5 rounded-full border border-softblack/15 px-4 sm:px-5 py-2 sm:py-2.5 text-[10.5px] sm:text-[11px] text-softblack transition-colors hover:bg-beige"
              >
                <span>All Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <main className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: Fulfillment Tracking + Line Items */}
          <div className="space-y-8 lg:col-span-2">
            {/* Fulfillment & Tracking Dossier */}
            <div className="rounded-3xl border border-softblack/10 bg-white/80 p-6 sm:p-8 shadow-[0_2px_16px_-8px_rgba(26,26,26,0.06)]">
              <div className="flex items-center justify-between border-b border-softblack/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-softblack" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75c0-.621-.504-1.125-1.125-1.125h-9.75c-.621 0-1.125.504-1.125 1.125v10.5c0 .621.504 1.125 1.125 1.125h2.25" />
                  </svg>
                  <h2 className="font-display text-[18px] text-softblack">Dispatch & Shipment Tracking</h2>
                </div>
                <span className="text-[12px] font-medium uppercase tracking-wider text-warmgray">
                  {order.fulfillmentStatus}
                </span>
              </div>

              {order.fulfillments && order.fulfillments.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {order.fulfillments.map((fulfillment, fIdx) => (
                    <div key={fIdx} className="rounded-2xl border border-softblack/10 bg-beige/30 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-medium text-softblack">
                          Fulfillment #{fIdx + 1}
                        </p>
                        <span className="rounded-full bg-softblack/10 px-2.5 py-0.5 text-[10.5px] uppercase tracking-wider text-softblack">
                          {fulfillment.status}
                        </span>
                      </div>

                      {fulfillment.tracking && fulfillment.tracking.length > 0 ? (
                        <div className="mt-4 space-y-3">
                          {fulfillment.tracking.map((track, tIdx) => (
                            <div
                              key={tIdx}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3.5 border border-softblack/5"
                            >
                              <div>
                                <p className="label text-[10px] text-warmgray">Carrier</p>
                                <p className="text-[13px] font-medium text-softblack">
                                  {track.company || "Shopify Standard Delivery"}
                                </p>
                                {track.number && (
                                  <p className="mt-0.5 text-[12px] text-warmgray font-mono">
                                    Tracking #: {track.number}
                                  </p>
                                )}
                              </div>

                              {track.url && (
                                <a
                                  href={track.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="label inline-flex items-center gap-1.5 rounded-full bg-softblack px-4 py-2 text-[10.5px] text-ivory transition-transform hover:scale-[1.03]"
                                >
                                  <span>Track Package</span>
                                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[13px] text-warmgray">
                          Tracking coordinates will update as soon as the courier scans the package.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-softblack/5 bg-beige/20 p-5 text-[13.5px] text-warmgray leading-relaxed">
                  <p className="font-medium text-softblack">Atelier Preparation</p>
                  <p className="mt-1">
                    Your pieces are currently being carefully inspected and prepared in our atelier. Real-time carrier tracking coordinates will appear here once handed over to the courier.
                  </p>
                </div>
              )}
            </div>

            {/* Line Items List */}
            <div className="rounded-3xl border border-softblack/10 bg-white/80 p-6 sm:p-8 shadow-[0_2px_16px_-8px_rgba(26,26,26,0.06)]">
              <h2 className="font-display text-[18px] text-softblack border-b border-softblack/10 pb-4">
                Purchased Pieces ({order.lineItems.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>

              <div className="divide-y divide-softblack/5">
                {order.lineItems.map((item, idx) => {
                  const lineTotal = (parseFloat(item.priceAmount) * item.quantity).toFixed(2);

                  return (
                    <div key={idx} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.imageAlt || item.title}
                            className="h-16 w-16 rounded-2xl object-cover bg-beige/60"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-beige/80 text-[11px] text-warmgray">
                            Piece
                          </div>
                        )}
                        <div>
                          <p className="text-[14.5px] font-medium text-softblack">{item.title}</p>
                          {item.variantTitle && (
                            <p className="mt-0.5 text-[12.5px] text-warmgray">{item.variantTitle}</p>
                          )}
                          <p className="mt-0.5 text-[12px] text-warmgray">
                            {item.currencyCode} {parseFloat(item.priceAmount).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-[15px] text-softblack">
                          {item.currencyCode} {lineTotal}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Financial Summary + Shipping Address + Concierge */}
          <div className="space-y-8">
            {/* Financial Summary */}
            <div className="rounded-3xl border border-softblack/10 bg-white/80 p-6 sm:p-7 shadow-[0_2px_16px_-8px_rgba(26,26,26,0.06)]">
              <h2 className="font-display text-[18px] text-softblack border-b border-softblack/10 pb-3">
                Financial Summary
              </h2>

              <div className="mt-4 space-y-3 text-[13.5px]">
                {order.subtotalAmount && (
                  <div className="flex justify-between text-warmgray">
                    <span>Subtotal</span>
                    <span className="font-medium text-softblack">
                      {order.currencyCode} {parseFloat(order.subtotalAmount).toFixed(2)}
                    </span>
                  </div>
                )}

                {order.totalShippingAmount !== null && (
                  <div className="flex justify-between text-warmgray">
                    <span>Shipping</span>
                    <span className="font-medium text-softblack">
                      {parseFloat(order.totalShippingAmount) === 0
                        ? "Complimentary"
                        : `${order.currencyCode} ${parseFloat(order.totalShippingAmount).toFixed(2)}`}
                    </span>
                  </div>
                )}

                {order.totalTaxAmount && (
                  <div className="flex justify-between text-warmgray">
                    <span>Taxes (Included)</span>
                    <span className="font-medium text-softblack">
                      {order.currencyCode} {parseFloat(order.totalTaxAmount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t border-softblack/10 pt-3 flex justify-between items-baseline">
                  <span className="label text-[12px] text-softblack">Grand Total</span>
                  <span className="font-display text-[22px] text-softblack">
                    {order.currencyCode} {parseFloat(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-3xl border border-softblack/10 bg-white/80 p-6 sm:p-7 shadow-[0_2px_16px_-8px_rgba(26,26,26,0.06)]">
              <h2 className="font-display text-[18px] text-softblack border-b border-softblack/10 pb-3">
                Delivery Address
              </h2>

              {order.shippingAddress ? (
                <div className="mt-4 text-[13.5px] leading-relaxed text-warmgray">
                  <p className="font-medium text-softblack">
                    {[order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(" ")}
                  </p>
                  <p className="mt-1">{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="mt-2 text-[12.5px] text-warmgray">Tel: {order.shippingAddress.phone}</p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-warmgray">
                  Digital fulfillment or standard billing address applied.
                </p>
              )}
            </div>

            {/* Concierge Assistance */}
            <div className="rounded-3xl bg-softblack p-7 text-ivory">
              <p className="label text-[10px] text-ivory/60 tracking-[0.2em]">CONCIERGE</p>
              <h3 className="mt-2 font-display text-[19px]">Need order adjustments?</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ivory/70">
                Contact our client advisors regarding sizing exchanges, address amendments, or gift notes.
              </p>
              <Link
                to="/about#contact"
                className="label mt-5 inline-block rounded-full bg-ivory px-6 py-3 text-[11px] text-softblack transition-transform hover:scale-[1.03]"
              >
                Contact Atelier Concierge
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
