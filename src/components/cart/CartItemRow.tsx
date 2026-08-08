import { Link } from "react-router-dom";
import { Product } from "../../data/products";
import { CartItem } from "../../context/CartContext";
import { formatINR } from "../../utils/format";
import { discountPct } from "../../utils/product";

export default function CartItemRow({
  product,
  item,
  onUpdateQty,
  onSaveForLater,
  onRemove,
}: {
  product: Product;
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onSaveForLater: () => void;
  onRemove: () => void;
}) {
  const p = product;
  const pct = discountPct(p);

  return (
    <li className="flex gap-4 py-5 md:gap-5">
      <Link to={`/product/${p.id}`} className="w-24 shrink-0 overflow-hidden rounded-xl bg-beige transition-opacity hover:opacity-90 md:w-32">
        <img src={p.images[0]} alt={p.name} className="aspect-[3/4] w-full object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${p.id}`} className="block truncate font-display text-[16.5px] hover:underline md:text-[18px]">
              {p.name}
            </Link>
            <p className="label mt-1.5 text-[10px] text-warmgray">
              {p.color.name} · Size {item.size}
            </p>
            <p className="mt-1.5 text-[12.5px] text-success">In stock · Ships in 24 hrs</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15.5px] font-semibold">{formatINR(p.price * item.qty)}</p>
            {p.compareAt && (
              <p className="text-[12.5px] text-warmgray">
                <span className="line-through">{formatINR(p.compareAt * item.qty)}</span>
                <span className="ml-1.5 font-medium text-success">{pct}% off</span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-4">
          <div className="flex items-center overflow-hidden rounded-full border border-softblack/20">
            <button onClick={() => onUpdateQty(item.qty - 1)} className="grid h-9 w-9 place-items-center text-lg leading-none transition-colors hover:bg-beige" aria-label={`Decrease quantity of ${p.name}`}>−</button>
            <span className="min-w-[28px] text-center text-[14px] font-medium" aria-live="polite">{item.qty}</span>
            <button onClick={() => onUpdateQty(item.qty + 1)} className="grid h-9 w-9 place-items-center text-lg leading-none transition-colors hover:bg-beige" aria-label={`Increase quantity of ${p.name}`}>+</button>
          </div>
          <button
            onClick={onSaveForLater}
            className="label text-[10.5px] text-warmgray underline-offset-4 transition-colors hover:text-softblack hover:underline"
          >
            Save for later
          </button>
          <button
            onClick={onRemove}
            className="label text-[10.5px] text-warmgray underline-offset-4 transition-colors hover:text-danger hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
