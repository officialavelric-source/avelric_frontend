import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { Reveal, BoxIcon } from "../../components/common";
import { analyticsService } from "../../services/analytics";

export default function OrderSuccess() {
  const { clear } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [searchParams] = useSearchParams();

  // Extract order reference from URL parameters if available
  const rawOrderNumber =
    searchParams.get("order_number") ||
    searchParams.get("order_id") ||
    searchParams.get("order") ||
    searchParams.get("id");

  const orderNumber = useMemo(() => {
    if (rawOrderNumber) {
      return rawOrderNumber.startsWith("#") ? rawOrderNumber : `#${rawOrderNumber}`;
    }
    // Consistent session order reference
    const cached = sessionStorage.getItem("avelric_last_order_num");
    if (cached) return cached;
    const generated = `#AV-${Math.floor(100000 + Math.random() * 900000)}`;
    sessionStorage.setItem("avelric_last_order_num", generated);
    return generated;
  }, [rawOrderNumber]);

  // Clean the cart immediately upon landing on order confirmation
  useEffect(() => {
    try {
      clear();
      // Remove any lingering checkout tokens
      sessionStorage.removeItem("avelric_checkout_pending");
    } catch {
      // ignore
    }
  }, [clear]);

  // Track purchase event in GA4 with deduplication guard
  useEffect(() => {
    const STORAGE_KEY = "avelric_processed_orders";
    try {
      const processed: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!processed.includes(orderNumber)) {
        const storedValue = parseFloat(sessionStorage.getItem("avelric_last_checkout_value") || "0");
        const rawItems = sessionStorage.getItem("avelric_last_checkout_items");
        const storedItems = rawItems ? JSON.parse(rawItems) : [];

        analyticsService.trackPurchase({
          transaction_id: orderNumber,
          value: storedValue > 0 ? storedValue : 2499,
          currency: "INR",
          tax: 0,
          shipping: 0,
          items: storedItems.length > 0 ? storedItems : [
            {
              item_id: orderNumber,
              item_name: "AVELRIC Bespoke Garment",
              item_brand: "AVELRIC",
              price: storedValue > 0 ? storedValue : 2499,
              quantity: 1,
              currency: "INR",
            },
          ],
        });

        processed.push(orderNumber);
        if (processed.length > 100) processed.shift();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(processed));
      }
    } catch {
      // fail-safe
    }
  }, [orderNumber]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-24 text-center">
      <Reveal>
        {/* Status Emblem */}
        <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs mb-5 sm:mb-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-700 animate-fade-in"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Brand Tagline */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B8860B]" />
          <p className="text-[11px] sm:text-[11.5px] uppercase tracking-[0.25em] font-medium text-neutral-500">
            Avelric Atelier · Order Confirmed
          </p>
        </div>

        {/* Title */}
        <h1 className="font-display text-[26px] sm:text-[42px] leading-tight text-neutral-900 font-semibold tracking-tight">
          Thank You For Your Patronage
        </h1>

        <p className="mt-3 text-[14px] sm:text-[16px] text-neutral-600 font-light max-w-lg mx-auto leading-relaxed">
          Your order has been recorded. Our craftsmen are preparing your garment with the highest care.
        </p>

        {/* Order Reference Badge */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-neutral-100/90 border border-neutral-200/80 px-6 py-2.5 text-neutral-900">
          <span className="text-[12px] uppercase tracking-wider text-neutral-500 font-medium">Order Number:</span>
          <span className="font-display font-bold text-[15px] tracking-wide text-black">{orderNumber}</span>
          {customer?.email && (
            <span className="text-[12px] text-neutral-400 font-light border-l border-neutral-300 pl-2">
              {customer.email}
            </span>
          )}
        </div>

        {/* Order Status & Delivery Timeline */}
        <div className="mt-12 rounded-3xl border border-neutral-200/90 bg-[#FAF9F6] p-7 sm:p-9 text-left shadow-xs">
          <h3 className="text-[13px] uppercase tracking-[0.2em] font-semibold text-neutral-900 mb-6">
            Fulfilment & Delivery Trajectory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3.5 sm:gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-[12px] font-bold shrink-0">
                ✓
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">Payment Secured</p>
                <p className="text-[11.5px] text-neutral-500 font-light mt-0.5">Order logged in atelier</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3.5 sm:gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white text-[12px] font-bold shrink-0">
                2
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">Preparation & Inspection</p>
                <p className="text-[11.5px] text-neutral-500 font-light mt-0.5">Finishing & bespoke packaging</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3.5 sm:gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 text-[12px] font-bold shrink-0">
                3
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-600">Courier Handover</p>
                <p className="text-[11.5px] text-neutral-400 font-light mt-0.5">Bluedart / Delhivery Express</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex sm:flex-col items-center sm:items-start gap-3.5 sm:gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 text-[12px] font-bold shrink-0">
                4
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-600">Doorstep Delivery</p>
                <p className="text-[11.5px] text-neutral-400 font-light mt-0.5">Signature delivery</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-neutral-200/70 pt-6 text-[13px] text-neutral-600 space-y-2">
            <p className="flex items-center gap-2">
              <span className="text-[#B8860B] font-bold">⚡</span>
              <span><strong>Chandigarh, Kharar, Mohali &amp; Panchkula:</strong> Same-day doorstep dispatch.</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neutral-400 font-bold">📍</span>
              <span><strong>All other regions across India:</strong> Expected delivery in <strong>7–9 working days</strong>.</span>
            </p>
          </div>
        </div>

        {/* Key Patron Assurances */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 text-neutral-900 font-semibold text-[14px] mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[#B8860B]">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Email Updates &amp; Live Tracking</span>
            </div>
            <p className="text-[12.5px] text-neutral-500 font-light leading-relaxed">
              Order invoice, pack notification, and the courier tracking link will be dispatched directly to your registered email.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 text-neutral-900 font-semibold text-[14px] mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[#B8860B]">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              <span>7-Day Complimentary Exchange</span>
            </div>
            <p className="text-[12.5px] text-neutral-500 font-light leading-relaxed">
              Need another size or fit adjustment? Doorstep pickup &amp; exchange is arranged effortlessly by writing to <span className="font-medium text-neutral-800">officialavelric@gmail.com</span>.
            </p>
          </div>
        </div>

        {/* Primary Call-to-Actions */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/shop"
            className="w-full sm:w-auto rounded-full bg-neutral-900 px-10 py-4 text-[12px] uppercase tracking-widest font-semibold text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-md text-center"
          >
            Continue Shopping
          </Link>

          {isAuthenticated ? (
            <Link
              to="/account"
              className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white px-8 py-4 text-[12px] uppercase tracking-widest font-medium text-neutral-800 transition-all hover:border-black hover:bg-neutral-50 text-center"
            >
              View My Account &amp; Orders
            </Link>
          ) : (
            <Link
              to="/new-arrivals"
              className="w-full sm:w-auto rounded-full border border-neutral-300 bg-white px-8 py-4 text-[12px] uppercase tracking-widest font-medium text-neutral-800 transition-all hover:border-black hover:bg-neutral-50 text-center"
            >
              Explore New Arrivals
            </Link>
          )}
        </div>

        {/* Concierge Help */}
        <p className="mt-10 text-[12px] text-neutral-400 font-light">
          Have questions regarding this order? Write directly to our concierge at{" "}
          <a
            href="mailto:officialavelric@gmail.com"
            className="text-neutral-700 underline underline-offset-4 hover:text-black font-medium"
          >
            officialavelric@gmail.com
          </a>
        </p>
      </Reveal>
    </div>
  );
}
