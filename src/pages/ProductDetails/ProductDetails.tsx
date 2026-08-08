import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { byCategory, getProduct } from "../../services/productService";
import { formatINR } from "../../utils/format";
import { discountPct } from "../../utils/product";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { Accordion, Reveal, Stars } from "../../components/common";
import { ProductCard, WishlistHeart } from "../../components/product";
import ProductGallery from "../../components/product/ProductGallery";
import SizeSelector from "../../components/product/SizeSelector";
import { REVIEWS } from "../../data/reviews";

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id ?? "");
  const { add } = useCart();
  const { push } = useToast();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    setSize(null);
    setAdded(false);
    setSizeError(false);
  }, [id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl">This piece isn't in the catalogue</h1>
        <p className="mt-3 text-warmgray">It may have sold out and been retired. Small batches do that.</p>
        <Link to="/shop" className="label mt-8 inline-block rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">Back to shop</Link>
      </div>
    );
  }

  const related = byCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const productReviews = REVIEWS.filter((r) => r.productId === product.id).sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    add(product.id, size);
    setAdded(true);
    push({
      message: `Added "${product.name}" (${size}) to cart`,
      image: product.images[0],
      action: { label: "Cart", to: "/cart" },
    });
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <p className="label text-warmgray">
        <Link to="/" className="hover:text-softblack">Home</Link> /{" "}
        <Link to={`/category/${product.category}`} className="hover:text-softblack">{product.category.replace("-", " ")}</Link> / {product.name}
      </p>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductGallery key={product.id} images={product.images} name={product.name} />

        <div className="lg:pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-warmgray">{product.category.replace("-", " ")}</p>
              <h1 className="mt-2 font-display text-[30px] leading-tight md:text-[36px]">{product.name}</h1>
            </div>
            <WishlistHeart product={product} className="mt-1 shrink-0 ring-1 ring-softblack/10" />
          </div>
          {productReviews.length > 0 ? (
            <a href="#reviews" className="mt-3 flex items-center gap-2 text-[13.5px] text-warmgray transition-colors hover:text-softblack">
              <Stars rating={product.rating} className="h-4 w-4" />
              <span className="font-medium text-softblack">{product.rating}</span>
              <span className="underline decoration-softblack/25 underline-offset-2">· {product.reviews} verified reviews</span>
            </a>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-[13.5px] text-warmgray">
              <Stars rating={product.rating} className="h-4 w-4" />
              <span className="font-medium text-softblack">{product.rating}</span>
              <span>· {product.reviews} verified reviews</span>
            </p>
          )}
          <p className="mt-4 text-[19px] font-medium">
            {formatINR(product.price)}
            {product.compareAt && (
              <>
                <span className="ml-3 text-[16px] font-normal text-warmgray line-through">{formatINR(product.compareAt)}</span>
                <span className="ml-3 text-[14px] font-semibold text-success">{discountPct(product)}% off</span>
              </>
            )}
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-warmgray">{product.description}</p>

          <div className="mt-9">
            <SizeSelector
              sizes={product.sizes}
              selected={size}
              onSelect={(s) => { setSize(s); setSizeError(false); }}
              showError={sizeError}
            />
          </div>

          <button
            onClick={handleAdd}
            className="label mt-9 w-full rounded-full bg-softblack py-5 text-[12px] text-ivory transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {added ? "Added to cart ✓" : "Add to cart"}
          </button>
          <p className="mt-4 text-center text-[13px] text-warmgray">
            Ships in 24 hours from Chandigarh · COD available · 7-day exchange
          </p>

          <div className="mt-10">
            <Accordion
              items={[
                { q: "Fabric & fit", a: `${product.fabric}. ${product.fit}. Measurements for every size are listed in the size guide — we measure the garment, not the body.` },
                { q: "Delivery", a: "Tricity: 1–2 working days. Punjab & Delhi NCR: 2–4 working days. Rest of India: 4–7 working days. Free shipping on prepaid orders above ₹2,499; COD available up to ₹5,000 (₹49 fee)." },
                { q: "Returns & exchange", a: "7 days from delivery for exchanges and returns. Tags on, unworn beyond trying. Size exchanges are free with doorstep pickup; refunds reach your account within 5–7 working days of pickup." },
                { q: "Why we picked it", a: "Each listing passes our 12-step check — fabric hand-feel, stitch density, hardware, shrinkage, and a real fitting. If a batch fails re-inspection at our end, it never ships." },
              ]}
            />
          </div>
        </div>
      </div>

      {productReviews.length > 0 && (
        <section id="reviews" className="mt-24 scroll-mt-24 border-t border-softblack/10 pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label text-warmgray">Reviews</p>
              <h2 className="mt-3 font-display text-[26px] md:text-[30px]">What buyers of this piece say</h2>
            </div>
            <Link to="/reviews" className="label border-b border-softblack/30 pb-1 text-[11px] transition-colors hover:border-softblack">
              All reviews →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {productReviews.map((r) => (
              <figure key={r.n + r.date} className="rounded-2xl border border-softblack/10 bg-beige/40 p-6">
                <div className="flex items-center gap-3.5">
                  <img src={r.avatar} alt="" className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                  <figcaption>
                    <p className="text-[14px] font-semibold">{r.n}</p>
                    <p className="label mt-0.5 text-[9px] text-warmgray">{r.c} · {fmtDate(r.date)}</p>
                  </figcaption>
                  <span className="label ml-auto rounded-full bg-ivory px-2.5 py-1 text-[8.5px] text-warmgray">Verified buyer</span>
                </div>
                <div className="mt-3.5"><Stars rating={r.rating} /></div>
                <blockquote className="mt-3 text-[14.5px] leading-relaxed text-softblack/85">"{r.q}"</blockquote>
              </figure>
            ))}
          </div>
        </section>
      )}

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
