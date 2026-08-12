import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { ProductCard } from "../product";
import { getCachedProduct, getProducts } from "../../services/shopify/productService";
import type { AppProduct } from "../../types/app";

/**
 * WishlistPanel — renders wishlisted products from Shopify product cache.
 * No mock PRODUCTS fallback.
 */
export default function WishlistPanel() {
  const { ids } = useWishlist();
  const [cacheReady, setCacheReady] = useState(false);

  // Pre-warm the Shopify product cache so wishlisted products can be resolved
  useEffect(() => {
    getProducts(50).then(() => setCacheReady(true)).catch(() => setCacheReady(true));
  }, []);

  const items: AppProduct[] = ids
    .map((id) => getCachedProduct(id))
    .filter((p): p is AppProduct => Boolean(p));

  if (!cacheReady && ids.length > 0) {
    return (
      <div className="py-10 text-center text-warmgray text-[14px]">Loading wishlist…</div>
    );
  }

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
