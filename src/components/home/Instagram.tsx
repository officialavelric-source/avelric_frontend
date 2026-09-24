import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal, SectionHeading } from "../common";
import type { InstagramMediaItem, InstagramApiResponse } from "../../types/instagram";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/avelricindia/";
const INSTAGRAM_USERNAME = "@avelricindia";

// ─── InstagramCard ──────────────────────────────────────────────────────────
interface InstagramCardProps {
  item: InstagramMediaItem;
  index: number;
}

function InstagramCard({ item, index }: InstagramCardProps) {
  const isVideo =
    item.mediaType === "VIDEO" || item.mediaProductType === "REELS";
  const isCarousel = item.mediaType === "CAROUSEL_ALBUM";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);

  // ── IntersectionObserver: Autoplay in viewport, pause outside ──────────
  useEffect(() => {
    if (!isVideo || videoFailed) return;
    const video = videoRef.current;
    if (!video) return;

    // Strict browser autoplay compliance: must be muted
    video.muted = true;
    video.defaultMuted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Silently suppress pre-interaction autoplay restriction
            });
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isVideo, videoFailed]);

  const displayImage =
    isVideo && item.thumbnailUrl ? item.thumbnailUrl : item.mediaUrl;

  return (
    <Reveal key={item.id} delay={index * 0.05}>
      <a
        href={item.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-warmgray/10 shadow-sm transition-shadow duration-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-softblack"
        aria-label={
          item.caption
            ? `View Instagram post: ${item.caption.slice(0, 60)}`
            : "View on Instagram"
        }
      >
        {/* ── Media: autoplaying video or optimised image ── */}
        {isVideo && !videoFailed && item.mediaUrl ? (
          <video
            ref={videoRef}
            src={item.mediaUrl}
            poster={item.thumbnailUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <img
            src={displayImage}
            alt={
              item.caption
                ? item.caption.slice(0, 80)
                : "AVELRIC Instagram content"
            }
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        )}

        {/* ── Content-type badge (top-right) ── */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
          {isVideo && (
            <span
              className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-md"
              title="Reel"
            >
              {/* Play icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 translate-x-[0.5px]"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
          {isCarousel && (
            <span
              className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-md backdrop-blur-md"
              title="Carousel Album"
            >
              {/* Stack icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="13" height="13" rx="2" />
                <path d="M7 21h12a2 2 0 0 0 2-2V7" />
              </svg>
            </span>
          )}
        </div>

        {/* ── Frosted hover / touch overlay ── */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 sm:p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {item.caption && (
            <p className="line-clamp-2 sm:line-clamp-3 text-[11px] sm:text-[12px] leading-snug font-normal text-white/95 drop-shadow-sm">
              {item.caption}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-1.5 sm:pt-2 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase text-white/90">
            <span className="inline-flex items-center gap-1 sm:gap-1.5">
              {/* Instagram icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              {isVideo ? "View Reel" : "View Post"}
            </span>
            <span className="text-xs transition-transform duration-300 group-hover:translate-x-0.5">
              ↗
            </span>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard({ id }: { id: string }) {
  return (
    <div
      key={id}
      className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-warmgray/10 animate-pulse"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-warmgray/15" />
      </div>
    </div>
  );
}

// ─── Main Instagram section ─────────────────────────────────────────────────
export default function Instagram() {
  const [items, setItems] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchInstagramMedia() {
      try {
        setLoading(true);
        setHasError(false);

        const res = await fetch("/api/instagram/media", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const data: InstagramApiResponse = await res.json();

        if (isMounted) {
          // Backend always returns success=true + data (live or fallback)
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setItems(data.data);
          } else {
            setHasError(true);
          }
        }
      } catch (err: any) {
        if (err?.name !== "AbortError" && isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInstagramMedia();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // ── Desktop/Tablet: up to 6 items (images, carousels, reels) ─────────────
  const desktopItems = useMemo(() => items.slice(0, 6), [items]);

  // ── Mobile: prioritise reels/videos; backfill with latest posts ───────────
  // This guarantees mobile is NEVER empty — even if there are no videos.
  const mobileItems = useMemo(() => {
    const reels = items.filter(
      (item) =>
        item.mediaType === "VIDEO" || item.mediaProductType === "REELS"
    );
    // Sort reels newest-first; take up to 4
    const sortedReels = [...reels].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const topReels = sortedReels.slice(0, 4);

    // If we have fewer than 4 reels, backfill with the latest non-reel posts
    if (topReels.length < 4) {
      const nonReels = items
        .filter(
          (item) =>
            item.mediaType !== "VIDEO" && item.mediaProductType !== "REELS"
        )
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      const needed = 4 - topReels.length;
      topReels.push(...nonReels.slice(0, needed));
    }

    // Final sort: newest first
    return topReels.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [items]);

  const desktopCount = desktopItems.length;
  const desktopGridClasses =
    desktopCount <= 3
      ? "mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 max-w-4xl mx-auto"
      : "mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6";

  return (
    <section className="py-20 md:py-24 border-t border-softblack/5">
      <div className="mx-auto max-w-7xl px-6">
        {/* ── Header row ── */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Instagram"
            title={INSTAGRAM_USERNAME}
            sub="Fit checks, drop previews, and what didn't make the cut."
          />
          <Reveal>
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="label group inline-flex items-center gap-1.5 border-b border-softblack/30 pb-1 text-[11px] text-softblack transition-colors hover:border-softblack"
            >
              <span>Follow {INSTAGRAM_USERNAME}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </Reveal>
        </div>

        {/* ── Loading Skeletons ── */}
        {loading && (
          <>
            {/* Desktop skeleton */}
            <div
              className="hidden sm:grid mt-12 grid-cols-3 gap-4 max-w-4xl mx-auto"
              aria-busy="true"
              aria-label="Loading Instagram posts"
            >
              {[1, 2, 3].map((idx) => (
                <SkeletonCard key={`d-skel-${idx}`} id={`d-skel-${idx}`} />
              ))}
            </div>
            {/* Mobile skeleton */}
            <div
              className="grid sm:hidden mt-8 grid-cols-2 gap-3"
              aria-busy="true"
              aria-label="Loading Instagram reels"
            >
              {[1, 2].map((idx) => (
                <SkeletonCard key={`m-skel-${idx}`} id={`m-skel-${idx}`} />
              ))}
            </div>
          </>
        )}

        {/* ── Live / Fallback Content ── */}
        {!loading && items.length > 0 && (
          <>
            {/* ════════════════════════════════════════════════════════════ */}
            {/* DESKTOP / TABLET — Full feed (images, carousels, reels)     */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div className="hidden sm:block">
              <div className={desktopGridClasses}>
                {desktopItems.map((item, index) => (
                  <InstagramCard
                    key={`desktop-${item.id}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* MOBILE — Reels first, backfilled with latest posts (max 4)  */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div className="block sm:hidden">
              <div className="mt-8 grid grid-cols-2 gap-3">
                {mobileItems.map((item, index) => (
                  <InstagramCard
                    key={`mobile-${item.id}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Error fallback (only if backend returned no data at all) ── */}
        {!loading && (hasError || items.length === 0) && (
          <Reveal delay={0.1}>
            <div className="mt-10 rounded-2xl border border-dashed border-warmgray/30 bg-warmgray/5 p-8 text-center sm:p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-softblack/5 text-softblack">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <p className="mt-4 font-display text-lg text-softblack">
                Follow {INSTAGRAM_USERNAME}
              </p>
              <p className="mt-1 text-xs text-warmgray">
                Stay updated with our newest drops, behind-the-scenes looks, and
                editorial releases.
              </p>
              <a
                href={INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-softblack px-5 py-2.5 text-[11px] font-medium uppercase tracking-widest text-white transition-opacity hover:opacity-90"
              >
                <span>Visit Instagram</span>
                <span>↗</span>
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
