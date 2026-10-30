import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

/* ───────── The turning page ─────────
 * Underneath sits the spread you'll see once the page lands. On top, one
 * leaf turns over the spine: its front is the page you were reading, its
 * back is the page that comes next (like real paper). Light falls across
 * it as it lifts, and it casts a shadow on the page below. */
const FLIP = { duration: 0.95, ease: [0.55, 0.05, 0.25, 1] };

function Shade({ from, to, side }) {
  // a soft gradient from the spine that darkens/lightens as the leaf turns
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: `linear-gradient(${side === "right" ? "90deg" : "270deg"}, rgba(60,40,25,0.55), rgba(60,40,25,0.05) 65%)` }}
      initial={{ opacity: from }}
      animate={{ opacity: to }}
      transition={FLIP}
    />
  );
}

function Book({ pages, at, flip, wide, name, onLand }) {
  const page = (i, side) => (
    <Page verses={pages[i]} number={pages[i] ? i + 1 : null} side={side} chapterName={name} first={i === 0} />
  );

  if (!flip) {
    return (
      <div className={`absolute inset-0 grid ${wide ? "grid-cols-2" : ""}`} aria-live="polite">
        {page(at, wide ? "left" : "single")}
        {wide && page(at + 1, "right")}
      </div>
    );
  }

  const next = flip.dir > 0;
  const to = flip.to;

  // what's underneath while the leaf is in the air
  const base = wide
    ? next
      ? [page(at, "left"), page(to + 1, "right")]
      : [page(to, "left"), page(at + 1, "right")]
    : [page(next ? to : at, "single")];

  // the leaf: which half it covers, where it hinges, and its two faces
  const leaf = wide
    ? next
      ? { half: "right", origin: "left center", rotate: [0, -180], front: page(at + 1, "right"), back: page(to, "left") }
      : { half: "left", origin: "right center", rotate: [0, 180], front: page(at, "left"), back: page(to + 1, "right") }
    : next
      ? { half: "all", origin: "left center", rotate: [0, -180], front: page(at, "single"), back: <BlankPage /> }
      : { half: "all", origin: "left center", rotate: [-180, 0], front: page(to, "single"), back: <BlankPage /> };

  const pos = leaf.half === "right" ? "left-1/2 right-0" : leaf.half === "left" ? "left-0 right-1/2" : "inset-x-0";
  const lift = next ? -1 : 1;

  return (
    <>
      <div className={`absolute inset-0 grid ${wide ? "grid-cols-2" : ""}`}>
        {base.map((b, i) => (
          <div key={i} className="relative h-full">
            {b}
            {/* the shadow the turning page casts on the one below */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[rgba(60,40,25,0.35)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0] }}
              transition={FLIP}
            />
          </div>
        ))}
      </div>
      <motion.div
        className={`absolute inset-y-0 z-10 ${pos}`}
        style={{ transformOrigin: leaf.origin, transformStyle: "preserve-3d" }}
        initial={{ rotateY: leaf.rotate[0] }}
        animate={{
          rotateY: leaf.rotate,
          // a little lift and curl in the middle of the turn, so it isn't stiff
          z: [0, 60, 0],
          skewY: [0, lift * 2.5, 0],
          scaleY: [1, 1.015, 1],
        }}
        transition={FLIP}
        onAnimationComplete={onLand}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {leaf.front}
          <Shade from={0} to={0.6} side={leaf.half === "left" ? "left" : "right"} />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {leaf.back}
          <Shade from={0.6} to={0} side={leaf.half === "left" ? "right" : "left"} />
        </div>
      </motion.div>
    </>
  );
}

function BlankPage() {
  return <div className="h-full rounded-[6px] bg-[#F6EEDD] shadow-[inset_0_0_40px_rgba(107,85,68,0.18)]" />;
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
  const [flip, setFlip] = useState(null); // a page in the middle of turning: { dir, to }
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
    if (flip) return; // let the page land first
    const next = at + d * step;
    if (next < 0 || next >= pages.length) return;
    setFlip({ dir: d, to: next });
    setSaved(false);
  };
  const land = () => {
    setPage(flip.to);
    setFlip(null);
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
    setFlip(null);
    setSaved(false);
  };

  const save = () => {
    const done = last && !progress.done.includes(current.id) ? [...progress.done, current.id] : progress.done;
    const p = { ...progress, id: current.id, page: at, done };
    setProgress(p);
    writeProgress(p);
    setSaved(true);
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

        <motion.div
          className="relative h-[640px] touch-pan-y [perspective:2000px] sm:h-[600px]"
          onPanEnd={(e, info) => {
            if (Math.abs(info.offset.x) > 60 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) turn(info.offset.x < 0 ? 1 : -1);
          }}
        >
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
          {chapter && <Book pages={pages} at={at} flip={flip} wide={wide} name={chapter.name} onLand={land} />}
          {/* the spine */}
          {wide && <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-[#D9C7A6]" />}
        </motion.div>
      </div>

      {/* turn, save */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => turn(-1)} disabled={at === 0 || !chapter || !!flip} aria-label={t("Previous page")} className="grid h-12 w-12 place-items-center rounded-full border border-dune transition-colors hover:border-umber disabled:opacity-35">
          <ChevronLeft aria-hidden className="h-5 w-5" />
        </button>
        <span className="min-w-[110px] text-center text-sm text-bark tabular-nums">
          {chapter ? `${t("Page")} ${at + 1}${wide && pages[at + 1] ? `–${at + 2}` : ""} ${t("of")} ${pages.length}` : "…"}
        </span>
        <button type="button" onClick={() => turn(1)} disabled={last || !chapter || !!flip} aria-label={t("Next page")} className="grid h-12 w-12 place-items-center rounded-full border border-dune transition-colors hover:border-umber disabled:opacity-35">
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
