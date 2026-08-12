import { useEffect, useState } from "react";
import {
  getCachedProduct,
  getProductByHandle,
} from "../services/shopify/productService";
import type { AppProduct } from "../types/app";

/**
 * Async hook for loading a single product by Shopify handle.
 * Checks the module-level product cache first for instant renders.
 */
export function useProduct(handle: string | undefined): {
  product: AppProduct | null;
  loading: boolean;
  error: string | null;
} {
  const [product, setProduct] = useState<AppProduct | null>(
    () => (handle ? getCachedProduct(handle) ?? null : null)
  );
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setLoading(false);
      return;
    }

    // Already in cache from this session — no network needed
    const cached = getCachedProduct(handle);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getProductByHandle(handle)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setLoading(false);
        if (!p) setError("Product not found");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Unable to load product. Please try again.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return { product, loading, error };
}
