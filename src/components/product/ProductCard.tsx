import { MouseEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../data/products";
import { formatINR } from "../../utils/format";
import { discountPct } from "../../utils/product";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Stars from "../common/Stars";
import WishlistHeart from "./WishlistHeart";

export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { add } = useCart();
  const { push } = useToast();
  const [picking, setPicking] = useState(false);
  const pct = discountPct(product);
  const outOfStock = new Set(product.outOfStockSizes ?? []);

  // one badge only, ranked by what actually matters to a shopper
  const badge =
    pct > 0
      ? { label: `−${pct}%`, tone: "bg-danger text-ivory" }
      : product.tags.includes("new")
      ? { label: "New", tone: "bg-softblack text-ivory" }
      : product.tags.includes("trending")
      ? { label: "Trending", tone: "bg-softblack text-ivory" }
      : null;

  const doAdd = (size: string) => {
    if (outOfStock.has(size)) return;
    add(product.id, size);
    setPicking(false);
    push({
      message: `Added "${product.name}" (${size}) to cart`,
      image: product.images[0],
      action: { label: "Cart", to: "/cart" },
    });
  };

  const onQuickAdd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes.length === 1) doAdd(product.sizes[0]);
    else setPicking(true);
  };

  const onNotifyMe = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    push({ message: `We'll email you when "${product.name}" is back in stock` });
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block"
      onMouseLeave={() => setPicking(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-softblack/10 bg-beige">
        <div className="aspect-[3/4]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading={eager ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition-opacity duration-[400ms] ease-premium group-hover:opacity-0 ${product.soldOut ? "opacity-60" : ""}`}
          />
          <img
            src={product.images[1]}
            alt=""
            loading="lazy"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[400ms] ease-premium group-hover:opacity-100"
          />
        </div>

        {product.soldOut && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="label rounded-full bg-ivory/95 px-4 py-2 text-[10px] text-softblack shadow-sm">Sold Out</span>
          </div>
        )}

        {badge && !product.soldOut && (
          <span className={`label absolute left-3 top-3 rounded-full px-2.5 py-1.5 text-[10px] shadow-sm ${badge.tone}`}>
            {badge.label}
          </span>
        )}

        <WishlistHeart
          product={product}
          className="absolute right-3 top-3 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        />

        {/* quick add — mobile: always on, desktop: slides up from the edge on hover */}
        {product.soldOut ? (
          <div className="absolute inset-x-0 bottom-0 md:translate-y-full md:opacity-0 md:transition-all md:duration-[400ms] md:ease-premium md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <button
              onClick={onNotifyMe}
              className="label w-full border-t border-softblack/10 bg-ivory/95 py-3.5 text-[10.5px] text-softblack backdrop-blur transition-colors hover:bg-ivory"
            >
              Notify Me
            </button>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 md:translate-y-full md:opacity-0 md:transition-all md:duration-[400ms] md:ease-premium md:group-hover:translate-y-0 md:group-hover:opacity-100">
            {picking ? (
              <div
                className="border-t border-softblack/10 bg-ivory/95 p-3 shadow-[0_-8px_24px_-12px_rgba(26,26,26,0.18)] backdrop-blur"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <p className="label px-0.5 text-[9.5px] text-warmgray">Select size</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => {
                    const disabled = outOfStock.has(s);
                    return (
                      <button
                        key={s}
                        disabled={disabled}
                        aria-disabled={disabled}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); doAdd(s); }}
                        className={`min-w-[36px] rounded-[2px] border px-2 py-1.5 text-[12.5px] transition-colors ${
                          disabled
                            ? "cursor-not-allowed border-softblack/10 text-softblack/30 line-through"
                            : "border-softblack/20 hover:border-softblack hover:bg-softblack hover:text-ivory"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                onClick={onQuickAdd}
                className="label w-full border-t border-softblack/10 bg-ivory/95 py-3.5 text-[10.5px] text-softblack backdrop-blur transition-colors hover:bg-softblack hover:text-ivory"
              >
                Quick Add
              </button>
            )}
          </div>
        )}
      </div>

      <div className="pt-4">
        <p className="label text-warmgray">{product.category.replace("-", " ")}</p>
        <h3 className="mt-1 truncate font-display text-[16px] leading-snug tracking-[-0.01em]">
          <span className="bg-gradient-to-r from-softblack to-softblack bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-[400ms] ease-premium group-hover:bg-[length:100%_1px]">
            {product.name}
          </span>
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-warmgray">
          <Stars rating={product.rating} />
          <span className="font-medium text-softblack">{product.rating}</span>
          <span>({product.reviews})</span>
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[15px] font-medium text-softblack">
          {formatINR(product.price)}
          {product.compareAt && (
            <>
              <span className="font-normal text-warmgray line-through">{formatINR(product.compareAt)}</span>
              <span className="text-[13px] font-semibold text-danger">{pct}% off</span>
            </>
          )}
        </p>
        <span
          className="mt-2 inline-block h-3 w-3 rounded-full ring-1 ring-offset-2 ring-softblack/15"
          style={{ backgroundColor: product.color.hex }}
          title={product.color.name}
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
