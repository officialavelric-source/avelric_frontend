import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../common";
import { u } from "../../data/products";
import { getAllCachedProducts, getProducts } from "../../services/shopify/productService";
import type { AppProduct } from "../../types/app";

export default function Lookbook({ allProducts: initialProducts }: { allProducts?: AppProduct[] }) {
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

  const shirts = products.filter((p) => p.category === "shirts");
  const jeans = products.filter((p) => p.category === "jeans");

  const cards = [
    {
      eyebrow: "Shirts Curation",
      title: shirts.length > 0 ? `${shirts.length} Curated Shirts, Zero Fluff` : "Curated Shirts, Zero Compromises",
      body: "Hand-picked button-downs, breathable linens, and textured camp-collars — reviewed twice before being listed.",
      image: shirts[0]?.images?.[0] || u("photo-1596755094514-f87e34085b2c", 1000),
      to: "/category/shirts",
      cta: "Shop shirts",
      secondaryTo: "/new-arrivals",
      secondaryLabel: "See new arrivals",
    },
    {
      eyebrow: "Denim Curation",
      title: jeans.length > 0 ? `${jeans.length} Tailored Cuts, Selected Denim` : "Selected Denim, Not Mass-Produced",
      body: "Vintage washes, relaxed straight legs, and textured Japanese denim crafted for drape and everyday wear.",
      image: jeans[0]?.images?.[0] || u("photo-1542272604-787c3835535d", 1000),
      to: "/category/jeans",
      cta: "Shop jeans",
      secondaryTo: "/shop",
      secondaryLabel: "Explore all curations",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 md:py-24">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {cards.map((c, i) => (
          <Reveal key={c.eyebrow} delay={i * 0.08}>
            <div className="group relative overflow-hidden rounded-[3px] border border-softblack/10">
              <Link to={c.to} className="block aspect-[3/4] sm:aspect-[4/5] bg-beige">
                <img
                  src={c.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[600ms] ease-premium group-hover:scale-[1.06]"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-softblack/90 via-softblack/30 to-transparent" />
              </Link>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 sm:p-7 text-ivory md:p-8">
                <p className="label text-[9px] tracking-wider text-ivory/70 sm:text-[11px]">{c.eyebrow}</p>
                <h3 className="mt-1 sm:mt-2 max-w-xs font-display text-[15px] leading-[1.12] tracking-[-0.02em] sm:text-[24px] md:text-[30px]">{c.title}</h3>
                <p className="mt-1 sm:mt-2.5 max-w-xs text-[11px] leading-snug text-ivory/75 line-clamp-2 sm:line-clamp-none sm:text-[13.5px] sm:leading-relaxed">{c.body}</p>
                <div className="pointer-events-auto mt-2.5 sm:mt-5 flex flex-wrap items-center gap-x-3 sm:gap-x-6 gap-y-1 sm:gap-y-2">
                  <Link to={c.to} className="label inline-flex items-center gap-1 sm:gap-2 border-b border-ivory/50 pb-0.5 sm:pb-1 text-[10px] sm:text-[11px] transition-colors hover:border-ivory">
                    {c.cta}
                    <span aria-hidden="true">→</span>
                  </Link>
                  {c.secondaryTo && (
                    <Link to={c.secondaryTo} className="label text-[10px] sm:text-[11px] text-ivory/60 transition-colors hover:text-ivory hidden xs:inline-block sm:inline-block">
                      {c.secondaryLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
