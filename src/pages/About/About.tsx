import { Link } from "react-router-dom";
import { Reveal, SectionHeading, StitchDivider } from "../../components/common";
import { u } from "../../data/products";

const STATS = [
  { n: "400+", t: "pieces reviewed in markets so far" },
  { n: "~6%", t: "of reviewed products make it to the site" },
  { n: "2×", t: "quality checks before anything ships" },
];

const VALUES = [
  { t: "Taste over trend", d: "We skip whatever the algorithm is pushing this month. If it won't look right in three years, it doesn't get listed." },
  { t: "Checked, then checked again", d: "Once at the supplier, once at our end. Stitching, hardware, shrinkage — verified by hand, not assumed." },
  { t: "Honest pricing", d: "No showroom rent, no mall margins. The gap between our price and retail is the whole pitch." },
  { t: "People, not tickets", d: "Sizing help, exchanges, complaints — a person answers on WhatsApp, usually within hours." },
];

export default function About() {
  return (
    <div>
      {/* hero banner */}
      <div className="relative overflow-hidden bg-softblack">
        <img
          src={u("photo-1441984904996-e0b6ba687e04", 1920)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-softblack/85 via-softblack/45 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-ivory md:py-36">
          <Reveal>
            <p className="label text-ivory/60">Our story</p>
            <h1 className="mt-4 max-w-2xl font-display text-[34px] leading-tight md:text-[48px]">
              We started AVELRIC because shopping online stopped being about clothes.
            </h1>
          </Reveal>
        </div>
      </div>

      {/* story — copy + imagery */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal>
            <div className="space-y-6 text-[16px] leading-[1.8] text-softblack/85">
              <p>
                It became about scrolling. Ten thousand listings, fake reviews, photos that lie, and a
                price that tells you nothing about what arrives at your door. Finding one good shirt
                started taking a full evening — and half the time, it still went back.
              </p>
              <p>
                We knew something most shoppers don't: the good products exist. India's markets and
                export houses make world-class clothing every day. The problem was never supply. The
                problem is that the good pieces sit buried next to a hundred bad ones, and no
                marketplace has any reason to tell you which is which.
              </p>
              <p>
                So that became the job. We go to the suppliers. We put the fabric in our hands. We
                check the stitching, the buttons, the zips, and the fit on a real body. Most of what
                we see, we reject. What passes gets photographed honestly, priced honestly, and
                listed on this site.
              </p>
              <p>
                AVELRIC doesn't manufacture anything, and that's the point. You're not paying us for
                a factory. You're paying us for taste, standards, and the hours of searching you'll
                never have to do again.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid gap-4">
              <img
                src={u("photo-1558769132-cb1aea458c5e", 900)}
                alt="Fabric and tailoring detail"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <img
                src={u("photo-1445205170230-053b83016050", 900)}
                alt="Curated clothing rail"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>

      <StitchDivider />

      {/* stats */}
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 text-center sm:grid-cols-3">
        {STATS.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.08}>
            <p className="font-display text-[44px]">{s.n}</p>
            <p className="mx-auto mt-2 max-w-[220px] text-[14px] text-warmgray">{s.t}</p>
          </Reveal>
        ))}
      </div>

      {/* founder note */}
      <div className="bg-beige py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="grid items-center gap-10 rounded-[24px] bg-ivory p-8 shadow-sm shadow-softblack/5 ring-1 ring-softblack/5 md:grid-cols-[220px_1fr] md:p-12">
              <img
                src={u("photo-1517070208541-6ddc4d3efbcb", 600)}
                alt="Founder of AVELRIC"
                loading="lazy"
                className="mx-auto aspect-square w-44 rounded-full object-cover md:w-full md:rounded-2xl md:aspect-[3/4]"
              />
              <div>
                <p className="label text-warmgray">A note from the founder</p>
                <blockquote className="mt-4 font-display text-[20px] leading-relaxed md:text-[24px]">
                  "Every piece on this site is something I'd wear myself, gift to a friend, and
                  stand behind when it arrives at your door. The day that stops being true, we've
                  lost the plot."
                </blockquote>
                <p className="mt-5 font-display text-[17px] italic">— Founder, AVELRIC · Chandigarh, 2026</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* values */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <SectionHeading eyebrow="What we stand for" title="Four things we refuse to compromise on" />
        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.08}>
              <p className="font-display text-[42px] leading-none text-softblack/15">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-display text-[19px]">{v.t}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-warmgray">{v.d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-16 flex flex-wrap items-center gap-5">
          <Link to="/how-we-curate" className="label rounded-full bg-softblack px-8 py-4 text-[12px] text-ivory transition-transform hover:scale-[1.02]">
            See the 12-step process
          </Link>
          <Link to="/shop" className="label border-b border-softblack/30 pb-1 text-[11px] transition-colors hover:border-softblack">
            Shop what passed →
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
