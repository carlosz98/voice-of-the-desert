import { greetingFor, useLang } from "../lib/i18n.jsx";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Moon, Pause, Play, Sun, Sunset } from "lucide-react";
import { HOST, SLIDES } from "../lib/data.js";
import { usePlayer } from "../lib/player.jsx";

const DURATION = 7000; // ms each photo stays up
const FADE = 1.2;      // s crossfade between photos

// warm desert tint + darkening for legible text, shared by the photo and its cut-out
const GRADIENT =
  "linear-gradient(180deg, rgba(35,26,21,0.7) 0%, rgba(43,29,23,0.5) 30%, rgba(43,29,23,0.32) 52%, rgba(43,29,23,0.2) 74%, #231A15 100%)";

function Tint() {
  return (
    <>
      <div className="absolute inset-0 bg-[#D9873A] opacity-30 mix-blend-multiply" />
      <div className="absolute inset-0" style={{ background: GRADIENT }} />
    </>
  );
}

/* One photo layer. The same component draws the full photo (behind the
 * headline) and its cut-out subject (in front of the headline). Both mount
 * together on each slide change, so their slow zoom stays in sync. */
function SlideLayer({ slide, cutout, priority, reduce }) {
  const maskStyle = cutout
    ? {
        WebkitMaskImage: `url(${slide.mask})`,
        maskImage: `url(${slide.mask})`,
        WebkitMaskSize: "cover",
        maskSize: "cover",
        WebkitMaskPosition: slide.pos,
        maskPosition: slide.pos,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : undefined;

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FADE, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ ...maskStyle, transformOrigin: slide.origin || "50% 60%" }}
        initial={{ scale: 1.04 * (slide.zoom || 1) }}
        animate={{ scale: (reduce ? 1.04 : 1.12) * (slide.zoom || 1) }}
        transition={{ duration: DURATION / 1000 + FADE * 2, ease: "linear" }}
      >
        <img
          src={slide.src}
          alt={cutout ? "" : slide.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: slide.pos }}
          fetchpriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
        />
        <Tint />
      </motion.div>
    </motion.div>
  );
}

