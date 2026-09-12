import { u } from "./products";

/* Curated, theme-based collections — New Arrivals se alag.
   Har collection ki apni banner image + story hai. */

export interface Collection {
  slug: string;
  title: string;
  eyebrow: string;
  story: string;
  image: string;
  productIds: string[];
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "denim-story",
    title: "The Denim Story",
    eyebrow: "Raw & washed",
    story:
      "From the same denim lines that cut for premium export labels. Vintage washes, textured indigo, and relaxed cuts — chain-stitched and riveted.",
    image: u("photo-1542272604-787c3835535d", 1600),
    productIds: [
      "men-s-relaxed-fit-washed-blue-jeans-vintage-fade-denim",
      "men-s-relaxed-fit-washed-light-blue-jeans-textured-vintage-denim",
      "men-s-relaxed-fit-light-blue-washed-jeans-vintage-denim",
      "men-s-relaxed-fit-off-white-jeans-classic-straight-leg-denim",
      "men-s-relaxed-fit-charcoal-black-textured-jeans",
      "ice-blue-loose-fit-jeans-vintage-wash-denim",
    ],
  },
  {
    slug: "shirts-edit",
    title: "The Shirts Edit",
    eyebrow: "Artisanal & Resort",
    story:
      "Hand-picked casuals, camp collars, textured floral prints, and structured button-downs designed for relaxed elegance.",
    image: u("photo-1596755094514-f87e34085b2c", 1600),
    productIds: [
      "black-white-abstract-print-casual-shirt",
      "dusty-rose-button-down-casual-shirt-for-men",
      "ivory-button-down-casual-shirt-for-men",
      "ivory-floral-print-textured-casual-shirt-for-men",
      "men-s-beige-resort-print-short-sleeve-shirt",
      "men-s-ivory-floral-embroidered-short-sleeve-shirt",
      "men-s-cream-floral-embroidered-short-sleeve-shirt",
      "men-s-white-pinstripe-utility-shirt",
    ],
  },
  {
    slug: "best-sellers",
    title: "The Best Sellers",
    eyebrow: "Most re-ordered",
    story:
      "The pieces our customers come back for — highest rated, most re-ordered, and restocked every time a batch sells through. If you're new here, start with one of these.",
    image: u("photo-1441986300917-64674bd600d8", 1600),
    productIds: [
      "men-s-relaxed-fit-washed-blue-jeans-vintage-fade-denim",
      "ivory-floral-print-textured-casual-shirt-for-men",
      "men-s-relaxed-fit-charcoal-black-textured-jeans",
      "men-s-beige-resort-print-short-sleeve-shirt",
    ],
  },
  {
    slug: "summer-edit",
    title: "The Summer Edit",
    eyebrow: "Light fabrics, honest weights",
    story:
      "Linen that recovers, compact cotton that breathes, and colours that survive the Indian sun. Everything in this edit is pre-washed and picked for everyday comfort.",
    image: u("photo-1523381210434-271e8be1f52b", 1600),
    productIds: [
      "ivory-button-down-casual-shirt-for-men",
      "men-s-cream-floral-embroidered-short-sleeve-shirt",
      "ice-blue-loose-fit-jeans-vintage-wash-denim",
      "men-s-relaxed-fit-off-white-jeans-classic-straight-leg-denim",
    ],
  },
];

export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
