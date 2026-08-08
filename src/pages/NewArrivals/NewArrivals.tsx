import { Link } from "react-router-dom";
import { byNewest } from "../../services/productService";
import { Reveal } from "../../components/common";
import { ProductCard } from "../../components/product";
import { u } from "../../data/products";

/* New Arrivals — chronological, latest first, "Just In" date chips.
   Collections (curated edits) se distinct page. */

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function NewArrivals() {
  const items = byNewest();
  const justInCutoff = items[0]?.addedAt ?? "";

  return (
    <div>
      {/* banner header */}
      <div className="relative overflow-hidden bg-softblack">
        <img
          src={u("photo-1445205170230-053b83016050", 1920)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-softblack/80 via-softblack/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 text-ivory md:py-24">
          <Reveal>
            <p className="label text-ivory/60">
              <Link to="/" className="hover:text-ivory">Home</Link> / New Arrivals
            </p>
            <h1 className="mt-3 font-display text-[32px] md:text-[44px]">Just In</h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ivory/75">
              Every Friday we list the pieces that survived that week's market visits. Latest first —
              small batches, so the newest drop is also the fullest size run.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 5) * 0.05}>
              <div>
                <p className="label mb-2.5 flex items-center gap-2 text-[9.5px] text-warmgray">
                  {p.addedAt === justInCutoff && (
                    <span className="rounded-full bg-softblack px-2.5 py-1 text-ivory">Just In</span>
                  )}
                  Listed {fmtDate(p.addedAt)}
                </p>
                <ProductCard product={p} eager={i < 4} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