function SandParticles() {
  const grains = [
    [120, 3, 9, 0], [90, 2, 7, 1.2], [160, 2, 11, 2.4], [60, 3, 8, 3.1], [200, 2, 12, 0.6],
    [140, 2, 6.5, 4.2], [100, 3, 10, 5], [40, 2, 7.5, 2], [180, 2, 9.5, 6], [75, 2, 8.5, 3.8],
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[520px] motion-reduce:hidden">
      {grains.map(([b, s, d, delay], i) => (
        <span
          key={i}
          className="absolute left-0 animate-blow rounded-full bg-[#FFF3DC]"
          style={{ bottom: b, width: s, height: s, animationDuration: `${d}s`, animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
}

const PART_ICON = { morning: Sun, afternoon: Sunset, night: Moon };

function Greeting({ className = "" }) {
  const { t } = useLang();
  const g = greetingFor();
  const Icon = PART_ICON[g.part];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icon aria-hidden className="h-3.5 w-3.5" /> {t(g.key)}
    </span>
  );
}

function HostCard() {
  const { t } = useLang();
  return (
    <motion.a
      href="#host"
      className="glass group hidden w-[330px] items-center gap-3.5 rounded-2xl p-3.5 pr-4 md:flex"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
    >
      <span className="relative grid h-[60px] w-[60px] flex-none place-items-center overflow-hidden rounded-full border-2 border-gold bg-clay font-display text-[15px] font-bold text-sun">
        {HOST.photo ? <img src={HOST.face} alt="" className="h-full w-full object-cover" /> : HOST.initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Greeting className="font-mono text-[11px] uppercase tracking-[0.18em] text-sun" />
        <strong className="text-base text-cream">{HOST.name}</strong>
        <span className="text-[13px] leading-snug text-haze">{t("News, notes, music and the podcast, all with his take.")}</span>
      </span>
      <ArrowRight aria-hidden className="h-5 w-5 flex-none text-sun transition-transform duration-200 group-hover:translate-x-1" />
    </motion.a>
  );
}

function NowPlayingCard() {
  const { track, playing, toggle } = usePlayer();
  const { t } = useLang();
  return (
    <motion.div
      className="glass hidden w-[300px] items-center gap-3.5 rounded-2xl p-3.5 lg:flex"
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <img src={track.photo} alt="" className="h-14 w-14 flex-none rounded-[10px] object-cover" style={{ objectPosition: track.pos }} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-sun">{t(playing ? "Now playing" : "Paused")}</span>
        <strong className="truncate text-[15px] text-cream">{t(track.title)}</strong>
        <span className="truncate text-[13px] text-haze">{t(track.artist)}</span>
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-label={t(playing ? "Pause music" : "Play music")}
        className="grid h-11 w-11 flex-none place-items-center rounded-full bg-cream text-umber transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
      </button>
    </motion.div>
  );
}

export default function Hero() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  // autoplay is off for visitors who ask for reduced motion; the controls still work
  const [paused, setPaused] = useState(!!reduce);
  const [announce, setAnnounce] = useState(null); // index of the photo to announce
  const [word, setWord] = useState({ top: 9999, height: 0 });
  const sectionRef = useRef(null);
  const bigRef = useRef(null);
  const slide = SLIDES[index];
  // gentle depth: the photo scrolls a little slower than the page
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 900], [0, reduce ? 0 : 140]);
  const copyFade = useTransform(scrollY, [0, 500], [1, reduce ? 1 : 0.35]);

  const go = useCallback((dir, fromUser) => {
    setIndex(i => {
      const n = (i + dir + SLIDES.length) % SLIDES.length;
      if (fromUser) setAnnounce(n);
      return n;
    });
    setElapsed(0);
  }, []);

  // slideshow clock; pauses when the visitor pauses it or the tab is hidden
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      setElapsed(e => e + 100);
    }, 100);
    return () => clearInterval(t);
  }, [paused]);
  useEffect(() => {
    if (elapsed >= DURATION) go(1, false);
  }, [elapsed, go]);

  // The cut-outs start just below the top of the giant word, so the subject
  // stands in front of its lower part and the top of every letter stays visible. Measured, so it holds at any size.
  useLayoutEffect(() => {
    const measure = () => {
      const s = sectionRef.current, h = bigRef.current;
      if (!s || !h) return;
      const sr = s.getBoundingClientRect(), hr = h.getBoundingClientRect();
      setWord({ top: hr.top - sr.top, height: hr.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bigRef.current);
    ro.observe(sectionRef.current);
    document.fonts?.ready.then(measure);
    // once more after the headline's entrance animation settles
    const t = setTimeout(measure, 1300);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  const onKeyDown = e => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1, true); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1, true); }
  };

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={t("Featured places")}
      onKeyDown={onKeyDown}
      className="relative flex min-h-[max(100svh,760px)] flex-col overflow-hidden bg-umber"
    >
      {/* photos (behind the headline) */}
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <AnimatePresence initial={false}>
          <SlideLayer key={slide.id} slide={slide} priority={index === 0} reduce={reduce} />
        </AnimatePresence>
      </motion.div>

      <SandParticles />
      <div aria-hidden className="pointer-events-none absolute -inset-[10%] z-10 animate-grain bg-[radial-gradient(rgba(255,243,220,0.08)_1px,transparent_1px)] [background-size:3px_3px]" />

      {/* cut-out subjects (in front of the headline) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-30" style={{ clipPath: `inset(${Math.round(word.top + word.height * (slide.cutFrom ?? 0.22))}px 0 0 0)` }}>
        <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <AnimatePresence initial={false}>
          {slide.mask && <SlideLayer key={slide.id} slide={slide} cutout reduce={reduce} />}
        </AnimatePresence>
        </motion.div>
      </div>

      {/* headline block. The giant word sits at z-20, between the photo and
          its cut-out, so the horses / towers / hills / flowers stand in front
          of it. Everything else is z-40: always readable and clickable. */}
      <div className="container-x relative flex flex-1 flex-col items-center pb-40 pt-[128px] text-center sm:pt-[136px]">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-40 inline-flex items-center gap-2.5 rounded-full border border-bone/30 bg-earth/40 px-3.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.2em] sm:text-[13px]"
        >
          <span className="relative h-2 w-2">
            <span className="absolute inset-0 animate-ping2 rounded-full bg-gold" />
            <span className="absolute inset-0 rounded-full bg-gold" />
          </span>
          {t("On air now · [Show name]")}
        </motion.span>

        <motion.p
          ref={bigRef}
          aria-hidden
          key={lang}
          className={`relative z-20 -mr-[0.06em] mt-3 select-none whitespace-nowrap font-display ${lang === "es" ? "text-[clamp(52px,14vw,212px)]" : "text-[clamp(72px,19vw,280px)]"} font-light uppercase leading-[0.9] tracking-[0.04em] text-cream [text-shadow:0_4px_40px_rgba(20,14,10,0.35)]`}
        >
          {/* each letter rises softly out of a blur, one after another */}
          {t("Desert").split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: "0.18em", filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.11 }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.p>

        <motion.div style={{ opacity: copyFade }} className="relative z-40 mt-2 flex flex-col items-center gap-5 sm:mt-0 sm:gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className="flex flex-col items-center [text-shadow:0_2px_8px_rgba(20,14,10,0.55),0_6px_30px_rgba(20,14,10,0.6)]"
          >
            <span className="font-display text-[clamp(20px,2.6vw,36px)] font-normal italic tracking-[0.01em] text-cream">{t("Voices from")}</span>
            <span className="grid justify-items-center font-serif text-[clamp(48px,7vw,104px)] font-semibold italic leading-[1.05] text-sun">
              <AnimatePresence initial={false}>
                <motion.span
                  key={lang + slide.word}
                  style={{ gridArea: "1 / 1" }}
                  className="whitespace-nowrap"
                  initial={{ opacity: 0, y: "0.3em", filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: "-0.3em", filter: "blur(8px)" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  {t(slide.word)}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-[580px] rounded-2xl bg-earth/45 px-5 py-2.5 text-base font-medium leading-relaxed text-cream backdrop-blur-sm [text-shadow:0_1px_8px_rgba(20,14,10,0.6)] sm:text-lg"
          >
            {t("Videos, music, news and a podcast, all in one place. Press play, or upload your own.")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <a href="#watch" className="pill-gold min-h-[52px] px-7 text-base shadow-[0_10px_40px_rgba(230,176,74,0.4)]">
              <Play aria-hidden className="h-4 w-4" fill="currentColor" /> {t("Watch now")}
            </a>
            <a href="#listen" className="pill-ghost min-h-[52px] bg-earth/35 px-7 text-base backdrop-blur-md">{t("Listen live")}</a>
          </motion.div>

          {/* on phones the host card is hidden, so Felipe says hello here */}
          <motion.a
            href="#host"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="glass flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-left md:hidden"
          >
            <img src={HOST.face} alt="" className="h-10 w-10 flex-none rounded-full border-2 border-gold object-cover" />
            <span className="flex flex-col leading-tight">
              <Greeting className="font-mono text-[11px] uppercase tracking-[0.16em] text-sun" />
              <span className="text-[13px] text-cream">{t("I'm Felipe. Welcome, make yourself at home.")}</span>
            </span>
          </motion.a>
        </motion.div>
      </div>

      {/* floating cards */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[96px] z-40">
        <div className="container-x flex items-end justify-between gap-6 [&>*]:pointer-events-auto">
          <HostCard />
          <NowPlayingCard />
        </div>
      </div>

      {/* slideshow bar: place, progress, counter, controls */}
      <div className="absolute inset-x-0 bottom-0 z-40 border-t border-bone/25 bg-earth/40 backdrop-blur-md">
        <div className="container-x flex items-center gap-3 py-3 font-mono text-[12px] uppercase tracking-[0.14em] sm:gap-6">
          <span className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:basis-[340px]">
            <MapPin aria-hidden className="h-4 w-4 flex-none text-gold" />
            <span className="relative grid min-w-0">
              <AnimatePresence initial={false}>
                <motion.span
                  key={slide.id}
                  style={{ gridArea: "1 / 1" }}
                  className="truncate"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  {t(slide.caption)}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <span aria-hidden className="relative hidden h-0.5 flex-1 overflow-hidden bg-bone/20 sm:block">
            <span
              className="absolute inset-0 origin-left bg-gold transition-transform duration-100 ease-linear"
              style={{ transform: `scaleX(${Math.min(elapsed / DURATION, 1)})` }}
            />
          </span>
          <span className="tabular-nums" aria-hidden>
            {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
          <span className="flex gap-2">
            <button type="button" onClick={() => go(-1, true)} aria-label={t("Previous photo")} className="grid h-11 w-11 place-items-center rounded-full border border-bone/45 transition-colors hover:border-gold hover:text-gold">
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setPaused(p => !p)} aria-label={t(paused ? "Play slideshow" : "Pause slideshow")} aria-pressed={paused} className="grid h-11 w-11 place-items-center rounded-full border border-bone/45 transition-colors hover:border-gold hover:text-gold">
              {paused ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => go(1, true)} aria-label={t("Next photo")} className="grid h-11 w-11 place-items-center rounded-full border border-bone/45 transition-colors hover:border-gold hover:text-gold">
              <ChevronRight aria-hidden className="h-5 w-5" />
            </button>
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{announce === null ? "" : `${t("Photo")} ${announce + 1} ${t("of")} ${SLIDES.length}: ${t(SLIDES[announce].caption)}`}</p>
    </section>
  );
}
