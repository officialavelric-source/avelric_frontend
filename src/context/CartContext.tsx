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
import { getCachedProduct, getProductByHandle } from "../services/shopify/productService";
import {
  createCart,
  fetchCart,
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
    setState((prev) => {
      // Enrich local items with image, title, price from cart lines if snapshot was incomplete
      const updatedItems = prev.items.map((it) => {
        const matchingLine = cart.lines.find(
          (l) => l.variantId === it.variantId || l.productHandle === it.productId
        );
        if (matchingLine && (!it.snapshot || !it.snapshot.image)) {
          return {
            ...it,
            variantId: it.variantId ?? matchingLine.variantId,
            snapshot: {
              name: it.snapshot?.name || matchingLine.productTitle,
              image: it.snapshot?.image || matchingLine.image || "",
              colorName: it.snapshot?.colorName || "",
              price: it.snapshot?.price || matchingLine.price,
              compareAt: it.snapshot?.compareAt,
            },
          };
        }
        return it;
      });

      return {
        ...prev,
        items: updatedItems,
        shopifyCartId: cart.id,
        checkoutUrl: cart.checkoutUrl,
        variantLineMap: newMap,
      };
    });
  }, []);

  /* ——— Validate stored cart on mount ——— */
  useEffect(() => {
    const initialCartId = stateRef.current.shopifyCartId;
    if (initialCartId) {
      fetchCart(initialCartId)
        .then((cart) => {
          if (cart) {
            applyShopifyCart(cart);
          } else {
            // Cart expired on Shopify — reset stale ID
            setState((prev) => ({
              ...prev,
              shopifyCartId: null,
              checkoutUrl: null,
              variantLineMap: {},
            }));
          }
        })
        .catch(() => {});
    }
  }, [applyShopifyCart]);

  /* ——— Auto-hydrate any unhydrated items in localStorage ——— */
  const hydratingSetRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const unhydrated = state.items.filter(
      (i) => !i.snapshot || !i.snapshot.image || !i.variantId
    );
    if (unhydrated.length === 0) return;

    unhydrated.forEach((item) => {
      const key = `${item.productId}:${item.size}`;
      if (hydratingSetRef.current.has(key)) return;
      hydratingSetRef.current.add(key);

      getProductByHandle(item.productId).then((prod) => {
        if (!prod) return;
        const v =
          prod.variants.find((variant) =>
            variant.selectedOptions.some(
              (o) => o.name.toLowerCase() === "size" && o.value === item.size
            )
          ) ??
          prod.variants.find(
            (variant) => variant.title.toLowerCase() === item.size.toLowerCase()
          ) ??
          (prod.variants.length === 1 ? prod.variants[0] : undefined);

        const frontImage = prod.images[0] ?? v?.image ?? "";
        setState((prev) => ({
          ...prev,
          items: prev.items.map((it) => {
            if (!same(it, item.productId, item.size)) return it;
            return {
              ...it,
              variantId: it.variantId ?? v?.id,
              snapshot: {
                name: it.snapshot?.name || prod.name,
                image: it.snapshot?.image || frontImage,
                colorName: it.snapshot?.colorName || prod.color?.name || "",
                price: it.snapshot?.price || v?.price || prod.price,
                compareAt: it.snapshot?.compareAt || v?.compareAtPrice || prod.compareAt,
              },
            };
          }),
        }));
      }).catch(() => {});
    });
  }, [state.items]);

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
        ) ??
        cached.variants.find((v) => v.title.toLowerCase() === size.toLowerCase()) ??
        (cached.variants.length === 1 ? cached.variants[0] : undefined);
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

      // If snapshot is missing or image is missing, try populating from cache
      let initialSnapshot = snapshot;
      const cached = getCachedProduct(productId);
      if ((!initialSnapshot || !initialSnapshot.image) && cached) {
        const v = cached.variants.find((variant) => variant.id === (resolvedVariantId ?? variantId));
        const frontImage = cached.images[0] ?? v?.image ?? "";
        initialSnapshot = {
          name: initialSnapshot?.name || cached.name,
          image: initialSnapshot?.image || frontImage,
          colorName: initialSnapshot?.colorName || cached.color?.name || "",
          price: initialSnapshot?.price || v?.price || cached.price,
          compareAt: initialSnapshot?.compareAt || v?.compareAtPrice || cached.compareAt,
        };
      }

      // Optimistic local state update
      setState((prev) => {
        const found = prev.items.find((i) => same(i, productId, size));
        const newItem: CartItem = {
          productId,
          size,
          qty,
          variantId: resolvedVariantId,
          snapshot: initialSnapshot,
        };
        const items = found
          ? prev.items.map((i) =>
              same(i, productId, size)
                ? {
                    ...i,
                    qty: i.qty + qty,
                    variantId: resolvedVariantId ?? i.variantId,
                    snapshot: initialSnapshot ?? i.snapshot,
                  }
                : i
            )
          : [...prev.items, newItem];
        return { ...prev, items };
      });

      // Helper to push line to Shopify
      const syncLineToShopify = (merchandiseId: string, quantity: number) => {
        const line = { merchandiseId, quantity };
        const cartId = stateRef.current.shopifyCartId;

        const buyerIdentity: CartBuyerIdentityInput | undefined =
          isAuthenticated && customer?.email
            ? {
                email: customer.email,
                phone: customer.phone ?? undefined,
                deliveryAddressPreferences: customer.defaultAddress
                  ? [
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
                    ]
                  : undefined,
              }
            : undefined;

        if (!cartId) {
          createCart([line], buyerIdentity)
            .then(applyShopifyCart)
            .catch((err) => console.warn("[Cart] createCart failed:", err));
        } else {
          addCartLines(cartId, [line])
            .then(applyShopifyCart)
            .catch((err) => console.warn("[Cart] addCartLines failed:", err));
        }
      };

      if (resolvedVariantId) {
        syncLineToShopify(resolvedVariantId, qty);
      } else {
        // Asynchronously resolve product & variant from Shopify if not in cache
        getProductByHandle(productId)
          .then((prod) => {
            if (!prod) return;
            const v =
              prod.variants.find((variant) =>
                variant.selectedOptions.some(
                  (o) => o.name.toLowerCase() === "size" && o.value === size
                )
              ) ??
              prod.variants.find(
                (variant) => variant.title.toLowerCase() === size.toLowerCase()
              ) ??
              (prod.variants.length === 1 ? prod.variants[0] : undefined);

            const frontImage = prod.images[0] ?? v?.image ?? "";
            const fullSnapshot: CartItem["snapshot"] = {
              name: prod.name,
              image: frontImage,
              colorName: prod.color?.name ?? "",
              price: v?.price ?? prod.price,
              compareAt: v?.compareAtPrice ?? prod.compareAt,
            };

            setState((prev) => ({
              ...prev,
              items: prev.items.map((i) =>
                same(i, productId, size)
                  ? {
                      ...i,
                      variantId: i.variantId ?? v?.id,
                      snapshot: i.snapshot?.image ? i.snapshot : fullSnapshot,
                    }
                  : i
              ),
            }));

            if (v?.id) {
              syncLineToShopify(v.id, qty);
            }
          })
          .catch((err) => console.warn("[Cart] async product fetch failed:", err));
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
