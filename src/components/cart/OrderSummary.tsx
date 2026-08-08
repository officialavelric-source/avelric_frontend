import { FREE_SHIP_AT } from "../../constants/shipping";
import { formatINR } from "../../utils/format";
import { LockIcon, ReturnIcon, TruckIcon } from "../common";

export default function OrderSummary({
  count,
  mrpTotal,
  discount,
  shipping,
  total,
  checkoutDisabled,
  onCheckout,
}: {
  count: number;
  mrpTotal: number;
  discount: number;
  shipping: number;
  total: number;
  checkoutDisabled: boolean;
  onCheckout: () => void;
}) {
  return (
    <div className="rounded-2xl border border-softblack/10 bg-beige p-6 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.1)] md:p-7">
      <h2 className="font-display text-[20px]">Order summary</h2>
      <dl className="mt-5 space-y-3 text-[14.5px]">
        <div className="flex justify-between">
          <dt className="text-warmgray">Price ({count} item{count === 1 ? "" : "s"})</dt>
          <dd>{formatINR(mrpTotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-warmgray">Discount</dt>
            <dd className="font-medium text-success">− {formatINR(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-warmgray">Delivery</dt>
          <dd>{shipping === 0 ? <span className="font-medium text-success">Free</span> : formatINR(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-softblack/15 pt-3.5 text-[16.5px] font-semibold">
          <dt>Total</dt>
          <dd>{formatINR(total)}</dd>
        </div>
      </dl>
      {discount > 0 && (
        <p className="mt-4 rounded-xl bg-success/10 px-4 py-2.5 text-[13px] font-medium text-success">
          You save {formatINR(discount)} on this order
        </p>
      )}
      <div className="mt-5 flex items-center gap-2 rounded-full border border-softblack/20 bg-ivory px-4 py-1 transition-colors focus-within:border-softblack">
        <input placeholder="Promo code" aria-label="Promo code" className="w-full bg-transparent py-2 text-[14px] placeholder:text-softblack/40 focus:outline-none" />
        <button className="label shrink-0 py-2 text-[10.5px] text-softblack/70 hover:text-softblack">Apply</button>
      </div>
      <button
        onClick={onCheckout}
        disabled={checkoutDisabled}
        className="label mt-6 w-full rounded-full bg-softblack py-5 text-[12px] text-ivory transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Proceed to checkout →
      </button>
      <ul className="mt-5 space-y-2.5 text-[12.5px] text-warmgray">
        <li className="flex items-center gap-2.5"><LockIcon className="h-4 w-4 shrink-0 text-softblack/50" /> Secure checkout — UPI, cards &amp; COD</li>
        <li className="flex items-center gap-2.5"><ReturnIcon className="h-4 w-4 shrink-0 text-softblack/50" /> 7-day easy returns &amp; size exchange</li>
        <li className="flex items-center gap-2.5"><TruckIcon className="h-4 w-4 shrink-0 text-softblack/50" /> Free shipping above {formatINR(FREE_SHIP_AT)}</li>
      </ul>
    </div>
  );
}
