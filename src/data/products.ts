export type Category = "shirts" | "t-shirts" | "jeans" | "trousers" | "jackets";
export type ColorGroup = "black" | "white" | "beige" | "olive" | "blue" | "grey" | "rust";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  compareAt?: number;
  fabric: string;
  fit: string;
  description: string;
  sizes: string[];
  outOfStockSizes?: string[];
  soldOut?: boolean;
  images: string[];
  tags: string[];
  addedAt: string;
  rating: number;
  reviews: number;
  color: { name: string; hex: string; group: ColorGroup };
}

/* Unsplash image helper — sab URLs verified (HTTP 200) */
export const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const COLOR_FILTERS: { group: ColorGroup; name: string; hex: string }[] = [
  { group: "black", name: "Black", hex: "#1A1A1A" },
  { group: "white", name: "White / Ivory", hex: "#F5F2EA" },
  { group: "beige", name: "Beige / Sand", hex: "#D8C9A8" },
  { group: "olive", name: "Olive", hex: "#7A7A5C" },
  { group: "blue", name: "Blue / Indigo", hex: "#40536E" },
  { group: "grey", name: "Grey / Charcoal", hex: "#5A5A5A" },
  { group: "rust", name: "Rust", hex: "#A65E3F" },
];

export const CATEGORIES: { slug: Category; name: string; image: string; blurb: string }[] = [
  { slug: "shirts", name: "Shirts", image: u("photo-1596755094514-f87e34085b2c"), blurb: "Oxfords, linens & everyday poplins" },
  { slug: "t-shirts", name: "T-Shirts", image: u("photo-1521572163474-6864f9cf17ab"), blurb: "Heavyweight, 220–240 GSM staples" },
  { slug: "jeans", name: "Jeans", image: u("photo-1542272604-787c3835535d"), blurb: "Raw & washed premium denim" },
  // { slug: "trousers", name: "Trousers", image: u("photo-1594938298603-c8148c4dae35"), blurb: "Tailored, cargo & chino cuts" },
  // { slug: "jackets", name: "Jackets", image: u("photo-1551028719-00167b16eac5"), blurb: "Harringtons, bikers & coach jackets" },
];

