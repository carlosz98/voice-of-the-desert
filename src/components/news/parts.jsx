import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Camera, Link2, MessageCircle, Mic, Music, NotebookPen, Send } from "lucide-react";
import { DESK, HOST, LEAD_STORY, NEXT_POST } from "../../lib/data.js";
import { useLang } from "../../lib/i18n.jsx";
import { Link } from "../../lib/router.jsx";
import { useAuth } from "../../lib/auth.jsx";
import { EASE } from "../ui/Reveal.jsx";
import { SpotlightCard } from "../ui/SpotlightCard.jsx";
import { NewBadge, isFresh } from "../ui/NewBadge.jsx";

export const storyPath = story => `/noticias/${story.slug}`;

export function Avatar({ size = 40, className = "" }) {
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

/* ───────── Story card (grid) ───────── */

export function StoryCard({ story, headingLevel = 3 }) {
  const { t } = useLang();
  const H = `h${headingLevel}`;
  return (
    <SpotlightCard as="article" className="group relative flex h-full flex-col overflow-hidden rounded-[18px] bg-cream shadow-[0_20px_50px_rgba(43,29,23,0.08)]">
      <div className="aspect-[16/10] overflow-hidden bg-clay">
        <img src={story.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: story.pos }} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="flex flex-wrap items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ochre">
          {t(story.category)} · {t(story.ago)}
          {isFresh(story.ago) && <NewBadge />}
        </span>
        <H className="font-display text-[20px] font-semibold leading-snug">
          {/* the whole card is clickable through this link's stretched area */}
          <Link to={storyPath(story)} className="text-left after:absolute after:inset-0 after:content-[''] hover:text-ochre">
            {t(story.title)}
          </Link>
        </H>
        <p className="text-[15px] leading-relaxed text-bark">{t(story.source)}</p>
        <p className="mt-auto flex items-start gap-2.5 rounded-xl bg-paper p-3">
          <Avatar size={28} />
          <span className="font-serif text-lg italic leading-snug text-clay">“{t(story.take)}”</span>
        </p>
        <span className="inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-loam">
          <MessageCircle aria-hidden className="h-4 w-4" /> {story.comments} {t("comments")} · {t("Read his full take")}
        </span>
      </div>
    </SpotlightCard>
  );
}

/* Compact row for side lists ("most commented", "more stories"). */
export function StoryRow({ story, rank }) {
  const { t } = useLang();
  return (
    <Link to={storyPath(story)} className="group flex items-center gap-3.5 rounded-xl py-2.5 transition-colors">
      {rank != null && <span className="w-6 flex-none font-display text-2xl font-semibold text-gold">{rank}</span>}
      <img src={story.photo} alt="" loading="lazy" className="h-14 w-14 flex-none rounded-lg object-cover" style={{ objectPosition: story.pos }} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="line-clamp-2 font-display text-[15px] font-semibold leading-snug group-hover:text-ochre">{t(story.title)}</span>
        <span className="flex items-center gap-1.5 text-xs text-bark">
          <MessageCircle aria-hidden className="h-3.5 w-3.5" /> {story.comments} · {t(story.category)}
        </span>
      </span>
    </Link>
  );
}

/* ───────── Comments ───────── */

export function Comments({ story, idPrefix = "c" }) {
  const { t } = useLang();
  const { isFelipe } = useAuth();
  const [extra, setExtra] = useState([]);
  const [draft, setDraft] = useState("");
  const thread = [...(story.thread || []), ...extra];

  const post = e => {
    e.preventDefault();
    if (!draft.trim()) return;
    setExtra(x => [...x, { name: isFelipe ? HOST.name : "You", host: isFelipe, ago: "Just now", text: draft.trim(), mine: true }]);
    setDraft("");
  };

  return (
    <section aria-labelledby={`${idPrefix}-comments-h`} className="flex flex-col gap-4">
      <h2 id={`${idPrefix}-comments-h`} className="font-display text-2xl font-semibold">
        {(story.comments || thread.length) + extra.length} {t("comments")}
      </h2>
      <ul className="flex flex-col gap-4">
        {thread.map((c, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${c.host ? "ml-8 sm:ml-12" : ""}`}>
            {c.host ? <Avatar size={36} /> : <ReaderAvatar name={c.name} />}
            <div className={`flex-1 rounded-2xl px-4 py-3 ${c.host ? "bg-umber text-bone" : "bg-cream"}`}>
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                <strong className="text-[15px]">{t(c.name)}</strong>
                {c.host && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-umber">{t("Host")}</span>}
                <span className={`text-xs ${c.host ? "text-dust" : "text-bark"}`}>{t(c.ago)}</span>
              </div>
              <p className="text-[16px] leading-relaxed">{c.mine ? c.text : t(c.text)}</p>
            </div>
          </motion.li>
        ))}
      </ul>
      <form onSubmit={post} className="flex gap-2">
        <label htmlFor={`${idPrefix}-comment`} className="sr-only">{t("Add a comment")}</label>
        <input
          id={`${idPrefix}-comment`}
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

export function Desk({ sticky = true }) {
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
      setPosts(p => (p[0]?.id === NEXT_POST.id ? p : [NEXT_POST, ...p]));
    }, 4200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [inView]);

  return (
    <aside ref={ref} aria-labelledby="desk-h" className={`rounded-[22px] bg-umber p-5 text-bone shadow-[0_30px_60px_rgba(43,29,23,0.18)] sm:p-6 ${sticky ? "lg:sticky lg:top-24" : ""}`}>
      <div className="mb-4 flex items-center gap-3">
        <Avatar size={46} className="ring-2 ring-gold/40 ring-offset-2 ring-offset-umber" />
        <div className="flex flex-col">
          <h2 id="desk-h" className="font-display text-xl font-semibold">{t("From Felipe's desk")}</h2>
          <span className="flex items-center gap-1.5 text-sm text-dust">
            <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping2 rounded-full bg-gold" /><span className="relative h-2 w-2 rounded-full bg-gold" /></span>
            {t("Online now")}
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {typing && (
          <motion.div key="typing" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
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
                    <Link to={storyPath(LEAD_STORY)} className="mt-0.5 inline-flex min-h-[36px] w-fit items-center text-sm font-bold text-sun hover:underline">
                      {t("Read it →")}
                    </Link>
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
