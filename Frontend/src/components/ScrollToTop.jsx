import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // On route change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    // Also on first mount (refresh)
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => window.scrollTo(0, 0), 100); // extra guarantee
  }, []);

  return null;
};

export default ScrollToTop;
