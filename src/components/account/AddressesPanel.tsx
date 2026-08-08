import { DEMO_ADDRESSES } from "../../constants/account";
import { MapPinIcon } from "../common";

export default function AddressesPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {DEMO_ADDRESSES.map((a) => (
        <div key={a.label} className="rounded-2xl border border-softblack/10 bg-ivory p-6 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)]">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-display text-[17px]">
              <MapPinIcon className="h-4 w-4 text-softblack/50" />
              {a.label}
            </p>
            {a.default && <span className="label rounded-full bg-beige px-3 py-1 text-[9.5px]">Default</span>}
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-warmgray">
            {a.lines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </p>
          <div className="mt-5 flex gap-5">
            <button className="label border-b border-softblack/30 pb-0.5 text-[10.5px] hover:border-softblack">Edit</button>
            <button className="label border-b border-transparent pb-0.5 text-[10.5px] text-warmgray hover:text-softblack">Remove</button>
          </div>
        </div>
      ))}
      <button className="flex min-h-[170px] items-center justify-center rounded-2xl border border-dashed border-softblack/25 text-warmgray transition-colors hover:border-softblack/60 hover:text-softblack">
        <span className="label text-[11px]">+ Add new address</span>
      </button>
    </div>
  );
}
