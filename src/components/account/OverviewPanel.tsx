import { Link } from "react-router-dom";
import { DEMO_ORDERS } from "../../constants/account";
import { formatINR } from "../../utils/format";
import { getProduct } from "../../services/productService";
import { BoxIcon, CoinIcon, TruckIcon } from "../common";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";

export default function OverviewPanel() {
  const recent = DEMO_ORDERS[0];
  const recentProduct = getProduct(recent.productId);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<BoxIcon className="h-4 w-4" />} label="Total orders" value={String(DEMO_ORDERS.length)} sub="Since you joined" />
        <StatCard icon={<TruckIcon className="h-4 w-4" />} label="In transit" value="1" sub="Arriving in 2–3 days" />
        <StatCard icon={<CoinIcon className="h-4 w-4" />} label="Store credit" value={formatINR(0)} sub="Earned via referrals" />
      </div>

      <div>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[20px]">Recent order</h2>
          <button className="label text-[10.5px] text-warmgray hover:text-softblack">View all →</button>
        </div>
        <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-softblack/10 bg-ivory p-6 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)] sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <div className="flex min-w-0 items-center gap-5">
            {recentProduct && (
              <Link to={`/product/${recentProduct.id}`} className="w-16 shrink-0 overflow-hidden rounded-xl bg-beige transition-opacity hover:opacity-90">
                <img src={recentProduct.images[0]} alt={recentProduct.name} className="aspect-[3/4] w-full object-cover" />
              </Link>
            )}
            <div className="min-w-0">
              <p className="label text-[10px] text-warmgray">{recent.id} · {recent.date}</p>
              <p className="mt-1.5 truncate font-display text-[17px]">{recent.items}</p>
              <p className="mt-1 text-[14px] font-medium">{formatINR(recent.total)}</p>
            </div>
          </div>
          <StatusBadge status={recent.status} />
        </div>
      </div>

      <div className="rounded-2xl bg-softblack p-7 text-ivory sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="label text-ivory/60">Need a size exchanged?</p>
          <p className="mt-2 font-display text-[19px]">WhatsApp us — one message, no forms.</p>
        </div>
        <Link
          to="/contact"
          className="label mt-5 inline-block rounded-full bg-ivory px-7 py-3.5 text-[11px] text-softblack transition-transform hover:scale-[1.03] sm:mt-0"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
