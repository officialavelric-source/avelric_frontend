import { Link } from "react-router-dom";
import { COLLECTIONS } from "../../data/collections";
import { getProduct } from "../../services/productService";
import { Reveal } from "../../components/common";
import { ProductCard } from "../../components/product";

/* Curated theme-based collections — har collection ka apna
   banner + story + product row. New Arrivals se distinct. */

export default function Collections() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <Reveal>
        <p className="label text-warmgray">
          <Link to="/" className="hover:text-softblack">Home</Link> / Collections
        </p>
        <h1 className="mt-3 font-display text-[32px] md:text-[40px]">Collections</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-warmgray">
          Curated edits, not endless scrolling. Each collection is a small story — picked around a
          season, a fabric, or the pieces people keep re-ordering.
        </p>
      </Reveal>

      {/* quick jump chips */}
      <Reveal className="mt-8">
        <div className="flex flex-wrap gap-2.5">
          {COLLECTIONS.map((c) => (
            <a
              key={c.slug}
              href={`#${c.slug}`}
              className="label rounded-full border border-softblack/25 px-4 py-2.5 text-[10.5px] transition-colors hover:border-softblack hover:bg-softblack hover:text-ivory"
            >
              {c.title}
            </a>
          ))}
        </div>
      </Reveal>

      <div className="mt-14 space-y-20 md:space-y-24">
        {COLLECTIONS.map((c, ci) => {
          const products = c.productIds
            .map((id) => getProduct(id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p));
          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-32">
              <Reveal>
                <div className="relative overflow-hidden rounded-[24px] bg-softblack">
                  <img
                    src={c.image}
                    alt=""
                    aria-hidden="true"
                    loading={ci === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-softblack/80 via-softblack/40 to-transparent" />
                  <div className="relative px-7 py-14 md:px-12 md:py-20">
                    <p className="label text-ivory/60">{c.eyebrow}</p>
                    <h2 className="mt-3 max-w-lg font-display text-[28px] leading-tight text-ivory md:text-[36px]">
                      {c.title}
                    </h2>
                    <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-ivory/75">{c.story}</p>
                  </div>
                </div>
              </Reveal>

              <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
                {products.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 3) * 0.06}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
