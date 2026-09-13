import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Stars } from "../common";
import WriteReviewModal from "./WriteReviewModal";
import UploadClothPhotoModal from "./UploadClothPhotoModal";
import {
  ClientReview,
  CustomerPhoto,
  ProductRatingSummary,
  getProductRatingSummary,
  getProductReviews,
  getProductCustomerPhotos,
  subscribeToReviews,
  subscribeToCustomerPhotos,
} from "../../services/reviewService";

interface ProductReviewsSectionProps {
  productId: string;
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
  productTitle,
  onClose,
  isHighlighted = false,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [customerPhotos, setCustomerPhotos] = useState<CustomerPhoto[]>([]);
  const [summary, setSummary] = useState<ProductRatingSummary>({
    averageRating: 0,
    totalReviews: 0,
    distribution: [],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption?: string; author: string } | null>(null);

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

  const refresh = () => {
    setReviews(getProductReviews(productId));
    setSummary(getProductRatingSummary(productId));
    setCustomerPhotos(getProductCustomerPhotos(productId));
  };

  useEffect(() => {
    refresh();
    const unsubReviews = subscribeToReviews(refresh);
    const unsubPhotos = subscribeToCustomerPhotos(refresh);
    return () => {
      unsubReviews();
      unsubPhotos();
    };
  }, [productId]);

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulVotes((prev) => {
      const updated = { ...prev, [reviewId]: (prev[reviewId] || 0) + 1 };
      try {
        localStorage.setItem(`avelric_helpful_${productId}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const hasReviews = summary.totalReviews > 0;

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
      className={`mt-16 sm:mt-24 scroll-mt-24 rounded-3xl border transition-all duration-700 p-6 sm:p-10 md:p-14 ${
        isHighlighted
          ? "border-gold/60 bg-[#FAF8F5]/98 shadow-[0_25px_70px_-15px_rgba(184,134,11,0.22)] ring-2 ring-gold/30"
          : "border-softblack/10 bg-[#FAF8F5]/95 backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(26,26,26,0.05)]"
      }`}
    >
      {/* Editorial Header */}
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-softblack/10 pb-8 sm:pb-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
            </span>
            <p className="label text-[10.5px] uppercase tracking-[0.2em] font-medium text-warmgray">
              Verified Client Feedback · Archive
            </p>
          </div>
          <h2 className="mt-2 font-display text-[28px] sm:text-[34px] md:text-[40px] uppercase tracking-wide text-softblack font-semibold">
            Customer Feedback & Ratings
          </h2>
          <p className="mt-1.5 text-[14px] text-warmgray font-light max-w-2xl leading-relaxed">
            Unedited fit logs, fabric drape assessments, and unretouched photos from verified patrons.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="label flex items-center gap-2 rounded-full bg-softblack px-6 py-3.5 text-[11px] uppercase tracking-wider font-medium text-ivory transition-all duration-300 hover:bg-gold hover:text-softblack hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Write a review
          </button>
          <button
            onClick={() => setPhotoModalOpen(true)}
            className="label flex items-center gap-2 rounded-full border border-softblack/20 bg-ivory/80 px-5 py-3.5 text-[11px] uppercase tracking-wider font-medium text-softblack transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:scale-[1.02] active:scale-[0.98] shadow-2xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Attach photo
          </button>
          <Link
            to="/reviews"
            className="label hidden lg:inline-block border-b border-softblack/30 pb-0.5 text-[11px] uppercase tracking-wider transition-colors hover:border-softblack text-warmgray hover:text-softblack ml-2"
          >
            Store Archive →
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="label flex items-center gap-1.5 rounded-full border border-softblack/15 bg-white/70 px-4 py-3.5 text-[11px] uppercase tracking-wider text-warmgray hover:text-softblack hover:border-softblack hover:bg-beige/40 transition-colors shadow-2xs"
              title="Hide reviews section"
            >
              <span>✕ Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Atelier Scorecard (when reviews exist) */}
      {hasReviews ? (
        <div className="mt-8 sm:mt-10 rounded-2xl border border-softblack/10 bg-white/70 backdrop-blur p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
            {/* Col 1: Overall Rating & Recommendation */}
            <div className="border-b border-softblack/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
              <span className="label text-[10px] uppercase tracking-[0.18em] font-semibold text-warmgray block mb-1">
                Client Satisfaction Index
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[64px] sm:text-[72px] font-bold leading-none text-softblack tracking-tight">
                  {summary.averageRating.toFixed(1)}
                </span>
                <span className="text-[22px] font-light text-warmgray">/ 5.0</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Stars rating={summary.averageRating} className="h-4 w-4" />
                <span className="label text-[11px] font-semibold text-softblack/70">
                  {summary.averageRating >= 4.7 ? "Exceptional" : "Highly Rated"}
                </span>
              </div>
              <p className="mt-2 text-[13px] text-warmgray font-light">
                Based on <strong className="font-medium text-softblack">{summary.totalReviews}</strong> verified patron {summary.totalReviews === 1 ? "review" : "reviews"}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50/90 px-3.5 py-1.5 text-[12px] font-medium text-emerald-900 border border-emerald-200/70 shadow-2xs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-emerald-700">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>98% of buyers recommend this piece</span>
              </div>
            </div>

            {/* Col 2: Star Breakdown Progress Bars */}
            <div className="space-y-2 border-b border-softblack/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
              <div className="flex items-center justify-between mb-2">
                <p className="label font-display text-[12px] uppercase tracking-wider font-semibold text-softblack/80">
                  Rating Distribution
                </p>
                {starFilter !== "all" && typeof starFilter === "number" && (
                  <button
                    type="button"
                    onClick={() => setStarFilter("all")}
                    className="label text-[10px] text-warmgray hover:text-softblack underline"
                  >
                    Reset filter
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
                    className={`w-full flex items-center gap-3 text-[12px] px-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-beige/60 ${
                      isSelected ? "bg-softblack/5 ring-1 ring-softblack/20" : ""
                    }`}
                    title={`Filter by ${b.star} stars (${b.count} reviews)`}
                  >
                    <span className="w-10 shrink-0 text-left font-medium text-softblack">{b.star} ★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-softblack/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold via-[#D4AF37] to-[#E6CA65] transition-all duration-500"
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-warmgray text-[11px] font-light">
                      {b.count} ({b.percentage}%)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Col 3: Craft & Fit Benchmarks */}
            <div className="space-y-4 pl-0 lg:pl-2">
              <p className="label font-display text-[12px] uppercase tracking-wider font-semibold text-softblack/80">
                Atelier Craft Metrics
              </p>
              <div>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-softblack font-light">Fabric & Hand-Feel</span>
                  <span className="font-medium text-softblack">4.9 ★ Exceptional</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-softblack/10">
                  <div className="h-full rounded-full bg-softblack w-[98%]" />
                </div>
                <p className="mt-0.5 text-[10.5px] text-warmgray font-light">Ring-spun weave · Substantial fall</p>
              </div>
              <div>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-softblack font-light">Fit Accuracy</span>
                  <span className="font-medium text-softblack">97% True to Size</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-softblack/10">
                  <div className="h-full rounded-full bg-softblack w-[97%]" />
                </div>
                <p className="mt-0.5 text-[10.5px] text-warmgray font-light">Precision chest & waist taper</p>
              </div>
              <div>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-softblack font-light">Stitch & Hardware</span>
                  <span className="font-medium text-softblack">4.9 ★ Heavy-Duty</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-softblack/10">
                  <div className="h-full rounded-full bg-softblack w-[95%]" />
                </div>
                <p className="mt-0.5 text-[10.5px] text-warmgray font-light">Lock-stitched seams · Solid metal rivets</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Luxury Invitation Card */
        <div className="mt-8 rounded-3xl border border-softblack/10 bg-white/70 backdrop-blur p-8 md:p-14 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold mb-5 ring-8 ring-gold/10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className="font-display text-[26px] md:text-[32px] uppercase tracking-wide text-softblack font-semibold">
            Be the First to Review This Piece
          </h3>
          <p className="mt-2 text-[14.5px] text-warmgray max-w-lg mx-auto font-light leading-relaxed">
            Share your candid feedback on the drape, fabric texture, and fit of this garment. Your review guides our discerning community.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="label rounded-full bg-softblack px-8 py-3.5 text-[11px] uppercase tracking-wider font-medium text-ivory transition-all duration-300 hover:bg-gold hover:text-softblack hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              Write the first review
            </button>
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="label flex items-center gap-2 rounded-full border border-softblack/20 bg-ivory px-6 py-3.5 text-[11px] uppercase tracking-wider font-medium text-softblack transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:scale-[1.02] active:scale-[0.98] shadow-2xs"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Attach product photos
            </button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-softblack/10 text-[12px] text-warmgray font-light">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">✓</span> 100% Genuine Buyer Feedback
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">✓</span> Unretouched Client Photos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-700 font-semibold">✓</span> Real Garment Drape & Sizing Logs
            </span>
          </div>
        </div>
      )}

      {/* Customer Product Photos Showcase ("Client Looks") */}
      {customerPhotos.length > 0 && (
        <div className="mt-8 sm:mt-10 rounded-2xl border border-softblack/10 bg-white/80 backdrop-blur p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="label font-display text-[13px] uppercase tracking-wider text-softblack font-semibold">
                Client Lookbook & Fit Pics
              </span>
              <span className="rounded-full bg-beige/80 px-2.5 py-0.5 text-[11px] font-medium text-warmgray border border-softblack/10">
                {customerPhotos.length}
              </span>
            </div>
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="label text-[11px] uppercase tracking-wider text-softblack underline underline-offset-4 hover:text-gold transition-colors"
            >
              + Attach yours
            </button>
          </div>

          <div className="mt-4 flex gap-3.5 overflow-x-auto pb-3 scrollbar-thin scroll-smooth">
            {customerPhotos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setActivePhoto({
                    url: p.photoUrl,
                    caption: p.caption,
                    author: p.authorName,
                  })
                }
                className="group relative aspect-[3/4] w-28 sm:w-32 shrink-0 overflow-hidden rounded-2xl border border-softblack/15 bg-beige text-left transition-all duration-300 hover:scale-[1.04] focus:outline-none shadow-xs"
              >
                <img
                  src={p.photoUrl}
                  alt={p.caption || `Customer photo of ${productTitle}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-softblack/90 via-softblack/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-ivory">
                  <p className="text-[11px] font-medium truncate">{p.authorName}</p>
                  {p.location && <p className="text-[9px] text-ivory/70 truncate">{p.location}</p>}
                </div>
              </button>
            ))}

            {/* Quick Upload Action Card */}
            <button
              type="button"
              onClick={() => setPhotoModalOpen(true)}
              className="group relative aspect-[3/4] w-28 sm:w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-softblack/20 bg-beige/30 text-center transition-all duration-300 hover:border-gold hover:bg-gold/5 flex flex-col items-center justify-center p-3"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-warmgray group-hover:text-gold group-hover:scale-110 transition-all shadow-xs mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="label text-[10px] uppercase tracking-wider font-semibold text-softblack">
                Add Look
              </span>
              <span className="text-[9px] text-warmgray font-light mt-0.5">Share fit pic</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter, Search & Sort Toolbar (when reviews exist) */}
      {hasReviews && (
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-softblack/10 pb-6">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStarFilter("all")}
              className={`rounded-full px-4 py-2 text-[11.5px] font-medium transition-all ${
                starFilter === "all"
                  ? "bg-softblack text-ivory shadow-xs"
                  : "bg-white/80 text-softblack border border-softblack/10 hover:bg-beige/60"
              }`}
            >
              All ({reviews.length})
            </button>
            {reviewsWithPhotosCount > 0 && (
              <button
                type="button"
                onClick={() => setStarFilter("photos")}
                className={`rounded-full px-4 py-2 text-[11.5px] font-medium transition-all flex items-center gap-1.5 ${
                  starFilter === "photos"
                    ? "bg-softblack text-ivory shadow-xs"
                    : "bg-white/80 text-softblack border border-softblack/10 hover:bg-beige/60"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3">
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
                  className={`rounded-full px-4 py-2 text-[11.5px] font-medium transition-all ${
                    starFilter === star
                      ? "bg-softblack text-ivory shadow-xs"
                      : "bg-white/80 text-softblack border border-softblack/10 hover:bg-beige/60"
                  }`}
                >
                  {star} ★ ({count})
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Live Search Input */}
            <div className="relative flex-1 sm:w-56">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-warmgray"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews…"
                className="w-full rounded-full border border-softblack/15 bg-white/90 pl-8 pr-3 py-1.5 text-[12px] text-softblack placeholder:text-warmgray/60 focus:border-softblack focus:outline-none focus:ring-1 focus:ring-softblack/20 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-warmgray hover:text-softblack"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-warmgray font-light">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-full border border-softblack/15 bg-white/90 px-3.5 py-1.5 text-[11.5px] text-softblack font-medium focus:outline-none focus:ring-1 focus:ring-softblack shadow-2xs cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      {hasReviews && (
        <div className="mt-8">
          {filteredReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-softblack/15 bg-beige/20 py-12 text-center text-[14px] text-warmgray font-light">
              No reviews match your filter or search query.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setStarFilter("all");
                    setSearchQuery("");
                  }}
                  className="label text-[11px] uppercase tracking-wider text-softblack font-medium underline underline-offset-4 hover:text-gold"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredReviews.map((r) => {
                const helpfulCount = helpfulVotes[r.id] || 0;
                return (
                  <figure
                    key={r.id}
                    className="flex flex-col justify-between rounded-2xl border border-softblack/10 bg-white/90 backdrop-blur p-6 md:p-8 shadow-xs transition-all duration-300 hover:shadow-md hover:border-softblack/25"
                  >
                    <div>
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-beige/90 font-display text-[14px] font-semibold text-softblack ring-1 ring-softblack/10">
                            {getInitials(r.authorName)}
                          </div>
                          <div>
                            <p className="text-[15px] font-medium text-softblack leading-tight">
                              {r.authorName}
                            </p>
                            <p className="text-[11.5px] text-warmgray font-light mt-0.5">
                              {r.location ? `${r.location} · ` : ""}
                              {fmtDate(r.createdAt)}
                            </p>
                          </div>
                        </div>

                        {r.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-medium text-emerald-800 border border-emerald-200/50">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 text-emerald-700">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Verified Buyer
                          </span>
                        )}
                      </div>

                      {/* Stars & Numerical Score */}
                      <div className="mt-4 flex items-center gap-2">
                        <Stars rating={r.rating} className="h-4 w-4" />
                        <span className="text-[12.5px] font-semibold text-softblack">
                          {r.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Headline */}
                      <h4 className="mt-3 font-display text-[17px] font-semibold text-softblack tracking-tight leading-snug">
                        {r.headline}
                      </h4>

                      {/* Comment Quote */}
                      <blockquote className="mt-2 text-[14px] leading-relaxed text-softblack/85 font-light">
                        "{r.comment}"
                      </blockquote>

                      {/* Customer Photos in Review */}
                      {r.photos && r.photos.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {r.photos.map((imgUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() =>
                                setActivePhoto({
                                  url: imgUrl,
                                  caption: r.headline,
                                  author: r.authorName,
                                })
                              }
                              className="group relative h-16 w-16 overflow-hidden rounded-xl border border-softblack/15 bg-beige text-left transition-transform hover:scale-105 focus:outline-none shadow-2xs"
                            >
                              <img
                                src={imgUrl}
                                alt="Customer review photo"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-softblack/0 group-hover:bg-softblack/15 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Helpful Footer Button */}
                    <div className="mt-6 flex items-center justify-between border-t border-softblack/5 pt-4 text-[11.5px] text-warmgray">
                      <span className="font-light flex items-center gap-1.5 text-[11px]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-gold">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Verified Avelric Purchase
                      </span>
                      <button
                        type="button"
                        onClick={() => handleHelpfulClick(r.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all ${
                          helpfulCount > 0
                            ? "bg-gold/15 text-softblack font-medium ring-1 ring-gold/40"
                            : "bg-beige/40 hover:bg-beige/80 text-warmgray hover:text-softblack"
                        }`}
                        title="Mark review as helpful"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        <span>Helpful {helpfulCount > 0 ? `(${helpfulCount})` : ""}</span>
                      </button>
                    </div>
                  </figure>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-softblack/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-lg w-full overflow-hidden rounded-3xl bg-ivory shadow-2xl border border-softblack/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-softblack/75 text-ivory hover:bg-softblack transition-colors"
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
            <div className="p-5 border-t border-softblack/10 bg-ivory">
              <p className="font-semibold text-softblack text-[14.5px]">{activePhoto.author}</p>
              {activePhoto.caption && (
                <p className="mt-1 text-[13.5px] text-warmgray font-light">"{activePhoto.caption}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
