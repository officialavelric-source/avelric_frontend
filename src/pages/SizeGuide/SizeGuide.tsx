import { Reveal, SectionHeading } from "../../components/common";
import { SIZE_GUIDE_BOTTOMS, SIZE_GUIDE_TOPS } from "../../constants/sizeGuide";

const TABLES = [
  { h: "Tops — shirts, tees, jackets", cols: ["Size", "Chest", "Length", "Shoulder"], rows: SIZE_GUIDE_TOPS },
  { h: "Bottoms — jeans, trousers", cols: ["Size", "Waist", "Length", "Rise"], rows: SIZE_GUIDE_BOTTOMS },
];

export default function SizeGuide() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <SectionHeading
        eyebrow="Size guide"
        title="We measure garments, not bodies"
        sub="Lay a similar garment you own flat, measure it, and compare with the tables below. All figures in inches."
      />
      {TABLES.map((t) => (
        <Reveal key={t.h} className="mt-12">
          <h2 className="font-display text-[22px]">{t.h}</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-softblack/10">
            <table className="w-full text-left text-[14.5px]">
              <thead>
                <tr className="bg-beige">
                  {t.cols.map((c) => (
                    <th key={c} className="label px-5 py-4 text-[10.5px] font-medium text-warmgray">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-softblack/10">
                {t.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((cell, ci) => (
                      <td key={ci} className={`px-5 py-3.5 ${ci === 0 ? "font-medium" : "text-softblack/80"}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      ))}
      <p className="mt-10 text-[14.5px] leading-relaxed text-warmgray">
        Between two sizes? For boxy and relaxed fits, take the smaller one; for regular and slim fits, the larger.
        Or message us on WhatsApp with your measurements — we'll tell you exactly which size to order.
      </p>
    </div>
  );
}
