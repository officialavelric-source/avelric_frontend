import { ReactNode } from "react";

export default function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl bg-beige p-6 shadow-[0_2px_16px_-6px_rgba(26,26,26,0.08)]">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-ivory text-softblack/70 shadow-sm">{icon}</span>
      <p className="label mt-4 text-[10px] text-warmgray">{label}</p>
      <p className="mt-2 font-display text-[26px] leading-none">{value}</p>
      {sub && <p className="mt-2 text-[12.5px] text-warmgray">{sub}</p>}
    </div>
  );
}
