import { u } from "./products";

/* Customer reviews — homepage section aur /reviews page dono
   isi list se read karte hain. Backend aane par API se replace. */

export interface Review {
  n: string;
  c: string;
  avatar: string;
  rating: number;
  productId: string;
  date: string;
  q: string;
}

export const REVIEWS: Review[] = [
  {
    n: "Arjun Mehta",
    c: "Chandigarh",
    avatar: u("photo-1507003211169-0a1dd7228f2d", 200),
    rating: 5,
    productId: "tee-heavy-black",
    date: "2026-07-02",
    q: "Ordered the heavyweight tee expecting the usual thin online-store cotton. It's genuinely 240 GSM — you can feel the difference the moment you pick it up.",
  },
  {
    n: "Karan Bajwa",
    c: "Mohali",
    avatar: u("photo-1492562080023-ab3db95bfbce", 200),
    rating: 5,
    productId: "oxford-white",
    date: "2026-06-30",
    q: "The oxford shirt fits like something twice the price. What sold me is the product page told me the exact GSM and fit before I bought.",
  },
  {
    n: "Rohan Kapoor",
    c: "Panchkula",
    avatar: u("photo-1500648767791-00dcc994a43e", 200),
    rating: 4.5,
    productId: "jeans-indigo",
    date: "2026-06-27",
    q: "Exchanged a size on WhatsApp in one message. No forms, no call centre. That alone puts them above every marketplace I've used.",
  },
  {
    n: "Simran Gill",
    c: "Ludhiana",
    avatar: u("photo-1494790108377-be9c29b29330", 200),
    rating: 5,
    productId: "jacket-harrington",
    date: "2026-07-05",
    q: "Bought the harrington for my brother. The packaging alone felt like a premium label — and the jacket has survived a month of daily wear.",
  },
  {
    n: "Vikram Sethi",
    c: "New Delhi",
    avatar: u("photo-1506794778202-cad84cf45f1d", 200),
    rating: 4.5,
    productId: "trouser-chino",
    date: "2026-06-22",
    q: "The chinos arrived exactly as measured on the size chart — down to the half inch. First online order I haven't had to alter.",
  },
  {
    n: "Ananya Rao",
    c: "Gurugram",
    avatar: u("photo-1438761681033-6461ffad8d80", 200),
    rating: 5,
    productId: "linen-sand",
    date: "2026-07-06",
    q: "Got the linen shirt for my husband. Pre-washed really means pre-washed — three washes in and it still fits the same. Rare honesty.",
  },
  {
    n: "Devansh Khanna",
    c: "Jalandhar",
    avatar: u("photo-1519085360753-af0119f7cbe7", 200),
    rating: 4,
    productId: "flannel-check",
    date: "2026-06-18",
    q: "The flannel is heavier than any I've bought online — genuinely works as a light jacket. Docking one star only because my first-choice colour sold out in a day.",
  },
  {
    n: "Harleen Kaur",
    c: "Amritsar",
    avatar: u("photo-1544005313-94ddf0286df2", 200),
    rating: 5,
    productId: "tee-graphic",
    date: "2026-07-07",
    q: "Ordered the graphic tee as a gift. The print is subtle in a good way, and the ink hasn't cracked after washing. Will be back for the black tee everyone talks about.",
  },
  {
    n: "Nikhil Verma",
    c: "Noida",
    avatar: u("photo-1479064555552-3ef4979f8908", 200),
    rating: 4.5,
    productId: "jacket-pu",
    date: "2026-06-25",
    q: "Matte finish is exactly as photographed — zero plastic shine. The lining doesn't stick even in Delhi humidity. Hardware feels like it'll outlast the jacket.",
  },
  {
    n: "Sahil Chaudhary",
    c: "Zirakpur",
    avatar: u("photo-1580657018950-c7f7d6a6d990", 200),
    rating: 4,
    productId: "trouser-cargo",
    date: "2026-06-20",
    q: "Cargos that don't balloon at the pockets — finally. Fabric has already taken two bike trips without fraying. Wish there were more colours.",
  },
];

export const AVG_RATING = (
  REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length
).toFixed(1);
