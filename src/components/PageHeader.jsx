import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { EASE } from "./ui/Reveal.jsx";

/* Dark header shared by the inner pages: faded photo, breadcrumb, chapter
 * label, big title, a line of text and an optional row of extras. */
export default function PageHeader({ page, eyebrow, title, subtitle, meta, photo, pos = "50% 50%", children }) {
  const { t } = useLang();

  useEffect(() => {
    document.title = `${t(page)} · ${t("Voice of the Desert")}`;
  }, [page, t]);

  return (
    <header className="relative overflow-hidden bg-earth pb-14 pt-[150px] text-bone sm:pb-16 sm:pt-[170px]">
      {photo && <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" style={{ objectPosition: pos }} />}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,26,21,0.85)_0%,rgba(35,26,21,0.55)_45%,#231A15_100%)]" />
      <div className="container-x relative flex flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-dust">
          <Link to="/" className="hover:text-gold">{t("Home")}</Link>
          <ChevronRight aria-hidden className="h-4 w-4" />
          <span aria-current="page" className="text-bone">{t(page)}</span>
        </nav>
        {eyebrow && (
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="eyebrow flex items-center gap-2.5 text-gold">
            <span aria-hidden>✦</span> {eyebrow}
          </motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.08 }} className="h-display text-[clamp(40px,6vw,80px)]">
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.25 }} className="max-w-[640px] text-lg leading-relaxed text-haze">
            {subtitle}
          </motion.p>
        )}
        {meta && <p className="text-sm text-dust">{meta}</p>}
        {children}
      </div>
    </header>
  );
}
