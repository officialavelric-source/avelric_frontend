import { Navigate } from "react-router-dom";

/**
 * Collections component has been removed per user request.
 * Automatically redirects to /shop.
 */
export default function Collections() {
  return <Navigate to="/shop" replace />;
}
