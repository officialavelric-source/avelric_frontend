import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal, Stars } from "../../components/common";
import { getProduct } from "../../services/productService";
import { AVG_RATING, REVIEWS } from "../../data/reviews";

/* Dedicated reviews page — rating aur product se filterable */

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const RATING_FILTERS = [
  { label: "All ratings", min: 0 },
  { label: "5 stars", min: 5 },
  { label: "4 stars & up", min: 4 },
];

export default function Reviews() {
  const [ratingFilter, setRatingFilter] = useState(0);
  const [productFilter, setProductFilter] = useState("all");

  const reviewedProducts = useMemo(() => {
    const ids = [...new Set(REVIEWS.map((r) => r.productId))];
    return ids
      .map((id) => getProduct(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, []);

  const items = useMemo(
    () =>
      REVIEWS.filter(
        (r) =>
          r.rating >= RATING_FILTERS[ratingFilter].min &&
          (productFilter === "all" || r.productId === productFilter)
      ).sort((a, b) => b.date.localeCompare(a.date)),
    [ratingFilter, productFilter]
  );

  // rating distribution — summary bar ke liye
  const dist = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: REVIEWS.filter((r) => Math.floor(r.rating) === star || (star === 4 && r.rating === 4.5)).length,
    }));
    return buckets;
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <Reveal>
        <p className="label text-warmgray">
          <Link to="/" className="hover:text-softblack">Home</Link> / Reviews
        </p>
        <h1 className="mt-3 font-display text-[32px] md:text-[40px]">Customer reviews</h1>
        <p className="mt-3 max-w-xl text-[15px] text-warmgray">
          Every review here is from a delivered order. We publish the fours alongside the fives.
        </p>
      </Reveal>

      {/* summary card */}
      <Reveal className="mt-10">
        <div className="grid gap-8 rounded-2xl bg-beige p-7 md:grid-cols-[220px_1fr_auto] md:items-center md:p-9">
          <div>
            <p className="font-display text-[52px] leading-none">{AVG_RATING}<span className="text-[24px] text-warmgray">/5</span></p>
            <div className="mt-3"><Stars rating={Number(AVG_RATING)} className="h-4.5 w-4.5" /></div>
            <p className="mt-2 text-[13px] text-warmgray">{REVIEWS.length} published reviews · 1,200+ orders</p>
          </div>
          <div className="max-w-md space-y-1.5">
            {dist.map((b) => (
              <div key={b.star} className="flex items-center gap-3 text-[12.5px]">
                <span className="w-8 shrink-0 text-warmgray">{b.star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-softblack/10">
                  <div
                    className="h-full rounded-full bg-softblack"
                    style={{ width: `${(b.count / REVIEWS.length) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-warmgray">{b.count}</span>
              </div>
            ))}
          </div>
          <div className="text-[13.5px] leading-relaxed text-warmgray md:max-w-[200px]">
            Bought something?
            <Link to="/contact" className="ml-1 border-b border-softblack/30 text-softblack hover:border-softblack">
              Send us your review
            </Link>{" "}
            — photos welcome.
          </div>
        </div>
      </Reveal>

      {/* filters */}
      <Reveal className="mt-10">
        <div className="flex flex-wrap items-center gap-2.5">
          {RATING_FILTERS.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setRatingFilter(i)}
              aria-pressed={ratingFilter === i}
              className={`label rounded-full border px-4 py-2.5 text-[10.5px] transition-colors ${
                ratingFilter === i
                  ? "border-softblack bg-softblack text-ivory"
                  : "border-softblack/25 hover:border-softblack"
              }`}
            >
              {f.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-3 text-[13px] text-warmgray">
            Product
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="rounded-full border border-softblack/25 bg-transparent px-4 py-2 text-[13px] text-softblack"
            >
              <option value="all">All products</option>
              {reviewedProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>
      </Reveal>

      {/* review cards */}
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-beige px-8 py-20 text-center">
          <p className="font-display text-2xl">No reviews match these filters</p>
          <button
            onClick={() => { setRatingFilter(0); setProductFilter("all"); }}
            className="label mt-8 rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => {
            const p = getProduct(r.productId);
            return (
              <Reveal key={r.n + r.productId} delay={Math.min(i, 5) * 0.05}>
                <motion.figure
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col rounded-2xl bg-ivory p-6 shadow-sm shadow-softblack/5 ring-1 ring-softblack/10 md:p-7"
                >
                  <div className="flex items-center gap-3.5">
                    <img src={r.avatar} alt="" className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                    <figcaption>
                      <p className="text-[14.5px] font-semibold">{r.n}</p>
                      <p className="label mt-0.5 text-[9.5px] text-warmgray">{r.c} · {fmtDate(r.date)}</p>
                    </figcaption>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="label rounded-full bg-beige px-2.5 py-1 text-[8.5px] text-warmgray">Verified buyer</span>
                  </div>
                  <blockquote className="mt-3.5 flex-1 font-display text-[16.5px] leading-relaxed">"{r.q}"</blockquote>
                  {p && (
                    <Link
                      to={`/product/${p.id}`}
                      className="mt-5 flex items-center gap-3 rounded-xl bg-beige/70 p-2.5 transition-colors hover:bg-beige"
                    >
                      <img src={p.images[0]} alt="" className="h-12 w-10 rounded-lg object-cover" loading="lazy" />
                      <span className="min-w-0">
                        <span className="label block text-[9px] text-warmgray">Purchased</span>
                        <span className="block truncate text-[13px] font-medium">{p.name}</span>
                      </span>
                      <span aria-hidden="true" className="ml-auto text-warmgray">→</span>
                    </Link>
                  )}
                </motion.figure>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
