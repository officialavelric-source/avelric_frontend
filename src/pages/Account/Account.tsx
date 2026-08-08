import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, BoxIcon, GridIcon, HeartIcon, MapPinIcon, UserIcon } from "../../components/common";
import { useWishlist } from "../../context/WishlistContext";
import { ACCOUNT_TABS, AccountTabId, DEMO_USER } from "../../constants/account";
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      {/* page header */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-softblack/10 bg-beige px-7 py-8 shadow-[0_2px_20px_-8px_rgba(26,26,26,0.1)] md:px-9">
          <div className="flex items-center gap-5">
            <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-softblack font-display text-[24px] text-ivory shadow-[0_4px_18px_-4px_rgba(26,26,26,0.35)] ring-4 ring-ivory">
              {DEMO_USER.name.split(" ").map((w) => w[0]).join("")}
            </span>
            <div>
              <p className="label text-warmgray">My account</p>
              <h1 className="mt-1 font-display text-[26px] leading-tight md:text-[32px]">{DEMO_USER.name}</h1>
              <p className="mt-1 text-[13px] text-warmgray">Member since {DEMO_USER.since}</p>
            </div>
          </div>
          <Link
            to="/shop"
            className="label shrink-0 rounded-full border border-softblack/25 bg-ivory px-5 py-2.5 text-[11px] transition-colors hover:border-softblack"
          >
            Continue shopping →
          </Link>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-10 md:grid-cols-[220px_1fr] md:gap-14">
        {/* sidebar tabs — mobile par horizontal pills */}
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
