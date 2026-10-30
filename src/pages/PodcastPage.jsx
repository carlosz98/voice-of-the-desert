import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Headphones, Mic, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { EPISODES, HOST, PHOTOS, episodeBySlug } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { fmt } from "../lib/player.jsx";
import { tuneIn } from "../lib/radio.js";
import PageHeader from "../components/PageHeader.jsx";
import NextEpisode from "../components/NextEpisode.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { EASE, Reveal } from "../components/ui/Reveal.jsx";
import { NewBadge } from "../components/ui/NewBadge.jsx";
import { Comments } from "../components/news/parts.jsx";

export const episodePath = e => `/podcast/${e.slug}`;
const secs = s => s.split(":").reduce((a, n) => a * 60 + Number(n), 0);

function EpisodeCard({ ep }) {
  const { t } = useLang();
  return (
    <Link to={episodePath(ep)} className="group flex gap-4 rounded-[20px] border border-[#F3E2C2]/15 bg-[#F3E2C2]/[0.05] p-4 transition-colors hover:border-gold/60 sm:gap-5 sm:p-5">
      <span className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl sm:h-28 sm:w-28">
        <img src={ep.photo} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: ep.pos }} />
        <span aria-hidden className="absolute inset-0 grid place-items-center bg-night/30 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-umber"><Play className="ml-0.5 h-4 w-4" fill="currentColor" /></span>
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-sun">
          Ep. {ep.number} · {ep.length} · {t(ep.ago)} {ep.isNew && <NewBadge />}
        </span>
        <strong className="font-display text-xl font-semibold leading-snug text-cream group-hover:text-sun">{t(ep.title)}</strong>
        <span className="text-sm text-dust">{t("with")} <span className="text-haze">{ep.guest}</span> · {t(ep.guestRole)}</span>
        <span className="line-clamp-2 text-[15px] leading-relaxed text-haze">{t(ep.summary)}</span>
      </span>
    </Link>
  );
}

/* /podcast */
export default function PodcastPage() {
  const { t } = useLang();
  const [latest, ...older] = EPISODES;
  return (
    <>
      <PageHeader
        page="Podcast"
        eyebrow={`${t("Chapter")} ${t("three")} · ${t("The podcast")}`}
        title={<>{t("Voices of the")} <Accent className="text-sun">{t("world")}</Accent></>}
        subtitle={t("Conversations with people from everywhere: their stories, their music, and what the news leaves out. Hosted by Felipe Lerma.")}
        meta={`${EPISODES.length} ${t("Episodes").toLowerCase()} · ${t("Listen here, and soon on Spotify, Apple Podcasts and YouTube.")}`}
        photo={PHOTOS.sunset}
        pos="50% 70%"
      >
        <div className="mt-2"><NextEpisode /></div>
      </PageHeader>

      <div className="relative bg-night text-bone">
        <div className="container-x flex flex-col gap-12 py-12 sm:py-16">
          {/* latest */}
          <Reveal className="grid items-center gap-8 overflow-hidden rounded-[26px] bg-[#F3E2C2]/[0.06] p-5 ring-1 ring-[#F3E2C2]/15 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
            <Link to={episodePath(latest)} className="group relative block aspect-square overflow-hidden rounded-2xl sm:aspect-[4/3]">
              <img src={latest.photo} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: latest.pos }} />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
              <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-semibold text-umber">
                <Play aria-hidden className="h-4 w-4" fill="currentColor" /> {t("Listen now")}
              </span>
            </Link>
            <div className="flex flex-col gap-4">
              <span className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-sun">
                {t("Latest episode")} · Ep. {latest.number} · {latest.length} {latest.isNew && <NewBadge />}
              </span>
              <h2 className="h-display text-[clamp(28px,3.4vw,44px)] text-cream">
                <Link to={episodePath(latest)} className="hover:text-sun">{t(latest.title)}</Link>
              </h2>
              <p className="flex items-center gap-2 text-haze"><Mic aria-hidden className="h-4 w-4 text-sun" /> {latest.guest} · {t(latest.guestRole)}</p>
              <p className="text-[17px] leading-relaxed text-haze">{t(latest.summary)}</p>
              <figure className="flex items-start gap-3 rounded-2xl bg-night/60 p-4">
                <img src={HOST.face} alt="" className="h-10 w-10 flex-none rounded-full border-2 border-gold object-cover" />
                <blockquote className="font-serif text-lg italic leading-snug text-cream">“{t(latest.note)}”</blockquote>
              </figure>
            </div>
          </Reveal>

          <section aria-labelledby="eps-h" className="flex flex-col gap-5">
            <h2 id="eps-h" className="h-display text-[clamp(26px,3vw,38px)] text-cream">{t("All episodes")}</h2>
            <ul className="grid gap-5 lg:grid-cols-2">
              {older.map((ep, i) => (
                <Reveal as="li" key={ep.id} delay={i * 0.04}><EpisodeCard ep={ep} /></Reveal>
              ))}
            </ul>
            <p className="text-xs text-dust">{t("Guests and episodes are samples for the demo.")}</p>
          </section>
        </div>
      </div>
    </>
  );
}

