import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { MapPinIcon } from "../common";

export default function AddressesPanel() {
  const { customer } = useCustomerAuth();
  const address = customer?.defaultAddress;

  return (
    <div className="space-y-6">
      <h3 className="font-display text-[20px] text-softblack">Saved Addresses</h3>
      {address ? (
        <div className="rounded-2xl border border-softblack/10 bg-ivory p-7 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)] max-w-lg">
          <div className="flex items-center justify-between border-b border-softblack/10 pb-3">
            <span className="flex items-center gap-2 label text-softblack">
              <MapPinIcon className="h-4 w-4" /> Default Shipping Address
            </span>
            <span className="rounded-full bg-softblack px-2.5 py-0.5 text-[9px] text-ivory">Default</span>
          </div>
          <div className="mt-4 text-[13.5px] leading-relaxed text-warmgray">
            <p className="font-medium text-softblack">{[address.firstName, address.lastName].filter(Boolean).join(" ")}</p>
            <p className="mt-1">{address.address1}</p>
            {address.address2 && <p>{address.address2}</p>}
            <p>{[address.city, address.province, address.zip].filter(Boolean).join(", ")}</p>
            <p>{address.country}</p>
            {address.phone && <p className="mt-2 text-[12px]">Phone: {address.phone}</p>}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-softblack/10 bg-ivory px-7 py-10 text-center shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)]">
          <MapPinIcon className="mx-auto h-8 w-8 text-warmgray" />
          <p className="mt-5 font-display text-[20px]">No addresses saved</p>
          <p className="mt-2.5 max-w-sm mx-auto text-[13.5px] leading-relaxed text-warmgray">
            Your saved addresses from Shopify Customer Accounts will automatically appear here during checkout.
          </p>
        </div>
      )}
    </div>
  );
}
