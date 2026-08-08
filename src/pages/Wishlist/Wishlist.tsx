import { Link } from "react-router-dom";
import { PRODUCTS } from "../../data/products";
import { Reveal } from "../../components/common";
import { ProductCard } from "../../components/product";
import { useWishlist } from "../../context/WishlistContext";

export default function Wishlist() {
  const { ids } = useWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 stroke-warmgray" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20.5s-7.5-4.7-9.6-9.2C.9 8 2.7 4.5 6.2 4.5c2 0 3.5 1.1 4.3 2.6L12 8.6l1.5-1.5c.8-1.5 2.3-2.6 4.3-2.6 3.5 0 5.3 3.5 3.8 6.8-2.1 4.5-9.6 9.2-9.6 9.2Z" />
        </svg>
        <h1 className="mt-6 font-display text-[32px]">Your wishlist is empty</h1>
        <p className="mt-3 text-warmgray">Tap the heart on any product to save it here for later.</p>
        <Link to="/shop" className="label mt-8 inline-block rounded-full bg-softblack px-8 py-4 text-[12px] text-ivory">
          Explore the collection
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <Reveal>
        <p className="label text-warmgray">
          <Link to="/" className="hover:text-softblack">Home</Link> / Wishlist
        </p>
        <h1 className="mt-3 font-display text-[32px] md:text-[40px]">Wishlist</h1>
        <p className="mt-3 text-[15px] text-warmgray">
          {items.length} saved piece{items.length === 1 ? "" : "s"} — add them to your cart before the batch runs out.
        </p>
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
            <ProductCard product={p} eager={i < 4} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
