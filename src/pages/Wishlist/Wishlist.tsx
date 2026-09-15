import { Navigate } from "react-router-dom";

/**
 * Wishlist component has been removed per user request.
 * Automatically redirects to /shop.
 */
export default function Wishlist() {
  return <Navigate to="/shop" replace />;
}
