import { Link } from "react-router-dom";
import { Accordion, Reveal, SectionHeading } from "../../components/common";
import { FAQ_GROUPS } from "../../constants/faq";

export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16 md:py-24">
      <SectionHeading
        eyebrow="FAQ"
        title="Everything people ask us"
        sub="Grouped by topic. If your question isn't here, mail us at officialavelric@gmail.com — we reply within a few hours."
      />

      {/* topic jump chips */}
      <Reveal className="mt-6 sm:mt-8">
        <div className="flex flex-wrap gap-2">
          {FAQ_GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#faq-${g.id}`}
              className="label rounded-full border border-softblack/25 px-3.5 py-2 text-[10px] sm:text-[10.5px] transition-colors hover:border-softblack hover:bg-softblack hover:text-ivory"
            >
              {g.topic}
            </a>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 sm:mt-12 space-y-10 sm:space-y-14">
        {FAQ_GROUPS.map((g) => (
          <section key={g.id} id={`faq-${g.id}`} className="scroll-mt-28">
            <Reveal>
              <h2 className="font-display text-[20px] sm:text-[24px]">{g.topic}</h2>
              <div className="mt-4 sm:mt-5">
                <Accordion items={g.items} />
              </div>
            </Reveal>
          </section>
        ))}
      </div>

      <Reveal className="mt-10 sm:mt-14">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 rounded-2xl bg-softblack p-5 sm:p-7 text-ivory">
          <div>
            <p className="label text-[10px] sm:text-[11px] text-ivory/60">Still stuck?</p>
            <p className="mt-1 font-display text-[16px] sm:text-[19px] break-words">Mail us at officialavelric@gmail.com — a person answers within hours.</p>
          </div>
          <a href="mailto:officialavelric@gmail.com" className="label shrink-0 text-center rounded-full bg-ivory px-7 py-3.5 text-[11px] text-softblack transition-transform hover:scale-[1.03]">
            Email us
          </a>
        </div>
      </Reveal>
    </div>
  );
}
