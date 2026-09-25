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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-softblack/10 bg-ivory/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] sm:text-[16px] font-semibold leading-tight">{formatINR(total)}</p>
          {discount > 0 && <p className="text-[11px] sm:text-[11.5px] font-medium text-success truncate">You save {formatINR(discount)}</p>}
        </div>
        <button onClick={onCheckout} className="label shrink-0 rounded-full bg-softblack px-5 sm:px-8 py-3.5 sm:py-4 text-[11px] text-ivory transition-transform active:scale-95">
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
