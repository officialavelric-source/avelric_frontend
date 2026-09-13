import { ChangeEvent, FormEvent, useState } from "react";
import { submitReview } from "../../services/reviewService";
import { useToast } from "../../context/ToastContext";
import { compressImage } from "../../utils/image";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle?: string;
  onReviewSubmitted?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: "5.0 · Exceptional quality & fit",
  4: "4.0 · Very good overall",
  3: "3.0 · Average / Met expectations",
  2: "2.0 · Below expectations",
  1: "1.0 · Unsatisfied",
};

export default function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { push } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [location, setLocation] = useState("");
  const [headline, setHeadline] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const availableSlots = 4 - photos.length;
    if (availableSlots <= 0) {
      setError("You can attach up to 4 photos per review.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    setUploadingPhotos(true);

    try {
      const processedUrls: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) {
          setError("Please select valid image files (JPEG, PNG, or WebP).");
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          setError("Image file size should be less than 8MB.");
          continue;
        }
        const dataUrl = await compressImage(file);
        processedUrls.push(dataUrl);
      }
      if (processedUrls.length > 0) {
        setPhotos((prev) => [...prev, ...processedUrls]);
      }
    } catch {
      setError("Failed to process images. Please try again.");
    } finally {
      setUploadingPhotos(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const resetForm = () => {
    setHeadline("");
    setComment("");
    setAuthorName("");
    setLocation("");
    setPhotos([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authorName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!headline.trim()) {
      setError("Please provide a headline for your review.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write your detailed review.");
      return;
    }

    try {
      setLoading(true);
      await submitReview({
        productId,
        productTitle,
        authorName: authorName.trim(),
        location: location.trim() || undefined,
        rating,
        headline: headline.trim(),
        comment: comment.trim(),
        verifiedPurchase: true,
        photos: photos.length > 0 ? photos : undefined,
      });

      push({ message: "Thank you! Your review has been published." });
      resetForm();
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hoverRating ?? rating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-softblack/60 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-softblack/10 bg-ivory shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-softblack/10 px-7 py-5 bg-ivory">
          <div>
            <span className="label text-[10px] uppercase tracking-widest text-warmgray">
              Verified Experience
            </span>
            <h2 id="write-review-title" className="mt-1 font-display text-[24px] uppercase tracking-wide text-softblack font-semibold">
              Write a Review
            </h2>
            {productTitle && (
              <p className="mt-0.5 truncate text-[13px] text-warmgray max-w-[360px]">
                {productTitle}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-softblack/5 text-warmgray hover:bg-softblack hover:text-ivory transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-7 py-6 space-y-5 flex-1">
          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 text-[13px] text-red-600 border border-red-200 flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Rating Selector */}
          <div className="rounded-2xl border border-softblack/10 bg-beige/35 p-4.5">
            <label className="label block text-[10.5px] uppercase tracking-wider text-warmgray mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex items-center gap-1.5"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    className="p-1 transition-transform hover:scale-115 focus:outline-none"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-7 w-7 transition-colors duration-200 ${
                        star <= activeRating
                          ? "fill-gold text-gold drop-shadow-sm"
                          : "fill-softblack/10 text-softblack/20"
                      }`}
                    >
                      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <span className="label rounded-full bg-ivory px-3 py-1 text-[11px] font-medium text-softblack border border-softblack/10 shadow-xs">
                {RATING_LABELS[activeRating]}
              </span>
            </div>
          </div>

          {/* Review Headline */}
          <div>
            <label htmlFor="review-headline" className="label block text-[10.5px] uppercase tracking-wider text-warmgray mb-1.5">
              Review Headline <span className="text-red-500">*</span>
            </label>
            <input
              id="review-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Impeccable tailoring and heavy drape"
              required
              className="w-full rounded-xl border border-softblack/15 bg-white/80 px-4 py-3 text-[14px] text-softblack placeholder:text-warmgray/60 focus:border-softblack focus:bg-white focus:ring-1 focus:ring-softblack/25 focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label htmlFor="review-comment" className="label block text-[10.5px] uppercase tracking-wider text-warmgray mb-1.5">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how the garment feels, sizing accuracy, fabric texture, and your overall experience…"
              required
              className="w-full rounded-xl border border-softblack/15 bg-white/80 px-4 py-3 text-[14px] text-softblack placeholder:text-warmgray/60 focus:border-softblack focus:bg-white focus:ring-1 focus:ring-softblack/25 focus:outline-none transition-all shadow-xs resize-none"
            />
          </div>

          {/* Attach Photos of Your Product Field */}
          <div className="rounded-2xl border border-softblack/10 bg-beige/35 p-4.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <label className="label block text-[10.5px] uppercase tracking-wider text-softblack font-semibold">
                  Attach photos of your product
                </label>
                <p className="text-[11.5px] text-warmgray mt-0.5">
                  Show real photos of the fit, fabric texture & drape (optional, up to 4).
                </p>
              </div>
              {photos.length > 0 && (
                <span className="label shrink-0 rounded-full bg-ivory px-2.5 py-1 text-[10px] font-medium text-softblack border border-softblack/10 shadow-xs">
                  {photos.length}/4 attached
                </span>
              )}
            </div>

            {/* Previews / Upload Area */}
            {photos.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {photos.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative h-20 w-16 overflow-hidden rounded-xl border border-softblack/15 bg-ivory shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label={`Remove photo ${idx + 1}`}
                      className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-softblack/85 text-ivory text-[10px] hover:bg-red-600 transition-colors shadow-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {photos.length < 4 && (
                  <label
                    htmlFor="review-product-photos"
                    className="flex h-20 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-softblack/25 bg-ivory/80 text-center hover:border-softblack hover:bg-ivory transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-warmgray"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="label text-[9px] text-warmgray mt-1 font-medium">+ Add</span>
                  </label>
                )}
              </div>
            ) : (
              <label
                htmlFor="review-product-photos"
                className="group mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-softblack/20 bg-ivory/80 px-4 py-5 text-center cursor-pointer hover:border-softblack/50 hover:bg-ivory transition-all shadow-xs"
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-beige text-warmgray group-hover:text-softblack group-hover:scale-105 transition-all mb-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-softblack">
                  Click or drag to attach photos of your product
                </span>
                <span className="mt-0.5 text-[11px] text-warmgray">
                  JPEG, PNG, WebP up to 8MB · Up to 4 photos
                </span>
              </label>
            )}

            <input
              id="review-product-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoFiles}
              disabled={uploadingPhotos || photos.length >= 4}
              className="hidden"
            />

            {uploadingPhotos && (
              <p className="mt-2 text-[11.5px] text-warmgray animate-pulse">
                Optimizing photos…
              </p>
            )}
          </div>

          {/* Reviewer Details Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="review-author" className="label block text-[10.5px] uppercase tracking-wider text-warmgray mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Arjun M."
                required
                className="w-full rounded-xl border border-softblack/15 bg-white/80 px-4 py-3 text-[14px] text-softblack placeholder:text-warmgray/60 focus:border-softblack focus:bg-white focus:ring-1 focus:ring-softblack/25 focus:outline-none transition-all shadow-xs"
              />
            </div>
            <div>
              <label htmlFor="review-location" className="label block text-[10.5px] uppercase tracking-wider text-warmgray mb-1.5">
                City / Location
              </label>
              <input
                id="review-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chandigarh, PB"
                className="w-full rounded-xl border border-softblack/15 bg-white/80 px-4 py-3 text-[14px] text-softblack placeholder:text-warmgray/60 focus:border-softblack focus:bg-white focus:ring-1 focus:ring-softblack/25 focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Reassurance note */}
          <div className="flex items-center gap-2 rounded-xl bg-beige/40 px-3.5 py-2.5 text-[12px] text-warmgray border border-softblack/5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-success shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified buyer review. Published directly to this product page.</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-softblack/10">
            <button
              type="button"
              onClick={handleClose}
              className="label rounded-full border border-softblack/20 px-6 py-3 text-[11px] uppercase tracking-wider text-softblack hover:border-softblack transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="label rounded-full bg-softblack hover:bg-gold hover:text-softblack px-8 py-3 text-[11px] uppercase tracking-wider text-ivory shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Publishing…" : "Publish Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
