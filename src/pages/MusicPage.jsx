import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, ListMusic, Pause, Play, Send, SkipBack, SkipForward } from "lucide-react";
import { DEDICATIONS, GENRES, HOST, PHOTOS, PLAYLISTS, TRACKS } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { fmt, usePlayer } from "../lib/player.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { EASE, Reveal } from "../components/ui/Reveal.jsx";
import { NewBadge } from "../components/ui/NewBadge.jsx";
import { DuneWave } from "../components/Listen.jsx";

const trackIndex = id => TRACKS.findIndex(t => t.id === id);
const playsNum = p => parseFloat(p) * (p.endsWith("K") ? 1000 : 1);

/* little bars that dance next to the song that's playing */
function Equalizer({ on }) {
  return (
    <span aria-hidden className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-ochre"
          animate={on ? { height: ["30%", "100%", "45%", "80%", "30%"] } : { height: "35%" }}
          transition={on ? { duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" } : { duration: 0.2 }}
        />
      ))}
    </span>
  );
}

function NowPlaying() {
  const { t } = useLang();
  const { tracks, index, track, playing, time, progress, next, prev, toggle } = usePlayer();
  return (
    <div className="relative overflow-hidden rounded-[26px] bg-umber text-bone shadow-[0_30px_70px_rgba(43,29,23,0.25)]">
      <img src={track.photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm" style={{ objectPosition: track.pos }} />
      <div className="relative flex flex-wrap items-center gap-8 p-6 sm:p-9">
        <motion.img
          key={track.id}
          initial={{ opacity: 0, rotate: -4, scale: 0.94 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          src={track.photo}
          alt=""
          className="aspect-square w-36 flex-none rounded-2xl object-cover shadow-2xl sm:w-full sm:max-w-[240px]"
          style={{ objectPosition: track.pos }}
        />
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-gold">
              <Equalizer on={playing} /> {t(playing ? "Now playing" : "Paused")} · {t("Track")} {index + 1} {t("of")} {tracks.length}
            </span>
            <strong className="font-display text-[clamp(28px,3.6vw,44px)] font-semibold leading-tight">{track.title}</strong>
            <span className="text-lg text-dust">{track.artist} · {track.album} · {t(track.genre)}</span>
          </div>
          <DuneWave progress={progress} />
          <div className="flex justify-between font-mono text-[13px] tabular-nums text-dust">
            <span>{fmt(time)}</span>
            <span>{fmt(track.length)}</span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={prev} aria-label={t("Previous track")} className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold">
              <SkipBack aria-hidden className="h-4 w-4" fill="currentColor" />
            </button>
            <button type="button" onClick={toggle} aria-label={t(playing ? "Pause" : "Play")} className="grid h-[72px] w-[72px] place-items-center rounded-full bg-gold text-umber shadow-[0_10px_40px_rgba(230,176,74,0.45)] transition-transform duration-200 hover:scale-105 active:scale-95">
              {playing ? <Pause aria-hidden className="h-7 w-7" fill="currentColor" /> : <Play aria-hidden className="ml-1 h-7 w-7" fill="currentColor" />}
            </button>
            <button type="button" onClick={next} aria-label={t("Next track")} className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold">
              <SkipForward aria-hidden className="h-4 w-4" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dedicate() {
  const { t } = useLang();
  const id = useId();
  const [list, setList] = useState(DEDICATIONS);
  const [form, setForm] = useState({ name: "", to: "", song: "t1", text: "" });
  const [sent, setSent] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    if (!form.name.trim() || !form.to.trim()) return;
    setList(l => [{ ...form, ago: "Just now", mine: true }, ...l]);
    setForm({ name: "", to: "", song: "t1", text: "" });
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  const field = "h-12 rounded-xl border border-dune bg-bone px-3.5 text-base font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/40";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={submit} className="flex min-w-0 flex-col gap-4 rounded-[22px] bg-cream p-6 shadow-[0_24px_60px_rgba(43,29,23,0.1)] sm:p-8">
        <h3 className="flex items-center gap-2.5 font-display text-2xl font-semibold"><Heart aria-hidden className="h-6 w-6 text-rust" /> {t("Dedicate a song")}</h3>
        <p className="text-loam">{t("Send a song to someone you love, and Felipe will read your dedication on the show.")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("Your name")}
            <input required value={form.name} onChange={set("name")} autoComplete="name" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("Who is it for?")}
            <input required value={form.to} onChange={set("to")} className={field} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {t("Choose a song")}
          <select value={form.song} onChange={set("song")} className={`${field} w-full min-w-0`}>
            {TRACKS.map(tr => <option key={tr.id} value={tr.id}>{tr.title} · {tr.artist}</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-msg`} className="flex flex-col gap-1.5 text-sm font-semibold">
          {t("Your message")}
          <textarea id={`${id}-msg`} value={form.text} onChange={set("text")} rows={3} className={`${field} h-auto py-3`} />
        </label>
        <button type="submit" className="pill-dark min-h-[52px] text-base">
          <Send aria-hidden className="h-4 w-4" /> {t("Send dedication")}
        </button>
        <AnimatePresence>
          {sent && (
            <motion.p role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 font-semibold text-ochre">
              <Check aria-hidden className="h-5 w-5" /> {t("Your dedication is on the list. Listen on Sunday!")}
            </motion.p>
          )}
        </AnimatePresence>
        <p className="text-xs text-bark">{t("Demo: nothing is sent yet.")}</p>
      </form>

      <div className="flex min-w-0 flex-col gap-4">
        <h3 className="font-display text-xl font-semibold">{t("Recent dedications")}</h3>
        <ul className="flex flex-col gap-3" aria-live="polite">
          <AnimatePresence initial={false}>
            {list.slice(0, 4).map((d, i) => {
              const song = TRACKS.find(tr => tr.id === d.song);
              return (
                <motion.li key={d.name + d.ago + i} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-dune bg-bone/70 p-4">
                  <p className="text-sm text-bark">
                    <strong className="text-umber">{d.name}</strong> → {t("For")} <strong className="text-umber">{d.mine ? d.to : t(d.to)}</strong> · {t(d.ago)}
                  </p>
                  {d.text && <p className="mt-1.5 font-serif text-lg italic leading-snug">“{d.mine ? d.text : t(d.text)}”</p>}
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ochre"><ListMusic aria-hidden className="h-4 w-4" /> {song?.title} · {song?.artist}</p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

export default function MusicPage() {
  const { t } = useLang();
  const { index, playing, select, toggle } = usePlayer();
  const [genre, setGenre] = useState("All");
  const list = TRACKS.map((tr, i) => ({ ...tr, i })).filter(tr => genre === "All" || tr.genre === genre);
  const top = useMemo(() => [...TRACKS].sort((a, b) => playsNum(b.plays) - playsNum(a.plays)).slice(0, 3), []);
  const play = i => (i === index ? toggle() : select(i));

  return (
    <>
      <PageHeader
        page="Music"
        eyebrow={`${t("Chapter")} ${t("two")} · ${t("Listen")}`}
        title={<>{t("The sound of")} <Accent className="text-sun">{t("open land")}</Accent></>}
        subtitle={t("Rancheras, boleros and norteñas: the songs he grew up with and the ones he keeps discovering.")}
        meta={`${TRACKS.length} ${t("songs")} · ${PLAYLISTS.length} ${t("playlists")}`}
        photo={PHOTOS.sunset}
        pos="50% 60%"
      />
      <div className="paper bg-bone text-umber">
        <div className="container-x flex flex-col gap-16 py-10 sm:py-14">
          <Reveal><NowPlaying /></Reveal>

          {/* playlists */}
          <section aria-labelledby="pl-h" className="flex flex-col gap-6">
            <h2 id="pl-h" className="h-display text-[clamp(28px,3.4vw,42px)]">{t("Felipe's playlists")}</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PLAYLISTS.map((p, n) => {
                const first = trackIndex(p.tracks[0]);
                const active = p.tracks.includes(TRACKS[index].id) && playing;
                return (
                  <Reveal as="li" key={p.id} delay={n * 0.05} className="group flex flex-col overflow-hidden rounded-[20px] bg-cream shadow-[0_20px_50px_rgba(43,29,23,0.08)]">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={p.photo} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: p.pos }} />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
                      <span className="absolute bottom-3 left-4 right-[68px] font-display text-xl font-semibold leading-tight text-cream">{t(p.title)}</span>
                      <button
                        type="button"
                        onClick={() => select(first)}
                        aria-label={`${t("Play list")}: ${t(p.title)}`}
                        className="absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full bg-gold text-umber shadow-lg transition-transform hover:scale-105"
                      >
                        {active ? <Equalizer on /> : <Play aria-hidden className="ml-0.5 h-5 w-5" fill="currentColor" />}
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <p className="font-serif text-lg italic leading-snug text-clay">“{t(p.note)}”</p>
                      <p className="mt-auto text-sm text-bark">{p.tracks.length} {p.tracks.length === 1 ? t("song") : t("songs")} · <span className="font-script text-lg text-rust">Felipe</span></p>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </section>

          {/* all songs + most played */}
          <section aria-labelledby="all-h" className="flex flex-wrap items-start gap-10">
            <div className="min-w-0 flex-[1_1_600px]">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <h2 id="all-h" className="h-display text-[clamp(28px,3.4vw,42px)]">{t("All songs")}</h2>
                <div role="group" aria-label={t("Genre")} className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button key={g} type="button" aria-pressed={genre === g} onClick={() => setGenre(g)} className={`pill border text-sm font-semibold ${genre === g ? "border-umber bg-umber text-bone" : "border-dune hover:border-umber"}`}>
                      {t(g)}
                    </button>
                  ))}
                </div>
              </div>
              <ol className="flex flex-col">
                {list.map(tr => {
                  const current = tr.i === index;
                  return (
                    <li key={tr.id}>
                      <button
                        type="button"
                        onClick={() => play(tr.i)}
                        aria-current={current ? "true" : undefined}
                        className={`grid w-full grid-cols-[32px_48px_1fr_auto] items-center gap-4 border-b border-dune px-2 py-3 text-left transition-colors hover:bg-paper/70 sm:grid-cols-[32px_48px_1fr_150px_90px_56px] ${current ? "bg-paper" : ""}`}
                      >
                        <span className="grid place-items-center font-display text-sm font-semibold tabular-nums text-ochre">
                          {current ? <Equalizer on={playing} /> : String(tr.i + 1).padStart(2, "0")}
                        </span>
                        <img src={tr.photo} alt="" loading="lazy" className="h-12 w-12 rounded-lg object-cover" style={{ objectPosition: tr.pos }} />
                        <span className="flex min-w-0 flex-col">
                          <strong className="flex items-center gap-2 text-base"><span className="truncate">{tr.title}</span>{tr.isNew && <NewBadge className="flex-none" />}</strong>
                          <span className="truncate text-sm text-bark">{tr.artist}</span>
                        </span>
                        <span className="hidden truncate text-sm text-bark sm:block">{tr.album}</span>
                        <span className="hidden text-sm text-bark sm:block">{t(tr.genre)}</span>
                        <span className="text-right font-mono text-[13px] tabular-nums text-bark">{fmt(tr.length)}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 text-xs text-bark">{t("Song titles and artists are samples for the demo.")}</p>
            </div>

            <aside className="min-w-0 flex-[1_1_300px] rounded-[22px] bg-umber p-6 text-bone lg:max-w-[360px]">
              <h2 className="mb-3 font-display text-xl font-semibold">{t("Most played")}</h2>
              <ol className="flex flex-col divide-y divide-line">
                {top.map((tr, n) => (
                  <li key={tr.id}>
                    <button type="button" onClick={() => play(trackIndex(tr.id))} className="group flex w-full items-center gap-3.5 py-3 text-left">
                      <span className="w-6 font-display text-2xl font-semibold text-gold">{n + 1}</span>
                      <img src={tr.photo} alt="" className="h-14 w-14 rounded-lg object-cover" style={{ objectPosition: tr.pos }} />
                      <span className="flex min-w-0 flex-col">
                        <strong className="truncate group-hover:text-sun">{tr.title}</strong>
                        <span className="truncate text-sm text-dust">{tr.artist}</span>
                        <span className="text-xs text-dust">{t(`${tr.plays} plays`)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm text-haze">
                <img src={HOST.face} alt="" className="h-8 w-8 rounded-full border border-gold object-cover" />
                <span className="font-script text-xl text-sun">{t("Sundays with Felipe")}</span>
              </p>
            </aside>
          </section>

          {/* dedications */}
          <section aria-labelledby="ded-h" className="flex flex-col gap-6">
            <h2 id="ded-h" className="sr-only">{t("Dedicate a song")}</h2>
            <Dedicate />
          </section>
        </div>
      </div>
    </>
  );
}
