import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Copy, ImageDown, RotateCw } from "lucide-react";
import { HOST, PHOTOS } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { dayNumber, loadVerse, verseForDay } from "../lib/verses.js";
import { saveVerseImage } from "../lib/verse-image.js";
import { dateFor } from "../components/Verse.jsx";
import { WhatsAppGlyph, whatsappLink } from "../components/TopStrip.jsx";
import { BlockNewsletter } from "@/components/ui/newsletter-signup-ticket";
import { EASE, Reveal } from "../components/ui/Reveal.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import BibleReader from "../components/BibleReader.jsx";

const TODAY = dayNumber();
const WEEK = [6, 5, 4, 3, 2, 1, 0].map(n => TODAY - n); // oldest → today

function shortDay(day, lang) {
  const d = new Date(day * 86400000);
  const opts = { timeZone: "UTC" };
  return {
    weekday: d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { ...opts, weekday: "short" }).replace(".", ""),
    num: d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { ...opts, day: "numeric" }),
  };
}

/* The verse, word by word, settling in like light coming up. */
function VerseText({ text }) {
  const words = text.split(" ");
  const size = text.length > 220 ? "text-[clamp(24px,3vw,38px)]" : text.length > 120 ? "text-[clamp(28px,3.8vw,48px)]" : "text-[clamp(32px,4.6vw,60px)]";
  return (
    <blockquote className={`font-serif font-semibold italic leading-[1.22] text-cream [text-shadow:0_2px_24px_rgba(20,14,10,0.6)] ${size}`}>
      <span aria-hidden className="text-gold">“</span>
      {words.map((w, i) => (
        <motion.span
          key={i + w}
          className="inline-block"
          initial={{ opacity: 0, y: "0.25em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.045 }}
        >
          {w}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
      <span aria-hidden className="text-gold">”</span>
    </blockquote>
  );
}

export default function VersePage() {
  const { t, lang } = useLang();
  const [day, setDay] = useState(TODAY);
  const [state, setState] = useState({ status: "loading" });
  const [tries, setTries] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = `${t("Verse")} · ${t("Voice of the Desert")}`;
  }, [t]);

  useEffect(() => {
    let alive = true;
    setState(s => (s.status === "ready" ? { ...s, status: "refreshing" } : { status: "loading" }));
    loadVerse(verseForDay(day), lang)
      .then(v => alive && setState({ status: "ready", ...v }))
      .catch(() => alive && setState({ status: "error" }));
    return () => { alive = false; };
  }, [day, lang, tries]);

  const isToday = day === TODAY;
  const date = dateFor(day, lang);
  const ready = state.status === "ready" || state.status === "refreshing";

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`“${state.text}” — ${state.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [state]);

  const save = async () => {
    setSaving(true);
    await saveVerseImage({ text: state.text, reference: state.reference, date, footer: t("Voice of the Desert"), photo: PHOTOS.sunset });
    setSaving(false);
  };

  const btn = "inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors";

  return (
    <>
      {/* the verse itself, over the sunrise */}
      <header className="relative flex min-h-[max(92svh,680px)] flex-col overflow-hidden bg-earth text-bone">
        <motion.img
          src={PHOTOS.sunset}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 55%" }}
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1.02, opacity: 0.55 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[58%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-40 mix-blend-soft-light motion-reduce:hidden"
          style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,236,190,0.55) 0deg 4deg, rgba(255,236,190,0) 4deg 18deg)", maskImage: "radial-gradient(circle, black 0%, transparent 55%)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
        />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(240,196,99,0.28)_0%,rgba(35,26,21,0)_55%),linear-gradient(180deg,rgba(35,26,21,0.85)_0%,rgba(35,26,21,0.45)_45%,#231A15_100%)]" />

        <div className="container-x relative flex flex-1 flex-col items-center justify-center gap-7 pb-14 pt-[150px] text-center sm:pt-[170px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-dust">
            <Link to="/" className="hover:text-gold">{t("Home")}</Link>
            <ChevronRight aria-hidden className="h-4 w-4" />
            <span aria-current="page" className="text-bone">{t("Verse")}</span>
          </nav>

          <h1 className="eyebrow flex items-center gap-2.5 text-gold">
            <span aria-hidden>✦</span> {t("The Word")} {t("of the day")}
          </h1>

          <p className="font-display text-[15px] font-semibold uppercase tracking-[0.2em] text-haze">
            {isToday ? <>{t("Today")} · <span className="normal-case tracking-normal">{date}</span></> : date}
          </p>

          <div className="flex min-h-[220px] w-full max-w-[920px] flex-col items-center justify-center" aria-live="polite" aria-busy={state.status === "loading"}>
            <AnimatePresence mode="popLayout" initial={false}>
              {state.status === "loading" && (
                <motion.div key="loading" exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-4">
                  <span className="sr-only">{t("Loading today's verse…")}</span>
                  {[80, 70, 45].map(w => <span key={w} aria-hidden className="h-7 animate-pulse rounded-full bg-bone/15" style={{ width: `${w}%` }} />)}
                </motion.div>
              )}
              {state.status === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                  <p className="text-lg text-haze">{t("We couldn't load the verse right now.")}</p>
                  <button type="button" onClick={() => setTries(n => n + 1)} className={`${btn} border border-bone/40 hover:border-gold hover:text-gold`}>
                    <RotateCw aria-hidden className="h-4 w-4" /> {t("Try again")}
                  </button>
                </motion.div>
              )}
              {ready && (
                <motion.div
                  key={state.reference + lang}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: state.status === "refreshing" ? 0.45 : 1 }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-6"
                >
                  <VerseText text={state.text} />
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 + state.text.split(" ").length * 0.045 }}
                    className="font-display text-[clamp(20px,2.2vw,26px)] font-semibold text-sun"
                  >
                    — {state.reference}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <img src={HOST.face} alt="" className="h-11 w-11 rounded-full border-2 border-gold object-cover" />
            <span className="font-script text-[30px] leading-none text-sun">{t("Shared by Felipe")}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            <a
              href={ready ? whatsappLink(`“${state.text}” — ${state.reference}\n\n${t("Shared from Voice of the Desert")}: ${location.origin + location.pathname}`) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!ready}
              className={`${btn} bg-[#2B6B3F] text-cream hover:bg-[#245A35] aria-disabled:pointer-events-none aria-disabled:opacity-50`}
            >
              <WhatsAppGlyph /> WhatsApp
            </a>
            <button type="button" onClick={save} disabled={!ready || saving} className={`${btn} bg-gold text-umber hover:bg-sun disabled:opacity-50`}>
              <ImageDown aria-hidden className="h-[18px] w-[18px]" /> {t("Save as image")}
            </button>
            <button type="button" onClick={copy} disabled={!ready} className={`${btn} border border-bone/40 hover:border-gold hover:text-gold disabled:opacity-50`}>
              {copied ? <Check aria-hidden className="h-4 w-4 text-gold" /> : <Copy aria-hidden className="h-4 w-4" />}
              <span aria-live="polite">{copied ? t("Copied") : t("Copy verse")}</span>
            </button>
          </div>
        </div>

        {/* the week, one day per button */}
        <div className="relative border-t border-bone/15 bg-earth/60 backdrop-blur-md">
          <div className="container-x flex flex-col items-center gap-3 py-5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-dust">{t("This week's verses")}</span>
            <div role="group" aria-label={t("Choose a day")} className="flex w-full max-w-[640px] justify-between gap-1.5 sm:gap-2.5">
              {WEEK.map(d => {
                const s = shortDay(d, lang);
                const on = d === day;
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    aria-label={dateFor(d, lang)}
                    onClick={() => setDay(d)}
                    className={`relative flex min-h-[64px] flex-1 flex-col items-center justify-center rounded-2xl px-1 transition-colors ${on ? "text-umber" : "text-haze hover:bg-bone/10 hover:text-cream"}`}
                  >
                    {on && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-gold" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="relative text-[12px] font-semibold uppercase tracking-[0.08em]">{d === TODAY ? t("Today") : s.weekday}</span>
                    <span className="relative font-display text-xl font-semibold">{s.num}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="paper bg-bone text-umber">
        {/* Felipe's reflection */}
        <section aria-labelledby="refl-h" className="container-x flex max-w-[820px] flex-col items-center gap-6 py-16 text-center sm:py-20">
          <Reveal className="w-full">
            <figure className="relative rounded-[6px] border border-dune bg-cream px-7 pb-8 pt-10 shadow-[0_24px_60px_rgba(43,29,23,0.12)] sm:px-12">
              <span aria-hidden className="absolute -top-2 right-10 h-16 w-6 bg-rust [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" />
              <img src={HOST.face} alt="" className="mx-auto mb-4 h-20 w-20 rounded-full border-2 border-gold object-cover" />
              <h2 id="refl-h" className="h-display mb-4 text-[clamp(26px,3.2vw,40px)]">{t("A reflection from Felipe")}</h2>
              <p className="font-serif text-[clamp(22px,2.6vw,28px)] italic leading-snug text-loam">{t("[Felipe's thoughts on today's verse, a few lines in his own words.]")}</p>
              <p className="mt-5 font-script text-[40px] leading-none text-rust">— Felipe</p>
            </figure>
          </Reveal>
        </section>

        {/* read the Bible, right here */}
        <section aria-labelledby="read-h" className="border-t border-dune bg-[radial-gradient(ellipse_at_50%_0%,rgba(240,196,99,0.18),transparent_60%)]">
          <div className="container-x flex flex-col gap-8 py-16 sm:py-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="eyebrow flex items-center gap-2.5 text-ochre"><span aria-hidden>✦</span> {t("A little every day")}</span>
              <h2 id="read-h" className="h-display text-[clamp(32px,4.2vw,56px)]">
                {t("Read the")} <Accent className="text-ochre">{t("Bible")}</Accent>
              </h2>
              <p className="max-w-[560px] text-lg text-loam">{t("Open the book, turn the pages, and save your place to keep reading tomorrow.")}</p>
            </div>
            <BibleReader />
          </div>
        </section>

        {/* why, and get it every morning */}
        <section aria-labelledby="why-h" className="border-t border-dune bg-sand/50">
          <div className="container-x grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 id="why-h" className="h-display text-[clamp(28px,3.4vw,44px)]">{t("Why a verse every day")}</h2>
              <p className="font-serif text-[clamp(22px,2.4vw,26px)] italic leading-snug text-loam">{t("[A few words from Felipe about his faith and why he shares the Word here.]")}</p>
              <p className="text-sm text-bark">Reina-Valera 1909 · King James · getBible</p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
              className="relative mx-auto w-full max-w-lg"
            >
              <span aria-hidden className="absolute -left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-sand" />
              <span aria-hidden className="absolute -right-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-sand" />
              <BlockNewsletter
                className="rounded-lg border-dune bg-cream shadow-2xl shadow-[rgba(43,29,23,0.3)] [&_button]:h-11 [&_button]:font-bold [&_input]:h-11 [&_input]:text-base"
                eyebrow={t("EVERY MORNING, BEFORE COFFEE")}
                title={t("Get the verse every morning")}
                successMessage={t("You're on the list. See you tomorrow morning.")}
                footnote={t("Demo: no emails are actually sent.")}
                buttonLabel={t("Join")}
                emailLabel={t("Email address")}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
