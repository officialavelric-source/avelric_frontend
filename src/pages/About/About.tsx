import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, SectionHeading, StitchDivider } from "../../components/common";
import { analyticsService } from "../../services/analytics";
import { u } from "../../data/products";

/* ============================================================
   STATS & METRICS
   ============================================================ */
const STATS = [
  {
    n: "100s",
    t: "Garments Evaluated Weekly",
    sub: "Directly sourced from vetted textile mills and makers",
    highlight: "Sourced Direct",
  },
  {
    n: "1 in 10",
    t: "Pass Our Final Selection",
    sub: "Strict 10% curation standard — we reject the remaining 90%",
    highlight: "10% Standard",
  },
  {
    n: "2×",
    t: "Quality Audits Per Piece",
    sub: "Verified at source & re-inspected at our Chandigarh atelier",
    highlight: "Double Inspected",
  },
  {
    n: "0%",
    t: "Showroom Middleman Markup",
    sub: "No mall rents or retailer cuts — direct honest pricing",
    highlight: "Zero Markup",
  },
];

/* ============================================================
   INTERACTIVE CRAFT DEEP-DIVE SPECIFICATIONS
   ============================================================ */
interface CraftPillar {
  id: string;
  tabLabel: string;
  title: string;
  subtitle: string;
  description: string;
  specs: { label: string; value: string }[];
  image: string;
  badge: string;
}

const CRAFT_PILLARS: CraftPillar[] = [
  {
    id: "fabric",
    tabLabel: "01. Fabric & GSM",
    title: "Dense, Breathable Weaves with Substantial Hand-Feel",
    subtitle: "Heavyweight 220–260 GSM Cotton & 13.5oz Ring-Spun Denim",
    description:
      "Most retail garments cut costs by using thin 140–160 GSM blends that turn flimsy after two washes. At AVELRIC, every shirt is tested for thread density, breathability, and opacity. Our jeans use authentic ring-spun denim that develops unique character with every wear.",
    specs: [
      { label: "Shirt Weight", value: "220 – 260 GSM Cotton" },
      { label: "Denim Weight", value: "13.5 oz Ring-Spun" },
      { label: "Weave Structure", value: "Twill, Oxford & Linen" },
      { label: "Skin Feel", value: "Combed & Pre-Softened" },
    ],
    image: u("photo-1558769132-cb1aea458c5e", 1000),
    badge: "Material Integrity",
  },
  {
    id: "stitching",
    tabLabel: "02. Seam Architecture",
    title: "Dual-Needle Seams & Reinforced Stress Points",
    subtitle: "Engineered for longevity, tension resistance & clean fall",
    description:
      "A garment is only as strong as its weakest seam. We scrutinize internal overlocking, shoulder yoke construction, and pocket bar-tacks. No loose hanging threads, no seam puckering after wash, and zero crooked topstitching.",
    specs: [
      { label: "Stitch Density", value: "12–14 SPI (Stitches Per Inch)" },
      { label: "Reinforcement", value: "Bar-tack at all tension joints" },
      { label: "Internal Finish", value: "French / Clean Overlock" },
      { label: "Tear Resistance", value: "Stress-tested seams" },
    ],
    image: u("photo-1584917865442-de89df76afd3", 1000),
    badge: "Tailoring Standard",
  },
  {
    id: "hardware",
    tabLabel: "03. Trims & Hardware",
    title: "Solid Alloy Buttons & Smooth High-Cycle Zippers",
    subtitle: "Custom buttons, heavy-gauge rivets, and smooth zips",
    description:
      "Flimsy plastic buttons and sticky zippers ruin even the best silhouettes. We mandate heavy-gauge antiqued alloy hardware, reinforced shank attachments, and rust-proof brass or blackened steel zippers that glide effortlessly.",
    specs: [
      { label: "Zipper Class", value: "High-Cycle Metal Sliders" },
      { label: "Button Composition", value: "Reinforced Alloy / Horn Finish" },
      { label: "Rivet Hardware", value: "Anti-Corrosion Brass" },
      { label: "Fastening Life", value: "Tested for 5,000+ pulls" },
    ],
    image: u("photo-1598033129183-c4f50c736f10", 1000),
    badge: "Enduring Trims",
  },
  {
    id: "silhouette",
    tabLabel: "04. Fit & Pre-Shrunk",
    title: "Tested on Real Human Bodies, Not Mannequins",
    subtitle: "Proportion-tailored for South Asian builds with zero shrinkage surprises",
    description:
      "Clothes should flatter your natural posture while allowing unrestricted movement. Every piece is drape-tested on diverse body types across M, L, XL for shirts and 30, 32, 34 for jeans. All fabrics undergo pre-wash treatment so the size you buy stays the size you keep.",
    specs: [
      { label: "Pre-Shrinkage", value: "< 2% Dimensional Tolerance" },
      { label: "Drape Test", value: "Verified on active bodies" },
      { label: "Shirt Sizing", value: "M, L, XL (True to Size)" },
      { label: "Jeans Sizing", value: "30, 32, 34 (Tailored Comfort)" },
    ],
    image: u("photo-1445205170230-053b83016050", 1000),
    badge: "Consistent Fit",
  },
];

