import { Link } from "react-router-dom";
import { DEMO_ORDERS } from "../../constants/account";
import { formatINR } from "../../utils/format";
import { getProduct } from "../../services/productService";
import StatusBadge from "./StatusBadge";

export default function OrdersPanel() {
  return (
    <div className="space-y-4">
      {DEMO_ORDERS.map((o) => {
        const product = getProduct(o.productId);
        return (
          <div key={o.id} className="flex flex-col items-start gap-4 rounded-2xl border border-softblack/10 bg-ivory p-6 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)] transition-colors hover:border-softblack/30 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="flex min-w-0 items-center gap-5">
              {product && (
                <Link to={`/product/${product.id}`} className="w-14 shrink-0 overflow-hidden rounded-xl bg-beige transition-opacity hover:opacity-90">
                  <img src={product.images[0]} alt={product.name} className="aspect-[3/4] w-full object-cover" />
                </Link>
              )}
              <div className="min-w-0">
                <p className="label text-[10px] text-warmgray">{o.id} · {o.date}</p>
                <p className="mt-1.5 truncate font-display text-[16px]">{o.items}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-6">
              <p className="text-[14.5px] font-medium">{formatINR(o.total)}</p>
              <StatusBadge status={o.status} />
            </div>
          </div>
        );
      })}
      <p className="pt-2 text-[13px] text-warmgray">
        Older orders? <Link to="/contact" className="border-b border-softblack/30 text-softblack hover:border-softblack">Message us</Link> with your phone number and we'll pull them up.
      </p>
    </div>
  );
}
