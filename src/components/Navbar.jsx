import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Upload } from "lucide-react";
import { NAV } from "../lib/data.js";
import { Sheet } from "./ui/Sheet.jsx";
import TopStrip from "./TopStrip.jsx";
import { Link } from "../lib/router.jsx";
import { useLocation } from "react-router-dom";
import { LangToggle, useLang } from "../lib/i18n.jsx";

export function Logo({ className = "" }) {
  const { lang } = useLang();
  return (
    <span className={`inline-flex items-baseline gap-1.5 whitespace-nowrap font-display text-[17px] font-semibold min-[400px]:text-[19px] tracking-[-0.01em] sm:text-[23px] ${className}`}>
      {lang === "es" ? (
        <>La Voz <span className="font-normal italic text-sun">del</span> Desierto</>
      ) : (
        <>Voice <span className="font-normal italic text-sun">of the</span> Desert</>
      )}
    </span>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  // only real pages light up; section links on the home page stay plain
  // only the home page has a photo behind the menu; other pages get a solid bar
  const onHome = pathname === "/";
  const isActive = href => !href.includes("#") && pathname.startsWith(href);
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? "border-b border-bone/10 bg-earth/80 backdrop-blur-lg" : onHome ? "border-b border-transparent" : "border-b border-bone/10 bg-earth"
        }`}
      >
        <AnimatePresence initial={false}>
          {!scrolled && (
            <motion.div
              key="strip"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <TopStrip />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="container-x flex h-[72px] items-center gap-6">
          <Link to="/" aria-label={t("Voice of the Desert, home")} className="text-cream">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
            <ul className="flex gap-1">
              {NAV.map(item => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`nav-link inline-flex min-h-[44px] items-center px-4 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:text-gold ${isActive(item.href) ? "text-gold" : "text-bone"}`}
                  >
                    {t(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LangToggle className="ml-auto lg:ml-0" />
          <Link to="/#upload" className="pill-ghost hidden bg-earth/35 backdrop-blur-md sm:inline-flex">
            <Upload aria-hidden className="h-4 w-4" /> {t("Upload")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("Open menu")}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-full border border-bone/40 text-bone lg:hidden"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </motion.header>

      <Sheet open={open} onClose={() => setOpen(false)} title={t("Menu")}>
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {[...NAV, { href: "/#upload", label: "Upload" }].map(item => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[56px] items-center border-b border-bone/10 font-display text-xl font-bold uppercase tracking-[0.08em] text-bone transition-colors hover:text-gold"
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Sheet>
    </>
  );
}
