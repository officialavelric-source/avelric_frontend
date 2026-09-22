import { Navigate, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { getReturnToStoreUrl } from "../utils/navigation";
import Home from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import NewArrivals from "../pages/NewArrivals/NewArrivals";
import Collections from "../pages/Collections/Collections";
import Reviews from "../pages/Reviews/Reviews";
import About from "../pages/About/About";
import HowWeCurate from "../pages/HowWeCurate/HowWeCurate";
import FAQ from "../pages/FAQ/FAQ";
import SizeGuide from "../pages/SizeGuide/SizeGuide";
import Account from "../pages/Account/Account";
import OrdersPage from "../pages/Account/OrdersPage";
import OrderDetails from "../pages/Account/OrderDetails";
import AuthCallback from "../pages/Account/AuthCallback";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Policy from "../pages/Policy/Policy";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import NotFound from "../pages/NotFound/NotFound";

/**
 * Redirect handler for legacy Shopify pages (/pages/*)
 */
function ShopifyPageRedirect() {
  const { slug } = useParams<{ slug: string }>();
  switch (slug?.toLowerCase()) {
    case "faq":
      return <Navigate to="/faq" replace />;
    case "about":
    case "about-us":
      return <Navigate to="/about" replace />;
    case "size-guide":
    case "size-chart":
      return <Navigate to="/size-guide" replace />;
    case "contact":
    case "contact-us":
      return <Navigate to="/about#contact" replace />;
    default:
      return <Navigate to="/shop" replace />;
  }
}

/**
 * Handles explicit "Return to store" and "Continue shopping" requests.
 * If a productHandle parameter is passed, safely redirects back to that product's details page.
 * Otherwise, safely returns the customer to the canonical Clothing / Shop page (/shop).
 */
function ReturnToStoreRedirect() {
  const [searchParams] = useSearchParams();
  const productHandle =
    searchParams.get("product") ||
    searchParams.get("handle") ||
    searchParams.get("productHandle") ||
    searchParams.get("id") ||
    searchParams.get("return_to");

  const targetUrl = getReturnToStoreUrl({ productHandle });
  return <Navigate to={targetUrl} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/new-arrivals" element={<NewArrivals />} />

      {/* Collections & Clothing Aliases */}
      <Route path="/collections" element={<Collections />} />
      <Route path="/collections/:slug" element={<Shop />} />
      <Route path="/category/:slug" element={<Shop />} />
      <Route path="/clothing" element={<Navigate to="/shop" replace />} />
      <Route path="/catalog" element={<Navigate to="/shop" replace />} />
      <Route path="/all" element={<Navigate to="/shop" replace />} />
      <Route path="/search" element={<Shop />} />

      {/* Return to Store & Continue Shopping handlers */}
      <Route path="/return-to-store" element={<ReturnToStoreRedirect />} />
      <Route path="/continue-shopping" element={<ReturnToStoreRedirect />} />
      <Route path="/return" element={<ReturnToStoreRedirect />} />

      {/* Product Details (both singular /product/:id and Shopify standard plural /products/:id) */}
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/products" element={<Navigate to="/shop" replace />} />
      <Route path="/product" element={<Navigate to="/shop" replace />} />

      {/* Cart & Checkout */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Navigate to="/shop" replace />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/order-confirmation" element={<OrderSuccess />} />
      <Route path="/thank-you" element={<OrderSuccess />} />

      {/* Customer Account */}
      <Route path="/account" element={<Account />} />
      <Route path="/account/login" element={<Navigate to="/account" replace />} />
      <Route
        path="/account/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />
      <Route path="/account/callback" element={<AuthCallback />} />

      {/* Editorial & Informational */}
      <Route path="/about" element={<About />} />
      <Route path="/how-we-curate" element={<HowWeCurate />} />
      <Route path="/contact" element={<Navigate to="/about#contact" replace />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/size-guide" element={<SizeGuide />} />

      {/* Policies (both singular /policy/:slug and Shopify standard plural /policies/:slug) */}
      <Route path="/policy/:slug" element={<Policy />} />
      <Route path="/policies/:slug" element={<Policy />} />

      {/* Shopify Page Redirects */}
      <Route path="/pages/:slug" element={<ShopifyPageRedirect />} />

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
