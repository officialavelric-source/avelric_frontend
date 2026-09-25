import { useEffect, useState } from "react";
import {
  CustomerPhoto,
  getProductCustomerPhotos,
  subscribeToCustomerPhotos,
} from "../../services/reviewService";
import UploadClothPhotoModal from "./UploadClothPhotoModal";

interface CustomerPhotosSectionProps {
  productId: string;
  productTitle: string;
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

export default function CustomerPhotosSection({
  productId,
  productTitle,
}: CustomerPhotosSectionProps) {
  const [photos, setPhotos] = useState<CustomerPhoto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<CustomerPhoto | null>(null);

  const refresh = () => {
    setPhotos(getProductCustomerPhotos(productId));
  };

  useEffect(() => {
    refresh();
    return subscribeToCustomerPhotos(refresh);
  }, [productId]);

  return (
    <section className="mt-14 sm:mt-20 border-t border-softblack/10 pt-10 sm:pt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div>
          <p className="label text-warmgray">Customer Looks</p>
          <h2 className="mt-2 font-display text-[24px] sm:text-[26px] md:text-[32px]">
            Photos of your cloth
          </h2>
          <p className="mt-1.5 text-[13.5px] sm:text-[14px] text-warmgray max-w-xl">
            Real photos shared by clients showing the garment in natural light, fit on body, and fabric texture.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="label flex items-center justify-center gap-2 rounded-full border border-softblack bg-softblack px-5 py-2.5 text-[11px] text-ivory hover:bg-softblack/90 transition-colors shadow-sm w-full sm:w-auto"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Add photos of your cloth
        </button>
      </div>

      {/* Gallery / Photos Grid */}
      {photos.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePhoto(p)}
              className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-softblack/10 bg-beige/50 text-left focus:outline-none"
            >
              <img
                src={p.photoUrl}
                alt={p.caption || `Customer photo of ${productTitle}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-softblack/80 via-softblack/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-3.5 text-ivory">
                <p className="text-[12.5px] font-semibold truncate">{p.authorName}</p>
                {p.location && (
                  <p className="label text-[9px] text-ivory/80">{p.location}</p>
                )}
                {p.caption && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-ivory/90 leading-tight">
                    "{p.caption}"
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-softblack/20 bg-beige/25 p-8 text-center md:p-12">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-beige text-softblack">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h3 className="mt-3 font-display text-[20px] text-softblack">
            Show us your cloth & style
          </h3>
          <p className="mt-2 text-[14px] text-warmgray max-w-md mx-auto">
            Received this piece? Add a photo of your cloth to show other clients how it looks in natural light and how you styled it.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="label mt-6 inline-flex items-center gap-2 rounded-full bg-softblack px-6 py-3 text-[11px] text-ivory hover:bg-softblack/90 transition-colors"
          >
            + Add photo of your cloth
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <UploadClothPhotoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={productId}
        productTitle={productTitle}
        onPhotoUploaded={refresh}
      />

      {/* Lightbox Preview Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-softblack/80 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full overflow-hidden rounded-2xl bg-ivory shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              aria-label="Close photo preview"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-softblack/70 text-ivory hover:bg-softblack transition-colors"
            >
              ✕
            </button>
            <div className="aspect-[4/5] sm:aspect-[1/1] w-full bg-softblack/5 flex items-center justify-center overflow-hidden">
              <img
                src={activePhoto.photoUrl}
                alt={activePhoto.caption || "Customer photo"}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="p-5 border-t border-softblack/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-softblack text-[15px]">{activePhoto.authorName}</p>
                  <p className="label text-[10px] text-warmgray">
                    {activePhoto.location ? `${activePhoto.location} · ` : ""}
                    {fmtDate(activePhoto.createdAt)}
                  </p>
                </div>
                <span className="label rounded-full bg-beige px-2.5 py-1 text-[9px] text-softblack">
                  Verified customer photo ✓
                </span>
              </div>
              {activePhoto.caption && (
                <p className="mt-3 text-[14px] text-softblack/85 leading-relaxed">
                  "{activePhoto.caption}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
