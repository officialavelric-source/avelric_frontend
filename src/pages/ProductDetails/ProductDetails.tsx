import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { byCategory } from "../../services/productService";
import { getCachedProduct, getAllCachedProducts } from "../../services/shopify/productService";
import { formatINR } from "../../utils/format";
import { discountPct } from "../../utils/product";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useProduct } from "../../hooks/useProduct";
import { Accordion, Reveal, Stars } from "../../components/common";
import { ProductCard, ProductCardSkeleton } from "../../components/product";
import ProductGallery from "../../components/product/ProductGallery";
import SizeSelector from "../../components/product/SizeSelector";
import { ProductReviewsSection } from "../../components/reviews";
import { getProductRatingSummary, subscribeToReviews } from "../../services/reviewService";
import { analyticsService } from "../../services/analytics";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();

  // Load product from Shopify (cache-first)
  const { product, loading, error } = useProduct(id);

  const { add } = useCart();
  const { push } = useToast();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const [ratingSummary, setRatingSummary] = useState(() => (id ? getProductRatingSummary(id) : null));
  const [activeImg, setActiveImg] = useState(0);
  const [showReviews, setShowReviews] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Track view_item in GA4 when product resolves
  useEffect(() => {
    if (product) {
      analyticsService.trackViewItem({
        currency: "INR",
        value: product.price,
        items: [
          {
            item_id: (product as any).shopifyId || product.id,
            item_name: product.name,
            item_brand: "AVELRIC",
            item_category: typeof product.category === "string" ? product.category : "Clothing",
            price: product.price,
            quantity: 1,
            currency: "INR",
          },
        ],
      });
    }
  }, [product?.id]);

  const openReviewsAndScroll = () => {
    setShowReviews(true);
    setIsHighlighted(true);
    setTimeout(() => {
      const el = document.getElementById("reviews");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
    setTimeout(() => {
      setIsHighlighted(false);
    }, 2500);
  };

  const toggleReviews = () => {
    if (showReviews) {
      setShowReviews(false);
    } else {
      openReviewsAndScroll();
    }
  };

  useEffect(() => {
    setActiveImg(0);
  }, [id, product?.id]);

  useEffect(() => {
    if (!id) return;
    const update = () => setRatingSummary(getProductRatingSummary(id));
    update();
    return subscribeToReviews(update);
  }, [id]);

  // Auto-select first in-stock size when product loads
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      const firstInStock = product.sizes.find(
        (s) => !product.outOfStockSizes?.includes(s)
      ) ?? product.sizes[0];
      setSize(firstInStock);
    } else {
      setSize(null);
    }
    setAdded(false);
    setSizeError(false);
  }, [id, product]);

  /* ——— Loading state ——— */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-beige" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-24 animate-pulse rounded bg-beige" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-beige" />
            <div className="h-6 w-24 animate-pulse rounded bg-beige" />
            <div className="mt-8 h-12 w-full animate-pulse rounded-full bg-beige" />
          </div>
        </div>
      </div>
    );
  }

  /* ——— Not found ——— */
  if (!product || error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl">This piece isn't in the catalogue</h1>
        <p className="mt-3 text-warmgray">
          It may have sold out and been retired. Small batches do that.
        </p>
        <Link
          to="/shop"
          className="label mt-8 inline-block rounded-full bg-softblack px-8 py-4 text-[12px] text-ivory transition-transform hover:scale-[1.02]"
        >
          Return to store
        </Link>
      </div>
    );
  }

  // Related products from Shopify cache — same category, excluding current product
  const allCached = getAllCachedProducts();
  const related = byCategory(product.category, allCached)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  /* ——— Find Shopify variant from selected size ——— */
  const findVariant = (selectedSize: string) => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((v) =>
        v.selectedOptions.some(
          (o) => o.name.toLowerCase() === "size" && o.value.toLowerCase() === selectedSize.toLowerCase()
        )
      ) ??
      product.variants.find((v) => v.title.toLowerCase() === selectedSize.toLowerCase()) ??
      (product.variants.length === 1 ? product.variants[0] : null)
    );
  };

  const handleAdd = () => {
    const effectiveSize = size || (product.sizes.length > 0 ? (
      product.sizes.find((s) => !product.outOfStockSizes?.includes(s)) ?? product.sizes[0]
    ) : "One Size");

    if (!size) {
      setSize(effectiveSize);
    }

    // Check availability from variants
    const variant = findVariant(effectiveSize);
    if (variant && !variant.availableForSale) {
      push({ message: "Sorry, this size is currently out of stock." });
      return;
    }

    const frontImage = product.images[0] ?? variant?.image ?? "";

    add(
      product.id,
      effectiveSize,
      1,
      variant?.id,
      // Pass snapshot so cart renders without refetching
      {
        name: product.name,
        image: frontImage,
        colorName: product.color?.name ?? "",
        price: variant?.price ?? product.price,
        compareAt: variant?.compareAtPrice ?? product.compareAt,
      }
    );

    const finalPrice = variant?.price ?? product.price;
    analyticsService.trackAddToCart({
      value: finalPrice,
      items: [
        {
          item_id: (product as any).shopifyId || product.id,
          item_name: product.name,
          item_brand: "AVELRIC",
          item_category: typeof product.category === "string" ? product.category : "Clothing",
          item_variant: effectiveSize,
          price: finalPrice,
          quantity: 1,
          currency: "INR",
        },
      ],
    });

    setAdded(true);
    push({
      message: `Added "${product.name}" (${effectiveSize}) to cart`,
      image: frontImage,
      action: { label: "Cart", to: "/cart" },
    });
    setTimeout(() => setAdded(false), 2200);
  };

  // Sizes available in Shopify (may exclude out-of-stock variants)
  const availableSizes = product.sizes;
  const outOfStockSizes = product.outOfStockSizes ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <p className="label text-warmgray">
        <Link to="/" className="hover:text-softblack">Home</Link>{" "}
        /{" "}
        <Link to={`/category/${product.category}`} className="hover:text-softblack">
          {product.category.replace("-", " ")}
        </Link>{" "}
        / {product.name}
      </p>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="w-full lg:sticky lg:top-28 lg:self-start">
          <ProductGallery
            key={product.id}
            images={product.images}
            name={product.name}
            activeImage={activeImg}
            onSelectImage={setActiveImg}
            showThumbnails={false}
          />
        </div>

        <div className="lg:pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-warmgray">{product.category.replace("-", " ")}</p>
              <h1 className="mt-2 font-display text-[30px] leading-tight md:text-[36px]">
                {product.name}
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2 shrink-0">
              {/* Highlighted Reviews Button */}
              <button
                type="button"
                onClick={toggleReviews}
                aria-expanded={showReviews}
                aria-label={showReviews ? "Hide customer reviews" : "View customer reviews"}
                className={`group flex items-center gap-1.5 h-9 px-3 rounded-full text-[11.5px] font-medium transition-all duration-300 shadow-sm backdrop-blur ${
                  showReviews
                    ? "bg-softblack text-ivory ring-2 ring-softblack shadow-md scale-[1.02]"
                    : "bg-ivory/95 text-softblack ring-1 ring-softblack/15 hover:ring-gold/70 hover:bg-beige/40 hover:shadow hover:scale-[1.02]"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 ${
                    showReviews ? "text-gold" : "text-gold"
                  }`}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="tracking-wide">Reviews</span>
                {ratingSummary && ratingSummary.totalReviews > 0 ? (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold transition-colors ${
                      showReviews
                        ? "bg-ivory/20 text-ivory"
                        : "bg-beige text-softblack group-hover:bg-gold/15"
                    }`}
                  >
                    {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalReviews})
                  </span>
                ) : (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9.5px] transition-colors ${
                      showReviews ? "bg-ivory/20 text-ivory" : "bg-beige/80 text-warmgray"
                    }`}
                  >
                    0
                  </span>
                )}
              </button>
            </div>
          </div>

          {ratingSummary && ratingSummary.totalReviews > 0 ? (
            <button
              type="button"
              onClick={openReviewsAndScroll}
              className="mt-3 flex items-center gap-2 text-[13.5px] text-warmgray transition-colors hover:text-softblack text-left cursor-pointer group"
            >
              <Stars rating={ratingSummary.averageRating} className="h-4 w-4" />
              <span className="font-medium text-softblack">{ratingSummary.averageRating.toFixed(1)}</span>
              <span className="underline decoration-softblack/25 underline-offset-2 group-hover:decoration-softblack">
                · {ratingSummary.totalReviews} verified {ratingSummary.totalReviews === 1 ? "review" : "reviews"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openReviewsAndScroll}
              className="mt-3 flex items-center gap-2 text-[13px] text-warmgray transition-colors hover:text-softblack text-left cursor-pointer group"
            >
              <span className="underline decoration-softblack/25 underline-offset-2 group-hover:decoration-softblack">
                Write a review
              </span>
            </button>
          )}

          <p className="mt-4 text-[19px] font-medium">
            {formatINR(product.price)}
            {product.compareAt && (
              <>
                <span className="ml-3 text-[16px] font-normal text-warmgray line-through">
                  {formatINR(product.compareAt)}
                </span>
                <span className="ml-3 text-[14px] font-semibold text-success">
                  {discountPct(product)}% off
                </span>
              </>
            )}
          </p>

          {/* Extra product images / views above size selector */}
          {product.images.length > 1 && (
            <div className="mt-7 w-full">
              <div className="flex items-center justify-between mb-2.5">
                <span className="label text-[10.5px] uppercase tracking-wider text-warmgray">
                  Views ({product.images.length})
                </span>
                <span className="label text-[10px] text-warmgray">
                  View {activeImg + 1} of {product.images.length}
                </span>
              </div>
              <div
                className={`grid gap-3 w-full ${
                  product.images.length === 2
                    ? "grid-cols-2"
                    : product.images.length === 3
                    ? "grid-cols-3"
                    : product.images.length === 4
                    ? "grid-cols-4"
                    : "grid-cols-4 sm:grid-cols-5"
                }`}
              >
                {product.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`View ${i + 1}`}
                    aria-pressed={activeImg === i}
                    className={`group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                      activeImg === i
                        ? "border-softblack shadow-md ring-1 ring-softblack"
                        : "border-softblack/15 bg-beige/30 opacity-70 hover:border-softblack/40 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          <div className="mt-7">
            <SizeSelector
              sizes={availableSizes}
              selected={size}
              onSelect={(s) => {
                setSize(s);
                setSizeError(false);
                const isAvailable = !outOfStockSizes.includes(s);
                analyticsService.trackSelectSize({
                  item_id: (product as any).shopifyId || product.id,
                  item_name: product.name,
                  size: s,
                  is_available: isAvailable,
                });
              }}
              showError={sizeError}
            />
            {/* Show out-of-stock indicator if some sizes are unavailable */}
            {!product.soldOut && outOfStockSizes.length > 0 && (
              <p className="mt-2.5 text-[12px] text-warmgray">
                Sizes {outOfStockSizes.join(", ")} are currently unavailable
              </p>
            )}
            {product.soldOut && (
              <p className="mt-2.5 text-[12px] text-warmgray">
                This item is currently sold out
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.soldOut}
            className="label mt-9 w-full rounded-full bg-softblack py-5 text-[12px] text-ivory transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.soldOut ? "Sold out" : added ? "Added to cart ✓" : "Add to cart"}
          </button>

          <p className="mt-4 text-center text-[13px] text-warmgray">
            Same day delivery in Chandigarh, Kharar, Mohali &amp; Panchkula · 7–9 working days elsewhere · Notifications via email only
          </p>

          <div className="mt-10">
            <Accordion
              key={product.id}
              defaultOpen={null}
              items={[
                {
                  q: "Description",
                  a: product.description,
                },
                {
                  q: "Fabric & fit",
                  a: `${product.fabric}. ${product.fit}. Measurements for every size are listed in the size guide — we measure the garment, not the body.`,
                },
                {
                  q: "Delivery",
                  a: "Chandigarh, Kharar, Mohali & Panchkula: Same day delivery. All other places across India: 7–9 working days delivery. Order updates and tracking notifications are sent exclusively to your email. Free shipping on prepaid orders above ₹1,500; COD available up to ₹5,000 (₹49 fee). Mail us at officialavelric@gmail.com for priority delivery queries.",
                },
                {
                  q: "Returns & exchange",
                  a: "7 days from delivery for exchanges and returns. Tags on, unworn beyond trying. Size exchanges are free with doorstep pickup; refunds reach your account within 5–7 working days of pickup. Contact us at officialavelric@gmail.com.",
                },
                {
                  q: "Why we picked it",
                  a: "Each listing passes our 12-step check — fabric hand-feel, stitch density, hardware, shrinkage, and a real fitting. If a batch fails re-inspection at our end, it never ships.",
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Customer feedback & ratings - only shown when reviews button is clicked */}
      <AnimatePresence>
        {showReviews && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductReviewsSection
              productId={product.id}
              shopifyProductId={product.shopifyId}
              productTitle={product.name}
              onClose={() => setShowReviews(false)}
              isHighlighted={isHighlighted}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <p className="label text-warmgray">You may also like</p>
            <h2 className="mt-3 font-display text-[26px] md:text-[30px]">From the same shelf</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
