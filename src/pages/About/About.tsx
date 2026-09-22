import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Reveal, SectionHeading, StitchDivider } from "../../components/common";
import { u } from "../../data/products";

/* ============================================================
   FOUNDERS DATA
   ============================================================ */
const FOUNDERS = [
  {
    name: "Roshan",
    role: "Co-Founder · Curation & Tech",
    quote:
      "Every piece must stand on its own merits. If the collar droops after a day or the weave feels flimsy, it has no place in your closet.",
  },
  {
    name: "Sumit",
    role: "Co-Founder · Operations & Sourcing",
    quote:
      "We bridge the gap between skilled textile makers and discerning buyers. Direct honest pricing, zero mall-rent inflation.",
  },
];

/* ============================================================
   PILLARS / CORE VALUES
   ============================================================ */
const PILLARS = [
  {
    num: "01",
    title: "Tangible Fabric Weight",
    desc: "Heavyweight 220–260 GSM combed cottons and 13.5oz ring-spun denim with substantial hand-feel, structural drape, and long-lasting weave integrity.",
    tag: "Material First",
  },
  {
    num: "02",
    title: "The 10% Selection Rule",
    desc: "We physically handle and test hundreds of garments every week. Only the top 10% that meet our strict benchmarks for drape, seams, and finishing qualify.",
    tag: "Rigorous Filter",
  },
  {
    num: "03",
    title: "Direct Honest Pricing",
    desc: "Sourced directly from verified makers. By eliminating showroom leases and corporate middleman overhead, you pay solely for authentic craft.",
    tag: "Zero Middleman",
  },
  {
    num: "04",
    title: "Pre-Shrunk & Real Fit",
    desc: "Drape-tested on diverse real human builds — not plastic mannequins. Pre-washed with <2% dimensional tolerance so the size you buy stays true.",
    tag: "Engineered Fit",
  },
];

