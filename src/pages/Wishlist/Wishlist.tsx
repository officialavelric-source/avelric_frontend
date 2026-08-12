import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../../components/common";
import { ProductCard, ProductCardSkeleton } from "../../components/product";
import { useWishlist } from "../../context/WishlistContext";
import { getCachedProduct, getProducts } from "../../services/shopify/productService";
import type { AppProduct } from "../../types/app";

/**
 * Wishlist page — resolves wishlisted product IDs from Shopify cache.
 * No mock PRODUCTS fallback.
 */
export default function Wishlist() {
  const { ids } = useWishlist();
  const [loading, setLoading] = useState(ids.length > 0);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    getProducts(50)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const items: AppProduct[] = loading
    ? []
    : ids.map((id) => getCachedProduct(id)).filter((p): p is AppProduct => Boolean(p));

  if (ids.length === 0)
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
        {!loading && (
          <p className="mt-3 text-[15px] text-warmgray">
            {items.length} saved piece{items.length === 1 ? "" : "s"}
            {items.length > 0 && " — add them to your cart before the batch runs out."}
          </p>
        )}
      </Reveal>

      {loading && (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: Math.min(ids.length, 4) }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mt-10 rounded-2xl bg-beige px-8 py-16 text-center">
          <p className="font-display text-xl">Saved items no longer available</p>
          <p className="mt-3 text-warmgray">The products you saved are no longer in the Shopify catalogue.</p>
          <Link to="/shop" className="label mt-7 inline-block rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">
            Browse current collection
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
              <ProductCard product={p} eager={i < 4} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
