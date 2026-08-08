export default function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <label className="block">
      <span className="label text-[10px] text-warmgray">{label}</span>
      <input
        type={type}
        defaultValue={value}
        className="mt-2 w-full rounded-xl border border-softblack/15 bg-transparent px-4 py-3 text-[14px] transition-colors focus:border-softblack focus:outline-none"
      />
    </label>
  );
}