/* Stand-in audio player: a clock that runs, chapters you can jump to and
 * ±15 seconds. Swap for an <audio> element when the real files exist. */
function EpisodePlayer({ ep }) {
  const { t } = useLang();
  const total = secs(ep.length);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime(s => Math.min(total, s + 1)), 1000);
    return () => clearInterval(id);
  }, [playing, total]);
  useEffect(() => {
    if (time >= total) setPlaying(false);
  }, [time, total]);
  const jump = s => { setTime(Math.max(0, Math.min(total, s))); };
  const current = [...ep.chapters].reverse().find(([at]) => secs(at) <= time);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[22px] bg-umber p-5 text-bone sm:p-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => jump(time - 15)} aria-label={t("Rewind 15 seconds")} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-gold hover:text-gold">
            <RotateCcw aria-hidden className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => { if (!playing) tuneIn(); setPlaying(p => !p); }}
            aria-label={t(playing ? "Pause episode" : "Play episode")}
            className="grid h-[68px] w-[68px] flex-none place-items-center rounded-full bg-gold text-umber shadow-[0_10px_40px_rgba(230,176,74,0.4)] transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <Pause aria-hidden className="h-6 w-6" fill="currentColor" /> : <Play aria-hidden className="ml-1 h-6 w-6" fill="currentColor" />}
          </button>
          <button type="button" onClick={() => jump(time + 15)} aria-label={t("Forward 15 seconds")} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-gold hover:text-gold">
            <RotateCw aria-hidden className="h-5 w-5" />
          </button>
          <span className="ml-1 hidden min-w-0 flex-col sm:flex">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-sun">{t(playing ? "Playing" : "Paused")}</span>
            <span className="truncate text-haze">{current ? t(current[1]) : ""}</span>
          </span>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="sr-only">{t("Jump to")}</span>
          <input
            type="range"
            min={0}
            max={total}
            value={time}
            onChange={e => jump(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F3E2C2]/20 accent-[#E6B04A]"
          />
          <span className="flex justify-between font-mono text-[13px] tabular-nums text-dust">
            <span>{fmt(time)}</span>
            <span>{ep.length}</span>
          </span>
        </label>
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-semibold">{t("Chapters")}</h2>
        <ol className="flex flex-col">
          {ep.chapters.map(([at, label]) => {
            const on = current && current[0] === at;
            return (
              <li key={at}>
                <button
                  type="button"
                  onClick={() => { jump(secs(at)); if (!playing) { tuneIn(); setPlaying(true); } }}
                  className={`flex min-h-[48px] w-full items-center gap-4 border-b border-dune px-2 text-left transition-colors hover:bg-paper/70 ${on ? "bg-paper font-semibold" : ""}`}
                >
                  <span className="w-14 font-mono text-sm tabular-nums text-ochre">{at}</span>
                  <span>{t(label)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* /podcast/:slug */
export function EpisodePage() {
  const { slug } = useParams();
  const { t } = useLang();
  const ep = episodeBySlug(slug);

  useEffect(() => {
    if (ep) document.title = `Ep. ${ep.number} · ${t(ep.title)} · ${t("Voice of the Desert")}`;
  }, [ep, t]);

  if (!ep) {
    return (
      <section className="paper flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-bone px-5 pb-20 pt-40 text-center text-umber">
        <h1 className="h-display text-[clamp(32px,4vw,52px)]">{t("Episode not found")}</h1>
        <Link to="/podcast" className="pill-dark">{t("All episodes")}</Link>
      </section>
    );
  }

  const more = EPISODES.filter(e => e !== ep).slice(0, 3);

  return (
    <div key={ep.slug}>
      <header className="relative overflow-hidden bg-night pb-12 pt-[150px] text-bone sm:pt-[170px]">
        <img src={ep.photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" style={{ objectPosition: ep.pos }} />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,20,15,0.8),#1C140F)]" />
        <div className="container-x relative flex max-w-[1100px] flex-wrap items-end gap-8">
          <img src={ep.photo} alt="" className="aspect-square w-full max-w-[220px] rounded-2xl object-cover shadow-2xl" style={{ objectPosition: ep.pos }} />
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-dust">
              <Link to="/" className="hover:text-gold">{t("Home")}</Link>
              <ChevronRight aria-hidden className="h-4 w-4" />
              <Link to="/podcast" className="hover:text-gold">{t("Podcast")}</Link>
            </nav>
            <span className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-sun">
              <Headphones aria-hidden className="h-4 w-4" /> Ep. {ep.number} · {ep.length} · {t(ep.ago)} {ep.isNew && <NewBadge />}
            </span>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="h-display text-[clamp(32px,4.4vw,56px)] text-cream">
              {t(ep.title)}
            </motion.h1>
            <p className="text-lg text-haze">{t("with")} <strong className="text-cream">{ep.guest}</strong> · {t(ep.guestRole)}</p>
          </div>
        </div>
      </header>

      <div className="paper bg-bone text-umber">
        <div className="container-x flex max-w-[1100px] flex-wrap gap-10 py-10 sm:py-12">
          <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-8">
            <EpisodePlayer ep={ep} />
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-semibold">{t("In this episode")}</h2>
              <p className="text-[18px] leading-relaxed text-loam">{t(ep.summary)}</p>
            </section>
            <figure className="relative rounded-[6px] border border-dune bg-cream px-6 pb-6 pt-7 shadow-[0_20px_50px_rgba(43,29,23,0.1)]">
              <figcaption className="mb-3 flex items-center gap-3">
                <img src={HOST.face} alt="" className="h-12 w-12 rounded-full border-2 border-gold object-cover" />
                <strong className="font-display text-lg">{t("Felipe's note")}</strong>
              </figcaption>
              <blockquote className="font-serif text-[24px] font-medium italic leading-snug">“{t(ep.note)}”</blockquote>
              <p className="mt-3 text-right font-script text-[32px] leading-none text-rust">— Felipe</p>
            </figure>
            <div id="comments" className="scroll-mt-28">
              <Comments story={ep} idPrefix={ep.slug} />
            </div>
          </div>

          <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-5 lg:max-w-[340px]">
            <div className="flex flex-col gap-2 rounded-[20px] border border-dune bg-cream p-5">
              <span className="eyebrow text-[12px] text-ochre">{t("Guest")}</span>
              <strong className="font-display text-2xl">{ep.guest}</strong>
              <span className="text-loam">{t(ep.guestRole)}</span>
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold">{t("More episodes")}</h2>
            {more.map(e => (
              <Link key={e.id} to={episodePath(e)} className="group flex items-center gap-3.5">
                <img src={e.photo} alt="" loading="lazy" className="h-16 w-16 flex-none rounded-xl object-cover" style={{ objectPosition: e.pos }} />
                <span className="flex min-w-0 flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ochre">Ep. {e.number} · {e.length}</span>
                  <strong className="font-display leading-snug group-hover:text-ochre">{t(e.title)}</strong>
                </span>
              </Link>
            ))}
            <Link to="/podcast" className="inline-flex min-h-[44px] items-center gap-2 font-bold text-ochre hover:underline">
              <ArrowLeft aria-hidden className="h-4 w-4" /> {t("All episodes")}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
