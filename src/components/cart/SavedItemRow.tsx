import { Link } from "react-router-dom";
import { CartItem } from "../../context/CartContext";
import { getCachedProduct } from "../../services/shopify/productService";
import { formatINR } from "../../utils/format";

/**
 * SavedItemRow — renders from CartItem.snapshot with fallback to getCachedProduct.
 */
export default function SavedItemRow({
  item,
  onMoveToCart,
  onRemove,
}: {
  item: CartItem;
  onMoveToCart: () => void;
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

  return (
    <li className="flex items-center gap-4 py-4 md:gap-5">
      <Link to={`/product/${item.productId}`} className="w-16 shrink-0 overflow-hidden rounded-lg bg-beige">
        {imageSrc ? (
          <img src={imageSrc} alt={snap.name} className="aspect-[3/4] w-full object-cover" />
        ) : (
          <div className="aspect-[3/4] w-full grid place-items-center bg-beige text-warmgray text-[9px] uppercase">
            Avelric
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/product/${item.productId}`} className="block truncate font-display text-[15.5px] hover:underline">{snap.name}</Link>
        <p className="label mt-1 text-[9.5px] text-warmgray">Size {item.size} · Qty {item.qty}</p>
        <p className="mt-1 text-[14px] font-medium">{formatINR(snap.price)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          onClick={onMoveToCart}
          className="label rounded-full border border-softblack px-4 py-2 text-[10px] transition-colors hover:bg-softblack hover:text-ivory"
        >
          Move to cart
        </button>
        <button onClick={onRemove} className="label text-[9.5px] text-warmgray hover:text-softblack">
          Remove
        </button>
      </div>
    </li>
  );
}
