import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CustomerAuthService } from "../../services/shopify/customerAuthService";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Invalid OAuth callback parameters.");
      return;
    }

    let isMounted = true;

    CustomerAuthService.handleCallback(code, state)
      .then(() => {
        if (isMounted) {
          // Refresh session & redirect to main account dashboard
          window.location.href = "/account";
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("[AuthCallback] Exchange failed:", err);
          setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate]);

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