export const PRODUCTS: Product[] = [
  {
    id: "oxford-white",
    name: "Structured Oxford Shirt",
    category: "shirts",
    price: 1899,
    compareAt: 2799,
    fabric: "100% compact cotton, 140 GSM",
    fit: "Regular fit, structured collar",
    description:
      "Sourced from a mill that supplies export houses in Ludhiana. The collar holds its shape after a full day, and the buttons are stitched with a cross-lock so they don't loosen. We compared eleven oxford shirts before selecting this one.",
    sizes: ["S", "M", "L", "XL"],
    images: [u("photo-1598033129183-c4f50c736f10"), u("photo-1596755094514-f87e34085b2c"), u("photo-1563630423918-b58f07336ac9")],
    tags: ["best-find"],
    addedAt: "2026-06-28",
    rating: 4.8,
    reviews: 214,
    color: { name: "Crisp White", hex: "#F5F2EA", group: "white" },
  },
  {
    id: "linen-sand",
    name: "Sand Linen Shirt",
    category: "shirts",
    price: 2199,
    fabric: "55% linen, 45% cotton",
    fit: "Relaxed fit, camp collar",
    description:
      "A summer shirt that doesn't crease into a mess by noon. The cotton blend keeps the linen texture but adds recovery. Pre-washed, so the size you buy is the size it stays.",
    sizes: ["S", "M", "L", "XL"],
    images: [u("photo-1589310243389-96a5483213a8"), u("photo-1520975954732-35dd22299614"), u("photo-1495105787522-5334e3ffa0ef")],
    tags: ["trending", "new"],
    addedAt: "2026-07-01",
    rating: 4.6,
    reviews: 98,
    color: { name: "Sand", hex: "#D8C9A8", group: "beige" },
  },
  {
    id: "flannel-check",
    name: "Brushed Flannel Overshirt",
    category: "shirts",
    price: 2399,
    compareAt: 3199,
    fabric: "Brushed cotton flannel, 210 GSM",
    fit: "Overshirt fit, wear open or buttoned",
    description:
      "Heavy enough to work as a light jacket from October to February in the north. Double-stitched seams, real chest pockets, and a check pattern that's woven — not printed.",
    sizes: ["M", "L", "XL"],
    images: [u("photo-1611312449408-fcece27cdbb7"), u("photo-1608234807905-4466023792f5"), u("photo-1516257984-b1b4d707412e")],
    tags: ["best-value"],
    addedAt: "2026-06-10",
    rating: 4.7,
    reviews: 156,
    color: { name: "Rust Check", hex: "#A65E3F", group: "rust" },
  },
  {
    id: "tee-heavy-black",
    name: "Heavyweight Black Tee",
    category: "t-shirts",
    price: 899,
    compareAt: 1299,
    fabric: "240 GSM combed cotton",
    fit: "Boxy fit, drop shoulder",
    description:
      "The t-shirt we get asked about most. 240 GSM means it drapes instead of clinging, and the collar is ribbed with spandex so it survives a hundred washes. Bio-washed to stop shrinkage.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [u("photo-1617137968427-85924c800a22"), u("photo-1521572163474-6864f9cf17ab"), u("photo-1583743814966-8936f5b7be1a")],
    tags: ["best-find", "best-value"],
    addedAt: "2026-06-20",
    rating: 4.9,
    reviews: 342,
    color: { name: "Jet Black", hex: "#1A1A1A", group: "black" },
  },
  {
    id: "tee-ecru",
    name: "Ecru Pocket Tee",
    category: "t-shirts",
    price: 999,
    fabric: "220 GSM slub cotton",
    fit: "Regular fit",
    description:
      "An off-white that works with everything in this catalogue. The slub weave gives it texture in daylight, and the pocket is bar-tacked at both corners.",
    sizes: ["S", "M", "L", "XL"],
    images: [u("photo-1562157873-818bc0726f68"), u("photo-1603252109303-2751441dd157"), u("photo-1618354691373-d851c5c3a990")],
    tags: ["new"],
    addedAt: "2026-07-02",
    rating: 4.5,
    reviews: 47,
    color: { name: "Ecru", hex: "#EDE6D6", group: "white" },
  },
  {
    id: "tee-olive",
    name: "Faded Olive Tee",
    category: "t-shirts",
    price: 949,
    fabric: "230 GSM garment-dyed cotton",
    fit: "Relaxed fit",
    description:
      "Garment-dyed after stitching, so the fade is even and the seams tone perfectly. The olive is muted — closer to stone than to army.",
    sizes: ["S", "M", "L", "XL"],
    images: [u("photo-1576566588028-4147f3842f27"), u("photo-1550246140-29f40b909e5a"), u("photo-1523381210434-271e8be1f52b")],
    tags: ["trending"],
    addedAt: "2026-06-25",
    rating: 4.6,
    reviews: 121,
    color: { name: "Faded Olive", hex: "#7A7A5C", group: "olive" },
  },
  {
    id: "jeans-indigo",
    name: "Raw Indigo Straight Jeans",
    category: "jeans",
    price: 2499,
    compareAt: 3499,
    fabric: "13.5 oz raw denim, 2% stretch",
    fit: "Straight fit, mid rise",
    description:
      "From the same denim lines that cut for premium export labels. The stretch is minimal — enough for comfort, not enough to bag out at the knees. Chain-stitched hems.",
    sizes: ["30", "32", "34", "36"],
    outOfStockSizes: ["30"],
    images: [u("photo-1542272604-787c3835535d"), u("photo-1541099649105-f69ad21f3246"), u("photo-1584370848010-d7fe6bc767ec")],
    tags: ["best-find", "trending"],
    addedAt: "2026-06-15",
    rating: 4.8,
    reviews: 267,
    color: { name: "Raw Indigo", hex: "#2E3A59", group: "blue" },
  },
  {
    id: "jeans-washed",
    name: "Stone Wash Tapered Jeans",
    category: "jeans",
    price: 2299,
    fabric: "12 oz washed denim",
    fit: "Tapered fit, mid rise",
    description:
      "A wash that looks earned, not painted on. Tapers below the knee so it sits clean over sneakers. YKK zip, riveted stress points.",
    sizes: ["30", "32", "34", "36"],
    images: [u("photo-1624378439575-d8705ad7ae80"), u("photo-1565084888279-aca607ecce0c"), u("photo-1490114538077-0a7f8cb49891")],
    tags: ["new"],
    addedAt: "2026-07-03",
    rating: 4.4,
    reviews: 38,
    color: { name: "Stone Blue", hex: "#7E97AD", group: "blue" },
  },
  {
    id: "trouser-pleat",
    name: "Single-Pleat Wool Trousers",
    category: "trousers",
    price: 2799,
    compareAt: 3999,
    fabric: "Poly-wool suiting, 260 GSM",
    fit: "Tailored fit, single pleat",
    description:
      "Cut like tailoring, priced like ready-to-wear. The single pleat gives room through the thigh, and the fabric has enough weight to fall straight without pressing every week.",
    sizes: ["30", "32", "34", "36"],
    images: [u("photo-1594938298603-c8148c4dae35"), u("photo-1507680434567-5739c80be1ac"), u("photo-1529374255404-311a2a4f1fd9")],
    tags: ["best-find"],
    addedAt: "2026-06-18",
    rating: 4.7,
    reviews: 143,
    color: { name: "Charcoal", hex: "#3C3C3C", group: "grey" },
  },
  {
    id: "trouser-cargo",
    name: "Garment-Dyed Cargo Trousers",
    category: "trousers",
    price: 2199,
    fabric: "Cotton ripstop, garment-dyed",
    fit: "Relaxed straight fit",
    description:
      "Cargos without the bulk. The side pockets are cut flat so they don't balloon, and the ripstop weave takes a beating. Drawcord hem, metal hardware.",
    sizes: ["30", "32", "34", "36"],
    images: [u("photo-1626497764746-6dc36546b388"), u("photo-1473966968600-fa801b869a1a"), u("photo-1487222477894-8943e31ef7b2")],
    tags: ["trending", "best-value"],
    addedAt: "2026-06-22",
    rating: 4.5,
    reviews: 89,
    color: { name: "Khaki", hex: "#8A7B5C", group: "beige" },
  },
  {
    id: "trouser-chino",
    name: "Stone Twill Chinos",
    category: "trousers",
    price: 1899,
    fabric: "Cotton twill, 2% elastane",
    fit: "Slim straight fit",
    description:
      "The pair we point to when someone asks where to start. A neutral stone twill that reads formal with a shirt and easy with a tee. Gripper waistband keeps shirts tucked.",
    sizes: ["30", "32", "34", "36", "38"],
    images: [u("photo-1543076447-215ad9ba6923"), u("photo-1552374196-c4e7ffc6e126"), u("photo-1488161628813-04466f872be2")],
    tags: ["best-value"],
    addedAt: "2026-06-05",
    rating: 4.6,
    reviews: 178,
    color: { name: "Stone", hex: "#C9BFA8", group: "beige" },
  },
  {
    id: "jacket-harrington",
    name: "Ivory Harrington Jacket",
    category: "jackets",
    price: 3299,
    compareAt: 4499,
    fabric: "Cotton-nylon microtwill, water repellent",
    fit: "Classic Harrington fit",
    description:
      "A light jacket for the eight months a year when leather is too much. Water-repellent shell, tartan-lined body, ribbed hem and cuffs. The zip runs smooth after a hundred cycles — we counted.",
    sizes: ["M", "L", "XL"],
    images: [u("photo-1591047139829-d91aecb6caea"), u("photo-1519238263530-99bdd11df2ea"), u("photo-1441984904996-e0b6ba687e04")],
    tags: ["best-find", "new"],
    addedAt: "2026-06-30",
    rating: 4.9,
    reviews: 76,
    color: { name: "Ivory", hex: "#F0EBE0", group: "white" },
  },
  {
    id: "jacket-pu",
    name: "Matte Biker Jacket",
    category: "jackets",
    price: 3799,
    fabric: "Matte PU, viscose lining",
    fit: "Slim fit, cropped length",
    description:
      "The jacket from our launch shoot. Matte finish — no plastic shine — with a lining that doesn't stick in humidity. Hardware is gunmetal, not chrome.",
    sizes: ["M", "L", "XL"],
    soldOut: true,
    images: [u("photo-1551028719-00167b16eac5"), u("photo-1548126032-079a0fb0099d"), u("photo-1531891437562-4301cf35b7e4")],
    tags: ["trending"],
    addedAt: "2026-06-12",
    rating: 4.7,
    reviews: 192,
    color: { name: "Matte Black", hex: "#1F1F1F", group: "black" },
  },
  {
    id: "jacket-coach",
    name: "Beige Coach Jacket",
    category: "jackets",
    price: 2599,
    fabric: "Cotton-poly poplin",
    fit: "Relaxed fit",
    description:
      "Snap buttons, clean back, no logos. The poplin is tight-woven enough to cut wind on a bike. Sits well over hoodies without looking padded.",
    sizes: ["M", "L", "XL", "XXL"],
    images: [u("photo-1593030761757-71fae45fa0e7"), u("photo-1516826957135-700dedea698c"), u("photo-1445205170230-053b83016050")],
    tags: ["best-value", "new"],
    addedAt: "2026-07-04",
    rating: 4.4,
    reviews: 31,
    color: { name: "Beige", hex: "#D6C7A8", group: "beige" },
  },
  {
    id: "shirt-stripe",
    name: "Butcher Stripe Shirt",
    category: "shirts",
    price: 1799,
    fabric: "Yarn-dyed cotton poplin",
    fit: "Regular fit",
    description:
      "Yarn-dyed, so the stripe is in the weave and won't fade into a blur. A working-wardrobe shirt that holds up to daily ironing.",
    sizes: ["S", "M", "L", "XL"],
    images: [u("photo-1602810318383-e386cc2a3ccf"), u("photo-1492447166138-50c3889fccb1"), u("photo-1441986300917-64674bd600d8")],
    tags: ["best-value"],
    addedAt: "2026-06-08",
    rating: 4.5,
    reviews: 104,
    color: { name: "Blue Stripe", hex: "#9FB4CC", group: "blue" },
  },
  {
    id: "tee-graphic",
    name: "Minimal Graphic Tee",
    category: "t-shirts",
    price: 1099,
    fabric: "230 GSM combed cotton",
    fit: "Boxy fit",
    description:
      "One small chest print, high-density ink that won't crack. We rejected fourteen graphic tees for loud prints before finding one this quiet.",
    sizes: ["S", "M", "L", "XL"],
    images: [u("photo-1503341504253-dff4815485f1"), u("photo-1610652492500-ded49ceeb378"), u("photo-1550995694-3f5f4a7e1bd2")],
    tags: ["trending", "new"],
    addedAt: "2026-07-05",
    rating: 4.3,
    reviews: 58,
    color: { name: "Off-White", hex: "#EFEAE0", group: "white" },
  },
];

