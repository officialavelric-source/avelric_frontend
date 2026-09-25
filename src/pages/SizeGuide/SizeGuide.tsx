import { Reveal, SectionHeading } from "../../components/common";
import { SIZE_GUIDE_BOTTOMS, SIZE_GUIDE_TOPS } from "../../constants/sizeGuide";

const TABLES = [
  { h: "Shirts", cols: ["Size", "Chest", "Length", "Shoulder"], rows: SIZE_GUIDE_TOPS },
  { h: "Jeans", cols: ["Size", "Waist", "Length", "Rise"], rows: SIZE_GUIDE_BOTTOMS },
];

export default function SizeGuide() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16 md:py-24">
      <SectionHeading
        eyebrow="Size guide"
        title="We measure garments, not bodies"
        sub="Lay a similar garment you own flat, measure it, and compare with the tables below. All figures in inches."
      />
      {TABLES.map((t) => (
        <Reveal key={t.h} className="mt-10 sm:mt-12">
          <h2 className="font-display text-[20px] sm:text-[22px]">{t.h}</h2>
          <div className="mt-4 sm:mt-5 overflow-x-auto rounded-2xl border border-softblack/10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[300px] text-left text-[13.5px] sm:text-[14.5px]">
              <thead>
                <tr className="bg-beige">
                  {t.cols.map((c) => (
                    <th key={c} className="label px-3.5 sm:px-5 py-3 sm:py-4 text-[10px] sm:text-[10.5px] font-medium text-warmgray">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-softblack/10">
                {t.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((cell, ci) => (
                      <td key={ci} className={`px-3.5 sm:px-5 py-3 sm:py-3.5 ${ci === 0 ? "font-medium" : "text-softblack/80"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      ))}
      <p className="mt-8 sm:mt-10 text-[13.5px] sm:text-[14.5px] leading-relaxed text-warmgray break-words">
        AVELRIC shirts are cut exclusively in sizes M, L, and XL. Jeans are cut in sizes 30, 32, and 34. Between two sizes? For relaxed fits, take the smaller one; for regular fits, the larger. Or email us at officialavelric@gmail.com with your measurements — we'll help you pick the perfect fit.
      </p>
    </div>
  );
}
