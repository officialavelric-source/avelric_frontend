import { Navigate } from "react-router-dom";

/**
 * Contact component has been integrated directly into the About Us page per user request.
 * Automatically redirects to /about#contact.
 */
export default function Contact() {
  return <Navigate to="/about#contact" replace />;
}
