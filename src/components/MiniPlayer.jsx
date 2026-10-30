import { useLang } from "../lib/i18n.jsx";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pause, Play, SkipForward, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useRadio } from "../lib/radio-live.jsx";
import { Link } from "../lib/router.jsx";
import { usePlayer } from "../lib/player.jsx";

/* Small player pinned to the bottom once music is playing and the hero is
 * out of view, so the visitor can keep listening while reading. */
function MusicMini() {
  const { track, playing, progress, toggle, next } = usePlayer();
  const { t } = useLang();
  const [past, setPast] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => { if (playing) setStarted(true); }, [playing]);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {started && past && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-bone/20 bg-umber/90 text-bone shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-lg"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          role="region"
          aria-label={t("Music player")}
        >
          <div className="flex items-center gap-3 p-2.5 pr-3">
            <img src={track.photo} alt="" className="h-11 w-11 flex-none rounded-lg object-cover" style={{ objectPosition: track.pos }} />
            <span className="flex min-w-0 flex-1 flex-col">
              <strong className="truncate text-sm">{t(track.title)}</strong>
              <span className="truncate text-xs text-dust">{t(track.artist)}</span>
            </span>
            <button type="button" onClick={toggle} aria-label={t(playing ? "Pause" : "Play")} className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gold text-umber active:scale-95">
              {playing ? <Pause aria-hidden className="h-4 w-4" fill="currentColor" /> : <Play aria-hidden className="ml-0.5 h-4 w-4" fill="currentColor" />}
            </button>
            <button type="button" onClick={next} aria-label={t("Next track")} className="grid h-11 w-11 flex-none place-items-center rounded-full text-bone hover:text-gold">
              <SkipForward aria-hidden className="h-4 w-4" fill="currentColor" />
            </button>
          </div>
          <div aria-hidden className="h-0.5 bg-bone/15">
            <div className="h-full origin-left bg-gold transition-transform duration-1000 ease-linear" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* While a live station is on, a small radio bar follows the visitor around
 * the site (except on the radio page itself, which has the big radio). */
function RadioMini() {
  const { t } = useLang();
  const { station, status, toggle, stop } = useRadio();
  const live = status === "playing" || status === "loading";
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-gold/40 bg-umber/95 text-bone shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-lg"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label={t("Live radio")}
    >
      <div className="flex items-center gap-3 p-2.5 pr-3">
        <Link to="/radio" className="flex min-w-0 flex-1 items-center gap-3">
          <span className="relative grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-lg bg-clay">
            <span className="font-display text-sm font-semibold text-sun">FM</span>
            {station.logo && <img src={station.logo} alt="" onError={e => e.currentTarget.remove()} className="absolute inset-0 h-full w-full bg-cream object-contain p-0.5" />}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F08A8D]">
              <span className={`h-2 w-2 rounded-full ${status === "playing" ? "animate-pulse bg-[#E5484D]" : "bg-dust"}`} /> {t(status === "playing" ? "ON AIR" : status === "loading" ? "Tuning…" : "Paused")}
            </span>
            <strong className="truncate text-sm">{station.name}</strong>
          </span>
        </Link>
        <button type="button" onClick={toggle} aria-label={t(live ? "Pause radio" : "Play radio")} className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gold text-umber active:scale-95">
          {status === "loading" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : live ? <Pause aria-hidden className="h-4 w-4" fill="currentColor" /> : <Play aria-hidden className="ml-0.5 h-4 w-4" fill="currentColor" />}
        </button>
        <button type="button" onClick={stop} aria-label={t("Turn off")} className="grid h-11 w-11 flex-none place-items-center rounded-full text-dust hover:text-gold">
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function MiniPlayer() {
  const { station } = useRadio();
  const { pathname } = useLocation();
  if (station && pathname !== "/radio") {
    return <AnimatePresence><RadioMini /></AnimatePresence>;
  }
  return <MusicMini />;
}
