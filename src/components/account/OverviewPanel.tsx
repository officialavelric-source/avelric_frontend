import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BoxIcon, CoinIcon, TruckIcon } from "../common";
import StatCard from "./StatCard";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { CustomerAuthService } from "../../services/shopify/customerAuthService";
import type { CustomerOrder } from "../../types/customer";

export default function OverviewPanel() {
  const { customer } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let active = true;
    CustomerAuthService.getCustomerOrders(5)
      .then((data) => {
        if (active) {
          setOrders(data);
          setLoadingOrders(false);
        }
      })
      .catch(() => {
        if (active) setLoadingOrders(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalOrders = loadingOrders ? "…" : orders.length.toString();
  const inTransitCount = loadingOrders
    ? "…"
    : orders.filter((o) => o.fulfillmentStatus?.toUpperCase() === "IN_TRANSIT" || o.fulfillmentStatus?.toUpperCase() === "FULFILLED").length.toString();

  return (
    <div className="space-y-8">
      {/* Real stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<BoxIcon className="h-4 w-4" />} label="Total orders" value={totalOrders} sub="Lifetime Shopify orders" />
        <StatCard icon={<TruckIcon className="h-4 w-4" />} label="Fulfilled orders" value={inTransitCount} sub="Successfully dispatched" />
        <StatCard icon={<CoinIcon className="h-4 w-4" />} label="Account status" value="Active" sub="Shopify Verified" />
      </div>

      {/* Profile & Default Address Quick Overview */}
      <div className="rounded-2xl border border-softblack/10 bg-ivory p-7 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)]">
        <h3 className="font-display text-[18px] text-softblack">Default Shipping Address</h3>
        {customer?.defaultAddress ? (
          <div className="mt-3 text-[13.5px] leading-relaxed text-warmgray">
            <p className="font-medium text-softblack">
              {[customer.defaultAddress.firstName, customer.defaultAddress.lastName].filter(Boolean).join(" ")}
            </p>
            <p>{customer.defaultAddress.address1}</p>
            {customer.defaultAddress.address2 && <p>{customer.defaultAddress.address2}</p>}
            <p>
              {[customer.defaultAddress.city, customer.defaultAddress.province, customer.defaultAddress.zip]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>{customer.defaultAddress.country}</p>
            {customer.defaultAddress.phone && <p className="mt-1">Tel: {customer.defaultAddress.phone}</p>}
          </div>
        ) : (
          <p className="mt-2 text-[13.5px] text-warmgray">No default address saved in your Shopify account yet.</p>
        )}
      </div>

      {/* Support block */}
      <div className="rounded-2xl bg-softblack p-7 text-ivory sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="label text-ivory/60">Need assistance with your account?</p>
          <p className="mt-2 font-display text-[19px]">Concierge support is available via WhatsApp.</p>
        </div>
        <Link
          to="/contact"
          className="label mt-5 inline-block rounded-full bg-ivory px-7 py-3.5 text-[11px] text-softblack transition-transform hover:scale-[1.03] sm:mt-0"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
