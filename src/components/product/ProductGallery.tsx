import { useState, useRef, useEffect, useCallback } from "react";

/* Interactive scrollable product gallery with smooth scrolling animation,
   wheel/swipe support, luxury navigation controls, and bidirectional sync
   with external view selectors across all clothing and product pages. */

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
  const currentIndex = activeImage !== undefined ? activeImage : internalImg;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticTimeoutRef = useRef<number | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const wheelCooldownRef = useRef(0);

  // Drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Keep ref synchronized with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const updateIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, index));
      setInternalImg(clamped);
      currentIndexRef.current = clamped;
      onSelectImage?.(clamped);
    },
    [images.length, onSelectImage]
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const clamped = Math.max(0, Math.min(images.length - 1, index));
      updateIndex(clamped);

      isProgrammaticScrollRef.current = true;
      const targetLeft = clamped * container.clientWidth;
      container.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      });

      if (programmaticTimeoutRef.current) {
        window.clearTimeout(programmaticTimeoutRef.current);
      }
      programmaticTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    },
    [images.length, updateIndex]
  );

  // Synchronize when parent changes activeImage (e.g. user clicked right-side thumbnail)
  useEffect(() => {
    if (activeImage !== undefined && activeImage !== currentIndexRef.current) {
      scrollToIndex(activeImage);
    }
  }, [activeImage, scrollToIndex]);

  // Handle manual scroll (trackpad, touch swipe, drag)
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isProgrammaticScrollRef.current) return;

    const width = container.clientWidth;
    if (width <= 0) return;

    const nextIndex = Math.round(container.scrollLeft / width);
    if (
      nextIndex !== currentIndexRef.current &&
      nextIndex >= 0 &&
      nextIndex < images.length
    ) {
      updateIndex(nextIndex);
    }
  };

  // Mouse wheel scrolling over the gallery with smooth transitions and page-boundary pass-through
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || images.length <= 1) return;

    const onWheel = (e: WheelEvent) => {
      // If predominantly horizontal, let native horizontal scroll operate
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const now = Date.now();
      const isScrollingDown = e.deltaY > 15;
      const isScrollingUp = e.deltaY < -15;

      const canScrollDown = currentIndexRef.current < images.length - 1;
      const canScrollUp = currentIndexRef.current > 0;

      // Only intercept if we have a valid next/prev view to navigate to
      if ((isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp)) {
        e.preventDefault();

        // Throttle wheel ticks so user flips 1 image at a time
        if (now - wheelCooldownRef.current < 380) return;
        wheelCooldownRef.current = now;

        const target = isScrollingDown
          ? currentIndexRef.current + 1
          : currentIndexRef.current - 1;
        scrollToIndex(target);
      }
      // If at boundary (first image scrolling up, or last image scrolling down),
      // allow default behavior so user can scroll up/down the page naturally!
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [images.length, scrollToIndex]);

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    startScrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    scrollContainerRef.current.scrollLeft = startScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // Snap to closest image
    const container = scrollContainerRef.current;
    const width = container.clientWidth;
    if (width > 0) {
      const targetIndex = Math.round(container.scrollLeft / width);
      scrollToIndex(targetIndex);
    }
  };

  return (
    <div className="w-full">
      {/* Main Image Gallery Viewport */}
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-softblack/10 bg-beige select-none shadow-sm">
        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {images.map((src, i) => (
            <div
              key={src + i}
              className="relative h-full w-full min-w-full shrink-0 snap-center overflow-hidden bg-beige"
            >
              <img
                src={src}
                alt={`${name}, view ${i + 1}`}
                draggable={false}
                className="h-full w-full object-cover object-center transition-transform duration-500 will-change-transform"
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
                  scrollToIndex(currentIndex - 1);
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
                  scrollToIndex(currentIndex + 1);
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 rounded-full bg-softblack/60 px-3.5 py-1.5 backdrop-blur-md border border-ivory/15 shadow-lg">
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
                      scrollToIndex(i);
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
              onClick={() => scrollToIndex(i)}
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
