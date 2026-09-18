import { useEffect, useMemo, useState } from "react";
import { Stars } from "../common";
import WriteReviewModal from "./WriteReviewModal";
import UploadClothPhotoModal from "./UploadClothPhotoModal";
import {
  ClientReview,
  CustomerPhoto,
  ProductRatingSummary,
  fetchProductReviews,
  getProductRatingSummary,
  getProductReviews,
  getProductCustomerPhotos,
  subscribeToReviews,
  subscribeToCustomerPhotos,
  voteReviewHelpful,
} from "../../services/reviewService";

interface ProductReviewsSectionProps {
  productId: string;
  shopifyProductId?: string;
  productTitle: string;
  onClose?: () => void;
  isHighlighted?: boolean;
}

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

export default function ProductReviewsSection({
  productId,
  shopifyProductId,
  productTitle,
  onClose,
  isHighlighted = false,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ClientReview[]>(() =>
    getProductReviews(productId, shopifyProductId)
  );
  const [customerPhotos, setCustomerPhotos] = useState<CustomerPhoto[]>(() =>
    getProductCustomerPhotos(productId)
  );
  const [summary, setSummary] = useState<ProductRatingSummary>(() =>
    getProductRatingSummary(productId, shopifyProductId)
  );
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<{
    url: string;
    caption?: string;
    author: string;
    location?: string;
  } | null>(null);

  // Filters, search and sorting
  const [starFilter, setStarFilter] = useState<number | "all" | "photos">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest" | "helpful">("recent");

  // Helpful reactions stored locally in state & localStorage
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`avelric_helpful_${productId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const refresh = async () => {
    try {
      const data = await fetchProductReviews(productId, shopifyProductId, true);
      setReviews(data.reviews);
      setSummary(data.summary);
      setCustomerPhotos(getProductCustomerPhotos(productId));
    } catch (err) {
      console.warn("[ProductReviewsSection] Fetch error:", err);
      setReviews(getProductReviews(productId, shopifyProductId));
      setSummary(getProductRatingSummary(productId, shopifyProductId));
      setCustomerPhotos(getProductCustomerPhotos(productId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const unsubReviews = subscribeToReviews(refresh);
    const unsubPhotos = subscribeToCustomerPhotos(refresh);
    return () => {
      unsubReviews();
      unsubPhotos();
    };
  }, [productId, shopifyProductId]);

  const handleHelpfulClick = async (reviewId: string) => {
    setHelpfulVotes((prev) => {
      const updated = { ...prev, [reviewId]: (prev[reviewId] || 0) + 1 };
      try {
        localStorage.setItem(`avelric_helpful_${productId}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    try {
      await voteReviewHelpful(reviewId);
    } catch {
      // ignore
    }
  };

  // True if either summary reports reviews OR reviews array has entries
  const hasReviews = (summary?.totalReviews > 0) || (reviews && reviews.length > 0);

  // Combine photos from fetched reviews + standalone customerPhotos
  const allPatronPhotos = useMemo(() => {
    const list: { url: string; caption?: string; author: string; location?: string }[] = [];
    const seenUrls = new Set<string>();

    for (const r of reviews) {
      if (r.photos && r.photos.length > 0) {
        for (const pUrl of r.photos) {
          if (pUrl && !seenUrls.has(pUrl)) {
            seenUrls.add(pUrl);
            list.push({
              url: pUrl,
              caption: r.headline || r.comment,
              author: r.authorName,
              location: r.location,
            });
          }
        }
      }
    }

    for (const cp of customerPhotos) {
      if (cp.photoUrl && !seenUrls.has(cp.photoUrl)) {
        seenUrls.add(cp.photoUrl);
        list.push({
          url: cp.photoUrl,
          caption: cp.caption,
          author: cp.authorName,
          location: cp.location,
        });
      }
    }

    return list;
  }, [reviews, customerPhotos]);

  // Filtered, searched and sorted reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (starFilter === "photos") {
      list = list.filter((r) => r.photos && r.photos.length > 0);
    } else if (typeof starFilter === "number") {
      list = list.filter((r) => Math.round(r.rating) === starFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.headline.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          (r.location && r.location.toLowerCase().includes(q))
      );
    }

    if (sortBy === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "helpful") {
      list.sort((a, b) => (helpfulVotes[b.id] || 0) - (helpfulVotes[a.id] || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [reviews, starFilter, searchQuery, sortBy, helpfulVotes]);

  const reviewsWithPhotosCount = useMemo(() => {
    return reviews.filter((r) => r.photos && r.photos.length > 0).length;
  }, [reviews]);

  // Initials helper for review avatars
  const getInitials = (name: string) => {
    return (
      name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "A"
    );
  };

  return (
    <section
      id="reviews"
      className={`mt-16 sm:mt-24 scroll-mt-24 border-t border-neutral-200/80 pt-12 sm:pt-16 pb-16 transition-all duration-500 ${
        isHighlighted ? "bg-[#FAF8F5]/80 -mx-4 px-4 sm:-mx-8 sm:px-8 rounded-3xl" : ""
      }`}
    >
      {/* Editorial Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B8860B]" />
            <span className="text-[11px] uppercase tracking-[0.28em] font-medium text-neutral-500">
              Avelric Atelier · Client Verdicts
            </span>
          </div>
          <h2 className="font-display text-[26px] sm:text-[34px] uppercase tracking-wide text-neutral-900 font-semibold">
            Patron Reviews & Experiences
          </h2>
          <p className="mt-1.5 text-[14px] text-neutral-500 font-light max-w-xl leading-relaxed">
            Authentic impressions on fabric drape, silhouette proportions, and artisanal finishing.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="group flex items-center gap-2.5 rounded-full bg-neutral-900 px-6 py-3 text-[11.5px] uppercase tracking-widest font-medium text-white transition-all duration-300 hover:bg-black hover:shadow-lg hover:shadow-neutral-900/10 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Write a Review
          </button>
          <button
            onClick={() => setPhotoModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-[11.5px] uppercase tracking-widest font-medium text-neutral-800 transition-all duration-300 hover:border-black hover:bg-neutral-50 shadow-2xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Attach Photo
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full border border-neutral-200 px-4 py-3 text-[11.5px] uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Populated Scorecard OR Minimal Empty State */}
      {hasReviews ? (
        <div className="mt-8 rounded-3xl border border-neutral-200/90 bg-[#FAF9F6] p-7 sm:p-9 shadow-xs">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left: Overall Rating & Recommendation */}
            <div className="md:border-r md:border-neutral-200/80 md:pr-8">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[56px] sm:text-[64px] font-bold leading-none text-neutral-900 tracking-tight">
                  {(summary.averageRating || (reviews[0]?.rating ?? 5)).toFixed(1)}
                </span>
                <span className="text-[20px] font-light text-neutral-400">/ 5.0</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2.5">
                <Stars rating={summary.averageRating || (reviews[0]?.rating ?? 5)} className="h-4.5 w-4.5" />
                <span className="text-[12.5px] font-semibold text-neutral-800 tracking-wide uppercase">
                  {(summary.averageRating || (reviews[0]?.rating ?? 5)) >= 4.7 ? "Flawless Quality" : "Highly Regarded"}
                </span>
              </div>
              <p className="mt-2 text-[13px] text-neutral-500 font-light">
                Consensus derived from <strong className="font-medium text-neutral-900">{reviews.length || summary.totalReviews}</strong> { (reviews.length || summary.totalReviews) === 1 ? "verified patron submission" : "verified patron submissions"}.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[12px] font-medium text-neutral-800 border border-neutral-200/80 shadow-2xs">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B8860B]/15 text-[#B8860B]">
                  ✓
                </span>
                <span>100% of verified clients endorse this creation</span>
              </div>
            </div>

            {/* Right: Star Breakdown Progress Bars */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-neutral-600">
                  Rating Distribution
                </p>
                {starFilter !== "all" && typeof starFilter === "number" && (
                  <button
                    type="button"
                    onClick={() => setStarFilter("all")}
                    className="text-[11px] text-neutral-500 hover:text-black underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              {summary.distribution.map((b) => {
                const isSelected = starFilter === b.star;
                return (
                  <button
                    key={b.star}
                    type="button"
                    onClick={() => setStarFilter(isSelected ? "all" : b.star)}
                    className={`w-full flex items-center gap-3 text-[12.5px] px-3 py-1.5 rounded-xl transition-all ${
                      isSelected
                        ? "bg-white ring-1 ring-black shadow-xs font-medium"
                        : "hover:bg-white/80 text-neutral-700"
                    }`}
                  >
                    <span className="w-12 shrink-0 text-left font-medium text-neutral-800 flex items-center gap-1">
                      {b.star} <span className="text-[#B8860B]">★</span>
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200/80">
                      <div
                        className="h-full rounded-full bg-[#B8860B] transition-all duration-500"
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-neutral-400 text-[11px] font-light">
                      {b.count} ({b.percentage}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State (Only shown if genuinely 0 reviews exist) */
        <div className="mt-8 rounded-3xl border border-neutral-200/90 bg-[#FAF9F6] p-10 sm:p-14 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white border border-neutral-200/80 shadow-2xs mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#B8860B]">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className="font-display text-[22px] sm:text-[26px] uppercase tracking-wide text-neutral-900 font-semibold">
            Be the First to Chronicle This Piece
          </h3>
          <p className="mt-2 text-[14px] text-neutral-500 max-w-md mx-auto font-light leading-relaxed">
            Share your feedback on the fabric texture, hand-feel, and drape with the Avelric circle.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-neutral-900 px-8 py-3.5 text-[11.5px] uppercase tracking-widest font-medium text-white transition-all hover:bg-black shadow-xs"
            >
              Write the First Review
            </button>
          </div>
        </div>
      )}

      {/* Customer Visual Lookbook Showcase */}
      {allPatronPhotos.length > 0 && (
        <div className="mt-8 rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] uppercase tracking-[0.18em] font-semibold text-neutral-900">
                Patron Visual Lookbook
              </span>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                {allPatronPhotos.length}
              </span>
            </div>
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="text-[11.5px] uppercase tracking-wider text-neutral-800 underline underline-offset-4 hover:text-black transition-colors"
            >
              + Attach your fit
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {allPatronPhotos.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setActivePhoto({
                    url: p.url,
                    caption: p.caption,
                    author: p.author,
                    location: p.location,
                  })
                }
                className="group relative aspect-[3/4] w-32 sm:w-36 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-md cursor-pointer"
              >
                <img
                  src={p.url}
                  alt={p.caption || `Customer photo of ${productTitle}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                  <div className="self-end rounded-full bg-white/20 p-1 backdrop-blur-xs">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-medium truncate">{p.author}</p>
                    {p.location && <p className="text-[9.5px] text-white/70 truncate">{p.location}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter, Search & Sort Toolbar */}
      {hasReviews && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStarFilter("all")}
              className={`rounded-full px-4 py-2 text-[12px] font-medium transition-all ${
                starFilter === "all"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              All ({reviews.length})
            </button>
            {reviewsWithPhotosCount > 0 && (
              <button
                type="button"
                onClick={() => setStarFilter("photos")}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                  starFilter === "photos"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                With Photos ({reviewsWithPhotosCount})
              </button>
            )}
            {[5, 4, 3].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              if (count === 0) return null;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarFilter(starFilter === star ? "all" : star)}
                  className={`rounded-full px-4 py-2 text-[12px] font-medium transition-all ${
                    starFilter === star
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {star} ★ ({count})
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews…"
                className="w-full rounded-full border border-neutral-300 bg-white pl-9 pr-4 py-2 text-[12.5px] text-neutral-800 placeholder:text-neutral-400 focus:border-black focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-[12px] text-neutral-800 font-medium focus:outline-none focus:border-black shadow-2xs cursor-pointer"
            >
              <option value="recent">Newest Impressions</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      )}

      {/* Redesigned Luxury Review Cards Grid */}
      {hasReviews && (
        <div className="mt-8">
          {filteredReviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 py-14 text-center text-[14px] text-neutral-500 font-light bg-neutral-50/50">
              No patron reviews match your active query.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setStarFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-[12px] uppercase tracking-wider text-black font-semibold underline underline-offset-4"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredReviews.map((r) => {
                const helpfulCount = (r.helpfulCount || 0) + (helpfulVotes[r.id] || 0);
                return (
                  <article
                    key={r.id}
                    className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-7 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-neutral-400 hover:shadow-md"
                  >
                    <div>
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white font-display text-[13px] font-semibold tracking-wider shadow-2xs">
                            {getInitials(r.authorName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[15px] font-semibold text-neutral-900 leading-tight">
                                {r.authorName}
                              </p>
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                                <span className="text-[#B8860B]">✦</span> Verified Patron
                              </span>
                            </div>
                            <p className="text-[12px] text-neutral-400 font-light mt-0.5">
                              {r.location ? `${r.location} · ` : ""}
                              {fmtDate(r.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex flex-col items-end">
                          <Stars rating={r.rating} className="h-4 w-4" />
                          <span className="text-[11px] font-medium text-neutral-400 mt-1">
                            {r.rating.toFixed(1)} / 5.0
                          </span>
                        </div>
                      </div>

                      {/* Headline */}
                      <h4 className="mt-4 font-display text-[17.5px] font-semibold text-neutral-900 tracking-tight leading-snug">
                        "{r.headline}"
                      </h4>

                      {/* Comment Body */}
                      <p className="mt-2 text-[14px] leading-relaxed text-neutral-700 font-light">
                        {r.comment}
                      </p>

                      {/* Photos Attached to this Review */}
                      {r.photos && r.photos.length > 0 && (
                        <div className="mt-5">
                          <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium mb-2">
                            Patron Visuals:
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {r.photos.map((imgUrl, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() =>
                                  setActivePhoto({
                                    url: imgUrl,
                                    caption: r.headline,
                                    author: r.authorName,
                                    location: r.location,
                                  })
                                }
                                className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 text-left transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer"
                              >
                                <img
                                  src={imgUrl}
                                  alt="Customer review photo"
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                  </svg>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Review Footer with Helpful Action */}
                    <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-[12px] text-neutral-400">
                      <span className="font-light text-[11px] tracking-wide text-neutral-400">
                        Avelric Archive Curation
                      </span>
                      <button
                        type="button"
                        onClick={() => handleHelpfulClick(r.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all text-[11.5px] ${
                          helpfulVotes[r.id]
                            ? "bg-neutral-900 text-white font-medium shadow-xs"
                            : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200/70"
                        }`}
                        title="Mark review as helpful"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        <span>Helpful {helpfulCount > 0 ? `(${helpfulCount})` : ""}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={productId}
        shopifyProductId={shopifyProductId}
        productTitle={productTitle}
        onReviewSubmitted={refresh}
      />

      {/* Attach Photos Modal */}
      <UploadClothPhotoModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        productId={productId}
        productTitle={productTitle}
        onPhotoUploaded={refresh}
      />

      {/* High-Resolution Photo Lightbox */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-lg w-full overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/75 text-white hover:bg-black transition-colors"
            >
              ✕
            </button>
            <div className="aspect-[4/5] w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || "Customer cloth photo"}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="p-5 border-t border-neutral-200 bg-white">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-neutral-900 text-[15px]">{activePhoto.author}</p>
                {activePhoto.location && (
                  <span className="text-[12px] text-neutral-400 font-light">{activePhoto.location}</span>
                )}
              </div>
              {activePhoto.caption && (
                <p className="mt-1.5 text-[13.5px] text-neutral-600 font-light">"{activePhoto.caption}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
