# AVELRIC — Premium Curated Fashion

Frontend-only build: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
npm run preview    # preview the production build
```

## Structure
- `src/data/products.ts` — single typed product catalogue (edit products here)
- `src/context/CartContext.tsx` — cart state, persisted to localStorage
- `src/components/` — Header (announcement bar, navbar, search overlay), Footer, shared (ProductCard, MarqueeTicker, StitchDivider, Reveal, Accordion)
- `src/pages/` — Home, Shop (+ /category/:slug), Product, Cart, Checkout, About, HowWeCurate, Contact, FAQ, SizeGuide, Policy (/policy/shipping|returns|refund|privacy|terms)
- `tailwind.config.ts` — brand tokens: ivory `#FAF9F6`, beige `#F1EDE6`, warmgray `#8A8578`, softblack `#1A1A1A`; fonts: Playfair Display (display) + Inter (body)

## Homepage flow
Announcement bar → Navbar → Dark hero (3D tilt card) → Marquee ticker → Why shop from us → Weekly best finds → Categories → Trending → Best value → New arrivals → Banner → Reviews → Instagram → FAQ → Footer

## Notes
- Placeholder images via picsum.photos — replace with real photography (keep 3:4 ratio for products).
- Checkout is a branded placeholder; wire Shopify headless later.
- Respects `prefers-reduced-motion`; keyboard-accessible search (Esc closes) and focus states throughout.
