import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { getProduct } from "../services/productService";

export interface CartItem {
  productId: string;
  size: string;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  saved: CartItem[];
  add: (productId: string, size: string, qty?: number) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  saveForLater: (productId: string, size: string) => void;
  moveToCart: (productId: string, size: string) => void;
  removeSaved: (productId: string, size: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  mrpTotal: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "avelric-cart-v2";
const LEGACY_KEY = "avelric-cart-v1";

const same = (i: CartItem, productId: string, size: string) =>
  i.productId === productId && i.size === size;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ items: CartItem[]; saved: CartItem[] }>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      // purane format se migrate
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) return { items: JSON.parse(legacy) as CartItem[], saved: [] };
      return { items: [], saved: [] };
    } catch {
      return { items: [], saved: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const add = (productId: string, size: string, qty = 1) =>
    setState((prev) => {
      const found = prev.items.find((i) => same(i, productId, size));
      const items = found
        ? prev.items.map((i) => (same(i, productId, size) ? { ...i, qty: i.qty + qty } : i))
        : [...prev.items, { productId, size, qty }];
      return { ...prev, items };
    });

  const updateQty = (productId: string, size: string, qty: number) =>
    setState((prev) => ({
      ...prev,
      items:
        qty <= 0
          ? prev.items.filter((i) => !same(i, productId, size))
          : prev.items.map((i) => (same(i, productId, size) ? { ...i, qty } : i)),
    }));

  const remove = (productId: string, size: string) =>
    setState((prev) => ({ ...prev, items: prev.items.filter((i) => !same(i, productId, size)) }));

  const saveForLater = (productId: string, size: string) =>
    setState((prev) => {
      const item = prev.items.find((i) => same(i, productId, size));
      if (!item) return prev;
      const already = prev.saved.find((i) => same(i, productId, size));
      return {
        items: prev.items.filter((i) => !same(i, productId, size)),
        saved: already
          ? prev.saved.map((i) => (same(i, productId, size) ? { ...i, qty: i.qty + item.qty } : i))
          : [...prev.saved, item],
      };
    });

  const moveToCart = (productId: string, size: string) =>
    setState((prev) => {
      const item = prev.saved.find((i) => same(i, productId, size));
      if (!item) return prev;
      const inCart = prev.items.find((i) => same(i, productId, size));
      return {
        saved: prev.saved.filter((i) => !same(i, productId, size)),
        items: inCart
          ? prev.items.map((i) => (same(i, productId, size) ? { ...i, qty: i.qty + item.qty } : i))
          : [...prev.items, item],
      };
    });

  const removeSaved = (productId: string, size: string) =>
    setState((prev) => ({ ...prev, saved: prev.saved.filter((i) => !same(i, productId, size)) }));

  const clear = () => setState((prev) => ({ ...prev, items: [] }));

  const { count, subtotal, mrpTotal } = useMemo(() => {
    let c = 0;
    let s = 0;
    let m = 0;
    for (const i of state.items) {
      c += i.qty;
      const p = getProduct(i.productId);
      if (p) {
        s += p.price * i.qty;
        m += (p.compareAt ?? p.price) * i.qty;
      }
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
