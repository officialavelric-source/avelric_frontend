import { Link, useParams } from "react-router-dom";
import { CATEGORIES } from "../../data/products";
import { Reveal } from "../../components/common";
import { ProductCard } from "../../components/product";
import { ShopFilterBar } from "../../components/forms";
import { useShopFilters } from "../../hooks/useShopFilters";

export default function Shop({ preset }: { preset?: "new" }) {
  const { slug } = useParams<{ slug?: string }>();
  const { category, filters } = useShopFilters({ preset, categorySlug: slug });
  const { q, items, clearAll } = filters;

  const title = q.trim()
    ? `Results for "${q.trim()}"`
    : preset === "new"
      ? "New Arrivals"
      : category
        ? category.name
        : "The Collection";

  const crumb = preset === "new" ? "New Arrivals" : category ? category.name : "Shop";

  return (
    <div>
      <ShopFilterBar filters={filters} showCategoryPill={!category} />

      {/* ---------- RESULTS ---------- */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <Reveal>
          <p className="label text-warmgray">
            <Link to="/" className="hover:text-softblack">Home</Link> / {crumb}
          </p>
          <h1 className="mt-3 font-display text-[30px] md:text-[38px]">{title}</h1>
          <p className="mt-2.5 max-w-xl text-[15px] text-warmgray">
            {items.length} piece{items.length === 1 ? "" : "s"} — every one reviewed in person before listing.
          </p>
        </Reveal>

        {/* category quick tiles — sirf all-products view par */}
        {!category && !q && preset !== "new" && (
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="group relative h-24 w-40 shrink-0 overflow-hidden rounded-2xl"
              >
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-softblack/70 to-transparent" aria-hidden="true" />
                <span className="label absolute bottom-2.5 left-3.5 text-[10.5px] text-ivory">{c.name}</span>
              </Link>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-beige px-8 py-20 text-center">
            <p className="font-display text-2xl">
              {q ? `Nothing matches "${q.trim()}"` : "Nothing matches these filters"}
            </p>
            <p className="mt-3 text-warmgray">
              {q ? "Try a category — shirts, jeans, jackets — or clear the search." : "Widen the price range or clear a size to see more."}
            </p>
            <button onClick={clearAll} className="label mt-8 rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
                <ProductCard product={p} eager={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
