import { useParams, Link } from "react-router-dom";
import { Reveal } from "../../components/common";
import { POLICIES } from "../../constants/policies";

export default function Policy() {
  const { slug } = useParams<{ slug: string }>();
  const policy = slug ? POLICIES[slug] : undefined;

  if (!policy)
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl">Page not found</h1>
        <Link to="/" className="label mt-8 inline-block rounded-full bg-softblack px-7 py-3.5 text-[11px] text-ivory">Back home</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Reveal>
        <p className="label text-warmgray">AVELRIC policies · Last updated July 2026</p>
        <h1 className="mt-4 font-display text-[32px] leading-tight md:text-[40px]">{policy.title}</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-warmgray">{policy.intro}</p>
      </Reveal>
      <div className="mt-12 space-y-10">
        {policy.sections.map((s) => (
          <Reveal key={s.h}>
            <h2 className="font-display text-[21px]">{s.h}</h2>
            <ul className="mt-4 space-y-3">
              {s.body.map((b, i) => (
                <li key={i} className="text-[15px] leading-relaxed text-softblack/80">{b}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-14 rounded-2xl bg-beige p-7">
        <p className="text-[15px]">
          Questions about this policy? <Link to="/contact" className="underline underline-offset-4">Contact us</Link> — a person replies, usually within a few hours.
        </p>
      </Reveal>
    </div>
  );
}
