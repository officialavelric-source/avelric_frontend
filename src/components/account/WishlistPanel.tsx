import { Link } from "react-router-dom";
import { PRODUCTS } from "../../data/products";
import { useWishlist } from "../../context/WishlistContext";
import { ProductCard } from "../product";

export default function WishlistPanel() {
  const { ids } = useWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));

  if (items.length === 0)
    return (
      <div className="rounded-2xl bg-beige px-8 py-16 text-center">
        <p className="font-display text-[22px]">Your wishlist is empty</p>
        <p className="mt-2 text-[14px] text-warmgray">Tap the heart on any product to save it here.</p>
        <Link to="/shop" className="label mt-7 inline-block rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">
          Explore the collection
        </Link>
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <Link to="/wishlist" className="label mt-8 inline-block border-b border-softblack/30 pb-1 text-[10.5px] hover:border-softblack">
        Open full wishlist →
      </Link>
    </div>
  );
}
