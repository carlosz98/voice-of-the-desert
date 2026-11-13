import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useLang } from "../lib/i18n.jsx";
import { useContent } from "../lib/content.jsx";

/* Shown while the content comes from the database (LIVE mode only),
 * or if it couldn't be reached. In DEMO mode the content is ready at
 * once, so this never shows. */
export default function Loading({ dark = false, tall = true }) {
  const { t } = useLang();
  const { error, reload } = useContent();
  const tone = dark ? "bg-earth text-bone" : "paper bg-bone text-umber";

  return (
    <section aria-live="polite" className={`${tone} flex ${tall ? "min-h-[100svh]" : "min-h-[260px]"} flex-col items-center justify-center gap-4 px-5 pb-16 pt-32 text-center`}>
      {error ? (
        <>
          <p className="font-display text-2xl font-semibold">{t("We couldn't load this right now.")}</p>
          <p className={`max-w-md text-[17px] ${dark ? "text-haze" : "text-loam"}`}>{t(error)}</p>
          <button type="button" onClick={reload} className={dark ? "pill-gold min-h-[52px] px-6" : "pill-dark min-h-[52px] px-6"}>
            <RefreshCw aria-hidden className="h-4 w-4" /> {t("Try again")}
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-2" aria-hidden>
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="h-3 w-3 rounded-full bg-gold"
                animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <p className={dark ? "text-haze" : "text-loam"}>{t("One moment…")}</p>
        </>
      )}
    </section>
  );
}
