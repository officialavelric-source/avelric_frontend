import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* Main image + thumbnail strip. Product badalne par parent `key={product.id}`
   se remount karta hai, isliye selected view apne aap reset hota hai. */

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [img, setImg] = useState(0);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-beige">
        <AnimatePresence mode="wait">
          <motion.img
            key={img}
            src={images[img]}
            alt={`${name}, view ${img + 1}`}
            className="aspect-[3/4] w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </div>
      <div className="mt-4 flex gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setImg(i)}
            aria-label={`Show view ${i + 1}`}
            aria-pressed={img === i}
            className={`w-20 overflow-hidden rounded-xl transition-opacity ${img === i ? "ring-2 ring-softblack" : "opacity-60 hover:opacity-100"}`}
          >
            <img src={src} alt="" className="aspect-[3/4] w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
