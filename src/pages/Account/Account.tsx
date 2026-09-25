import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, BoxIcon, GridIcon, MapPinIcon, UserIcon } from "../../components/common";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { ACCOUNT_TABS, AccountTabId } from "../../constants/account";
import {
  AddressesPanel,
  OrdersPanel,
  OverviewPanel,
  SettingsPanel,
} from "../../components/account";
import SignInView from "../../components/auth/SignInView";

const TAB_ICONS: Record<AccountTabId, (props: { className?: string }) => JSX.Element> = {
  overview: GridIcon,
  orders: BoxIcon,
  addresses: MapPinIcon,
  settings: UserIcon,
};

export default function Account() {
  const [tab, setTab] = useState<AccountTabId>("overview");
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
    return <SignInView onLogin={() => login()} />;
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
    <div className="mx-auto max-w-6xl px-3.5 sm:px-6 py-10 sm:py-14 md:py-20">
      {/* page header */}
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 rounded-2xl sm:rounded-3xl border border-softblack/10 bg-beige px-4 sm:px-7 py-5 sm:py-8 shadow-[0_2px_20px_-8px_rgba(26,26,26,0.1)] md:px-9">
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="flex h-14 w-14 sm:h-[72px] sm:w-[72px] shrink-0 items-center justify-center rounded-full bg-softblack font-display text-[20px] sm:text-[24px] text-ivory shadow-[0_4px_18px_-4px_rgba(26,26,26,0.35)] ring-4 ring-ivory">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="label text-warmgray text-[10px] sm:text-[11px]">Verified Account</p>
              <h1 className="mt-0.5 sm:mt-1 font-display text-[22px] sm:text-[26px] leading-tight md:text-[32px] truncate">{customer.displayName}</h1>
              {customer.email && <p className="mt-0.5 sm:mt-1 text-[12px] sm:text-[13px] text-warmgray truncate">{customer.email}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 border-t sm:border-t-0 border-softblack/10 pt-3 sm:pt-0">
            <button
              onClick={logout}
              className="label shrink-0 rounded-full border border-softblack/25 bg-ivory px-4 sm:px-5 py-2 sm:py-2.5 text-[10.5px] sm:text-[11px] transition-colors hover:border-softblack"
            >
              Sign out
            </button>
            <Link
              to="/shop"
              className="label shrink-0 rounded-full bg-softblack px-4 sm:px-5 py-2 sm:py-2.5 text-[10.5px] sm:text-[11px] text-ivory transition-opacity hover:opacity-90"
            >
              Continue shopping →
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 sm:mt-10 grid gap-8 sm:gap-10 md:grid-cols-[220px_1fr] md:gap-14">
        {/* sidebar tabs — mobile horizontal pills with edge bleeding */}
        <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ACCOUNT_TABS.map((t) => {
            const TabIcon = TAB_ICONS[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`label flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-left text-[10.5px] transition-colors md:rounded-xl ${
                  tab === t.id ? "bg-softblack text-ivory" : "text-warmgray hover:bg-beige hover:text-softblack"
                }`}
              >
                <TabIcon className="h-4 w-4 shrink-0" />
                {t.label}
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
              {tab === "addresses" && <AddressesPanel />}
              {tab === "settings" && <SettingsPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
