import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { getCachedProduct } from "../services/shopify/productService";
import {
  createCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  updateCartBuyerIdentity,
  CartBuyerIdentityInput,
} from "../services/shopify/cartService";
import { useCustomerAuth } from "./CustomerAuthContext";
import { CustomerAuthService } from "../services/shopify/customerAuthService";
import type { AppCart } from "../types/app";

export interface CartItem {
  productId: string;   // Shopify handle (= route :id)
  size: string;
  qty: number;
  variantId?: string;  // Shopify variant GID — required for Shopify cart sync
  // Price snapshot stored at add-time so cart renders without re-fetching product
  snapshot?: {
    name: string;
    image: string;
    colorName: string;
    price: number;
    compareAt?: number;
  };
}

interface CartState {
  items: CartItem[];
  saved: CartItem[];
  shopifyCartId: string | null;    // Shopify cart GID
  checkoutUrl: string | null;
  variantLineMap: Record<string, string>; // variantId → Shopify cart line GID
}

interface CartCtx {
  items: CartItem[];
  saved: CartItem[];
  add: (
    productId: string,
    size: string,
    qty?: number,
    variantId?: string,
    snapshot?: CartItem["snapshot"]
  ) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  saveForLater: (productId: string, size: string) => void;
  moveToCart: (productId: string, size: string) => void;
  removeSaved: (productId: string, size: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  mrpTotal: number;
  checkoutUrl: string | null;
  shopifyCart: AppCart | null;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "avelric-cart-v2";
const LEGACY_KEY = "avelric-cart-v1";

const same = (i: CartItem, productId: string, size: string) =>
  i.productId === productId && i.size === size;

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, customer } = useCustomerAuth();

