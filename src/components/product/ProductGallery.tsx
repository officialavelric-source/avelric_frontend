import { useState, useRef, useEffect, useCallback } from "react";

/* Interactive luxury product gallery with smooth CSS transform transitions,
   wheel/swipe/drag support, floating luxury controls, and instant bidirectional
   sync with external view selectors. */

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
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = activeImage !== undefined ? activeImage : internalIndex;

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const containerRef = useRef<HTMLDivElement>(null);
  const wheelCooldownRef = useRef(0);

  // Drag & Touch Swipe State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const isPointerDownRef = useRef(false);

  const goToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, index));
      setInternalIndex(clamped);
      onSelectImage?.(clamped);
    },
    [images.length, onSelectImage]
  );

  // Mouse wheel navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length <= 1) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const now = Date.now();
      const isScrollingDown = e.deltaY > 15;
      const isScrollingUp = e.deltaY < -15;

      const canScrollDown = currentIndexRef.current < images.length - 1;
      const canScrollUp = currentIndexRef.current > 0;

      if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
        e.preventDefault();
        if (now - wheelCooldownRef.current < 380) return;
        wheelCooldownRef.current = now;

        const target = isScrollingDown
          ? currentIndexRef.current + 1
          : currentIndexRef.current - 1;
        goToIndex(target);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [images.length, goToIndex]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    isPointerDownRef.current = true;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPointerDownRef.current) return;
    const delta = e.touches[0].clientX - startXRef.current;
    // Add dampening at edges
    const atLeftEdge = currentIndexRef.current === 0 && delta > 0;
    const atRightEdge = currentIndexRef.current === images.length - 1 && delta < 0;
    setDragOffset(atLeftEdge || atRightEdge ? delta * 0.3 : delta);
  };

  const handleTouchEnd = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (dragOffset < -50 && currentIndexRef.current < images.length - 1) {
      goToIndex(currentIndexRef.current + 1);
    } else if (dragOffset > 50 && currentIndexRef.current > 0) {
      goToIndex(currentIndexRef.current - 1);
    }
    setDragOffset(0);
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1) return;
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPointerDownRef.current) return;
    e.preventDefault();
    const delta = e.clientX - startXRef.current;
    const atLeftEdge = currentIndexRef.current === 0 && delta > 0;
    const atRightEdge = currentIndexRef.current === images.length - 1 && delta < 0;
    setDragOffset(atLeftEdge || atRightEdge ? delta * 0.3 : delta);
  };

  const handleMouseUpOrLeave = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (dragOffset < -50 && currentIndexRef.current < images.length - 1) {
      goToIndex(currentIndexRef.current + 1);
    } else if (dragOffset > 50 && currentIndexRef.current > 0) {
      goToIndex(currentIndexRef.current - 1);
    }
    setDragOffset(0);
  };

  return (
    <div className="w-full">
      {/* Main Image Gallery Viewport */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-softblack/10 bg-beige select-none shadow-sm ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Animated Slide Track */}
        <div
          className="flex h-full w-full will-change-transform"
          style={{
            transform: isDragging
              ? `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
              : `translateX(-${currentIndex * 100}%)`,
            transition: isDragging ? "none" : "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {images.map((src, i) => (
            <div
              key={src + i}
              className="relative h-full w-full min-w-full shrink-0 overflow-hidden bg-beige"
            >
              <img
                src={src}
                alt={`${name}, view ${i + 1}`}
                draggable={false}
                className="h-full w-full object-cover object-center pointer-events-none select-none"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Floating Navigation Controls (Arrows) */}
        {images.length > 1 && (
          <>
            {/* Left Chevron Button */}
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToIndex(currentIndex - 1);
                }}
                aria-label="Previous view"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/85 text-softblack shadow-md backdrop-blur-md transition-all duration-200 hover:bg-ivory hover:scale-110 active:scale-95 border border-softblack/10 opacity-80 group-hover:opacity-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Right Chevron Button */}
            {currentIndex < images.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToIndex(currentIndex + 1);
                }}
                aria-label="Next view"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/85 text-softblack shadow-md backdrop-blur-md transition-all duration-200 hover:bg-ivory hover:scale-110 active:scale-95 border border-softblack/10 opacity-80 group-hover:opacity-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Luxury Bottom Floating Pill (View Counter & Interactive Indicator Dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 rounded-full bg-softblack/65 px-3.5 py-1.5 backdrop-blur-md border border-ivory/15 shadow-lg pointer-events-auto">
              <span className="text-[11px] font-medium tracking-widest text-ivory/90 font-mono">
                {String(currentIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              <div className="h-2.5 w-[1px] bg-ivory/30" />
              <div className="flex items-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToIndex(i);
                    }}
                    aria-label={`Go to view ${i + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      currentIndex === i
                        ? "h-1.5 w-4 bg-gold shadow-sm"
                        : "h-1.5 w-1.5 bg-ivory/40 hover:bg-ivory/80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Optional Secondary Thumbnails Strip (if enabled) */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goToIndex(i)}
              aria-label={`Show view ${i + 1}`}
              aria-pressed={currentIndex === i}
              className={`w-20 overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                currentIndex === i
                  ? "border-softblack ring-1 ring-softblack shadow"
                  : "border-softblack/15 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt=""
                className="aspect-[3/4] w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
