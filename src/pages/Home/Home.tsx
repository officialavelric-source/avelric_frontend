import { byTag } from "../../services/productService";
import {
  Hero,
  TrustLine,
  USPStrip,
  ProductRow,
  Categories,
  Lookbook,
  Bestsellers,
  Instagram,
  NewsletterBand,
} from "../../components/home";

/* Homepage section order is deliberate — one carousel, one grid, one
   card-pair, one carousel again, never two of the same layout back
   to back. Keep it to ~4-5 viewport scrolls; if a section doesn't
   show product or lead to product, it belongs on its own page instead. */
export default function Home() {
  return (
    <>
      <Hero />
      {/* <TrustLine /> */}
      {/* <USPStrip /> */}
      <Categories />
      <ProductRow
        eyebrow="New arrivals"
        title="Just listed"
        sub="This week's arrivals — reviewed twice before they were allowed to ship."
        items={byTag("new")}
        cta="View all"
        ctaTo="/new-arrivals"
        layout="scroll"
      />
      <Lookbook />
      <Bestsellers />
      <Instagram />
      {/* <NewsletterBand /> */}
    </>
  );
}
