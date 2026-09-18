import { FREE_SHIPPING_THRESHOLD } from "../../constants/shipping";
import { formatINR } from "../../utils/format";
import { TruckIcon } from "../common";

interface FreeShippingBarProps {
  subtotal: number;
  shipping?: number;
}

export default function FreeShippingBar({ subtotal, shipping }: FreeShippingBarProps) {
  const isUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD || (typeof shipping === "number" && shipping === 0 && subtotal > 0);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shipProgress = subtotal <= 0 ? 0 : isUnlocked ? 1 : Math.min(1, Math.max(0, subtotal / FREE_SHIPPING_THRESHOLD));
  const progressPercent = Math.round(shipProgress * 100);

  return (
    <div className="rounded-2xl bg-beige px-5 py-4">
      <p className="flex items-center gap-2.5 text-[13.5px]">
        <TruckIcon className="h-[18px] w-[18px] shrink-0 text-softblack/60" />
        {isUnlocked ? (
          <span className="font-medium tracking-wide text-softblack">
            FREE SHIPPING UNLOCKED ✓
          </span>
        ) : (
          <span>
            Add <span className="font-semibold">{formatINR(remaining)}</span> more for{" "}
            <span className="font-medium">free shipping</span>.
          </span>
        )}
      </p>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-softblack/10"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Free shipping progress"
      >
        <div
          className="h-full rounded-full bg-softblack transition-all duration-500"
          style={{ width: `${shipProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
