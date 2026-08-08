import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnnouncementBar, Footer, Navbar } from "../components/layout";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* Site-wide chrome: announcement bar + navbar upar, footer neeche */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
