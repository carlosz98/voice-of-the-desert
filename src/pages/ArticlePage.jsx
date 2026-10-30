import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Link2 } from "lucide-react";
import { ALL_STORIES, HOST, storyBySlug } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { EASE, ImageReveal, Reveal } from "../components/ui/Reveal.jsx";
import { NewBadge, isFresh } from "../components/ui/NewBadge.jsx";
import { Comments, StoryCard, storyPath } from "../components/news/parts.jsx";
import { WhatsAppGlyph, whatsappLink } from "../components/TopStrip.jsx";

function ShareBar({ story }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const url = window.location.href.split("#comments")[0];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-bark">{t("Share this story")}</span>
      <a
        href={whatsappLink(`${t(story.title)}\n\n${t("Shared from Voice of the Desert")}: ${url}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#2B6B3F] px-4 text-sm font-semibold text-cream transition-colors hover:bg-[#245A35]"
      >
        <WhatsAppGlyph /> WhatsApp
      </a>
      <button type="button" onClick={copy} className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-dune px-4 text-sm font-semibold transition-colors hover:border-umber">
        {copied ? <Check aria-hidden className="h-4 w-4 text-ochre" /> : <Link2 aria-hidden className="h-4 w-4" />}
        <span aria-live="polite">{copied ? t("Link copied") : t("Copy link")}</span>
      </button>
    </div>
  );
}

function Missing() {
  const { t } = useLang();
  return (
    <section className="paper flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-bone px-5 pb-20 pt-40 text-center text-umber">
      <h1 className="h-display text-[clamp(32px,4vw,52px)]">{t("Story not found")}</h1>
      <p className="max-w-md text-lg text-loam">{t("It may have moved, or the link is incomplete.")}</p>
      <Link to="/noticias" className="pill-dark">{t("Back to all stories")}</Link>
    </section>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { t } = useLang();
  const story = storyBySlug(slug);

  useEffect(() => {
    if (story) document.title = `${t(story.title)} · ${t("Voice of the Desert")}`;
  }, [story, t]);

  if (!story) return <Missing />;

  const index = ALL_STORIES.indexOf(story);
  const prev = ALL_STORIES[index - 1];
  const next = ALL_STORIES[index + 1];
  // same topic first, then the newest others
  const related = [
    ...ALL_STORIES.filter(a => a !== story && a.category === story.category),
    ...ALL_STORIES.filter(a => a !== story && a.category !== story.category),
  ].slice(0, 3);
  const body = story.body || [story.summary];

  return (
    <article key={story.slug} className="paper bg-bone text-umber">
      {/* headline */}
      <header className="container-x max-w-[900px] pb-8 pt-[150px] sm:pt-[170px]">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-bark">
          <Link to="/" className="hover:text-ochre">{t("Home")}</Link>
          <ChevronRight aria-hidden className="h-4 w-4" />
          <Link to="/noticias" className="hover:text-ochre">{t("News")}</Link>
          <ChevronRight aria-hidden className="h-4 w-4" />
          <Link to={`/noticias?tema=${encodeURIComponent(story.category)}`} className="hover:text-ochre">{t(story.category)}</Link>
        </nav>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ochre">
          {t(story.category)} · {t(story.ago)} · {t(story.read)}
          {isFresh(story.ago) && <NewBadge />}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.05 }} className="h-display text-[clamp(32px,4.6vw,58px)] leading-[1.08]">
          {t(story.title)}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-5 font-serif text-[clamp(22px,2.4vw,28px)] italic leading-snug text-loam">
          {t(story.summary)}
        </motion.p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-dune py-4">
          <span className="text-sm text-bark">
            {t("Source:")} <strong className="text-loam">{t(story.source)}</strong>
          </span>
          <ShareBar story={story} />
        </div>
      </header>

      {/* photo */}
      <div className="container-x max-w-[1100px]">
        <ImageReveal radius={20} className="aspect-[16/9] w-full bg-clay sm:aspect-[21/9]">
          <img src={story.photo} alt={t(story.alt || "")} className="h-full w-full object-cover" style={{ objectPosition: story.pos }} />
        </ImageReveal>
      </div>

      {/* text, Felipe's take, comments */}
      <div className="container-x flex max-w-[760px] flex-col gap-10 py-12 sm:py-14">
        <div className="flex flex-col gap-5">
          {body.map((p, i) => (
            <Reveal key={i} as="p" delay={i * 0.04} className={`text-[19px] leading-[1.75] text-loam ${i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[64px] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-ochre" : ""}`}>
              {t(p)}
            </Reveal>
          ))}
          <p className="text-sm text-bark">{t("Sample story for the demo. Originally published by")} {t(story.source)}.</p>
        </div>

        {/* his take, written like a letter */}
        <Reveal>
          <figure className="relative rounded-[6px] border border-dune bg-cream px-6 pb-7 pt-8 shadow-[0_24px_60px_rgba(43,29,23,0.12)] sm:px-10">
            <span aria-hidden className="absolute -top-2 right-8 h-14 w-5 bg-rust [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" />
            <figcaption className="mb-4 flex items-center gap-3.5">
              <img src={HOST.face} alt="" className="h-14 w-14 rounded-full border-2 border-gold object-cover" />
              <span className="flex flex-col">
                <strong className="font-display text-lg">{t(`${HOST.name}'s take`)}</strong>
                <span className="text-sm text-bark">{t("Added")} {t(story.takeAgo || story.ago)}</span>
              </span>
            </figcaption>
            <blockquote className="font-serif text-[clamp(22px,2.6vw,28px)] font-medium italic leading-snug text-umber">
              “{t(story.longTake || story.take)}”
            </blockquote>
            <p className="mt-4 text-right font-script text-[36px] leading-none text-rust">— Felipe</p>
          </figure>
        </Reveal>

        <div id="comments" className="scroll-mt-28">
          <Comments story={story} idPrefix={story.slug} />
        </div>

        {/* previous / next */}
        <nav aria-label={t("More stories")} className="grid gap-3 border-t border-dune pt-8 sm:grid-cols-2">
          {prev ? (
            <Link to={storyPath(prev)} className="group flex flex-col gap-1 rounded-2xl border border-dune p-4 transition-colors hover:border-umber">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-bark"><ArrowLeft aria-hidden className="h-4 w-4" /> {t("Previous story")}</span>
              <span className="font-display font-semibold leading-snug group-hover:text-ochre">{t(prev.title)}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link to={storyPath(next)} className="group flex flex-col items-end gap-1 rounded-2xl border border-dune p-4 text-right transition-colors hover:border-umber">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-bark">{t("Next story")} <ArrowRight aria-hidden className="h-4 w-4" /></span>
              <span className="font-display font-semibold leading-snug group-hover:text-ochre">{t(next.title)}</span>
            </Link>
          )}
        </nav>
      </div>

      {/* more stories */}
      <section aria-labelledby="more-h" className="border-t border-dune bg-sand/40">
        <div className="container-x py-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <h2 id="more-h" className="h-display text-[clamp(26px,3vw,38px)]">{t("More stories")}</h2>
            <Link to="/noticias" className="inline-flex min-h-[44px] items-center gap-2 font-bold text-ochre hover:underline">
              <ArrowLeft aria-hidden className="h-4 w-4" /> {t("Back to all stories")}
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(a => (
              <li key={a.id}><StoryCard story={a} /></li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
