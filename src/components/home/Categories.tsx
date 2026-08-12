import { Link } from "react-router-dom";
import { Reveal, SectionHeading } from "../common";
import { CATEGORIES } from "../../data/products";

/* grid-cols count adapts to how many categories are actually active in
   data/products.ts — hardcoding md:grid-cols-5 left empty tracks (a big
   blank gap) whenever fewer than 5 categories were live. */
const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
};

export default function Categories() {
  const gridCols = GRID_COLS[CATEGORIES.length] ?? "sm:grid-cols-3 lg:grid-cols-5";

  return (
    <section className="bg-beige py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Shop by category" title="Five categories. Nothing that doesn't belong." />
          <Reveal>
            <Link to="/shop" className="label border-b border-softblack/30 pb-1 text-[11px] transition-colors hover:border-softblack">
              Browse everything →
            </Link>
          </Reveal>
        </div>
        <div className={`mt-12 grid grid-cols-2 gap-4 ${gridCols}`}>
          {CATEGORIES.map((c, i) => {
            const count: number = 0; // Count shown once Shopify products load on /category/:slug
            return (
              <Reveal key={c.slug} delay={i * 0.06}>
                <Link to={`/category/${c.slug}`} className="group relative block overflow-hidden rounded-2xl">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                    />
                  </div>
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-softblack/85 via-softblack/25 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-ivory md:p-5">
                    <span className="label block text-[9.5px] text-ivory/70">
                      {count} piece{count === 1 ? "" : "s"}
                    </span>
                    <span className="mt-1 flex items-center justify-between font-display text-[19px]">
                      {c.name}
                      <span aria-hidden="true" className="text-[15px] transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                    <span className="mt-1 block max-h-0 overflow-hidden text-[11.5px] leading-snug text-ivory/70 transition-all duration-400 group-hover:max-h-10">
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
