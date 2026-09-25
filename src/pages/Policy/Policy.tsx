import { useParams, Link } from "react-router-dom";
import { Reveal } from "../../components/common";
import { POLICIES } from "../../constants/policies";

export default function Policy() {
  const { slug } = useParams<{ slug: string }>();

  const normalizedKey = slug
    ?.toLowerCase()
    .replace(/-policy$/, "")
    .replace(/^(terms-of-service|terms-and-conditions|legal-notice)$/, "terms");

  const policy = (normalizedKey && POLICIES[normalizedKey]) || (slug && POLICIES[slug]) || undefined;

  if (!policy)
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl">Page not found</h1>
        <Link to="/" className="label mt-8 inline-block rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">Back home</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16 md:py-24">
      <Reveal>
        <p className="label text-[10px] sm:text-[11px] text-warmgray">AVELRIC policies · Last updated July 2026</p>
        <h1 className="mt-3 sm:mt-4 font-display text-[26px] sm:text-[32px] leading-tight md:text-[40px]">{policy.title}</h1>
        <p className="mt-3 sm:mt-5 text-[14px] sm:text-[16px] leading-relaxed text-warmgray">{policy.intro}</p>
      </Reveal>
      <div className="mt-8 sm:mt-12 space-y-8 sm:space-y-10">
        {policy.sections.map((s) => (
          <Reveal key={s.h}>
            <h2 className="font-display text-[18px] sm:text-[21px]">{s.h}</h2>
            <ul className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
              {s.body.map((b, i) => (
                <li key={i} className="text-[13.5px] sm:text-[15px] leading-relaxed text-softblack/80">{b}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10 sm:mt-14 rounded-2xl bg-beige p-5 sm:p-7">
        <p className="text-[13.5px] sm:text-[15px]">
          Questions about this policy? <Link to="/about#contact" className="underline underline-offset-4 font-medium">Contact us</Link> — a person replies, usually within a few hours.
        </p>
      </Reveal>
    </div>
  );
}
