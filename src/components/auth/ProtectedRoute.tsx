import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, login } = useCustomerAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-softblack/20 border-t-softblack" />
        <p className="mt-4 font-display text-[16px] text-softblack tracking-wide">AVELRIC</p>
        <p className="mt-1 text-[12.5px] text-warmgray">Verifying patron security clearance...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    const returnDestination = location.pathname + location.search;

    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-softblack/10 bg-ivory p-9 shadow-[0_4px_24px_-8px_rgba(26,26,26,0.08)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-softblack text-ivory">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="font-display text-[22px] text-softblack">Patron Authentication Required</h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-warmgray">
            Access to order dossiers and account settings requires authentication with your verified Shopify Customer Account.
          </p>
          <div className="mt-7 flex flex-col gap-3">
            <button
              onClick={() => login(returnDestination)}
              className="label w-full rounded-full bg-softblack py-3.5 text-[11px] text-ivory transition-transform hover:scale-[1.02]"
            >
              Sign In with Shopify
            </button>
            <Link
              to="/"
              className="label w-full rounded-full border border-softblack/15 py-3.5 text-[11px] text-softblack transition-colors hover:bg-beige"
            >
              Return to Boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
