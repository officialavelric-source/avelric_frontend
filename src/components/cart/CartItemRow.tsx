import { Link } from "react-router-dom";
import { CartItem } from "../../context/CartContext";
import { getCachedProduct } from "../../services/shopify/productService";
import { formatINR } from "../../utils/format";

/**
 * CartItemRow — renders from CartItem.snapshot with fallback to getCachedProduct.
 */
export default function CartItemRow({
  item,
  onUpdateQty,
  onSaveForLater,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onSaveForLater: () => void;
  onRemove: () => void;
}) {
  const cached = getCachedProduct(item.productId);
  const snap = item.snapshot ?? {
    name: cached?.name || item.productId.replace(/-/g, " "),
    image: cached?.images[0] || "",
    colorName: cached?.color?.name || "",
    price: cached?.price || 0,
    compareAt: cached?.compareAt,
  };
  const imageSrc = snap.image || cached?.images[0] || "";
  const price = snap.price;
  const compareAt = snap.compareAt;
  const pct = compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  return (
    <li className="flex gap-4 py-5 md:gap-5">
      <Link to={`/product/${item.productId}`} className="w-24 shrink-0 overflow-hidden rounded-xl bg-beige transition-opacity hover:opacity-90 md:w-32">
        {imageSrc ? (
          <img src={imageSrc} alt={snap.name} className="aspect-[3/4] w-full object-cover" />
        ) : (
          <div className="aspect-[3/4] w-full grid place-items-center bg-beige text-warmgray text-[10px] tracking-wider uppercase">
            Avelric
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${item.productId}`} className="block truncate font-display text-[16.5px] hover:underline md:text-[18px]">
              {snap.name}
            </Link>
            <p className="label mt-1.5 text-[10px] text-warmgray">
              {snap.colorName} · Size {item.size}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[15.5px] font-semibold">{formatINR(price * item.qty)}</p>
            {compareAt && compareAt > price && (
              <p className="text-[12.5px] text-warmgray">
                <span className="line-through">{formatINR(compareAt * item.qty)}</span>
                <span className="ml-1.5 font-medium text-success">{pct}% off</span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-4">
          <div className="flex items-center overflow-hidden rounded-full border border-softblack/20">
            <button
              onClick={() => onUpdateQty(item.qty - 1)}
              className="grid h-9 w-9 place-items-center text-lg leading-none transition-colors hover:bg-beige"
              aria-label={`Decrease quantity of ${snap.name}`}
            >−</button>
            <span className="min-w-[28px] text-center text-[14px] font-medium" aria-live="polite">{item.qty}</span>
            <button
              onClick={() => onUpdateQty(item.qty + 1)}
              className="grid h-9 w-9 place-items-center text-lg leading-none transition-colors hover:bg-beige"
              aria-label={`Increase quantity of ${snap.name}`}
            >+</button>
          </div>
          <button onClick={onSaveForLater} className="label text-[10.5px] text-warmgray underline-offset-4 transition-colors hover:text-softblack hover:underline">
            Save for later
          </button>
          <button onClick={onRemove} className="label text-[10.5px] text-warmgray underline-offset-4 transition-colors hover:text-danger hover:underline">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
