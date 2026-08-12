import { useCustomerAuth } from "../../context/CustomerAuthContext";
import Field from "./Field";

export default function SettingsPanel() {
  const { customer, logout } = useCustomerAuth();

  return (
    <div className="max-w-xl space-y-6">
      <h3 className="font-display text-[20px] text-softblack">Account Settings</h3>
      <div className="space-y-4">
        <Field label="Full name" value={customer?.displayName || ""} />
        <Field label="Email address" value={customer?.email || ""} type="email" />
        <Field label="Phone number" value={customer?.phone || "Not provided"} />
      </div>

      <div className="rounded-xl bg-beige/60 p-5 text-[12.5px] text-warmgray border border-warmgray/15">
        Profile details are securely synced directly from your Shopify Customer Account.
      </div>

      <div className="pt-4 border-t border-softblack/10">
        <button
          type="button"
          onClick={logout}
          className="label rounded-full bg-softblack px-8 py-3.5 text-[11px] text-ivory transition-transform hover:scale-[1.02]"
        >
          Sign Out of AVELRIC
        </button>
      </div>
    </div>
  );
}
