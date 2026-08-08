import { Link } from "react-router-dom";

export default function SizeSelector({
  sizes,
  selected,
  onSelect,
  showError,
}: {
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
  showError: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="label text-warmgray" id="size-label">Select size</p>
        <Link to="/size-guide" className="label border-b border-softblack/25 pb-0.5 text-[10.5px] hover:border-softblack">Size guide</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5" role="group" aria-labelledby="size-label">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            aria-pressed={selected === s}
            className={`min-w-[52px] rounded-full border px-4 py-2.5 text-[13.5px] transition-colors ${
              selected === s ? "border-softblack bg-softblack text-ivory" : "border-softblack/25 hover:border-softblack"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {showError && <p className="mt-3 text-[13.5px] text-softblack">Pick a size to continue.</p>}
    </div>
  );
}
