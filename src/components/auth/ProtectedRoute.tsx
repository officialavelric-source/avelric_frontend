import React from "react";
import { useLocation } from "react-router-dom";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import SignInView from "./SignInView";

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
      <SignInView
        title="Patron Authentication Required"
        subtitle="Access to your order records and private account dossiers requires authentication."
        onLogin={() => login(returnDestination)}
        returnDestination={returnDestination}
      />
    );
  }

  return <>{children}</>;
}
