import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* Main image + optional thumbnail strip. Supports controlled activeImage state. */

export default function ProductGallery({
  images,
  name,
  activeImage,
  onSelectImage,
  showThumbnails = false,
}: {
  images: string[];
  name: string;
  activeImage?: number;
  onSelectImage?: (index: number) => void;
  showThumbnails?: boolean;
}) {
  const [internalImg, setInternalImg] = useState(0);
  const img = activeImage !== undefined ? activeImage : internalImg;
  const setImg = (index: number) => {
    setInternalImg(index);
    if (onSelectImage) onSelectImage(index);
  };

  return (
    <div className="w-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-softblack/10 bg-beige">
        <AnimatePresence mode="wait">
          <motion.img
            key={img}
            src={images[img]}
            alt={`${name}, view ${img + 1}`}
            className="h-full w-full object-cover object-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </div>
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setImg(i)}
              aria-label={`Show view ${i + 1}`}
              aria-pressed={img === i}
              className={`w-20 overflow-hidden rounded-2xl border-2 transition-all ${
                img === i ? "border-softblack ring-1 ring-softblack" : "border-softblack/15 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="aspect-[3/4] w-full object-cover object-center" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
