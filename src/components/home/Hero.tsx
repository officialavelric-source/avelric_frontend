import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

/* ============================================================
   HERO — fullscreen lifestyle image · responsive crop (mobile vs
   laptop/desktop) · dark gradient overlay · condensed uppercase
   headline · white CTA + text CTA · "Scroll to discover"
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;
const HEADLINE_LINES = ["STYLE THAT", "SPEAKS BEFORE", "YOU DO."];

export default function Hero() {
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    /* -mt-[72px] → navbar (sticky, transparent) ke NICHE hero slide
       karta hai. Navbar height change karo to yeh bhi update karna. */
    <section className="relative -mt-[72px] h-[calc(100svh-36px)] min-h-[600px] overflow-hidden bg-softblack text-ivory">
      {/* background — Mobile-Compatible-HeroImage below md, Laptop-Compatible-HeroImage md+ */}
      <motion.img
        src="/Mobile-Compatible-HeroImage.png"
        alt="AVELRIC — style that speaks before you do"
        className="absolute inset-0 h-full w-full object-cover object-top md:hidden"
        initial={{ opacity: 0, scale: reduce ? 1 : 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <motion.img
        src="/Laptop-Compatible-HeroImage.png"
        alt="AVELRIC — style that speaks before you do"
        className="absolute inset-0 hidden h-full w-full object-cover object-top md:block"
        initial={{ opacity: 0, scale: reduce ? 1 : 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      {/* overlays — just enough for text legibility, real image stays visible */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-softblack/70 via-softblack/15 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-softblack/35 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-softblack/35 to-transparent" />

      {/* content — hero ke andar vertically centered */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center px-6 pt-[72px] md:px-12">
        <div className="max-w-2xl">
          <motion.p {...fadeUp(0.15)} className="text-[11px] font-medium uppercase tracking-[0.34em] text-ivory/80">
            Premium Curated Fashion
          </motion.p>

          {/* headline — line-by-line mask reveal */}
          <h1 className="mt-5 font-['Oswald','Archivo_Narrow',sans-serif] text-[clamp(38px,5.4vw,62px)] font-semibold uppercase leading-[1.05] tracking-[-0.01em]">
            {HEADLINE_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={reduce ? {} : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.28 + i * 0.14, ease: EASE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p {...fadeUp(0.85)} className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-ivory/70">
            Handpicked pieces that blend timeless elegance with modern aesthetics —
            quality-checked twice before they reach you.
          </motion.p>

          <motion.div {...fadeUp(1)} className="mt-8 flex flex-wrap items-center gap-7">
            <Link
              to="/shop"
              className="group label inline-flex items-center gap-3 rounded-[3px] bg-ivory px-7 py-[15px] text-[11px] text-softblack transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              Shop Now
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>

            <Link
              to="/new-arrivals"
              className="group label inline-flex items-center gap-2 border-b border-ivory/40 pb-1.5 text-[11px] text-ivory/90 transition-colors hover:border-ivory hover:text-ivory"
            >
              Shop New Arrivals
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* bottom-left: scroll to discover */}
      <motion.div {...fadeUp(1.25)} className="absolute bottom-6 left-6 z-10 flex items-center gap-4 md:left-12">
        <span className="relative block h-10 w-px overflow-hidden bg-ivory/20">
          <motion.span
            className="absolute left-0 top-0 h-1/2 w-full bg-ivory"
            animate={reduce ? {} : { y: ["-100%", "220%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-ivory/70">Scroll to Discover</span>
      </motion.div>
    </section>
  );
}
