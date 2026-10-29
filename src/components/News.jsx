import { Accent } from "./ui/Accent.jsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Camera, Link2, MessageCircle, Mic, Music, NotebookPen, Send, X } from "lucide-react";
import { ARTICLES, DESK, HOST, LEAD_STORY, NEWS_FILTERS, NEXT_POST } from "../lib/data.js";
import { EASE, ImageReveal, Reveal, SectionHead } from "./ui/Reveal.jsx";
import { SpotlightCard } from "./ui/SpotlightCard.jsx";
import { useLang } from "../lib/i18n.jsx";
import { NewBadge, isFresh } from "./ui/NewBadge.jsx";

function Avatar({ size = 40, className = "" }) {
  return (
    <span
      aria-hidden
      className={`grid flex-none place-items-center overflow-hidden rounded-full bg-gold font-display font-semibold text-umber ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {HOST.photo ? <img src={HOST.face} alt="" className="h-full w-full object-cover" /> : HOST.initials}
    </span>
  );
}

function ReaderAvatar({ name }) {
  return (
    <span aria-hidden className="grid h-9 w-9 flex-none place-items-center rounded-full bg-dune font-display text-sm font-semibold text-loam">
      {name[0]}
    </span>
  );
}

/* ───────── Reader: the full article, Felipe's take and the comments ───────── */

function Reader({ story, onClose }) {
  const { t } = useLang();
  const closeRef = useRef(null);
  const [extra, setExtra] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const prev = document.activeElement;
    closeRef.current?.focus();
    const onKey = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);

  const thread = [...(story.thread || []), ...extra];
  const body = story.body || [story.summary];
  const take = story.longTake || story.take;

  const post = e => {
    e.preventDefault();
    if (!draft.trim()) return;
    setExtra(x => [...x, { name: "You", ago: "Just now", text: draft.trim(), mine: true }]);
    setDraft("");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-night/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-h"
        onClick={e => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="paper relative max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-t-[22px] bg-bone text-umber shadow-2xl sm:rounded-[22px]"
      >
        <div className="relative aspect-[16/7] w-full overflow-hidden bg-clay">
          <img src={story.photo} alt="" className="h-full w-full object-cover" style={{ objectPosition: story.pos }} />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("Close article")}
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-bone/90 text-umber shadow hover:bg-cream"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 pb-8 pt-6 sm:px-9">
          <span className="eyebrow text-[12px] text-ochre">
            {t(story.category)} · {t(story.read)} · {t(story.source)}
          </span>
          <h2 id="reader-h" className="h-display text-[clamp(24px,3.4vw,36px)] leading-tight">{t(story.title)}</h2>
          {body.map((p, i) => (
            <p key={i} className="text-[17px] leading-relaxed text-loam">{t(p)}</p>
          ))}
          <p className="text-sm text-bark">{t("Sample story for the demo. Originally published by")} {t(story.source)}.</p>

          <figure className="flex flex-col gap-3 rounded-[18px] bg-umber p-5 text-bone sm:p-6">
            <figcaption className="flex items-center gap-3">
              <Avatar size={44} />
              <span className="flex flex-col">
                <strong>{t(`${HOST.name}'s take`)}</strong>
                <span className="text-sm text-dust">{story.takeAgo ? `${t("Added")} ${t(story.takeAgo)}` : t(story.ago)}</span>
              </span>
            </figcaption>
            <blockquote className="font-serif text-[22px] italic leading-snug text-cream">“{t(take)}”</blockquote>
            <span className="self-end font-script text-[30px] leading-none text-sun">— Felipe</span>
          </figure>

          <section aria-label={t("Comments")} className="flex flex-col gap-4">
            <h3 className="font-display text-xl font-semibold">
              {(story.comments || thread.length) + extra.length} {t("comments")}
            </h3>
            <ul className="flex flex-col gap-4">
              {thread.map((c, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${c.host ? "ml-8 sm:ml-12" : ""}`}
                >
                  {c.host ? <Avatar size={36} /> : <ReaderAvatar name={c.name} />}
                  <div className={`flex-1 rounded-2xl px-4 py-3 ${c.host ? "bg-umber text-bone" : "bg-cream"}`}>
                    <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                      <strong className="text-[15px]">{t(c.name)}</strong>
                      {c.host && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-umber">{t("Host")}</span>}
                      <span className={`text-xs ${c.host ? "text-dust" : "text-bark"}`}>{t(c.ago)}</span>
                    </div>
                    <p className="text-[15px] leading-relaxed">{c.mine ? c.text : t(c.text)}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <form onSubmit={post} className="flex gap-2">
              <label htmlFor="reader-comment" className="sr-only">{t("Add a comment")}</label>
              <input
                id="reader-comment"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={t("Say something kind…")}
                className="h-12 min-w-0 flex-1 rounded-full border border-dune bg-cream px-4 text-base outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
              />
              <button type="submit" className="pill-dark h-12 px-5">
                <Send aria-hidden className="h-4 w-4" /> {t("Post")}
              </button>
            </form>
            <p className="text-xs text-bark">{t("Demo: comments stay on this page only.")}</p>
          </section>
        </div>
      </motion.article>
    </motion.div>
  );
}

/* ───────── From Felipe's desk: his latest posts, with one arriving live ───────── */

const KIND = {
  shared: { icon: Link2, label: "Shared an article" },
  note: { icon: NotebookPen, label: "Wrote a note" },
  music: { icon: Music, label: "Added a song" },
  podcast: { icon: Mic, label: "Recorded an episode" },
  photo: { icon: Camera, label: "Posted a photo" },
};

function Desk({ onOpenLead }) {
  const { t } = useLang();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [typing, setTyping] = useState(false);
  const [posts, setPosts] = useState(DESK);

  useEffect(() => {
    if (!inView) return;
    const a = setTimeout(() => setTyping(true), 1200);
    const b = setTimeout(() => {
      setTyping(false);
      setPosts(p => [NEXT_POST, ...p]);
    }, 4200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [inView]);

  return (
    <aside ref={ref} aria-labelledby="desk-h" className="rounded-[22px] bg-umber p-5 text-bone shadow-[0_30px_60px_rgba(43,29,23,0.18)] sm:p-6 lg:sticky lg:top-24">
      <div className="mb-4 flex items-center gap-3">
        <Avatar size={46} className="ring-2 ring-gold/40 ring-offset-2 ring-offset-umber" />
        <div className="flex flex-col">
          <h3 id="desk-h" className="font-display text-xl font-semibold">{t("From Felipe's desk")}</h3>
          <span className="flex items-center gap-1.5 text-sm text-dust">
            <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping2 rounded-full bg-gold" /><span className="relative h-2 w-2 rounded-full bg-gold" /></span>
            {t("Online now")}
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {typing && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mb-3 flex items-center gap-2 rounded-xl bg-clay px-4 py-3 text-sm italic text-haze">
              {t("Felipe is writing")}
              <span aria-hidden className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-sun" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />
                ))}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <ol className="flex flex-col" aria-live="polite">
        <AnimatePresence initial={false}>
          {posts.map(p => {
            const k = KIND[p.kind];
            const Icon = k.icon;
            const fresh = p.id === NEXT_POST.id;
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className={`flex gap-3 border-t border-line py-4 first:border-t-0 first:pt-1 ${fresh ? "-mx-2 rounded-xl border-t-0 bg-gold/10 px-2" : ""}`}
              >
                <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full bg-clay text-sun">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-xs text-dust">
                    {t(k.label)} · <span className={fresh ? "font-bold text-sun" : ""}>{t(p.ago)}</span>
                  </span>
                  <p className={`leading-snug ${p.kind === "note" ? "font-serif text-[19px] italic text-cream" : "text-[15px] text-haze"}`}>{t(p.text)}</p>
                  {p.meta && <span className="text-sm font-semibold text-sun">{t(p.meta)}</span>}
                  {p.photo && <img src={p.photo} alt={t("The hills behind an adobe house")} loading="lazy" className="mt-1 aspect-[16/9] w-full rounded-xl object-cover" style={{ objectPosition: p.pos }} />}
                  {p.link === "lead" && (
                    <button type="button" onClick={onOpenLead} className="mt-0.5 inline-flex min-h-[36px] w-fit items-center text-sm font-bold text-sun hover:underline">
                      {t("Read it →")}
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </aside>
  );
}

/* ───────── Section ───────── */

export default function News() {
  const { t } = useLang();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const shown = ARTICLES.filter(a => filter === "All" || a.category === filter);

  return (
    <section id="news" aria-labelledby="news-h" className="paper scroll-mt-20 bg-bone text-umber">
      <div className="container-x py-20 sm:py-24">
        <div className="mb-8 flex flex-col gap-3.5">
          <SectionHead number="04" label="News & commentary" labelClass="text-ochre">
            <span id="news-h">
              {t("Echoes of the")} <Accent className="text-ochre">{t("road")}</Accent>
            </span>
          </SectionHead>
          <Reveal as="p" className="max-w-[620px] text-[17px] leading-relaxed text-loam">
            {t("What's going on in Chihuahua and the world, with Felipe's own take on every story.")}
          </Reveal>
        </div>

        {/* lead story with his full take */}
        <Reveal as="article" className="flex flex-wrap gap-10 border-t-2 border-umber pb-11 pt-8">
          <ImageReveal radius={18} className="aspect-[3/2] min-w-0 max-w-full flex-[1_1_480px] bg-clay">
            <button type="button" onClick={() => setOpen(LEAD_STORY)} aria-label={`${t("Read:")} ${t(LEAD_STORY.title)}`} className="group absolute inset-0 block overflow-hidden">
              <img src={LEAD_STORY.photo} alt={t(LEAD_STORY.alt)} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" style={{ objectPosition: LEAD_STORY.pos }} />
              <span className="absolute left-4 top-4 rounded-md bg-bone px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-umber">{t("Lead story")}</span>
              {isFresh(LEAD_STORY.ago) && <NewBadge className="absolute right-4 top-4 px-2.5 py-1 text-xs" />}
            </button>
          </ImageReveal>
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ochre">
              {t(LEAD_STORY.category)} · {t(LEAD_STORY.ago)} · {t(LEAD_STORY.read)}
            </span>
            <h3 className="h-display text-[clamp(22px,2.6vw,34px)] leading-tight">
              <button type="button" onClick={() => setOpen(LEAD_STORY)} className="text-left hover:text-ochre">{t(LEAD_STORY.title)}</button>
            </h3>
            <p className="text-[17px] leading-relaxed text-loam">
              {t(LEAD_STORY.summary)} <span className="text-bark">{t("Source:")} {t(LEAD_STORY.source)}</span>
            </p>
            <figure className="relative flex flex-col gap-3.5 rounded-[18px] bg-umber px-6 pb-5 pt-5 text-bone">
              <span aria-hidden className="absolute -top-2.5 left-8 h-5 w-5 rotate-45 rounded-[3px] bg-umber" />
              <figcaption className="flex items-center gap-3">
                <Avatar />
                <span className="flex flex-col">
                  <strong className="text-[15px]">{t(`${HOST.name}'s take`)}</strong>
                  <span className="text-[13px] text-dust">{t("Added")} {t(LEAD_STORY.takeAgo)}</span>
                </span>
              </figcaption>
              <blockquote className="font-serif text-[23px] italic leading-snug text-cream">“{t(LEAD_STORY.take)}”</blockquote>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
                <button type="button" onClick={() => setOpen(LEAD_STORY)} className="pill-gold">{t("Read article + full take")}</button>
                <button type="button" onClick={() => setOpen(LEAD_STORY)} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-haze hover:text-gold">
                  <MessageCircle aria-hidden className="h-[18px] w-[18px]" /> {LEAD_STORY.comments} {t("comments")}
                </button>
              </div>
            </figure>
          </div>
        </Reveal>

        <div className="flex flex-wrap items-start gap-8 border-t border-umber pt-6">
          <div className="min-w-0 flex-[1_1_560px]">
            {/* filters (UI/UX Pro Max: aria-pressed toggles, 44px targets) */}
            <div role="group" aria-label={t("Filter stories")} className="mb-6 flex flex-wrap gap-2">
              {NEWS_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`pill border font-semibold ${filter === f ? "border-umber bg-umber text-bone" : "border-dune text-umber hover:border-umber"}`}
                >
                  {t(f)}
                </button>
              ))}
            </div>

            <motion.ul layout className="grid gap-6 sm:grid-cols-2" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map(a => (
                  <motion.li
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SpotlightCard as="article" className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-cream shadow-[0_20px_50px_rgba(43,29,23,0.08)]">
                      <button type="button" onClick={() => setOpen(a)} tabIndex={-1} aria-hidden className="block aspect-[16/10] overflow-hidden bg-clay">
                        <img src={a.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: a.pos }} />
                      </button>
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ochre">{t(a.category)} · {t(a.ago)}{isFresh(a.ago) && <NewBadge />}</span>
                        <h3 className="font-display text-[20px] font-semibold leading-snug">
                          <button type="button" onClick={() => setOpen(a)} className="text-left hover:text-ochre">{t(a.title)}</button>
                        </h3>
                        <p className="text-[15px] leading-relaxed text-bark">{t(a.source)}</p>
                        <p className="mt-auto flex items-start gap-2.5 rounded-xl bg-paper p-3">
                          <Avatar size={28} />
                          <span className="font-serif text-lg italic leading-snug text-clay">“{t(a.take)}”</span>
                        </p>
                        <button type="button" onClick={() => setOpen(a)} className="inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-loam hover:text-ochre">
                          <MessageCircle aria-hidden className="h-4 w-4" /> {a.comments} {t("comments")} · {t("Read his full take")}
                        </button>
                      </div>
                    </SpotlightCard>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {shown.length === 0 && <p className="py-8 text-loam">{t("No stories here yet.")}</p>}

            <a href="#" className="mt-6 inline-flex min-h-[44px] items-center font-bold text-ochre hover:underline">
              {t("All articles and commentary →")}
            </a>
          </div>

          <div className="min-w-0 flex-[1_1_320px] lg:max-w-[380px]">
            <Desk onOpenLead={() => setOpen(LEAD_STORY)} />
          </div>
        </div>
      </div>

      <AnimatePresence>{open && <Reader key={open.id} story={open} onClose={close} />}</AnimatePresence>
    </section>
  );
}
