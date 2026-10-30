import { useEffect, useRef } from "react";
import { BrowserRouter, HashRouter, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

/* The live site uses real paths (/noticias/…). The Claude preview is built
 * with relative paths and can't serve those, so it uses hash links (#/noticias). */
const RELATIVE = import.meta.env.BASE_URL === "./";

export function Router({ children }) {
  return RELATIVE ? (
    <HashRouter>{children}</HashRouter>
  ) : (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>{children}</BrowserRouter>
  );
}

/* New page: start at the top. Link to a section (/#listen): scroll to it
 * once the page has drawn. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const lastPath = useRef(pathname);
  useEffect(() => {
    const samePage = lastPath.current === pathname;
    lastPath.current = pathname;
    if (!hash) {
      if (!samePage) window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    // coming from another page: jump straight there (and again once photos
    // above have loaded and moved things); on the same page: glide
    const behavior = samePage ? "smooth" : "instant";
    let tries = 0;
    const timers = [];
    const go = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView({ behavior, block: "start" });
        if (!samePage) timers.push(setTimeout(() => el.scrollIntoView({ behavior: "instant", block: "start" }), 450));
      } else if (tries++ < 20) timers.push(setTimeout(go, 50));
    };
    go();
    return () => timers.forEach(clearTimeout);
  }, [pathname, hash]);
  return null;
}

export const MotionLink = motion(Link);
export { Link };
