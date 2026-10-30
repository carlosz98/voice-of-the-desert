import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ALL_VIDEOS, HOST, PHOTOS, VIDEO_FILTERS, videoBySlug } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { tuneIn } from "../lib/radio.js";
import PageHeader from "../components/PageHeader.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { EASE, Reveal } from "../components/ui/Reveal.jsx";
import { NewBadge, isFresh } from "../components/ui/NewBadge.jsx";
import { Comments } from "../components/news/parts.jsx";

export const videoPath = v => `/videos/${v.slug}`;

export function VideoCard({ video, big = false }) {
  const { t } = useLang();
  return (
    <Link to={videoPath(video)} className="group flex flex-col gap-3">
      <span className={`relative block overflow-hidden rounded-2xl bg-clay ${big ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        <img src={video.photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" style={{ objectPosition: video.pos }} />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
        <span aria-hidden className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-umber opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Play className="ml-1 h-5 w-5" fill="currentColor" />
        </span>
        <span className="absolute bottom-2.5 right-2.5 rounded bg-earth/90 px-2 py-0.5 font-mono text-xs tabular-nums text-bone">{video.length}</span>
        {(video.isNew || isFresh(video.ago)) && <NewBadge className="absolute left-2.5 top-2.5" />}
      </span>
      <span className="flex flex-col gap-1">
        <strong className={`leading-snug transition-colors group-hover:text-ochre ${big ? "font-display text-2xl" : "text-[17px]"}`}>{t(video.title)}</strong>
        <span className="text-sm text-bark">
          {video.creator} · {t(video.views)} · {t(video.ago)}
        </span>
      </span>
    </Link>
  );
}

/* /videos */
export default function VideosPage() {
  const { t, lang } = useLang();
  const [params, setParams] = useSearchParams();
  const filter = VIDEO_FILTERS.includes(params.get("de")) ? params.get("de") : "All";
  const list = ALL_VIDEOS.filter(v => filter === "All" || v.from === filter);
  const [first, ...rest] = list;

  return (
    <>
      <PageHeader
        page="Videos"
        eyebrow={`${t("Chapter")} ${t("one")} · ${t("Watch")}`}
        title={<>{t("Views of the")} <Accent className="text-sun">{t("horizon")}</Accent></>}
        subtitle={t("Videos, music, news and a podcast, all in one place. Press play, or upload your own.")}
        meta={`${ALL_VIDEOS.length} ${t("Videos").toLowerCase()}`}
        photo={PHOTOS.adobe}
        pos="50% 50%"
      />
      <div className="paper bg-bone text-umber">
        <div className="container-x py-10 sm:py-12">
          <div role="group" aria-label={t("Filter stories")} className="mb-8 flex flex-wrap gap-2">
            {VIDEO_FILTERS.map(f => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setParams(f === "All" ? {} : { de: f }, { replace: true })}
                className={`pill border font-semibold ${filter === f ? "border-umber bg-umber text-bone" : "border-dune text-umber hover:border-umber"}`}
              >
                {t(f)}
              </button>
            ))}
          </div>

          {first && (
            <Reveal className="mb-10 grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <VideoCard video={first} big />
              <div className="flex flex-col gap-4">
                <span className="eyebrow text-ochre">{t(first.from)}</span>
                <p className="text-[17px] leading-relaxed text-loam">{t(first.description)}</p>
                <figure className="flex items-start gap-3 rounded-2xl bg-umber p-4 text-bone">
                  <img src={HOST.face} alt="" className="h-10 w-10 flex-none rounded-full border-2 border-gold object-cover" />
                  <span className="flex flex-col gap-1">
                    <strong className="text-sm text-sun">{t("Felipe's note")}</strong>
                    <blockquote className="font-serif text-lg italic leading-snug text-cream">“{t(first.note)}”</blockquote>
                  </span>
                </figure>
                <Link to={videoPath(first)} className="pill-gold w-fit">
                  <Play aria-hidden className="h-4 w-4" fill="currentColor" /> {t("Watch the video")}
                </Link>
              </div>
            </Reveal>
          )}

          <motion.ul layout className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {rest.map(v => (
                <motion.li key={v.id + lang} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                  <VideoCard video={v} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      </div>
    </>
  );
}

/* The player is a stand-in until real videos are uploaded: it shows the
 * poster, a play button and a moving progress bar. */
function DemoPlayer({ video }) {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => setProgress(p => (p >= 1 ? 0 : p + 0.004)), 250);
    return () => clearInterval(timer.current);
  }, [playing]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-night shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
      <img src={video.photo} alt="" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[20s] ease-linear ${playing ? "scale-110" : "scale-100"}`} style={{ objectPosition: video.pos }} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-transparent" />
      <button
        type="button"
        onClick={() => { if (!playing) tuneIn(); setPlaying(p => !p); }}
        aria-label={t(playing ? "Pause video" : "Play video")}
        className={`absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/95 text-umber shadow-xl transition-all duration-300 hover:scale-105 ${playing ? "opacity-0 hover:opacity-100 focus-visible:opacity-100" : ""}`}
      >
        {playing ? <Pause className="h-7 w-7" fill="currentColor" /> : <Play className="ml-1 h-7 w-7" fill="currentColor" />}
      </button>
      <AnimatePresence>
        {playing && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-4 top-4 rounded-full bg-night/70 px-3 py-1.5 text-xs text-haze backdrop-blur">
            {t("Demo: the real video plays here once it's uploaded.")}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 text-xs tabular-nums text-haze">
        <span aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-bone/25">
          <span className="block h-full origin-left rounded-full bg-gold transition-transform duration-300" style={{ transform: `scaleX(${progress})` }} />
        </span>
        <span>{video.length}</span>
      </div>
    </div>
  );
}

/* /videos/:slug */
export function VideoPage() {
  const { slug } = useParams();
  const { t } = useLang();
  const video = videoBySlug(slug);

  useEffect(() => {
    if (video) document.title = `${t(video.title)} · ${t("Voice of the Desert")}`;
  }, [video, t]);

  if (!video) {
    return (
      <section className="paper flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-bone px-5 pb-20 pt-40 text-center text-umber">
        <h1 className="h-display text-[clamp(32px,4vw,52px)]">{t("Video not found")}</h1>
        <Link to="/videos" className="pill-dark">{t("All videos")}</Link>
      </section>
    );
  }

  const more = ALL_VIDEOS.filter(v => v !== video).slice(0, 3);

  return (
    <div key={video.slug} className="paper bg-bone text-umber">
      <div className="bg-earth pb-10 pt-[140px] sm:pt-[156px]">
        <div className="container-x max-w-[1100px]">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-dust">
            <Link to="/" className="hover:text-gold">{t("Home")}</Link>
            <ChevronRight aria-hidden className="h-4 w-4" />
            <Link to="/videos" className="hover:text-gold">{t("Videos")}</Link>
          </nav>
          <DemoPlayer video={video} />
        </div>
      </div>

      <div className="container-x flex max-w-[1100px] flex-wrap gap-10 py-10 sm:py-12">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="flex flex-wrap items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ochre">
              {t(video.from)} · {t(video.ago)} · {t(video.views)}
              {(video.isNew || isFresh(video.ago)) && <NewBadge />}
            </span>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="h-display text-[clamp(28px,3.6vw,46px)]">
              {t(video.title)}
            </motion.h1>
            <p className="text-sm text-bark">{t("by")} <strong className="text-loam">{video.creator}</strong></p>
          </div>
          <p className="text-[18px] leading-relaxed text-loam">{t(video.description)}</p>
          <figure className="relative rounded-[6px] border border-dune bg-cream px-6 pb-6 pt-7 shadow-[0_20px_50px_rgba(43,29,23,0.1)]">
            <figcaption className="mb-3 flex items-center gap-3">
              <img src={HOST.face} alt="" className="h-12 w-12 rounded-full border-2 border-gold object-cover" />
              <strong className="font-display text-lg">{t("Felipe's note")}</strong>
            </figcaption>
            <blockquote className="font-serif text-[24px] font-medium italic leading-snug">“{t(video.note)}”</blockquote>
            <p className="mt-3 text-right font-script text-[32px] leading-none text-rust">— Felipe</p>
          </figure>
          <div id="comments" className="scroll-mt-28">
            <Comments story={video} idPrefix={video.slug} />
          </div>
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-6 lg:max-w-[340px]">
          <h2 className="font-display text-xl font-semibold">{t("More videos")}</h2>
          {more.map(v => <VideoCard key={v.id} video={v} />)}
          <Link to="/videos" className="inline-flex min-h-[44px] items-center gap-2 font-bold text-ochre hover:underline">
            <ArrowLeft aria-hidden className="h-4 w-4" /> {t("All videos")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
