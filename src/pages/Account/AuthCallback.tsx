import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CustomerAuthService } from "../../services/shopify/customerAuthService";

// Module-level guard: prevents duplicate window navigation across React renders/remounts
let hasTriggeredRedirect = false;

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Invalid OAuth callback parameters.");
      return;
    }

    // Call the idempotent service handler (keyed by authorization code at module & session level)
    CustomerAuthService.handleCallback(code, state)
      .then(() => {
        if (!hasTriggeredRedirect) {
          hasTriggeredRedirect = true;
          const destination = CustomerAuthService.getReturnToDestination();
          window.location.href = destination;
        }
      })
      .catch((err) => {
        console.error("[AuthCallback] Exchange failed:", err);
        setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
      });
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-2xl bg-beige p-8 max-w-md shadow-sm border border-warmgray/10">
          <h2 className="font-display text-[22px] text-softblack">Authentication Error</h2>
          <p className="mt-3 text-[13.5px] text-warmgray">{error}</p>
          <button
            onClick={() => CustomerAuthService.login()}
            className="label mt-6 w-full rounded-full bg-softblack px-6 py-3.5 text-[11px] text-ivory transition-opacity hover:opacity-90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-softblack/20 border-t-softblack" />
      <h2 className="mt-6 font-display text-[20px] text-softblack">Authenticating with AVELRIC</h2>
      <p className="mt-2 text-[13px] text-warmgray">Securing your session with Shopify Customer Accounts...</p>
    </div>
  );
}
