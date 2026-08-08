import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/format";

export default function Checkout() {
  const { subtotal, count } = useCart();
  return (
    <div className="mx-auto max-w-2xl px-6 py-28 text-center">
      <p className="label text-warmgray">Checkout</p>
      <h1 className="mt-4 font-display text-[32px] leading-tight md:text-[38px]">Secure checkout arrives with launch</h1>
      <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-warmgray">
        This preview build stops here. On launch, this step hands over to our payment partner with
        UPI, cards, and Cash on Delivery — your cart of {count} item{count === 1 ? "" : "s"} ({formatINR(subtotal)}) is saved on this device.
      </p>
      <Link to="/shop" className="label mt-10 inline-block rounded-full bg-softblack px-8 py-4 text-[12px] text-ivory">
        Continue browsing
      </Link>
    </div>
  );
}