/* ============================================================
   CORE PRINCIPLES
   ============================================================ */
const VALUES = [
  {
    num: "01",
    t: "Quality Over Quantity",
    d: "Fabric weight, seam integrity, buttons, hardware, finishing, and silhouette — rigorously audited before any item earns its place in our collection.",
    badge: "Craft & Material",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    num: "02",
    t: "Direct Honest Pricing",
    d: "By sourcing directly from vetted makers without showroom overhead or luxury markups, we pass genuine craft savings directly on to you.",
    badge: "Zero Middleman",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 6v2m0 8v2" />
      </svg>
    ),
  },
  {
    num: "03",
    t: "Nothing Random",
    d: "We do not mass-list inventory. If a garment lacks exceptional drape, durability, or character, it is rejected immediately. Only the top 10% qualify.",
    badge: "10% Filter",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    num: "04",
    t: "Effortless Experience",
    d: "Skip the exhausting market searches and deceptive listings. We bring verified, versatile staples directly to your doorstep with same-day local dispatch.",
    badge: "Fast Concierge",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

/* ============================================================
   COMPARISON DATA
   ============================================================ */
const COMPARISONS = [
  {
    type: "Typical Fast Fashion",
    tagline: "Endless scrolling, random quality & high returns",
    points: [
      "Overwhelming catalogs with chaotic, inconsistent sizing",
      "Studio lighting masks thin fabrics and synthetic polyester mixes",
      "Distorted collars and fraying seams after just 2-3 machine washes",
      "Protracted automated return loops and slow resolution",
    ],
    highlight: false,
    badge: "Industry Status Quo",
  },
  {
    type: "The AVELRIC Standard",
    tagline: "Meticulously curated, in-person verified & honest",
    points: [
      "Only the top 10% of evaluated garments ever make our collection",
      "Tested by hand on real human bodies for drape, density & longevity",
      "Fair direct pricing with zero showroom or multi-tier broker inflation",
      "Same-day local delivery in Chandigarh, Kharar, Mohali & Panchkula",
      "Direct WhatsApp concierge support with human stylists",
    ],
    highlight: true,
    badge: "The Atelier Standard",
  },
  {
    type: "Mall Boutique Chains",
    tagline: "Heavily marked-up branding & bloated overhead",
    points: [
      "3× to 5× markup solely to subsidize mall rents and corporate staffing",
      "You pay primarily for the brand logo, not higher yarn quality",
      "Inconvenient shopping trips, crowded dressing rooms & rigid policies",
      "Slow seasonal inventory rotation with limited real customer service",
    ],
    highlight: false,
    badge: "Retail Markup",
  },
];

/* ============================================================
   FOUNDERS
   ============================================================ */
const FOUNDERS = [
  { name: "Roshan", age: 23, role: "Co-Founder & Lead Full Stack Developer" },
  { name: "Sumit", age: 22, role: "Co-Founder & Principal Freelance Consultant" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function About() {
  const { hash } = useLocation();
  const [activeCraftTab, setActiveCraftTab] = useState(0);

  useEffect(() => {
    if (hash === "#contact") {
      const timer = setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    if (hash === "#manifesto") {
      const timer = setTimeout(() => {
        const el = document.getElementById("manifesto");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  const activeCraft = CRAFT_PILLARS[activeCraftTab];

  return (
    <div className="overflow-hidden bg-ivory text-softblack">
      {/* 1. HERO SECTION: Atelier Editorial Showcase */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-softblack text-ivory">
        <div className="absolute inset-0 z-0">
          <img
            src="/AboutUs-Hero.png"
            alt="AVELRIC Curated Menswear Atelier"
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-50 scale-105 transition-transform duration-[10000ms] hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-softblack/90 via-softblack/65 to-softblack/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-softblack to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32 w-full">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 text-[11px] tracking-wider">
              <span className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 font-mono text-[10px] text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                AVELRIC ATELIER · EST. 2026
              </span>
              <span className="hidden sm:inline-block text-ivory/40">|</span>
              <span className="text-ivory/70 font-mono text-[10px] hidden sm:inline-block">
                30.7333° N, 76.7794° E · CHANDIGARH
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-[30px] leading-[1.12] tracking-tight sm:text-[44px] lg:text-[54px]">
              GOOD CLOTHES ARE ALREADY OUT THERE.
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-ivory via-ivory/90 to-ivory/60">
                WE FIND THE 10% WORTH WEARING.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-ivory/80 sm:text-[15.5px]">
              Born out of frustration with flimsy fabrics, inflated mall markups, and deceptive listings.
              We evaluate hundreds of garments in person so you only wear pieces of verifiable substance,
              impeccable drape, and fair direct pricing.
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
                <span>The Curation Standard</span>
                <span className="text-ivory/60">↓</span>
              </a>
            </div>

            <div className="mt-12 pt-7 border-t border-ivory/15 grid grid-cols-2 gap-4 sm:grid-cols-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold text-[11px] font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-ivory">In-Person Inspected</p>
                  <p className="text-[10.5px] text-ivory/60">Every batch hand-verified</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold text-[11px] font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-ivory">Direct Maker Value</p>
                  <p className="text-[10.5px] text-ivory/60">Zero showroom rent markup</p>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-gold text-[11px] font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-[12px] font-semibold text-ivory">Strict 10% Pass Rate</p>
                  <p className="text-[10.5px] text-ivory/60">9 out of 10 rejected</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. STATS & PROOF BAR */}
      <section className="relative -mt-10 z-20 mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="rounded-3xl border border-softblack/10 bg-ivory/95 p-7 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] backdrop-blur-xl md:p-9">
            <div className="grid gap-7 divide-y divide-softblack/10 sm:grid-cols-2 lg:grid-cols-4 sm:divide-y-0 sm:divide-x">
              {STATS.map((s, i) => (
                <div
                  key={s.t}
                  className={`flex flex-col justify-between ${i > 0 ? "pt-6 sm:pt-0 sm:pl-6" : ""
                    }`}
                >
                  <div>
                    <span className="inline-block rounded-md bg-beige px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-warmgray">
                      {s.highlight}
                    </span>
                    <p className="mt-3 font-display text-[32px] font-bold leading-none text-softblack lg:text-[38px]">
                      {s.n}
                    </p>
                    <p className="mt-2 text-[13.5px] font-semibold text-softblack">
                      {s.t}
                    </p>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-warmgray">
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. MANIFESTO & ORIGIN STORY */}
      <section id="manifesto" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-beige px-3.5 py-1 text-[11px] font-medium uppercase tracking-wider text-warmgray">
                <span className="h-2 w-2 rounded-full bg-gold" />
                The Origin Story
              </div>

              <h2 className="mt-4 font-display text-[26px] uppercase leading-tight sm:text-[34px] lg:text-[38px]">
                Why We Founded AVELRIC
              </h2>

              <div className="mt-6 border-l-2 border-softblack pl-6 py-1">
                <p className="font-display text-[16px] uppercase leading-snug text-softblack sm:text-[18px]">
                  "Shopping for good clothes shouldn't mean wasting hours in crowded bazaars or gambling on deceptive online photos."
                </p>
              </div>

              <div className="mt-6 space-y-5 text-[14px] leading-[1.75] text-softblack/80">
                <p>
                  Plenty of exceptional garments are crafted across India's master textile hubs and supplier workshops.
                  The genuine obstacle is not the lack of quality clothing—it is the endless noise, misleading marketing,
                  and erratic quality standards that modern shoppers are forced to navigate.
                </p>
                <p>
                  We created AVELRIC to be the definitive filter. We physically visit makers, handle the raw fabrics,
                  conduct wash and stretch tests, evaluate the weight and drape on real bodies, and scrutinize every button shank.
                  If a garment doesn't feel premium or compromises on stitch density, it never earns our label.
                </p>

                <div className="rounded-2xl border border-softblack/10 bg-beige/50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-softblack text-ivory">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[14px] text-softblack">
                        The Direct-from-Maker Advantage
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-warmgray">
                        Traditional brands charge 3× to 5× markup simply to cover retail mall real estate, corporate overhead,
                        and distributor layers. By keeping our pipeline lean and direct, you pay solely for genuine fabric and craftsmanship.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="label text-[10.5px] font-semibold text-warmgray mb-4">
                  Our Non-Negotiable Benchmarks:
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    "Fabric GSM & Weight Verified",
                    "Dual-Stitched Reinforcement",
                    "Rust-Resistant Alloy Zips",
                    "Pre-Washed Shrink Resistance",
                    "Tested on Real Human Builds",
                    "100% In-Person Inspected",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 rounded-xl border border-softblack/10 bg-ivory p-3 text-[11.5px] font-medium text-softblack shadow-xs"
                    >
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-success"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="group relative overflow-hidden rounded-3xl border border-softblack/10 bg-beige shadow-[0_15px_40px_-15px_rgba(26,26,26,0.15)]">
                <img
                  src={u("photo-1558769132-cb1aea458c5e", 1100)}
                  alt="Fabric inspection and weave verification at AVELRIC"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-softblack/70 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <span className="label rounded bg-gold/90 px-2.5 py-1 text-[9.5px] font-semibold tracking-widest text-softblack">
                      STAGE 01
                    </span>
                    <p className="mt-2 font-display text-[17px] uppercase text-ivory">
                      Fabric &amp; Fiber Verification
                    </p>
                    <p className="text-[11px] text-ivory/80">Chandigarh Curation Lab</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 bg-ivory/10 text-ivory backdrop-blur">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="group relative overflow-hidden rounded-2xl border border-softblack/10 bg-beige shadow-sm">
                  <img
                    src={u("photo-1542272604-787c3835535d", 700)}
                    alt="Selected ring-spun denim pieces"
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-softblack/60 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-[11px] font-medium text-ivory">
                    13.5oz Ring-Spun Denim
                  </p>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-softblack/10 bg-ivory p-5 shadow-sm">
                  <div>
                    <span className="label text-[9.5px] text-warmgray uppercase">The Threshold</span>
                    <p className="mt-1 font-display text-[19px] uppercase leading-tight text-softblack">
                      Top 10% Only
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-warmgray">
                    If a piece doesn't hold shape after full-day wear and test washes, it is cut from our catalog immediately.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <StitchDivider />

      {/* 4. INTERACTIVE CRAFT DEEP-DIVE */}
      <section className="bg-sand/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="The Craft Anatomy"
            title="BEHIND EVERY STITCH &amp; SILHOUETTE"
            sub="We break down the tangible engineering behind why AVELRIC garments outwear and outperform ordinary retail clothing."
          />

          <div className="mt-10 flex flex-wrap gap-2 border-b border-softblack/10 pb-4">
            {CRAFT_PILLARS.map((pillar, idx) => (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveCraftTab(idx)}
                className={`relative rounded-full px-4.5 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${activeCraftTab === idx
                  ? "bg-softblack text-ivory shadow-sm"
                  : "bg-ivory text-warmgray hover:bg-beige hover:text-softblack border border-softblack/10"
                  }`}
              >
                {pillar.tabLabel}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-softblack/10 bg-ivory p-6 md:p-9 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCraft.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="label rounded-full bg-gold/15 px-3 py-1 text-[9.5px] font-semibold text-gold">
                      {activeCraft.badge}
                    </span>
                    <span className="text-[11px] text-warmgray font-mono">
                      STANDARD VERIFIED
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-[20px] uppercase leading-snug sm:text-[26px]">
                    {activeCraft.title}
                  </h3>

                  <p className="mt-2 text-[13.5px] font-medium text-softblack/90">
                    {activeCraft.subtitle}
                  </p>

                  <p className="mt-4 text-[13px] leading-relaxed text-warmgray">
                    {activeCraft.description}
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-4 border-t border-softblack/10 pt-6">
                    {activeCraft.specs.map((spec) => (
                      <div key={spec.label} className="rounded-xl bg-beige/50 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-warmgray font-mono">
                          {spec.label}
                        </p>
                        <p className="mt-1 font-semibold text-[12.5px] text-softblack">
                          {spec.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-softblack/10 bg-beige shadow-md">
                  <img
                    src={activeCraft.image}
                    alt={activeCraft.title}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-softblack/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-ivory">
                    <span className="label text-[10px] font-mono tracking-widest">
                      AVELRIC SPEC SHEET
                    </span>
                    <span className="text-[10px] font-semibold bg-ivory/20 backdrop-blur px-2.5 py-1 rounded">
                      Audited
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURAL COMPARISON */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="The Distinction"
            title="HOW AVELRIC COMPARES"
            sub="A transparent breakdown of why our curated model saves you wasted hours, frustrating returns, and unjustified retail markups."
          />

          <div className="mt-12 grid gap-7 lg:grid-cols-3">
            {COMPARISONS.map((c, i) => (
              <Reveal key={c.type} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col justify-between rounded-3xl p-7 transition-all duration-300 md:p-8 ${c.highlight
                    ? "border-2 border-softblack bg-softblack text-ivory shadow-2xl scale-[1.02] lg:-translate-y-2"
                    : "border border-softblack/10 bg-ivory text-softblack hover:shadow-lg"
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-[9.5px] font-semibold uppercase tracking-wider ${c.highlight
                          ? "bg-gold/20 text-gold border border-gold/40"
                          : "bg-beige text-warmgray border border-softblack/10"
                          }`}
                      >
                        {c.badge}
                      </span>
                      {c.highlight && (
                        <span className="flex items-center gap-1.5 text-[10px] font-mono text-gold">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
                          Recommended Choice
                        </span>
                      )}
                    </div>

                    <h3 className="mt-5 font-display text-[20px] uppercase leading-tight">
                      {c.type}
                    </h3>
                    <p
                      className={`mt-2 text-[13px] leading-relaxed ${c.highlight ? "text-ivory/70" : "text-warmgray"
                        }`}
                    >
                      {c.tagline}
                    </p>

                    <ul className="mt-7 space-y-3.5 border-t border-softblack/10 pt-6">
                      {c.points.map((pt) => (
                        <li
                          key={pt}
                          className={`flex items-start gap-3 text-[12.5px] leading-relaxed ${c.highlight ? "text-ivory/90" : "text-softblack/80"
                            }`}
                        >
                          {c.highlight ? (
                            <svg
                              className="mt-1 h-3.5 w-3.5 shrink-0 text-gold"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warmgray/40" />
                          )}
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {c.highlight && (
                    <div className="mt-7 pt-6 border-t border-ivory/15">
                      <Link
                        to="/shop"
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-ivory px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-softblack transition-all hover:bg-gold hover:text-white"
                      >
                        <span>Shop Curated Pieces</span>
                        <span>→</span>
                      </Link>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOUR CORE GUIDING PRINCIPLES */}
      <section className="border-t border-softblack/10 bg-beige/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="Our Guiding Code"
            title="FOUR NON-NEGOTIABLE PRINCIPLES"
            sub="The foundational rules governing every garment we evaluate, every partnership we sign, and every interaction with our patrons."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.08}>
                <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-softblack/10 bg-ivory p-7 transition-all duration-300 hover:-translate-y-2 hover:border-gold/60 hover:shadow-xl">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[28px] font-bold leading-none text-softblack/20 group-hover:text-gold transition-colors">
                        {v.num}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-beige text-softblack group-hover:bg-softblack group-hover:text-ivory transition-colors">
                        {v.icon}
                      </div>
                    </div>

                    <h3 className="mt-5 font-display text-[18px] uppercase leading-snug text-softblack">
                      {v.t}
                    </h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-warmgray">
                      {v.d}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-softblack/5">
                    <span className="label rounded-md bg-beige px-2.5 py-1 text-[9.5px] font-semibold text-warmgray group-hover:bg-softblack group-hover:text-ivory transition-colors">
                      {v.badge}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MEET THE FOUNDERS — text-only, no photos */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow="The People Behind It"
            title="MEET THE FOUNDERS"
            sub="The minds behind AVELRIC who got tired of guessing at fabric quality online — so they built the curation standard themselves."
          />

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={i * 0.1}>
                <div className="group relative flex h-full flex-col items-center rounded-3xl border border-softblack/10 bg-ivory p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-gold/60 hover:shadow-xl">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-softblack text-ivory font-display text-[18px] tracking-wide transition-colors group-hover:bg-gold">
                    {initials(f.name)}
                  </div>

                  <h3 className="mt-5 font-display text-[18px] uppercase leading-snug text-softblack">
                    {f.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] font-semibold text-gold">
                    {f.role}
                  </p>
                  <p className="mt-1 text-[12px] text-warmgray">
                    Age {f.age}
                  </p>

                  <span className="label mt-4 rounded-full bg-beige px-3.5 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-warmgray group-hover:bg-softblack group-hover:text-ivory transition-colors">
                    Co-Founder
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. VIP DIRECT CONCIERGE & DELIVERY SUPPORT */}
      <section id="contact" className="scroll-mt-28 border-t border-softblack/10 bg-sand/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[11px] font-medium text-gold">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                Live Concierge Active · Human Response
              </div>
              <h2 className="mt-4 font-display text-[26px] uppercase leading-tight sm:text-[34px]">
                Have Questions? Speak Directly.
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-warmgray">
                Skip automated bots and generic ticketing loops. Whether you need exact sizing recommendations,
                same-day delivery confirmation in Tricity, or custom styling advice, our team responds directly.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
            {/* Card 1: WhatsApp Concierge */}
            <Reveal delay={0.1}>
              <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-softblack/10 bg-ivory p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#25D366]/60 hover:shadow-xl md:p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366] transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="h-6 w-6 fill-current"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                        <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.777.468 3.515 1.355 5.052l-1.44 5.263 5.385-1.413c1.479.806 3.149 1.234 4.856 1.234 5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.272c-1.571 0-3.111-.422-4.457-1.22l-.32-.19-3.311.868.884-3.228-.208-.332c-.876-1.394-1.338-3.007-1.338-4.664 0-4.561 3.711-8.272 8.272-8.272 4.562 0 8.273 3.711 8.273 8.272 0 4.562-3.711 8.272-8.272 8.272z" />
                      </svg>
                    </div>
                    <span className="rounded-full bg-[#25D366]/10 px-3 py-1 text-[10px] font-semibold text-[#1fa851]">
                      Instant Chat
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-[19px] uppercase text-softblack">
                    WhatsApp Concierge
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-warmgray">
                    Direct conversation for fast size checks, order tracking, real-time pictures of pieces, or same-day local dispatch status.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl bg-beige px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
                    <span className="font-mono text-[13px] font-semibold tracking-wide text-softblack">
                      +91 62390 38301
                    </span>
                  </div>
                </div>

                <div className="mt-7 border-t border-softblack/10 pt-6">
                  <a
                    href="https://wa.me/916239195030?text=Hi%20AVELRIC,%20I%20have%20a%20query%20regarding..."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      analyticsService.trackLead({
                        lead_type: "whatsapp",
                        placement: "about_concierge_card",
                      });
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#1fa851] active:scale-98"
                  >
                    <span>Message On WhatsApp</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Card 2: Email Inquiries */}
            <Reveal delay={0.2}>
              <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-softblack/10 bg-ivory p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-softblack/50 hover:shadow-xl md:p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-softblack/5 text-softblack transition-transform duration-300 group-hover:scale-110">
                      <svg
                        className="h-6 w-6 fill-none stroke-current"
                        viewBox="0 0 24 24"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <span className="rounded-full bg-softblack/5 px-3 py-1 text-[10px] font-semibold text-warmgray">
                      Official Desk
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-[19px] uppercase text-softblack">
                    Email Desk
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-warmgray">
                    Drop our team an email for detailed order inquiries, returns &amp; exchanges, corporate curations, or feedback.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2.5 rounded-xl bg-beige px-4 py-2.5">
                    <svg className="h-4 w-4 text-warmgray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                    </svg>
                    <span className="font-mono text-[12px] font-semibold text-softblack">
                      officialavelric@gmail.com
                    </span>
                  </div>
                </div>

                <div className="mt-7 border-t border-softblack/10 pt-6">
                  <a
                    href="mailto:officialavelric@gmail.com?subject=AVELRIC%20Patron%20Query"
                    onClick={() => {
                      analyticsService.trackContactEmail({
                        placement: "about_email_card",
                      });
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-softblack px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ivory shadow-md transition-all hover:bg-gold hover:text-white active:scale-98"
                  >
                    <span>Write An Email</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Delivery & Logistics Guarantee Bar */}
          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-softblack/10 bg-ivory p-6 shadow-xs">
            <div className="grid grid-cols-1 gap-5 text-center sm:grid-cols-3 sm:text-left">
              <div className="sm:border-r sm:border-softblack/10 sm:pr-6">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Same-Day Tricity
                </span>
                <p className="mt-1 text-[12px] font-medium text-softblack">
                  Chandigarh, Kharar, Mohali &amp; Panchkula delivered within hours. Other areas: 7–9 working days.
                </p>
              </div>

              <div className="sm:border-r sm:border-softblack/10 sm:px-6">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-warmgray">
                  Transparent Invoicing
                </span>
                <p className="mt-1 text-[12px] font-medium text-softblack">
                  Order confirmations, live dispatch tracking &amp; digital tax invoices sent automatically via email.
                </p>
              </div>

              <div className="sm:pl-6">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-warmgray">
                  Curated Sizing Focus
                </span>
                <p className="mt-1 text-[12px] font-medium text-softblack">
                  Shirts focused on M, L, XL · Premium Jeans available in 30, 32, 34 with pre-shrunk standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CLOSING EDITORIAL BANNER */}
      <section className="bg-softblack py-20 text-center text-ivory">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <span className="label text-gold text-[11px] font-mono uppercase tracking-widest">
              The Wardrobe Archive
            </span>

            <h2 className="mt-4 font-display text-[26px] uppercase leading-tight sm:text-[36px]">
              Ready to Upgrade Your Daily Rotation?
            </h2>

            <p className="mt-4 text-[14px] leading-relaxed text-ivory/70">
              Skip the mass-market gamble. Explore hand-curated shirts and premium jeans evaluated to our strict 10% standard.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/shop"
                className="rounded-full bg-ivory px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-softblack transition-all hover:bg-gold hover:text-white shadow-lg active:scale-95"
              >
                Shop Curated Garments →
              </Link>

              <Link
                to="/category/shirts"
                className="rounded-full border border-ivory/30 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-ivory transition-all hover:border-ivory hover:bg-ivory/10"
              >
                View Selected Shirts
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}