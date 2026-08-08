import { Link } from "react-router-dom";
import { Accordion, Reveal, SectionHeading } from "../../components/common";
import { FAQ_GROUPS } from "../../constants/faq";

export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <SectionHeading
        eyebrow="FAQ"
        title="Everything people ask us"
        sub="Grouped by topic. If your question isn't here, WhatsApp us — that's genuinely the fastest route."
      />

      {/* topic jump chips */}
      <Reveal className="mt-8">
        <div className="flex flex-wrap gap-2.5">
          {FAQ_GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#faq-${g.id}`}
              className="label rounded-full border border-softblack/25 px-4 py-2.5 text-[10.5px] transition-colors hover:border-softblack hover:bg-softblack hover:text-ivory"
            >
              {g.topic}
            </a>
          ))}
        </div>
      </Reveal>

      <div className="mt-12 space-y-14">
        {FAQ_GROUPS.map((g) => (
          <section key={g.id} id={`faq-${g.id}`} className="scroll-mt-28">
            <Reveal>
              <h2 className="font-display text-[24px]">{g.topic}</h2>
              <div className="mt-5">
                <Accordion items={g.items} />
              </div>
            </Reveal>
          </section>
        ))}
      </div>

      <Reveal className="mt-14">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-softblack p-7 text-ivory">
          <div>
            <p className="label text-ivory/60">Still stuck?</p>
            <p className="mt-1.5 font-display text-[19px]">A person answers on WhatsApp — usually within hours.</p>
          </div>
          <Link to="/contact" className="label rounded-full bg-ivory px-7 py-3.5 text-[11px] text-softblack transition-transform hover:scale-[1.03]">
            Contact us
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
