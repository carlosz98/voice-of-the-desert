import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Copy, RotateCw } from "lucide-react";
import { HOST } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { dayNumber, loadVerse, verseForDay } from "../lib/verses.js";
import { Accent } from "./ui/Accent.jsx";
import { WhatsAppGlyph, whatsappLink } from "./TopStrip.jsx";
import { EASE, Reveal } from "./ui/Reveal.jsx";

const TODAY = dayNumber();
const WEEK = 6; // how many earlier days you can page back through

export function dateFor(day, lang) {
  // day is a UTC day number; show it as that calendar date
  return new Date(day * 86400000).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default function Verse() {
  const { t, lang } = useLang();
  const [day, setDay] = useState(TODAY);
  const [state, setState] = useState({ status: "loading" });
  const [tries, setTries] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setState(s => (s.status === "ready" ? { ...s, status: "refreshing" } : { status: "loading" }));
    loadVerse(verseForDay(day), lang)
      .then(v => alive && setState({ status: "ready", ...v }))
      .catch(() => alive && setState({ status: "error" }));
    return () => { alive = false; };
  }, [day, lang, tries]);

  const copy = useCallback(async () => {
    if (!state.text) return;
    try {
      await navigator.clipboard.writeText(`“${state.text}” — ${state.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [state]);

  const isToday = day === TODAY;
  const date = dateFor(day, lang);

  return (
    <section id="verse" aria-labelledby="verse-h" className="paper relative scroll-mt-20 overflow-hidden bg-bone text-umber">
      {/* soft morning sun behind the card */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,196,99,0.38)_0%,rgba(240,196,99,0)_65%)]" />

      <div className="container-x relative flex flex-col items-center gap-6 py-20 text-center sm:py-24">
        <Reveal as="span" className="eyebrow flex items-center gap-2.5 text-ochre">
          <span aria-hidden>✦</span> {t("Every morning")}
        </Reveal>
        <Reveal as="h2" id="verse-h" className="h-display text-[clamp(32px,4.4vw,58px)]">
          {t("A word for")} <Accent className="text-ochre">{t("today")}</Accent>
        </Reveal>

        <Reveal className="w-full max-w-[760px]">
          <figure className="relative rounded-[6px] border border-dune bg-cream px-6 pb-7 pt-12 shadow-[0_30px_70px_rgba(43,29,23,0.14)] sm:px-14 sm:pb-9 sm:pt-14">
            {/* bookmark ribbon */}
            <span aria-hidden className="absolute -top-2 right-10 h-16 w-6 bg-rust [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" />
            <span aria-hidden className="pointer-events-none absolute left-5 top-0 font-display text-[120px] leading-none text-gold/40 sm:left-8">“</span>

            <p className="mb-5 font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-bark">
              {isToday ? t("Today") : date}
              {isToday && <span className="font-normal normal-case tracking-normal"> · {date}</span>}
            </p>

            <div className="relative min-h-[150px]" aria-live="polite" aria-busy={state.status === "loading"}>
              <AnimatePresence mode="popLayout" initial={false}>
                {state.status === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 pt-2">
                    <span className="sr-only">{t("Loading today's verse…")}</span>
                    {[92, 80, 60].map(w => (
                      <span key={w} aria-hidden className="h-5 animate-pulse rounded-full bg-paper" style={{ width: `${w}%` }} />
                    ))}
                  </motion.div>
                )}
                {state.status === "error" && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 pt-4">
                    <p className="text-[17px] text-loam">{t("We couldn't load the verse right now.")}</p>
                    <button type="button" onClick={() => setTries(n => n + 1)} className="pill-dark">
                      <RotateCw aria-hidden className="h-4 w-4" /> {t("Try again")}
                    </button>
                  </motion.div>
                )}
                {(state.status === "ready" || state.status === "refreshing") && (
                  <motion.div
                    key={state.reference + lang}
                    initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                    animate={{ opacity: state.status === "refreshing" ? 0.5 : 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <blockquote className="font-serif text-[clamp(24px,3.1vw,36px)] font-medium italic leading-snug text-umber">
                      {state.text}
                    </blockquote>
                    <figcaption className="mt-5 font-display text-lg font-semibold text-ochre">— {state.reference}</figcaption>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 border-t border-dune pt-5">
              <span className="flex items-center gap-2.5 text-left">
                <span aria-hidden className="h-9 w-9 flex-none overflow-hidden rounded-full ring-2 ring-gold/50">
                  <img src={HOST.face} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="font-script text-[26px] leading-none text-rust">{t("Shared by Felipe")}</span>
              </span>
              <span className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDay(d => Math.max(d - 1, TODAY - WEEK))}
                  disabled={day <= TODAY - WEEK}
                  aria-label={t("Previous day")}
                  className="grid h-11 w-11 place-items-center rounded-full border border-dune transition-colors hover:border-umber disabled:opacity-35"
                >
                  <ChevronLeft aria-hidden className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDay(d => Math.min(d + 1, TODAY))}
                  disabled={isToday}
                  aria-label={t("Next day")}
                  className="grid h-11 w-11 place-items-center rounded-full border border-dune transition-colors hover:border-umber disabled:opacity-35"
                >
                  <ChevronRight aria-hidden className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={copy}
                  disabled={!state.text}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-dune px-4 text-sm font-semibold transition-colors hover:border-umber disabled:opacity-35"
                >
                  {copied ? <Check aria-hidden className="h-4 w-4 text-ochre" /> : <Copy aria-hidden className="h-4 w-4" />}
                  {copied ? t("Copied") : t("Copy verse")}
                </button>
                {state.text && (
                  <a
                    href={whatsappLink(`“${state.text}” — ${state.reference}\n\n${t("Shared from Voice of the Desert")}: ${location.origin + location.pathname}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#2B6B3F] px-4 text-sm font-semibold text-cream transition-colors hover:bg-[#245A35]"
                  >
                    <WhatsAppGlyph /> WhatsApp
                  </a>
                )}
                {!isToday && (
                  <button type="button" onClick={() => setDay(TODAY)} className="inline-flex min-h-[44px] items-center px-2 text-sm font-bold text-ochre hover:underline">
                    {t("Back to today")}
                  </button>
                )}
              </span>
            </div>
          </figure>
        </Reveal>

        <p className="text-xs text-bark">{t(lang === "es" ? "Reina-Valera 1909" : "King James Version")} · getBible</p>
      </div>
    </section>
  );
}
