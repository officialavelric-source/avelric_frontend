import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { submitReview, uploadReviewImage } from "../../services/reviewService";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useToast } from "../../context/ToastContext";
import { compressImage } from "../../utils/image";
import { analyticsService } from "../../services/analytics";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  shopifyProductId?: string;
  productTitle?: string;
  onReviewSubmitted?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: "5.0 · Exceptional Quality & Fit",
  4: "4.0 · Very Good Overall",
  3: "3.0 · Average / Met Expectations",
  2: "2.0 · Below Expectations",
  1: "1.0 · Unsatisfied",
};

export default function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  shopifyProductId,
  productTitle,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { customer } = useCustomerAuth();
  const { push } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [location, setLocation] = useState("");
  const [headline, setHeadline] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill logged-in customer name and email
  useEffect(() => {
    if (isOpen && customer) {
      if (!authorName && customer.displayName) {
        setAuthorName(customer.displayName);
      }
      if (!customerEmail && customer.email) {
        setCustomerEmail(customer.email);
      }
    }
  }, [isOpen, customer]);

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
      const uploadedUrls: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) {
          setError("Please select valid image files (JPEG, PNG, or WebP).");
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          setError("Image file size should be less than 8MB.");
          continue;
        }

        // Compress in browser before transmission
        const compressedBase64 = await compressImage(file, 1200, 0.82);
        const cdnUrl = await uploadReviewImage(compressedBase64);
        uploadedUrls.push(cdnUrl);
      }

      if (uploadedUrls.length > 0) {
        setPhotos((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (uploadErr) {
      setError(
        uploadErr instanceof Error
          ? uploadErr.message
          : "Failed to upload photos. Please try again."
      );
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
    setCustomerEmail("");
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

    const trimmedName = authorName.trim();
    const trimmedEmail = customerEmail.trim().toLowerCase();
    const trimmedHeadline = headline.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!trimmedHeadline) {
      setError("Please provide a headline for your review.");
      return;
    }
    if (!trimmedComment) {
      setError("Please write your detailed review.");
      return;
    }

    try {
      setLoading(true);
      await submitReview({
        productId,
        shopifyProductId: shopifyProductId || productId,
        productHandle: productId,
        productTitle,
        authorName: trimmedName,
        customerEmail: trimmedEmail,
        location: location.trim() || undefined,
        rating,
        headline: trimmedHeadline,
        comment: trimmedComment,
        photos: photos.length > 0 ? photos : undefined,
      });

      // Track submit_review event in GA4
      analyticsService.trackSubmitReview({
        product_id: shopifyProductId || productId,
        rating,
        has_photo: photos.length > 0,
      });

      push({ message: "Thank you! Your review has been submitted." });
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200/80 bg-[#FCFBF8] shadow-2xl animate-fade-in flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200/70 px-8 py-6 bg-white/70">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] font-medium text-neutral-500 block">
              Avelric Atelier · Client Feedback
            </span>
            <h2
              id="write-review-title"
              className="mt-1 font-display text-[26px] sm:text-[28px] uppercase tracking-wide text-neutral-900 font-semibold"
            >
              Write a Review
            </h2>
            {productTitle && (
              <p className="mt-0.5 truncate text-[13px] text-neutral-500 max-w-md">
                {productTitle}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body with generous spacing */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-8 py-7 space-y-6 flex-1">
          {error && (
            <div className="rounded-2xl bg-red-50/90 p-4 text-[13.5px] text-red-700 border border-red-200/80 flex items-center gap-3 animate-fade-in">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-red-500">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Rating Selection Section */}
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 sm:p-6 shadow-xs">
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-600 mb-2.5">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div
                className="flex items-center gap-2"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      aria-label={`Rate ${star} out of 5 stars`}
                      className="group p-1 transition-transform hover:scale-115 active:scale-95 focus:outline-none"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-8 w-8 transition-colors ${
                          isFilled
                            ? "fill-[#B8860B] text-[#B8860B]"
                            : "fill-neutral-200 text-neutral-200 group-hover:text-neutral-300"
                        }`}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-4 py-1.5 text-[12px] font-medium text-neutral-800 border border-neutral-200/60">
                {RATING_DESCRIPTIONS[activeRating]}
              </span>
            </div>
          </div>

          {/* Review Headline */}
          <div>
            <label
              htmlFor="review-headline"
              className="block text-[11.5px] uppercase tracking-wider font-medium text-neutral-700 mb-2"
            >
              Headline <span className="text-red-500">*</span>
            </label>
            <input
              id="review-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Impeccable tailoring and heavy drape"
              required
              className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label
              htmlFor="review-comment"
              className="block text-[11.5px] uppercase tracking-wider font-medium text-neutral-700 mb-2"
            >
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how the garment feels, sizing accuracy, fabric texture, and your overall experience…"
              required
              className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-xs resize-none"
            />
          </div>

          {/* 2-Column: Reviewer Name & Email */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="review-author"
                className="block text-[11.5px] uppercase tracking-wider font-medium text-neutral-700 mb-2"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Arjun M."
                required
                className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <label
                htmlFor="review-email"
                className="block text-[11.5px] uppercase tracking-wider font-medium text-neutral-700 mb-2"
              >
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                id="review-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. arjun@example.com"
                required
                className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label
              htmlFor="review-location"
              className="block text-[11.5px] uppercase tracking-wider font-medium text-neutral-700 mb-2"
            >
              City / Location <span className="text-neutral-400 text-[11px] font-normal">(Optional)</span>
            </label>
            <input
              id="review-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, MH"
              className="w-full rounded-xl border border-neutral-300/80 bg-white px-4 py-3.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Photo Upload Section */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <label className="block text-[11.5px] uppercase tracking-wider font-semibold text-neutral-800">
                  Attach Product Photos
                </label>
                <p className="text-[12px] text-neutral-500 font-light mt-0.5">
                  Showcase the drape, fit, or styling. Up to 4 photos (JPEG, PNG, WebP).
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-600">
                {photos.length} / 4
              </span>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group h-20 w-20 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-xs"
                  >
                    <img
                      src={url}
                      alt={`Attached photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label="Remove photo"
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 4 && (
              <label
                htmlFor="review-product-photos"
                className={`group flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-white/70 px-6 py-5 text-center cursor-pointer hover:border-black hover:bg-white transition-all shadow-2xs ${
                  uploadingPhotos ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-medium text-neutral-800 group-hover:text-black">
                    Click to attach fit or drape photos
                  </p>
                  <p className="text-[11.5px] text-neutral-500 font-light">
                    JPEG, PNG, WebP · Up to 4 images
                  </p>
                </div>
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
              <div className="mt-2.5 flex items-center gap-2 text-[12px] text-warmgray">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-softblack border-r-transparent" />
                <span>Uploading to secure image storage…</span>
              </div>
            )}
          </div>

          {/* Privacy reassurance note */}
          <div className="flex items-center gap-2 rounded-xl bg-beige/40 px-3.5 py-2.5 text-[12px] text-warmgray border border-softblack/5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-warmgray shrink-0">
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Your email is strictly private and will never be displayed publicly.</span>
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
              disabled={loading || uploadingPhotos}
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