export default function About() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === "#contact" || hash === "#manifesto") {
      const id = hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  return (
    <div className="overflow-hidden bg-ivory text-softblack">
      {/* ============================================================
          1. HERO SECTION: Editorial Statement & Proof Points
          ============================================================ */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden bg-softblack text-ivory">
        <div className="absolute inset-0 z-0">
          <img
            src="/AboutUs-Hero.png"
            alt="AVELRIC Menswear Atelier"
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-45 scale-105 transition-transform duration-[8000ms] hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-softblack/95 via-softblack/75 to-softblack/40" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-softblack to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32 w-full">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-wider">
              <span className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 font-mono text-[10px] text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                AVELRIC ATELIER · EST. 2026
              </span>
              <span className="hidden sm:inline-block text-ivory/40">|</span>
              <span className="text-ivory/70 font-mono text-[10px] hidden sm:inline-block">
                30.7333° N, 76.7794° E · CHANDIGARH
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-[32px] leading-[1.12] tracking-tight sm:text-[46px] lg:text-[56px] uppercase">
              Good clothes are out there.
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-ivory via-ivory/90 to-ivory/60">
                We find the 10% worth wearing.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[14.5px] leading-relaxed text-ivory/80 sm:text-[16px]">
              Born out of frustration with flimsy fast fashion, distorted collars, and inflated mall markups.
              We audit hundreds of garments in person so your wardrobe consists solely of substantial fabrics,
              impeccable drape, and honest maker value.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-ivory px-7 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-softblack shadow-lg transition-all duration-300 hover:bg-gold hover:text-white active:scale-95"
              >
                <span>Explore The Collection</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>

              <a
                href="#manifesto"
                className="inline-flex items-center gap-2 rounded-full border border-ivory/25 bg-ivory/5 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ivory backdrop-blur transition-all duration-300 hover:border-ivory/60 hover:bg-ivory/15"
              >
                <span>Our Philosophy</span>
                <span className="text-ivory/60">↓</span>
              </a>
            </div>

            {/* Quick Proof Metrics */}
            <div className="mt-14 pt-8 border-t border-ivory/15 grid grid-cols-2 gap-6 sm:grid-cols-3 max-w-3xl">
              <div>
                <p className="font-display text-[26px] font-bold text-gold sm:text-[32px]">1 in 10</p>
                <p className="text-[12.5px] font-semibold text-ivory mt-0.5">Selection Standard</p>
                <p className="text-[11px] text-ivory/60">90% rejected during audits</p>
              </div>
              <div>
                <p className="font-display text-[26px] font-bold text-gold sm:text-[32px]">2× Audited</p>
                <p className="text-[12.5px] font-semibold text-ivory mt-0.5">Double Inspection</p>
                <p className="text-[11px] text-ivory/60">At source mill &amp; atelier</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-display text-[26px] font-bold text-gold sm:text-[32px]">0% Markup</p>
                <p className="text-[12.5px] font-semibold text-ivory mt-0.5">Direct Maker Value</p>
                <p className="text-[11px] text-ivory/60">No mall rents or middleman tax</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          2. THE MANIFESTO & 4 PILLARS
          ============================================================ */}
      <section id="manifesto" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="label rounded-full bg-beige px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-warmgray">
                The Curation Standard
              </span>
              <h2 className="mt-4 font-display text-[28px] uppercase leading-tight sm:text-[36px]">
                The Definitive Filter for Modern Menswear
              </h2>
              <p className="mt-5 text-[14.5px] leading-relaxed text-softblack/80">
                Exceptional garments are actively crafted across master textile hubs in India. The real problem isn't a shortage of quality—it's the endless noise of synthetic blends, deceptive lighting, and chaotic sizing that men are forced to sift through.
              </p>
              <div className="mt-6 border-l-2 border-gold pl-5 py-1">
                <p className="font-display text-[15px] uppercase leading-snug text-softblack">
                  "If a shirt doesn't hold its collar all day, or denim loses its silhouette after a wash, it never earns our label."
                </p>
              </div>

              <div className="mt-8">
                <Link
                  to="/category/shirts"
                  className="inline-flex items-center gap-2 border-b border-softblack/40 pb-1 text-[11.5px] font-semibold uppercase tracking-wider text-softblack hover:border-softblack transition-colors"
                >
                  <span>See Curated Shirts</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.08}>
                <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-softblack/10 bg-ivory p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[22px] font-bold text-softblack/25 group-hover:text-gold transition-colors">
                        {p.num}
                      </span>
                      <span className="label rounded-md bg-beige px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-warmgray">
                        {p.tag}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-[17px] uppercase leading-snug text-softblack">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-warmgray">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StitchDivider />

      {/* ============================================================
          3. COMPARISON: Fast Fashion vs. AVELRIC
          ============================================================ */}
      <section className="bg-sand/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading
              eyebrow="The Distinction"
              title="WHY CURATION OUTPERFORMS MASS RETAIL"
              sub="A clear, transparent breakdown of what separates AVELRIC from ordinary mall and online shopping."
            />
          </div>

          <div className="mt-12 mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
            {/* The Status Quo */}
            <Reveal>
              <div className="flex h-full flex-col justify-between rounded-3xl border border-softblack/10 bg-ivory p-7 sm:p-9 shadow-sm">
                <div>
                  <span className="rounded-full bg-beige px-3 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-warmgray">
                    The Fast Fashion Status Quo
                  </span>
                  <h3 className="mt-4 font-display text-[20px] uppercase text-softblack">
                    Endless Noise &amp; Random Quality
                  </h3>
                  <p className="mt-2 text-[13px] text-warmgray">
                    Mass catalogs designed for single-season obsolescence.
                  </p>

                  <ul className="mt-6 space-y-3.5 border-t border-softblack/10 pt-6 text-[13px] text-softblack/80">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 text-danger font-bold text-[14px]">✕</span>
                      <span>Thin 140–160 GSM blends that turn limp after two washes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 text-danger font-bold text-[14px]">✕</span>
                      <span>3× to 5× markup subsidizing mall rents and logo branding</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 text-danger font-bold text-[14px]">✕</span>
                      <span>Chaotic sizing variations and deceptive catalog photography</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 text-danger font-bold text-[14px]">✕</span>
                      <span>Slow automated customer bots and frustrating return cycles</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-softblack/5 text-[11.5px] text-warmgray font-mono">
                  RESULT: Cluttered closet, wasted money
                </div>
              </div>
            </Reveal>

            {/* The AVELRIC Standard */}
            <Reveal delay={0.1}>
              <div className="flex h-full flex-col justify-between rounded-3xl border-2 border-softblack bg-softblack p-7 sm:p-9 text-ivory shadow-2xl scale-[1.02]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-gold/20 border border-gold/40 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-gold">
                      The AVELRIC Standard
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-gold">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
                      10% Selected
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-[20px] uppercase text-ivory">
                    Audited Staples, Zero Fluff
                  </h3>
                  <p className="mt-2 text-[13px] text-ivory/70">
                    Hand-inspected twice before listing. Sourced direct from makers.
                  </p>

                  <ul className="mt-6 space-y-3.5 border-t border-ivory/15 pt-6 text-[13px] text-ivory/90">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-gold font-bold text-[14px]">✓</span>
                      <span>Heavyweight 220–260 GSM cottons &amp; 13.5oz ring-spun denim</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-gold font-bold text-[14px]">✓</span>
                      <span>Direct honest pricing with zero showroom middleman tax</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-gold font-bold text-[14px]">✓</span>
                      <span>Drape-tested on real bodies with &lt;2% pre-wash shrinkage</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-gold font-bold text-[14px]">✓</span>
                      <span>Direct WhatsApp human concierge &amp; same-day Tricity delivery</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-ivory/15">
                  <Link
                    to="/shop"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-ivory px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-softblack transition-all hover:bg-gold hover:text-white active:scale-98"
                  >
                    <span>Shop The Curated Edit</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. THE PEOPLE BEHIND IT (Founders)
          ============================================================ */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            eyebrow="The Curators"
            title="MEET THE FOUNDERS"
            sub="Built by two friends who were exhausted by inconsistent clothing quality online — so they created the curation standard themselves."
          />
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {FOUNDERS.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.1}>
              <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-softblack/10 bg-ivory p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-xl">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-softblack text-ivory font-display text-[18px] tracking-wide transition-colors group-hover:bg-gold">
                    {f.name.slice(0, 2).toUpperCase()}
                  </div>

                  <h3 className="mt-5 font-display text-[19px] uppercase tracking-wide text-softblack">
                    {f.name}
                  </h3>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-gold">
                    {f.role}
                  </p>

                  <p className="mt-4 text-[13px] leading-relaxed italic text-warmgray">
                    "{f.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-softblack/5">
                  <span className="label text-[9.5px] text-warmgray uppercase tracking-widest">
                    AVELRIC Atelier · Chandigarh
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================
          5. DIRECT CONCIERGE & WARDROBE CTA
          ============================================================ */}
      <section id="contact" className="scroll-mt-28 border-t border-softblack/10 bg-sand/20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-medium text-gold">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                Live Concierge Active · Human Response
              </div>
              <h2 className="mt-4 font-display text-[28px] uppercase leading-tight sm:text-[36px]">
                Have Questions? Speak Directly.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-warmgray">
                Skip automated bots. Whether you need exact sizing checks, real unedited fabric photos, or local dispatch confirmation, our team responds directly.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {/* WhatsApp */}
            <Reveal delay={0.08}>
              <div className="flex h-full flex-col justify-between rounded-3xl border border-softblack/10 bg-ivory p-7 shadow-sm transition-all duration-300 hover:border-[#25D366]/60 hover:shadow-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#25D366]/10 px-3 py-1 text-[10px] font-semibold text-[#1fa851]">
                      Instant WhatsApp
                    </span>
                    <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
                  </div>
                  <h3 className="mt-4 font-display text-[18px] uppercase text-softblack">
                    WhatsApp Concierge
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-warmgray">
                    Fast size checks, order tracking, real-time pictures of pieces, or same-day local dispatch status.
                  </p>
                  <p className="mt-3 font-mono text-[13px] font-semibold text-softblack">
                    +91 62390 38301
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-softblack/10">
                  <a
                    href="https://wa.me/916239195030?text=Hi%20AVELRIC,%20I%20have%20a%20query%20regarding..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#1fa851] active:scale-98"
                  >
                    <span>Chat on WhatsApp</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Email */}
            <Reveal delay={0.16}>
              <div className="flex h-full flex-col justify-between rounded-3xl border border-softblack/10 bg-ivory p-7 shadow-sm transition-all duration-300 hover:border-softblack/50 hover:shadow-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-softblack/5 px-3 py-1 text-[10px] font-semibold text-warmgray">
                      Official Desk
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[18px] uppercase text-softblack">
                    Email Desk
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-warmgray">
                    Drop us an email for detailed order inquiries, returns &amp; exchanges, or custom feedback.
                  </p>
                  <p className="mt-3 font-mono text-[12px] font-semibold text-softblack break-all">
                    officialavelric@gmail.com
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-softblack/10">
                  <a
                    href="mailto:officialavelric@gmail.com?subject=AVELRIC%20Patron%20Query"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-softblack px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ivory shadow-sm transition-all hover:bg-gold hover:text-white active:scale-98"
                  >
                    <span>Write An Email</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Delivery & Logistics strip */}
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-softblack/10 bg-ivory p-5 text-center text-[12px] text-warmgray shadow-xs">
            <span className="font-semibold text-softblack">Same-Day Local Delivery:</span> Chandigarh, Mohali, Panchkula &amp; Kharar. All other regions in India delivered within 5–7 business days.
          </div>

          {/* Final Shop CTA */}
          <div className="mt-14 text-center">
            <Reveal>
              <h3 className="font-display text-[22px] uppercase text-softblack sm:text-[26px]">
                Ready to Upgrade Your Daily Rotation?
              </h3>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/shop"
                  className="rounded-full bg-softblack px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ivory transition-all hover:bg-gold hover:text-white shadow-md active:scale-95"
                >
                  Shop Curated Pieces →
                </Link>
                <Link
                  to="/category/shirts"
                  className="rounded-full border border-softblack/20 bg-ivory px-7 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-softblack transition-all hover:border-softblack hover:bg-beige"
                >
                  View Shirts Edit
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}