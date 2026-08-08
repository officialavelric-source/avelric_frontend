import { formatINR } from "../../utils/format";

/* Sticky checkout bar — mobile only */

export default function MobileCheckoutBar({
  total,
  discount,
  onCheckout,
}: {
  total: number;
  discount: number;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-softblack/10 bg-ivory/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-[16px] font-semibold leading-tight">{formatINR(total)}</p>
          {discount > 0 && <p className="text-[11.5px] font-medium text-success">You save {formatINR(discount)}</p>}
        </div>
        <button onClick={onCheckout} className="label rounded-full bg-softblack px-8 py-4 text-[11px] text-ivory">
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
