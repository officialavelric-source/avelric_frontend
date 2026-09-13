import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal, Stars } from "../../components/common";
import { getAllCachedProducts } from "../../services/shopify/productService";
import {
  ClientReview,
  getAllReviews,
  getGlobalRatingSummary,
  subscribeToReviews,
} from "../../services/reviewService";
import { WriteReviewModal } from "../../components/reviews";

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const RATING_FILTERS = [
  { label: "All ratings", min: 0 },
  { label: "5 stars", min: 5 },
  { label: "4 stars & up", min: 4 },
  { label: "3 stars & up", min: 3 },
];

export default function Reviews() {
  const [ratingFilter, setRatingFilter] = useState(0);
  const [productFilter, setProductFilter] = useState("all");
  const [allReviews, setAllReviews] = useState<ClientReview[]>(() => getAllReviews());
  const [summary, setSummary] = useState(() => getGlobalRatingSummary());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProductId, setModalProductId] = useState<string>("");
  const [modalProductTitle, setModalProductTitle] = useState<string>("");
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption?: string; author: string } | null>(null);

  const allProducts = getAllCachedProducts();

  const refresh = () => {
    setAllReviews(getAllReviews());
    setSummary(getGlobalRatingSummary());
  };

  useEffect(() => {
    refresh();
    return subscribeToReviews(refresh);
  }, []);

  // Distinct products that have reviews
  const reviewedProducts = useMemo(() => {
    const ids = [...new Set(allReviews.map((r) => r.productId))];
    return ids
      .map((id) => allProducts.find((p) => p.id === id || p.handle === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [allReviews, allProducts]);

  // Filtered reviews
  const items = useMemo(() => {
    return allReviews
      .filter(
        (r) =>
          r.rating >= RATING_FILTERS[ratingFilter].min &&
          (productFilter === "all" || r.productId === productFilter)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allReviews, ratingFilter, productFilter]);

  const handleOpenModal = (prodId?: string, prodTitle?: string) => {
    const targetProduct = prodId ? { id: prodId, name: prodTitle } : allProducts[0];
    setModalProductId(targetProduct?.id || "general");
    setModalProductTitle(targetProduct?.name || "Avelric Collection");
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <Reveal>
        <p className="label text-warmgray">
          <Link to="/" className="hover:text-softblack">Home</Link> / Reviews
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[32px] md:text-[40px]">Customer reviews</h1>
            <p className="mt-2 max-w-xl text-[15px] text-warmgray">
              Every review published here is genuine feedback from clients who purchased and wore our pieces.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="label rounded-full bg-softblack px-6 py-3 text-[11px] text-ivory transition-colors hover:bg-softblack/90 shadow-sm"
          >
            Write a review
          </button>
        </div>
      </Reveal>

      {/* Summary Card */}
      {summary.totalReviews > 0 ? (
        <Reveal className="mt-10">
          <div className="grid gap-8 rounded-2xl bg-beige p-7 md:grid-cols-[220px_1fr_auto] md:items-center md:p-9 border border-softblack/10">
            <div>
              <p className="font-display text-[52px] leading-none">
                {summary.averageRating.toFixed(1)}
                <span className="text-[24px] text-warmgray">/5</span>
              </p>
              <div className="mt-3">
                <Stars rating={summary.averageRating} className="h-4.5 w-4.5" />
              </div>
              <p className="mt-2 text-[13px] text-warmgray">
                {summary.totalReviews} verified {summary.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="max-w-md space-y-1.5">
              {summary.distribution.map((b) => (
                <div key={b.star} className="flex items-center gap-3 text-[12.5px]">
                  <span className="w-8 shrink-0 text-warmgray">{b.star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-softblack/10">
                    <div
                      className="h-full rounded-full bg-softblack transition-all duration-500"
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-warmgray">{b.count}</span>
                </div>
              ))}
            </div>
            <div className="text-[13.5px] leading-relaxed text-warmgray md:max-w-[200px]">
              Bought something recently?
              <button
                onClick={() => handleOpenModal()}
                className="ml-1 border-b border-softblack/40 text-softblack font-medium hover:border-softblack transition-colors"
              >
                Share your review
              </button>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal className="mt-10">
          <div className="rounded-2xl border border-softblack/10 bg-beige/40 p-10 text-center md:p-16">
            <h3 className="font-display text-[26px] text-softblack">Client Reviews</h3>
            <p className="mt-2 max-w-md mx-auto text-[14px] text-warmgray">
              Share your experience with Avelric garments. Every review helps other clients find the right fit and fabric.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="label mt-6 rounded-full bg-softblack px-7 py-3 text-[11px] text-ivory transition-colors hover:bg-softblack/90"
            >
              Write a review
            </button>
          </div>
        </Reveal>
      )}

      {/* Filters */}
      {summary.totalReviews > 0 && (
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

            {reviewedProducts.length > 0 && (
              <label className="ml-auto flex items-center gap-3 text-[13px] text-warmgray">
                Product
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="rounded-full border border-softblack/25 bg-transparent px-4 py-2 text-[13px] text-softblack focus:outline-none focus:border-softblack"
                >
                  <option value="all">All products</option>
                  {reviewedProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </Reveal>
      )}

      {/* Review Cards */}
      {summary.totalReviews > 0 && items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-beige px-8 py-20 text-center">
          <p className="font-display text-2xl">No reviews match these filters</p>
          <button
            onClick={() => {
              setRatingFilter(0);
              setProductFilter("all");
            }}
            className="label mt-8 rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory"
          >
            Clear filters
          </button>
        </div>
      ) : summary.totalReviews > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => {
            const p = allProducts.find((prod) => prod.id === r.productId || prod.handle === r.productId);
            return (
              <Reveal key={r.id} delay={Math.min(i, 5) * 0.05}>
                <motion.figure
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full flex-col rounded-2xl bg-ivory p-6 shadow-sm ring-1 ring-softblack/10 md:p-7"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14.5px] font-semibold text-softblack">{r.authorName}</p>
                      <p className="label mt-0.5 text-[9.5px] text-warmgray">
                        {r.location ? `${r.location} · ` : ""}
                        {fmtDate(r.createdAt)}
                      </p>
                    </div>
                    {r.verifiedPurchase && (
                      <span className="label rounded-full bg-beige/80 px-2.5 py-1 text-[8.5px] text-softblack font-medium">
                        Verified buyer ✓
                      </span>
                    )}
                  </div>

                  <div className="mt-3.5 flex items-center gap-2">
                    <Stars rating={r.rating} />
                  </div>

                  <h4 className="mt-3 font-semibold text-[15px] text-softblack">
                    {r.headline}
                  </h4>

                  <blockquote className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-softblack/80">
                    "{r.comment}"
                  </blockquote>

                  {/* Customer cloth photos */}
                  {r.photos && r.photos.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {r.photos.map((imgUrl, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setActivePhoto({ url: imgUrl, caption: r.headline, author: r.authorName })}
                          className="group relative h-16 w-14 overflow-hidden rounded-xl border border-softblack/15 bg-beige text-left transition-transform hover:scale-105 focus:outline-none"
                        >
                          <img src={imgUrl} alt="Cloth review photo" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-softblack/0 group-hover:bg-softblack/15 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}

                  {p && (
                    <Link
                      to={`/product/${p.id}`}
                      className="mt-5 flex items-center gap-3 rounded-xl bg-beige/60 p-2.5 transition-colors hover:bg-beige"
                    >
                      {p.images[0] && (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="h-12 w-10 rounded-lg object-cover"
                          loading="lazy"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="label block text-[9px] text-warmgray">Piece</span>
                        <span className="block truncate text-[13px] font-medium text-softblack">{p.name}</span>
                      </span>
                      <span aria-hidden="true" className="text-warmgray pr-1">→</span>
                    </Link>
                  )}
                </motion.figure>
              </Reveal>
            );
          })}
        </div>
      ) : null}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={modalProductId}
        productTitle={modalProductTitle}
        onReviewSubmitted={refresh}
      />

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-softblack/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-lg w-full overflow-hidden rounded-2xl bg-ivory shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-softblack/70 text-ivory hover:bg-softblack transition-colors"
            >
              ✕
            </button>
            <div className="aspect-[4/5] w-full bg-softblack/5 flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || "Customer cloth photo"}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="p-4 border-t border-softblack/10">
              <p className="font-semibold text-softblack text-[14px]">{activePhoto.author}</p>
              {activePhoto.caption && (
                <p className="mt-1 text-[13px] text-warmgray">"{activePhoto.caption}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
