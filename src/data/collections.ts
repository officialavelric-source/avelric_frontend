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
    slug: "best-sellers",
    title: "The Best Sellers",
    eyebrow: "Most re-ordered",
    story:
      "The pieces our customers come back for — highest rated, most re-ordered, and restocked every time a batch sells through. If you're new here, start with one of these.",
    image: u("photo-1441986300917-64674bd600d8", 1600),
    productIds: ["tee-heavy-black", "oxford-white", "jeans-indigo", "jacket-harrington"],
  },
  {
    slug: "summer-edit",
    title: "The Summer Edit",
    eyebrow: "Light fabrics, honest weights",
    story:
      "Linen that recovers, slub cotton that breathes, and colours that survive the Indian sun. Everything in this edit is pre-washed and picked for 35°C afternoons.",
    image: u("photo-1523381210434-271e8be1f52b", 1600),
    productIds: ["linen-sand", "tee-ecru", "tee-olive", "trouser-chino"],
  },
  {
    slug: "denim-story",
    title: "The Denim Story",
    eyebrow: "Raw & washed",
    story:
      "From the same denim lines that cut for premium export labels. One raw pair that ages with you, one wash that looks earned on day one — both chain-stitched, both riveted.",
    image: u("photo-1565084888279-aca607ecce0c", 1600),
    productIds: ["jeans-indigo", "jeans-washed", "tee-heavy-black", "shirt-stripe"],
  },
  {
    slug: "layering-edit",
    title: "The Layering Edit",
    eyebrow: "October to February",
    story:
      "The north Indian winter wardrobe: a flannel that works as a jacket, a harrington for eight months of the year, and outerwear with hardware that outlasts the season.",
    image: u("photo-1548126032-079a0fb0099d", 1600),
    productIds: ["flannel-check", "jacket-harrington", "jacket-pu", "jacket-coach"],
  },
];

export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