  const [state, setState] = useState<CartState>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CartState>;
        return {
          items: parsed.items ?? [],
          saved: parsed.saved ?? [],
          shopifyCartId: parsed.shopifyCartId ?? null,
          // Do NOT restore checkoutUrl — Shopify checkout URLs expire.
          // A fresh checkoutUrl is obtained after the next cart mutation.
          checkoutUrl: null,
          variantLineMap: parsed.variantLineMap ?? {},
        };
      }
      // Migrate from legacy format
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        return {
          items: JSON.parse(legacy) as CartItem[],
          saved: [],
          shopifyCartId: null,
          checkoutUrl: null,
          variantLineMap: {},
        };
      }
    } catch {
      /* ignore parse errors */
    }
    return {
      items: [],
      saved: [],
      shopifyCartId: null,
      checkoutUrl: null,
      variantLineMap: {},
    };
  });

  // Extra state for the latest Shopify cart (not persisted — re-sync on mutations)
  const [shopifyCart, setShopifyCart] = useState<AppCart | null>(null);

  // Ref to always access latest state inside async callbacks without stale closures
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Persist to localStorage on every state change (excluding checkoutUrl — it expires)
  useEffect(() => {
    const { checkoutUrl: _omit, ...toSave } = state;
    void _omit;
    localStorage.setItem(KEY, JSON.stringify({ ...toSave, checkoutUrl: null }));
  }, [state]);

  /* ——— Shopify cart sync helper ——— */

  const applyShopifyCart = useCallback((cart: AppCart) => {
    setShopifyCart(cart);
    const newMap: Record<string, string> = {};
    for (const line of cart.lines) {
      newMap[line.variantId] = line.id;
    }
    setState((prev) => ({
      ...prev,
      shopifyCartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      variantLineMap: newMap,
    }));
  }, []);

  /* ——— Synchronize Cart Buyer Identity on Login & Logout ——— */
  const syncedCustomerEmailRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && customer?.email) {
      if (syncedCustomerEmailRef.current !== customer.email) {
        syncedCustomerEmailRef.current = customer.email;

        // If a shopifyCartId exists, update buyer identity
        const cartId = stateRef.current.shopifyCartId;
        if (cartId) {
          CustomerAuthService.getValidAccessToken().then((accessToken) => {
            const buyerIdentity: CartBuyerIdentityInput = {
              customerAccessToken: accessToken ?? undefined,
              email: customer.email ?? undefined,
              phone: customer.phone ?? undefined,
            };
            if (customer.defaultAddress) {
              buyerIdentity.deliveryAddressPreferences = [
                {
                  deliveryAddress: {
                    firstName: customer.defaultAddress.firstName ?? undefined,
                    lastName: customer.defaultAddress.lastName ?? undefined,
                    address1: customer.defaultAddress.address1 ?? undefined,
                    address2: customer.defaultAddress.address2 ?? undefined,
                    city: customer.defaultAddress.city ?? undefined,
                    province: customer.defaultAddress.province ?? undefined,
                    zip: customer.defaultAddress.zip ?? undefined,
                    country: customer.defaultAddress.country ?? undefined,
                    phone: customer.defaultAddress.phone ?? undefined,
                  },
                },
              ];
            }

            updateCartBuyerIdentity(cartId, buyerIdentity)
              .then(applyShopifyCart)
              .catch((err) => console.warn("[Cart] Buyer identity update failed:", err));
          });
        }
      }
    } else if (!isAuthenticated && syncedCustomerEmailRef.current) {
      // User logged out — clear buyer identity tracking ref
      syncedCustomerEmailRef.current = null;
    }
  }, [isAuthenticated, customer, applyShopifyCart]);

  /**
   * Resolve variantId for a given (productId, size) by checking:
   * 1. The CartItem itself (if it already has variantId)
   * 2. The Shopify product cache (populated when product detail is viewed)
   */
  const resolveVariantId = useCallback(
    (productId: string, size: string, existingVariantId?: string): string | undefined => {
      if (existingVariantId) return existingVariantId;
      const cached = getCachedProduct(productId);
      if (!cached?.variants) return undefined;
      const variant =
        cached.variants.find((v) =>
          v.selectedOptions.some(
            (o) => o.name.toLowerCase() === "size" && o.value === size
          )
        ) ?? cached.variants.find((v) => v.title === size);
      return variant?.id;
    },
    []
  );

  /* ——— Cart operations ——— */

  const add = useCallback(
    (
      productId: string,
      size: string,
      qty = 1,
      variantId?: string,
      snapshot?: CartItem["snapshot"]
    ) => {
      const resolvedVariantId = resolveVariantId(productId, size, variantId);

      // Optimistic local state update
      setState((prev) => {
        const found = prev.items.find((i) => same(i, productId, size));
        const newItem: CartItem = {
          productId,
          size,
          qty,
          variantId: resolvedVariantId,
          snapshot,
        };
        const items = found
          ? prev.items.map((i) =>
              same(i, productId, size) ? { ...i, qty: i.qty + qty, variantId: resolvedVariantId ?? i.variantId, snapshot: snapshot ?? i.snapshot } : i
            )
          : [...prev.items, newItem];
        return { ...prev, items };
      });

      // Background Shopify sync — use stateRef to avoid stale closure
      if (!resolvedVariantId) return;
      const line = { merchandiseId: resolvedVariantId, quantity: qty };

      const cartId = stateRef.current.shopifyCartId;
      if (!cartId) {
        const buyerIdentity: CartBuyerIdentityInput | undefined = (isAuthenticated && customer?.email) ? {
          email: customer.email,
          phone: customer.phone ?? undefined,
          deliveryAddressPreferences: customer.defaultAddress ? [{
            deliveryAddress: {
              firstName: customer.defaultAddress.firstName ?? undefined,
              lastName: customer.defaultAddress.lastName ?? undefined,
              address1: customer.defaultAddress.address1 ?? undefined,
              address2: customer.defaultAddress.address2 ?? undefined,
              city: customer.defaultAddress.city ?? undefined,
              province: customer.defaultAddress.province ?? undefined,
              zip: customer.defaultAddress.zip ?? undefined,
              country: customer.defaultAddress.country ?? undefined,
              phone: customer.defaultAddress.phone ?? undefined,
            }
          }] : undefined
        } : undefined;

        createCart([line], buyerIdentity)
          .then(applyShopifyCart)
          .catch((err) => console.warn("[Cart] createCart failed:", err));
      } else {
        addCartLines(cartId, [line])
          .then(applyShopifyCart)
          .catch((err) => console.warn("[Cart] addCartLines failed:", err));
      }
    },
    [resolveVariantId, applyShopifyCart, isAuthenticated, customer]
  );

  const updateQty = useCallback(
    (productId: string, size: string, qty: number) => {
      setState((prev) => {
        const item = prev.items.find((i) => same(i, productId, size));
        const updatedItems =
          qty <= 0
            ? prev.items.filter((i) => !same(i, productId, size))
            : prev.items.map((i) => (same(i, productId, size) ? { ...i, qty } : i));

        // Background Shopify sync
        if (item?.variantId && prev.shopifyCartId) {
          const lineId = prev.variantLineMap[item.variantId];
          if (lineId) {
            if (qty <= 0) {
              removeCartLines(prev.shopifyCartId, [lineId])
                .then(applyShopifyCart)
                .catch((err) => console.warn("[Cart] removeCartLines failed:", err));
            } else {
              updateCartLines(prev.shopifyCartId, [{ id: lineId, quantity: qty }])
                .then(applyShopifyCart)
                .catch((err) => console.warn("[Cart] updateCartLines failed:", err));
            }
          }
        }

        return { ...prev, items: updatedItems };
      });
    },
    [applyShopifyCart]
  );

  const remove = useCallback(
    (productId: string, size: string) => {
      setState((prev) => {
        const item = prev.items.find((i) => same(i, productId, size));

        // Background Shopify sync
        if (item?.variantId && prev.shopifyCartId) {
          const lineId = prev.variantLineMap[item.variantId];
          if (lineId) {
            removeCartLines(prev.shopifyCartId, [lineId])
              .then(applyShopifyCart)
              .catch((err) => console.warn("[Cart] removeCartLines failed:", err));
          }
        }

        return { ...prev, items: prev.items.filter((i) => !same(i, productId, size)) };
      });
    },
    [applyShopifyCart]
  );

  const saveForLater = useCallback(
    (productId: string, size: string) => {
      setState((prev) => {
        const item = prev.items.find((i) => same(i, productId, size));
        if (!item) return prev;

        // Remove from Shopify cart
        if (item.variantId && prev.shopifyCartId) {
          const lineId = prev.variantLineMap[item.variantId];
          if (lineId) {
            removeCartLines(prev.shopifyCartId, [lineId])
              .then(applyShopifyCart)
              .catch((err) => console.warn("[Cart] saveForLater sync failed:", err));
          }
        }

        const already = prev.saved.find((i) => same(i, productId, size));
        return {
          ...prev,
          items: prev.items.filter((i) => !same(i, productId, size)),
          saved: already
            ? prev.saved.map((i) =>
                same(i, productId, size) ? { ...i, qty: i.qty + item.qty } : i
              )
            : [...prev.saved, item],
        };
      });
    },
    [applyShopifyCart]
  );

  const moveToCart = useCallback(
    (productId: string, size: string) => {
      setState((prev) => {
        const item = prev.saved.find((i) => same(i, productId, size));
        if (!item) return prev;

        const inCart = prev.items.find((i) => same(i, productId, size));
        const updatedItems = inCart
          ? prev.items.map((i) =>
              same(i, productId, size) ? { ...i, qty: i.qty + item.qty } : i
            )
          : [...prev.items, item];

        // Add back to Shopify cart — read cartId from prev (not stateRef — prev is reliable here)
        if (item.variantId) {
          const cartId = prev.shopifyCartId;
          if (cartId) {
            addCartLines(cartId, [{ merchandiseId: item.variantId, quantity: item.qty }])
              .then(applyShopifyCart)
              .catch((err) => console.warn("[Cart] moveToCart sync failed:", err));
          } else {
            createCart([{ merchandiseId: item.variantId, quantity: item.qty }])
              .then(applyShopifyCart)
              .catch((err) => console.warn("[Cart] moveToCart createCart failed:", err));
          }
        }

        return {
          ...prev,
          saved: prev.saved.filter((i) => !same(i, productId, size)),
          items: updatedItems,
        };
      });
    },
    [applyShopifyCart]
  );

  const removeSaved = useCallback(
    (productId: string, size: string) =>
      setState((prev) => ({
        ...prev,
        saved: prev.saved.filter((i) => !same(i, productId, size)),
      })),
    []
  );

  const clear = useCallback(
    () =>
      setState((prev) => ({
        ...prev,
        items: [],
        shopifyCartId: null,
        checkoutUrl: null,
        variantLineMap: {},
      })),
    []
  );

  /* ——— Derived totals (from snapshot — no mock product lookup) ——— */

  const { count, subtotal, mrpTotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    let m = 0;
    for (const i of state.items) {
      c += i.qty;
      // PRODUCTION: use snapshot price only — no mock product fallback
      const price = i.snapshot?.price ?? 0;
      const compare = i.snapshot?.compareAt ?? price;
      s += price * i.qty;
      m += compare * i.qty;
    }
    return { count: c, subtotal: s, mrpTotal: m };
  }, [state.items]);

  return (
    <Ctx.Provider
      value={{
        items: state.items,
        saved: state.saved,
        add,
        updateQty,
        remove,
        saveForLater,
        moveToCart,
        removeSaved,
        clear,
        count,
        subtotal,
        mrpTotal,
        checkoutUrl: state.checkoutUrl,
        shopifyCart,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
