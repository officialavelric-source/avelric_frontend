import { FREE_SHIP_AT } from "../../constants/shipping";
import { formatINR } from "../../utils/format";
import { TruckIcon } from "../common";

export default function FreeShippingBar({ subtotal, shipping }: { subtotal: number; shipping: number }) {
  const shipProgress = Math.min(1, subtotal / FREE_SHIP_AT);

  return (
    <div className="rounded-2xl bg-beige px-5 py-4">
      <p className="flex items-center gap-2.5 text-[13.5px]">
        <TruckIcon className="h-[18px] w-[18px] shrink-0 text-softblack/60" />
        {shipping === 0 ? (
          <span className="font-medium">Your order ships free.</span>
        ) : (
          <span>Add <span className="font-semibold">{formatINR(FREE_SHIP_AT - subtotal)}</span> more for <span className="font-medium">free shipping</span>.</span>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-softblack/10" role="progressbar" aria-valuenow={Math.round(shipProgress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-softblack transition-all duration-500" style={{ width: `${shipProgress * 100}%` }} />
      </div>
    </div>
  );
}
