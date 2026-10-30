import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookmarkCheck, BookOpen, Check, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useLang } from "../lib/i18n.jsx";
import { READING, loadChapter, readProgress, writeProgress } from "../lib/verses.js";

// roughly how much text fits on one page of the book (wide screens / phones)
const PAGE_CHARS = { wide: 520, narrow: 360 };

// split a chapter's verses into pages without cutting a verse in half
function paginate(verses, limit) {
  const pages = [];
  let page = [];
  let size = 0;
  for (const v of verses) {
    if (size + v.text.length > limit && page.length) {
      pages.push(page);
      page = [];
      size = 0;
    }
    page.push(v);
    size += v.text.length;
  }
  if (page.length) pages.push(page);
  return pages;
}

function useWide() {
  const query = "(min-width: 900px)";
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

function Page({ verses, number, side, chapterName, first }) {
  return (
    <div className={`relative flex h-full flex-col overflow-hidden bg-[#FBF5E8] px-6 pb-10 pt-9 sm:px-10 ${side === "single" ? "rounded-[6px]" : side === "left" ? "rounded-l-[6px] shadow-[inset_-18px_0_30px_-18px_rgba(107,85,68,0.35)]" : "rounded-r-[6px] shadow-[inset_18px_0_30px_-18px_rgba(107,85,68,0.35)]"}`}>
      <p className="mb-4 text-center font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-bark/80">{chapterName}</p>
      {first && <p className="mb-3 text-center font-display text-[44px] font-semibold leading-none text-ochre">{chapterName.split(" ").pop()}</p>}
      <div className="flex-1 font-serif text-[20px] leading-[1.6] text-umber sm:text-[21px]">
        {verses?.map(v => (
          <span key={v.n}>
            <sup className="mr-1 font-display text-[11px] font-semibold text-ochre">{v.n}</sup>
            {v.text}{" "}
          </span>
        ))}
      </div>
      {number && <p className="absolute bottom-4 left-0 right-0 text-center font-display text-sm text-bark/70">{number}</p>}
    </div>
  );
}

/* An open book: pick a chapter, turn the pages, and save your place. */
export default function BibleReader() {
  const { t, lang } = useLang();
  const wide = useWide();
  const [progress, setProgress] = useState(readProgress);
  const [chapter, setChapter] = useState(null); // { name, verses }
  const [failed, setFailed] = useState(false);
  const [tries, setTries] = useState(0);
  const [page, setPage] = useState(progress.page || 0);
  const [dir, setDir] = useState(1);
  const [saved, setSaved] = useState(false);
  const current = READING.find(r => r.id === progress.id) || READING[0];

  useEffect(() => {
    let alive = true;
    setChapter(null);
    setFailed(false);
    loadChapter(lang, current.book, current.chapter)
      .then(c => alive && setChapter(c))
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [lang, current.book, current.chapter, tries]);

  const pages = useMemo(() => (chapter ? paginate(chapter.verses, wide ? PAGE_CHARS.wide : PAGE_CHARS.narrow) : []), [chapter, wide]);
  const step = wide ? 2 : 1;
  // keep the spread aligned on desktop (left page is always even)
  const at = Math.min(wide ? page - (page % 2) : page, Math.max(0, pages.length - 1));
  const last = at + step >= pages.length;

  const turn = d => {
    const next = at + d * step;
    if (next < 0 || next >= pages.length) return;
    setDir(d);
    setPage(next);
    setSaved(false);
  };

  useEffect(() => {
    const onKey = e => {
      if (e.target.closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const choose = id => {
    const p = { ...progress, id, page: 0 };
    setProgress(p);
    setPage(0);
    setDir(1);
    setSaved(false);
  };

  const save = () => {
    const done = last && !progress.done.includes(current.id) ? [...progress.done, current.id] : progress.done;
    const p = { ...progress, id: current.id, page: at, done };
    setProgress(p);
    writeProgress(p);
    setSaved(true);
  };

  // the new pages wait underneath while the old ones turn away over the spine
  const variants = {
    enter: { opacity: 0.6, zIndex: 1 },
    center: { rotateY: 0, opacity: 1, zIndex: 1 },
    exit: d => ({ rotateY: d > 0 ? -95 : 95, opacity: 0.3, zIndex: 2, transformOrigin: d > 0 ? "left center" : "right center", boxShadow: "0 20px 60px rgba(43,29,23,0.35)" }),
  };

  const doneCount = progress.done.length;

  return (
    <div className="flex flex-col gap-8">
      {/* chapters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-bark">{t("Choose a chapter")}</span>
          <span className="text-sm text-bark">
            {doneCount} / {READING.length} {t("chapters read")}
          </span>
        </div>
        <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-dune">
          <motion.div className="h-full rounded-full bg-gold" animate={{ width: `${(doneCount / READING.length) * 100}%` }} transition={{ duration: 0.8 }} />
        </div>
        <div role="group" aria-label={t("Choose a chapter")} className="flex flex-wrap gap-2">
          {READING.map(r => {
            const on = r.id === current.id;
            const done = progress.done.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                onClick={() => choose(r.id)}
                className={`pill border font-semibold ${on ? "border-umber bg-umber text-bone" : "border-dune hover:border-umber"}`}
              >
                {done && <Check aria-hidden className={`h-4 w-4 ${on ? "text-gold" : "text-ochre"}`} />}
                {t(BOOK_NAMES[r.book])} {r.chapter}
              </button>
            );
          })}
        </div>
      </div>

      {/* the book */}
      <div className="relative mx-auto w-full max-w-[1020px]">
        {/* leather cover peeking out behind the pages */}
        <div aria-hidden className="absolute -inset-3 rounded-[14px] bg-[#5A3A26] shadow-[0_40px_80px_rgba(43,29,23,0.35)] sm:-inset-4" />
        <div aria-hidden className="absolute -top-5 right-16 z-20 h-24 w-6 bg-rust shadow-md [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]" />

        <div className="relative h-[640px] [perspective:2000px] sm:h-[600px]">
          {!chapter && !failed && (
            <div className={`grid h-full gap-0 ${wide ? "grid-cols-2" : ""}`}>
              {[0, 1].slice(0, wide ? 2 : 1).map(i => (
                <div key={i} className={`flex flex-col gap-3 bg-[#FBF5E8] p-10 ${i === 0 ? "rounded-l-[6px]" : "rounded-r-[6px]"} ${!wide ? "rounded-[6px]" : ""}`}>
                  {[90, 80, 95, 70, 85, 60].map((w, j) => <span key={j} aria-hidden className="h-4 animate-pulse rounded-full bg-[#EFE4CF]" style={{ width: `${w}%` }} />)}
                </div>
              ))}
            </div>
          )}
          {failed && (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[6px] bg-[#FBF5E8] p-10 text-center">
              <p className="text-lg text-loam">{t("We couldn't load the verse right now.")}</p>
              <button type="button" onClick={() => setTries(n => n + 1)} className="pill-dark"><RotateCw aria-hidden className="h-4 w-4" /> {t("Try again")}</button>
            </div>
          )}
          {chapter && (
            <AnimatePresence custom={dir} initial={false}>
              <motion.div
                key={`${current.id}-${at}-${wide}-${lang}`}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.75, ease: [0.45, 0, 0.2, 1] }}
                className={`absolute inset-0 grid ${wide ? "grid-cols-2" : ""}`}
                style={{ transformStyle: "preserve-3d" }}
                aria-live="polite"
              >
                <Page verses={pages[at]} number={at + 1} side={wide ? "left" : "single"} chapterName={chapter.name} first={at === 0} />
                {wide && <Page verses={pages[at + 1]} number={pages[at + 1] ? at + 2 : null} side="right" chapterName={chapter.name} />}
              </motion.div>
            </AnimatePresence>
          )}
          {/* the spine */}
          {wide && <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#D9C7A6]" />}
        </div>
      </div>

      {/* turn, save */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => turn(-1)} disabled={at === 0 || !chapter} aria-label={t("Previous page")} className="grid h-12 w-12 place-items-center rounded-full border border-dune transition-colors hover:border-umber disabled:opacity-35">
          <ChevronLeft aria-hidden className="h-5 w-5" />
        </button>
        <span className="min-w-[110px] text-center text-sm text-bark tabular-nums">
          {chapter ? `${t("Page")} ${at + 1}${wide && pages[at + 1] ? `–${at + 2}` : ""} ${t("of")} ${pages.length}` : "…"}
        </span>
        <button type="button" onClick={() => turn(1)} disabled={last || !chapter} aria-label={t("Next page")} className="grid h-12 w-12 place-items-center rounded-full border border-dune transition-colors hover:border-umber disabled:opacity-35">
          <ChevronRight aria-hidden className="h-5 w-5" />
        </button>
        <button type="button" onClick={save} disabled={!chapter} className="pill-dark ml-1 min-h-[48px] disabled:opacity-50">
          {saved ? <BookmarkCheck aria-hidden className="h-[18px] w-[18px] text-gold" /> : <BookOpen aria-hidden className="h-[18px] w-[18px]" />}
          <span aria-live="polite">{saved ? (last ? t("Chapter finished!") : t("Place saved")) : last ? t("Mark as read") : t("Save my place")}</span>
        </button>
      </div>
      <p className="text-center text-xs text-bark">{t("Your place is saved on this device only.")}</p>
    </div>
  );
}

// book numbers → English names (translated by i18n); the API gives the
// translated name for the open chapter, these are for the buttons
const BOOK_NAMES = { 19: "Psalms", 20: "Proverbs", 43: "John", 46: "1 Corinthians" };
