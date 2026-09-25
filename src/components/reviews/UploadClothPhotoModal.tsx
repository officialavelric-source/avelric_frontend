import { ChangeEvent, FormEvent, useState } from "react";
import { submitCustomerPhoto } from "../../services/reviewService";
import { useToast } from "../../context/ToastContext";
import { compressImage } from "../../utils/image";

interface UploadClothPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle?: string;
  onPhotoUploaded?: () => void;
}

export default function UploadClothPhotoModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  onPhotoUploaded,
}: UploadClothPhotoModalProps) {
  const { push } = useToast();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size should be less than 8MB.");
      return;
    }

    setError(null);
    try {
      const compressed = await compressImage(file);
      setPhotoUrl(compressed);
    } catch {
      setError("Failed to process image file. Please try again.");
    }
  };

  const resetForm = () => {
    setPhotoUrl(null);
    setAuthorName("");
    setLocation("");
    setCaption("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!photoUrl) {
      setError("Please upload a photo of your product.");
      return;
    }
    if (!authorName.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      await submitCustomerPhoto({
        productId,
        productTitle,
        authorName: authorName.trim(),
        location: location.trim() || undefined,
        photoUrl,
        caption: caption.trim() || undefined,
      });

      push({ message: "Photo attached successfully! Thank you for sharing." });
      resetForm();
      if (onPhotoUploaded) onPhotoUploaded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-photo-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-softblack/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-softblack/10 bg-ivory shadow-2xl animate-fade-in max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-softblack/10 px-4 sm:px-6 py-3.5 sm:py-4">
          <div>
            <h2 id="upload-photo-title" className="font-display text-[19px] sm:text-[22px] uppercase tracking-wide text-softblack font-semibold">
              Attach Photos of Your Product
            </h2>
            {productTitle && (
              <p className="mt-0.5 truncate text-[11.5px] sm:text-[12px] text-warmgray max-w-[280px] sm:max-w-[340px]">
                {productTitle}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-warmgray hover:bg-beige hover:text-softblack transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Photo Dropzone / Preview */}
          <div>
            <label className="label block text-[10px] uppercase tracking-wider text-warmgray mb-1.5">
              Product Photo <span className="text-red-500">*</span>
            </label>
            {photoUrl ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-softblack/15 bg-beige">
                <img
                  src={photoUrl}
                  alt="Product preview"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute right-3 top-3 rounded-full bg-softblack/80 px-3 py-1.5 text-[11px] text-ivory backdrop-blur hover:bg-softblack transition-colors"
                >
                  Change photo
                </button>
              </div>
            ) : (
              <label
                htmlFor="product-photo-upload"
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-softblack/20 bg-beige/30 p-8 text-center cursor-pointer hover:border-softblack/40 hover:bg-beige/50 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-9 w-9 text-warmgray mb-2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-[13.5px] font-medium text-softblack">
                  Click or drag photo of your product
                </span>
                <span className="mt-1 text-[11.5px] text-warmgray">
                  JPEG, PNG, or WebP up to 8MB
                </span>
                <input
                  id="product-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Reviewer Details */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="photo-author" className="label block text-[10px] uppercase tracking-wider text-warmgray mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="photo-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Sahil C."
                required
                className="w-full rounded-xl border border-softblack/15 bg-beige/40 px-3.5 py-2.5 text-[14px] placeholder:text-warmgray/60 focus:border-softblack focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="photo-location" className="label block text-[10px] uppercase tracking-wider text-warmgray mb-1">
                City / Location
              </label>
              <input
                id="photo-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mohali"
                className="w-full rounded-xl border border-softblack/15 bg-beige/40 px-3.5 py-2.5 text-[14px] placeholder:text-warmgray/60 focus:border-softblack focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Caption / Note */}
          <div>
            <label htmlFor="photo-caption" className="label block text-[10px] uppercase tracking-wider text-warmgray mb-1">
              Note or Fit details (optional)
            </label>
            <input
              id="photo-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Size L — true to size, great fabric drape"
              className="w-full rounded-xl border border-softblack/15 bg-beige/40 px-3.5 py-2.5 text-[14px] placeholder:text-warmgray/60 focus:border-softblack focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-softblack/10">
            <button
              type="button"
              onClick={handleClose}
              className="label rounded-full border border-softblack/20 px-5 py-2.5 text-[11px] uppercase tracking-wider text-softblack hover:border-softblack transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !photoUrl}
              className="label rounded-full bg-softblack hover:bg-gold hover:text-softblack px-7 py-3 text-[11px] uppercase tracking-wider text-ivory transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 text-center"
            >
              {loading ? "Attaching…" : "Attach photo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
