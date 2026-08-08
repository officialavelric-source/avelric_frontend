import { MouseEvent, useState } from "react";
import { Product } from "../../data/products";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";

export default function WishlistHeart({ product, className = "" }: { product: Product; className?: string }) {
  const { has, toggle } = useWishlist();
  const { push } = useToast();
  const [popping, setPopping] = useState(false);
  const active = has(product.id);
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    if (!active) {
      setPopping(true);
      setTimeout(() => setPopping(false), 320);
    }
    push(
      active
        ? { message: `Removed "${product.name}" from wishlist` }
        : { message: `Saved "${product.name}" to wishlist`, image: product.images[0], action: { label: "View", to: "/wishlist" } }
    );
  };
  return (
    <button
      onClick={onClick}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={active}
      className={`grid h-9 w-9 place-items-center rounded-full bg-ivory/90 shadow-sm backdrop-blur transition-all duration-250 hover:scale-110 active:scale-95 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-[17px] w-[17px] transition-colors ${popping ? "animate-heart-pop" : ""} ${active ? "fill-danger stroke-danger" : "fill-none stroke-softblack"}`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.5-4.7-9.6-9.2C.9 8 2.7 4.5 6.2 4.5c2 0 3.5 1.1 4.3 2.6L12 8.6l1.5-1.5c.8-1.5 2.3-2.6 4.3-2.6 3.5 0 5.3 3.5 3.8 6.8-2.1 4.5-9.6 9.2-9.6 9.2Z" />
      </svg>
    </button>
  );
}
