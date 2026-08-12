import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Wishlist from "../pages/Wishlist/Wishlist";
import Collections from "../pages/Collections/Collections";
import NewArrivals from "../pages/NewArrivals/NewArrivals";
import Reviews from "../pages/Reviews/Reviews";
import About from "../pages/About/About";
import HowWeCurate from "../pages/HowWeCurate/HowWeCurate";
import Contact from "../pages/Contact/Contact";
import FAQ from "../pages/FAQ/FAQ";
import SizeGuide from "../pages/SizeGuide/SizeGuide";
import Account from "../pages/Account/Account";
import AuthCallback from "../pages/Account/AuthCallback";
import Policy from "../pages/Policy/Policy";
import NotFound from "../pages/NotFound/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/new-arrivals" element={<NewArrivals />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/category/:slug" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />
      <Route path="/account/callback" element={<AuthCallback />} />
      <Route path="/about" element={<About />} />
      <Route path="/how-we-curate" element={<HowWeCurate />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/size-guide" element={<SizeGuide />} />
      <Route path="/policy/:slug" element={<Policy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
