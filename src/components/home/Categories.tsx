import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionHeading } from "../common";
import { CATEGORIES } from "../../data/products";
import { getAllCachedProducts, getProducts } from "../../services/shopify/productService";
import type { AppProduct } from "../../types/app";

export default function Categories({ allProducts: initialProducts }: { allProducts?: AppProduct[] }) {
  const [products, setProducts] = useState<AppProduct[]>(() => initialProducts ?? getAllCachedProducts());

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      return;
    }
    getProducts(50)
      .then(({ products: fetched }) => setProducts(fetched))
      .catch(() => {});
  }, [initialProducts]);

  return (
    <section className="bg-beige py-14 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Shop by category" title="Two categories. Nothing that doesn't belong." />
          <Reveal>
            <Link to="/shop" className="label border-b border-softblack/30 pb-1 text-[11px] transition-colors hover:border-softblack">
              Browse everything →
            </Link>
          </Reveal>
        </div>
        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
          {CATEGORIES.map((c, i) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <Reveal key={c.slug} delay={i * 0.08}>
                <Link to={`/category/${c.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm">
                  <div className="aspect-[4/5] overflow-hidden bg-beige">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                    />
                  </div>
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-softblack/85 via-softblack/25 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8 text-ivory">
                    <span className="label block text-[10px] uppercase tracking-wider text-ivory/75">
                      {count > 0 ? `${count} piece${count === 1 ? "" : "s"}` : "Curated pieces"}
                    </span>
                    <span className="mt-1.5 flex items-center justify-between font-display text-[22px] sm:text-[24px] md:text-[28px]">
                      {c.name}
                      <span aria-hidden="true" className="text-[20px] transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                    </span>
                    <span className="mt-2 block max-h-0 overflow-hidden text-[13px] leading-snug text-ivory/80 transition-all duration-400 group-hover:max-h-12">
                      {c.blurb}
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
