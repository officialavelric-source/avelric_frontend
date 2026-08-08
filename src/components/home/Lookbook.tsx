import { Link } from "react-router-dom";
import { Reveal } from "../common";
import { u } from "../../data/products";

const CARDS = [
  {
    eyebrow: "Just In",
    title: "Six Pieces, Zero Compromises",
    body: "This week's arrivals — reviewed twice before they were allowed to ship.",
    image: u("photo-1516257984-b1b4d707412e", 1000),
    to: "/new-arrivals",
    cta: "Shop new arrivals",
  },
  {
    eyebrow: "How We Curate",
    title: "Selected, Not Mass-Produced",
    body: "Out of every hundred pieces we review in the market, roughly six get listed.",
    image: u("photo-1441984904996-e0b6ba687e04", 1000),
    to: "/shop",
    cta: "Shop what passed",
    secondaryTo: "/how-we-curate",
    secondaryLabel: "See the 12-step process",
  },
];

export default function Lookbook() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <div className="grid gap-5 md:grid-cols-2">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <div className="group relative overflow-hidden rounded-[3px] border border-softblack/10">
              <Link to={c.to} className="block aspect-[4/5]">
                <img
                  src={c.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[600ms] ease-premium group-hover:scale-[1.06]"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-softblack/85 via-softblack/20 to-transparent" />
              </Link>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-7 text-ivory md:p-8">
                <p className="label text-ivory/70">{c.eyebrow}</p>
                <h3 className="mt-2 max-w-xs font-display text-[26px] leading-[1.1] tracking-[-0.02em] md:text-[30px]">{c.title}</h3>
                <p className="mt-2.5 max-w-xs text-[13.5px] leading-relaxed text-ivory/75">{c.body}</p>
                <div className="pointer-events-auto mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link to={c.to} className="label inline-flex items-center gap-2 border-b border-ivory/50 pb-1 text-[11px] transition-colors hover:border-ivory">
                    {c.cta}
                    <span aria-hidden="true">→</span>
                  </Link>
                  {c.secondaryTo && (
                    <Link to={c.secondaryTo} className="label text-[11px] text-ivory/60 transition-colors hover:text-ivory">
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
