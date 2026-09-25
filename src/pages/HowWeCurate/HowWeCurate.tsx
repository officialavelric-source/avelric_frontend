import { Link } from "react-router-dom";
import { Reveal, SectionHeading, StitchDivider } from "../../components/common";
import { CURATION_STEPS } from "../../constants/curation";

export default function HowWeCurate() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16 md:py-24">
      <SectionHeading
        eyebrow="How we curate"
        title="Twelve steps between the market and your wardrobe"
        sub="This is the entire company in one page. Every product on AVELRIC has passed each of these, in this order."
      />
      <ol className="mt-10 sm:mt-16 space-y-0">
        {CURATION_STEPS.map((s, i) => (
          <li key={s.t}>
            <Reveal>
              <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[64px_1fr] gap-4 sm:gap-6 py-5 sm:py-7 md:grid-cols-[96px_1fr]">
                <p className="font-display text-[28px] sm:text-[36px] leading-none text-softblack/20 md:text-[44px]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h2 className="font-display text-[17px] sm:text-[20px] md:text-[22px]">{s.t}</h2>
                  <p className="mt-1.5 sm:mt-2 max-w-xl text-[13.5px] sm:text-[15px] leading-relaxed text-warmgray">{s.d}</p>
                </div>
              </div>
            </Reveal>
            {i < CURATION_STEPS.length - 1 && <StitchDivider />}
          </li>
        ))}
      </ol>
      <Reveal className="mt-10 sm:mt-16 text-center">
        <Link to="/shop" className="label w-full sm:w-auto inline-block rounded-full bg-softblack px-8 py-4 text-[12px] text-ivory">
          Shop what passed
        </Link>
      </Reveal>
    </div>
  );
}
