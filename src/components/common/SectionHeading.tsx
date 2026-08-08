import Reveal from "./Reveal";

export default function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal>
      <p className="label text-warmgray">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[28px] leading-tight md:text-[34px]">{title}</h2>
      {sub && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-warmgray">{sub}</p>}
    </Reveal>
  );
}
