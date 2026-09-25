import Reveal from "./Reveal";

export default function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal>
      <p className="label text-[10px] sm:text-[11px] text-warmgray">{eyebrow}</p>
      <h2 className="mt-2 sm:mt-3 font-display text-[24px] sm:text-[28px] leading-tight md:text-[34px]">{title}</h2>
      {sub && <p className="mt-2.5 sm:mt-3 max-w-xl text-[13.5px] sm:text-[15px] leading-relaxed text-warmgray">{sub}</p>}
    </Reveal>
  );
}
