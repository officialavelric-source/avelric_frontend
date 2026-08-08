import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { NAV_LINKS } from "../../constants/navigation";
import { NAV_H } from "../../constants/layout";
import Icon from "../common/Icon";
import MiniCart from "../cart/MiniCart";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const reduce = useReducedMotion();
  const { count } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [miniCart, setMiniCart] = useState(false);

  /* route badalte hi mini-cart band */
  useEffect(() => setMiniCart(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Background hamesha transparent — sirf TEXT COLOR page ke hisaab se:
     home ke top par (dark video hero ke upar) → light text,
     baaki har page (light ivory/beige) aur scroll ke baad → dark text.
     Scroll par colorless backdrop-blur — section ke color se blend hota hai. */
  const isHome = pathname === "/";
  const dark = !isHome || scrolled;

  const linkTone = dark ? "text-softblack/70 hover:text-softblack" : "text-ivory/75 hover:text-ivory";
  const linkActive = dark ? "text-softblack" : "text-ivory";
  const underline = dark ? "bg-softblack" : "bg-ivory";
  const badge = dark ? "bg-softblack text-ivory" : "bg-ivory text-softblack";
  const hint = dark ? "text-softblack/40" : "text-ivory/50";

  return (
    <motion.header
      initial={reduce ? {} : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-40 bg-transparent transition-colors duration-500 ${
        dark ? "text-softblack" : "text-ivory"
      } ${scrolled ? "backdrop-blur-md" : ""}`}
      style={{ height: NAV_H }}
    >
      <div className="mx-auto grid h-full max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
        {/* left: desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((n) => (
            <NavLink
              key={n.label}
              to={n.to}
              className={({ isActive }) =>
                `group label relative text-[10.5px] transition-colors ${isActive ? linkActive : linkTone}`
              }
            >
              {n.label}
              <span aria-hidden="true" className={`absolute -bottom-1.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full ${underline}`} />
            </NavLink>
          ))}
        </nav>

        {/* mobile hamburger */}
        <button className="justify-self-start p-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
          <Icon label="Menu" path="M4 7h16M4 12h16M4 17h16" />
        </button>

        {/* center: wordmark */}
        <Link to="/" className="justify-self-center font-display text-[24px] tracking-[0.32em] md:text-[28px]" aria-label="AVELRIC home">
          AVELRIC
        </Link>

        {/* right: icons */}
        <div className="flex items-center justify-self-end gap-1 md:gap-2">
          <button
            onClick={() => navigate("/shop?focus=search")}
            className="flex items-center gap-2 p-2 transition-opacity hover:opacity-60"
            aria-label="Search the collection"
          >
            <Icon label="Search" path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />
            <span className={`label hidden text-[9.5px] xl:block ${hint}`}>Search</span>
          </button>

          <Link to="/wishlist" className="hidden p-2 transition-opacity hover:opacity-60 sm:block" aria-label="Wishlist">
            <Icon label="Wishlist" path="M12 20.5s-7.5-4.7-9.6-9.2C.9 8 2.7 4.5 6.2 4.5c2 0 3.5 1.1 4.3 2.6L12 8.6l1.5-1.5c.8-1.5 2.3-2.6 4.3-2.6 3.5 0 5.3 3.5 3.8 6.8-2.1 4.5-9.6 9.2-9.6 9.2Z" />
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setMiniCart(true)}
            onMouseLeave={() => setMiniCart(false)}
          >
            <Link to="/cart" className="relative block p-2 transition-opacity hover:opacity-60" aria-label={`Cart, ${count} items`}>
              <Icon label="Cart" path="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" />
              <span className={`absolute -right-0.5 top-0 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[3px] text-[9px] font-semibold transition-colors duration-500 ${badge}`}>
                {count}
              </span>
            </Link>
            <MiniCart open={miniCart} />
          </div>

          <Link to="/account" className="hidden items-center gap-2 p-2 transition-opacity hover:opacity-60 md:flex" aria-label="Account">
            <Icon label="Account" path="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 10a8 8 0 0 1 16 0" />
            <span className="label text-[10px]">Account</span>
          </Link>
        </div>
      </div>

      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </motion.header>
  );
}
