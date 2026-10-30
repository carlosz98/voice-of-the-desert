import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ARTICLES, HOST, LEAD_STORY, NEWS_FILTERS } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { Accent } from "./ui/Accent.jsx";
import { ImageReveal, Reveal, SectionHead } from "./ui/Reveal.jsx";
import { NewBadge, isFresh } from "./ui/NewBadge.jsx";
import { Avatar, Desk, StoryCard, storyPath } from "./news/parts.jsx";

const ON_HOME = 4; // the newest few; the rest live on /noticias

/* Lead story with his take: used on the home page and on /noticias. */
export function LeadStory({ story = LEAD_STORY, headingLevel = 3 }) {
  const { t } = useLang();
  const H = `h${headingLevel}`;
  return (
    <Reveal as="article" className="flex flex-wrap gap-10 border-t-2 border-umber pb-11 pt-8">
      <ImageReveal radius={18} className="aspect-[3/2] min-w-0 max-w-full flex-[1_1_480px] bg-clay">
        <Link to={storyPath(story)} aria-label={`${t("Read:")} ${t(story.title)}`} className="group absolute inset-0 block overflow-hidden">
          <img src={story.photo} alt={t(story.alt || "")} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" style={{ objectPosition: story.pos }} />
          <span className="absolute left-4 top-4 rounded-md bg-bone px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-umber">{t("Lead story")}</span>
          {isFresh(story.ago) && <NewBadge className="absolute right-4 top-4 px-2.5 py-1 text-xs" />}
        </Link>
      </ImageReveal>
      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ochre">
          {t(story.category)} · {t(story.ago)} · {t(story.read)}
        </span>
        <H className="h-display text-[clamp(22px,2.6vw,34px)] leading-tight">
          <Link to={storyPath(story)} className="hover:text-ochre">{t(story.title)}</Link>
        </H>
        <p className="text-[17px] leading-relaxed text-loam">
          {t(story.summary)} <span className="text-bark">{t("Source:")} {t(story.source)}</span>
        </p>
        <figure className="relative flex flex-col gap-3.5 rounded-[18px] bg-umber px-6 pb-5 pt-5 text-bone">
          <span aria-hidden className="absolute -top-2.5 left-8 h-5 w-5 rotate-45 rounded-[3px] bg-umber" />
          <figcaption className="flex items-center gap-3">
            <Avatar />
            <span className="flex flex-col">
              <strong className="text-[15px]">{t(`${HOST.name}'s take`)}</strong>
              <span className="text-[13px] text-dust">{t("Added")} {t(story.takeAgo || story.ago)}</span>
            </span>
          </figcaption>
          <blockquote className="font-serif text-[23px] italic leading-snug text-cream">“{t(story.take)}”</blockquote>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
            <Link to={storyPath(story)} className="pill-gold">{t("Read article + full take")}</Link>
            <Link to={`${storyPath(story)}#comments`} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-haze hover:text-gold">
              <MessageCircle aria-hidden className="h-[18px] w-[18px]" /> {story.comments} {t("comments")}
            </Link>
          </div>
        </figure>
      </div>
    </Reveal>
  );
}

export default function News() {
  const { t } = useLang();
  const [filter, setFilter] = useState("All");
  const shown = ARTICLES.filter(a => filter === "All" || a.category === filter).slice(0, ON_HOME);
  const allLink = filter === "All" ? "/noticias" : `/noticias?tema=${encodeURIComponent(filter)}`;

  return (
    <section id="news" aria-labelledby="news-h" className="paper scroll-mt-20 bg-bone text-umber">
      <div className="container-x py-20 sm:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3.5">
            <SectionHead number="04" label="News & commentary" labelClass="text-ochre">
              <span id="news-h">
                {t("Echoes of the")} <Accent className="text-ochre">{t("road")}</Accent>
              </span>
            </SectionHead>
            <Reveal as="p" className="max-w-[620px] text-[17px] leading-relaxed text-loam">
              {t("What's going on in Chihuahua and the world, with Felipe's own take on every story.")}
            </Reveal>
          </div>
          <Link to="/noticias" className="inline-flex min-h-[44px] items-center gap-2 font-bold text-ochre hover:underline">
            {t("All the stories")} <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <LeadStory />

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
                  <motion.li key={a.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}>
                    <StoryCard story={a} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {shown.length === 0 && <p className="py-8 text-loam">{t("No stories here yet.")}</p>}

            <Link to={allLink} className="pill-dark mt-8">
              {t("All articles and commentary →")}
            </Link>
          </div>

          <div className="min-w-0 flex-[1_1_320px] lg:max-w-[380px]">
            <Desk />
          </div>
        </div>
      </div>
    </section>
  );
}
