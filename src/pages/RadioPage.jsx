import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2, Pause, Play, Radio as RadioIcon, RotateCw, Search, Star, Volume1, Volume2, X } from "lucide-react";
import { PHOTOS } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { dialFor, fetchStations, useRadio } from "../lib/radio-live.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { EASE } from "../components/ui/Reveal.jsx";

const TABS = [
  ["chihuahua", "Chihuahua"],
  ["mexico", "All of Mexico"],
  ["favorites", "My stations"],
];

function Logo({ station, size = 56 }) {
  const [broken, setBroken] = useState(false);
  return station.logo && !broken ? (
    <img src={station.logo} alt="" loading="lazy" onError={() => setBroken(true)} className="flex-none rounded-xl bg-cream object-contain p-1" style={{ width: size, height: size }} />
  ) : (
    <span aria-hidden className="grid flex-none place-items-center rounded-xl bg-clay font-display font-semibold text-sun" style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {station.name.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase()}
    </span>
  );
}

/* The old radio set: wooden cabinet, cloth speaker, glowing dial and a
 * needle that sweeps to the station when you tune in. */
function VintageRadio() {
  const { t } = useLang();
  const { station, status, volume, toggle, setVolume, stop } = useRadio();
  const on = status === "playing" || status === "loading";
  const freq = dialFor(station);
  const needle = station ? ((freq - 88) / 20) * 100 : 50;

  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      <div className="relative rounded-[34px] bg-[linear-gradient(160deg,#7A4E2C_0%,#5A3A26_45%,#3E2718_100%)] p-4 shadow-[0_40px_90px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,220,170,0.25)] sm:p-6">
        {/* wood grain */}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[34px] opacity-25 mix-blend-overlay [background:repeating-linear-gradient(95deg,rgba(0,0,0,0.25)_0px,transparent_3px,transparent_14px)]" />

        <div className="relative grid gap-4 sm:grid-cols-[1fr_200px]">
          {/* speaker cloth */}
          <div className="relative min-h-[150px] overflow-hidden rounded-[22px] bg-[#C9A06A] shadow-[inset_0_6px_24px_rgba(0,0,0,0.45)] sm:min-h-[230px]">
            <div aria-hidden className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(60,35,20,0.55)_1.2px,transparent_1.4px)] [background-size:7px_7px]" />
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,200,120,0.45),transparent_60%)]"
              animate={on ? { opacity: [0.35, 0.8, 0.45, 0.75, 0.35] } : { opacity: 0 }}
              transition={on ? { duration: 2.4, repeat: Infinity } : { duration: 0.6 }}
            />
            {/* brass badge */}
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl border border-[#E6B04A]/60 bg-[#3E2718]/80 px-5 py-3 text-center shadow-lg backdrop-blur-[1px]">
              <span className="font-script text-[30px] leading-none text-sun">La Voz</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">del Desierto</span>
            </div>
          </div>

          {/* controls */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-[22px] bg-[#2B1D17]/70 p-4 shadow-[inset_0_4px_18px_rgba(0,0,0,0.5)]">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-dust">
              <span className={`h-2.5 w-2.5 rounded-full ${status === "playing" ? "animate-pulse bg-[#E5484D] shadow-[0_0_10px_#E5484D]" : "bg-[#5a4033]"}`} />
              {t(status === "playing" ? "ON AIR" : status === "loading" ? "Tuning…" : "Off")}
            </span>
            <button
              type="button"
              onClick={toggle}
              disabled={!station}
              aria-label={t(on ? "Pause radio" : "Play radio")}
              className="grid h-20 w-20 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#F6D58C,#E6B04A_45%,#A9772C)] text-umber shadow-[0_8px_24px_rgba(0,0,0,0.45),inset_0_2px_0_rgba(255,255,255,0.5)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              {status === "loading" ? <Loader2 aria-hidden className="h-8 w-8 animate-spin" /> : on ? <Pause aria-hidden className="h-8 w-8" fill="currentColor" /> : <Play aria-hidden className="ml-1 h-8 w-8" fill="currentColor" />}
            </button>
            <label className="flex w-full items-center gap-2 text-dust">
              <Volume1 aria-hidden className="h-4 w-4 flex-none" />
              <span className="sr-only">{t("Volume")}</span>
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-[#E6B04A]" />
              <Volume2 aria-hidden className="h-4 w-4 flex-none" />
            </label>
            {station && (
              <button type="button" onClick={stop} className="text-xs font-semibold text-dust hover:text-gold">{t("Turn off")}</button>
            )}
          </div>
        </div>

        {/* the dial */}
        <div className="relative mt-4 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#2A1A10,#1C130D)] px-5 pb-4 pt-3 shadow-[inset_0_4px_16px_rgba(0,0,0,0.6)]">
          <motion.div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(240,196,99,0.35),transparent_70%)]" animate={{ opacity: station ? 1 : 0.25 }} transition={{ duration: 0.8 }} />
          <div className="relative">
            <div aria-hidden className="flex justify-between font-display text-[11px] text-sun/80">
              {[88, 92, 96, 100, 104, 108].map(f => <span key={f}>{f}</span>)}
            </div>
            <div aria-hidden className="relative mt-1 h-7">
              <div className="absolute inset-x-0 top-0 h-full [background:repeating-linear-gradient(90deg,rgba(240,196,99,0.55)_0px,rgba(240,196,99,0.55)_1px,transparent_1px,transparent_10px)] [mask-image:linear-gradient(180deg,black_40%,transparent)]" />
              <motion.div
                className="absolute -top-1 bottom-[-6px] w-[3px] rounded-full bg-[#E5484D] shadow-[0_0_10px_rgba(229,72,77,0.9)]"
                animate={{ left: `${needle}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 11, mass: 1.2 }}
              />
            </div>
            <div className="mt-2 flex min-h-[44px] items-center justify-between gap-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={station?.id || "none"}
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.45 }}
                  className="min-w-0 truncate font-display text-xl font-semibold text-cream [text-shadow:0_0_14px_rgba(240,196,99,0.55)] sm:text-2xl"
                >
                  {station ? station.name : t("Choose a station below")}
                </motion.p>
              </AnimatePresence>
              {station && <span className="flex-none font-mono text-sm tabular-nums text-sun">{freq.toFixed(1)}</span>}
            </div>
            {station && (
              <p className="truncate text-sm text-dust">
                {[station.city, station.country].filter(Boolean).join(", ")}
                {station.tags.length > 0 && <> · {station.tags.join(" · ")}</>}
              </p>
            )}
          </div>
        </div>
      </div>
      {status === "error" && (
        <p role="alert" className="mx-auto mt-4 max-w-[560px] rounded-xl bg-[#9A3412]/90 px-4 py-3 text-center font-semibold text-cream">
          {t("This station isn't answering right now. Try another one.")}
        </p>
      )}
    </div>
  );
}

function StationCard({ s }) {
  const { t } = useLang();
  const { station, status, play, toggle, toggleFavorite, isFavorite } = useRadio();
  const current = station?.id === s.id;
  const live = current && (status === "playing" || status === "loading");
  const fav = isFavorite(s);
  return (
    <div className={`group flex items-center gap-3.5 rounded-2xl border p-3 transition-colors ${current ? "border-gold bg-gold/10" : "border-dune bg-cream hover:border-umber"}`}>
      <button type="button" onClick={() => (current ? toggle() : play(s))} className="flex min-w-0 flex-1 items-center gap-3.5 text-left" aria-label={`${t(live ? "Pause" : "Play")}: ${s.name}`}>
        <span className="relative">
          <Logo station={s} />
          <span className={`absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full shadow ${live ? "bg-gold text-umber" : "bg-umber text-bone opacity-90 group-hover:bg-gold group-hover:text-umber"}`}>
            {current && status === "loading" ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : live ? <Pause aria-hidden className="h-3.5 w-3.5" fill="currentColor" /> : <Play aria-hidden className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />}
          </span>
        </span>
        <span className="flex min-w-0 flex-col">
          <strong className="truncate text-[17px] leading-snug">{s.name}</strong>
          <span className="truncate text-sm text-bark">{[s.city, s.tags[0]].filter(Boolean).join(" · ") || s.country}</span>
        </span>
      </button>
      <button type="button" onClick={() => toggleFavorite(s)} aria-pressed={fav} aria-label={t(fav ? "Remove from my stations" : "Save to my stations")} className="grid h-11 w-11 flex-none place-items-center rounded-full text-bark transition-colors hover:text-ochre">
        <Star aria-hidden className={`h-5 w-5 ${fav ? "fill-gold text-ochre" : ""}`} />
      </button>
    </div>
  );
}

export default function RadioPage() {
  const { t } = useLang();
  const { favorites } = useRadio();
  const [tab, setTab] = useState("chihuahua");
  const [query, setQuery] = useState("");
  const [typed, setTyped] = useState("");
  const [state, setState] = useState({ status: "loading", list: [] });
  const [tries, setTries] = useState(0);
  const [shown, setShown] = useState(24);

  // wait until the visitor stops typing before searching
  useEffect(() => {
    const id = setTimeout(() => setQuery(typed.trim()), 400);
    return () => clearTimeout(id);
  }, [typed]);

  useEffect(() => {
    if (tab === "favorites") return;
    let alive = true;
    setState(s => ({ status: "loading", list: s.list }));
    setShown(24);
    fetchStations(tab, query)
      .then(list => alive && setState({ status: "ready", list }))
      .catch(() => alive && setState({ status: "error", list: [] }));
    return () => { alive = false; };
  }, [tab, query, tries]);

  const list = useMemo(() => {
    if (tab !== "favorites") return state.list;
    const q = query.toLowerCase();
    return favorites.filter(s => !q || s.name.toLowerCase().includes(q));
  }, [tab, state.list, favorites, query]);
  const status = tab === "favorites" ? "ready" : state.status;

  return (
    <>
      <PageHeader
        page="Radio"
        eyebrow={t("Live, right now")}
        title={<>{t("The radio of")} <Accent className="text-sun">{t("Chihuahua")}</Accent></>}
        subtitle={t("Stations from Chihuahua and all of Mexico, live. Turn one on and keep browsing: it keeps playing.")}
        photo={PHOTOS.horses}
        pos="50% 60%"
      >
        <div className="mt-6"><VintageRadio /></div>
      </PageHeader>

      <div className="paper bg-bone text-umber">
        <div className="container-x flex flex-col gap-6 py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label={t("Stations")} className="flex flex-wrap gap-2">
              {TABS.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`pill border font-semibold ${tab === id ? "border-umber bg-umber text-bone" : "border-dune hover:border-umber"}`}>
                  {id === "favorites" && <Star aria-hidden className={`h-4 w-4 ${tab === id ? "fill-gold text-gold" : ""}`} />}
                  {t(label)}
                  {id === "favorites" && favorites.length > 0 && <span className="text-xs font-bold text-ochre">{favorites.length}</span>}
                </button>
              ))}
            </div>
            <label className="relative ml-auto flex min-w-0 flex-[1_1_260px] items-center sm:max-w-[360px]">
              <span className="sr-only">{t("Search stations")}</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 h-5 w-5 text-bark" />
              <input
                type="search"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                placeholder={t("Search by name: La Caliente, Radio Fórmula…")}
                className="h-12 w-full rounded-full border border-dune bg-cream pl-12 pr-11 text-base outline-none placeholder:text-bark/80 focus:border-gold focus:ring-2 focus:ring-gold/40"
              />
              {typed && (
                <button type="button" onClick={() => setTyped("")} aria-label={t("Clear search")} className="absolute right-1.5 grid h-9 w-9 place-items-center rounded-full text-bark hover:text-umber">
                  <X aria-hidden className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>

          {status === "loading" && (
            <ul aria-hidden className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }, (_, i) => (
                <li key={i} className="flex items-center gap-3.5 rounded-2xl border border-dune bg-cream p-3">
                  <span className="h-14 w-14 animate-pulse rounded-xl bg-paper" />
                  <span className="flex flex-1 flex-col gap-2"><span className="h-4 w-3/4 animate-pulse rounded-full bg-paper" /><span className="h-3 w-1/2 animate-pulse rounded-full bg-paper" /></span>
                </li>
              ))}
            </ul>
          )}

          {status === "error" && (
            <div className="flex flex-col items-start gap-4 rounded-[18px] border border-dashed border-dune bg-cream/60 p-8">
              <p className="font-display text-xl font-semibold">{t("We couldn't load the stations right now.")}</p>
              <button type="button" onClick={() => setTries(n => n + 1)} className="pill-dark"><RotateCw aria-hidden className="h-4 w-4" /> {t("Try again")}</button>
            </div>
          )}

          {status === "ready" && list.length === 0 && (
            <div className="flex flex-col items-start gap-3 rounded-[18px] border border-dashed border-dune bg-cream/60 p-8">
              <p className="font-display text-xl font-semibold">
                {tab === "favorites" ? t("Tap the star on a station to keep it here.") : t("No stations match your search.")}
              </p>
            </div>
          )}

          {status === "ready" && list.length > 0 && (
            <>
              <p className="text-sm text-bark" aria-live="polite">{list.length} {t("stations")}</p>
              <motion.ul layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.slice(0, shown).map((s, i) => (
                  <motion.li key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: Math.min(i, 12) * 0.03 }}>
                    <StationCard s={s} />
                  </motion.li>
                ))}
              </motion.ul>
              {list.length > shown && (
                <div className="flex justify-center">
                  <button type="button" onClick={() => setShown(n => n + 24)} className="pill-dark min-h-[52px] px-8 text-base">{t("Show more stations")}</button>
                </div>
              )}
            </>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-dune pt-6 text-sm text-bark">
            <p className="flex items-center gap-2">
              <RadioIcon aria-hidden className="h-4 w-4 text-ochre" />
              {t("Stations from")}{" "}
              <a href="https://www.radio-browser.info" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-ochre hover:underline">
                Radio Browser <ExternalLink aria-hidden className="h-3.5 w-3.5" />
              </a>
              {t(", a free directory. Each station belongs to its owners.")}
            </p>
            <p>{t("Some stations only work in certain apps; if one doesn't play, try another.")} <Link to="/musica" className="font-semibold text-ochre hover:underline">{t("Or listen to Felipe's playlists →")}</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
