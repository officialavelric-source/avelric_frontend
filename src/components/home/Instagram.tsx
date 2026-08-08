import { Reveal, SectionHeading } from "../common";

export default function Instagram() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Instagram" title="@avelric" sub="Fit checks, drop previews, and what didn't make the cut." />
          <Reveal>
            <a href="https://instagram.com" className="label border-b border-softblack/30 pb-1 text-[11px] hover:border-softblack">Follow →</a>
          </Reveal>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-3 md:grid-cols-6">
          {["avig1", "avig2", "avig3", "avig4", "avig5", "avig6"].map((s, i) => (
            <Reveal key={s} delay={i * 0.05}>
              <a href="https://instagram.com" className="group block overflow-hidden rounded-xl">
                <img src={`https://picsum.photos/seed/${s}/500/500`} alt={`AVELRIC on Instagram, post ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
