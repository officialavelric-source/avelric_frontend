export default function StatusBadge({ status }: { status: string }) {
  const delivered = status === "Delivered";
  return (
    <span
      className={`label inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9.5px] ${
        delivered ? "bg-softblack text-ivory" : "border border-softblack/25 text-softblack"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${delivered ? "bg-ivory" : "bg-softblack/60"}`} aria-hidden="true" />
      {status}
    </span>
  );
}
