import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, BoxIcon, GridIcon, HeartIcon, MapPinIcon, UserIcon } from "../../components/common";
import { useWishlist } from "../../context/WishlistContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { ACCOUNT_TABS, AccountTabId } from "../../constants/account";
import {
  AddressesPanel,
  OrdersPanel,
  OverviewPanel,
  SettingsPanel,
  WishlistPanel,
} from "../../components/account";

const TAB_ICONS: Record<AccountTabId, (props: { className?: string }) => JSX.Element> = {
  overview: GridIcon,
  orders: BoxIcon,
  wishlist: HeartIcon,
  addresses: MapPinIcon,
  settings: UserIcon,
};

export default function Account() {
  const [tab, setTab] = useState<AccountTabId>("overview");
  const { ids } = useWishlist();
  const { status, customer, login, logout } = useCustomerAuth();

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-softblack/20 border-t-softblack" />
        <p className="mt-4 text-[13.5px] text-warmgray">Connecting to Shopify Customer Accounts...</p>
      </div>
    );
  }

  // Unauthenticated / Sign-in required state
  if (status === "unauthenticated" || !customer) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <Reveal>
          <div className="rounded-3xl border border-softblack/10 bg-beige px-8 py-14 shadow-[0_4px_24px_-10px_rgba(26,26,26,0.12)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-softblack text-ivory">
              <UserIcon className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-[28px] text-softblack">Sign In to Your Account</h1>
            <p className="mt-3 text-[14px] leading-relaxed text-warmgray">
              Access your order history, saved shipping addresses, and personal recommendations securely via Shopify Customer Accounts.
            </p>
            <button
              onClick={login}
              className="label mt-8 inline-flex items-center gap-2 rounded-full bg-softblack px-9 py-4 text-[11px] text-ivory transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Sign In with Shopify
            </button>
            <p className="mt-5 text-[11.5px] text-warmgray/80">
              Secured with OAuth 2.0 & PKCE encryption. Passwordless sign in.
            </p>
          </div>
        </Reveal>
      </div>
    );
  }

  const initials = customer.displayName
    ? customer.displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CU";

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      {/* page header */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-softblack/10 bg-beige px-7 py-8 shadow-[0_2px_20px_-8px_rgba(26,26,26,0.1)] md:px-9">
          <div className="flex items-center gap-5">
            <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-softblack font-display text-[24px] text-ivory shadow-[0_4px_18px_-4px_rgba(26,26,26,0.35)] ring-4 ring-ivory">
              {initials}
            </span>
            <div>
              <p className="label text-warmgray">Verified Account</p>
              <h1 className="mt-1 font-display text-[26px] leading-tight md:text-[32px]">{customer.displayName}</h1>
              {customer.email && <p className="mt-1 text-[13px] text-warmgray">{customer.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="label shrink-0 rounded-full border border-softblack/25 bg-ivory px-5 py-2.5 text-[11px] transition-colors hover:border-softblack"
            >
              Sign out
            </button>
            <Link
              to="/shop"
              className="label shrink-0 rounded-full bg-softblack px-5 py-2.5 text-[11px] text-ivory transition-opacity hover:opacity-90"
            >
              Continue shopping →
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-10 md:grid-cols-[220px_1fr] md:gap-14">
        {/* sidebar tabs — mobile horizontal pills */}
        <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:pb-0">
          {ACCOUNT_TABS.map((t) => {
            const TabIcon = TAB_ICONS[t.id];
            const count = t.id === "wishlist" ? ids.length : undefined;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`label flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-5 py-3 text-left text-[10.5px] transition-colors md:rounded-xl ${
                  tab === t.id ? "bg-softblack text-ivory" : "text-warmgray hover:bg-beige hover:text-softblack"
                }`}
              >
                <TabIcon className="h-4 w-4 shrink-0" />
                {t.label}
                {!!count && (
                  <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] ${tab === t.id ? "bg-ivory/20" : "bg-softblack/10"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* content panel */}
        <div className="min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "overview" && <OverviewPanel />}
              {tab === "orders" && <OrdersPanel />}
              {tab === "wishlist" && <WishlistPanel />}
              {tab === "addresses" && <AddressesPanel />}
              {tab === "settings" && <SettingsPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
