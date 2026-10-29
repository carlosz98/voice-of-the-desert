import { useLang } from "../lib/i18n.jsx";
import { Accent } from "./ui/Accent.jsx";
import { motion } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { fmt, usePlayer } from "../lib/player.jsx";
import { Reveal, SectionHead } from "./ui/Reveal.jsx";
import { NewBadge } from "./ui/NewBadge.jsx";

const RIDGE =
  "M0 80 C 30 40 50 70 80 50 S 130 10 160 45 S 210 75 240 30 S 300 5 330 50 S 380 80 410 35 S 470 15 500 55 S 560 70 600 40 L 600 90 L 0 90 Z";

/* The sound wave is drawn as a dune ridge; gold fills it as the song plays. */
function DuneWave({ progress }) {
  return (
    <div aria-hidden className="relative h-[90px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 90" preserveAspectRatio="none">
        <path d={RIDGE} fill="#4A372B" />
      </svg>
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 90" preserveAspectRatio="none">
          <path d={RIDGE} fill="#E6B04A" />
        </svg>
      </div>
      <span className="absolute inset-y-0 w-0.5 bg-cream" style={{ left: `${progress * 100}%` }} />
    </div>
  );
}

export default function Listen() {
  const { tracks, index, track, playing, time, progress, select, next, prev, toggle } = usePlayer();
  const { t } = useLang();

  return (
    <section id="listen" aria-labelledby="listen-h" className="paper scroll-mt-20 bg-bone text-umber">
      <div className="container-x flex flex-wrap gap-12 py-20 sm:py-24">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
          <SectionHead number="02" label="Listen" labelClass="text-ochre">
            <span id="listen-h">
              {t("The sound of")} <Accent className="text-ochre">{t("open land")}</Accent>
            </span>
          </SectionHead>

          <Reveal className="flex flex-col gap-5 rounded-3xl bg-umber p-6 text-bone sm:p-7">
            <div className="flex items-center gap-4">
              <motion.img
                key={track.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={track.photo}
                alt=""
                className="h-[88px] w-[88px] flex-none rounded-2xl object-cover"
                style={{ objectPosition: track.pos }}
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                  {t(playing ? "Playing" : "Paused")} · {t("Track")} {index + 1} {t("of")} {tracks.length}
                </span>
                <strong className="truncate text-xl sm:text-[22px]">{t(track.title)}</strong>
                <span className="truncate text-[15px] text-dust">
                  {t(track.artist)} · {t(track.album)}
                </span>
              </div>
            </div>
            <DuneWave progress={progress} />
            <div className="flex justify-between font-mono text-[13px] tabular-nums text-dust">
              <span>{fmt(time)}</span>
              <span>{fmt(track.length)}</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={prev} aria-label={t("Previous track")} className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold">
                <SkipBack aria-hidden className="h-4 w-4" fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={t(playing ? "Pause" : "Play")}
                className="grid h-[68px] w-[68px] place-items-center rounded-full bg-gold text-umber transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                {playing ? <Pause aria-hidden className="h-6 w-6" fill="currentColor" /> : <Play aria-hidden className="ml-1 h-6 w-6" fill="currentColor" />}
              </button>
              <button type="button" onClick={next} aria-label={t("Next track")} className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold">
                <SkipForward aria-hidden className="h-4 w-4" fill="currentColor" />
              </button>
            </div>
          </Reveal>
        </div>

        <div className="flex min-w-0 flex-[1_1_380px] flex-col justify-end">
          <Reveal as="h3" className="eyebrow mb-2.5 font-medium text-bark">{t("Up next")}</Reveal>
          <ol className="flex flex-col">
            {tracks.map((tr, i) => {
              const current = i === index;
              return (
                <Reveal as="li" key={tr.id} delay={i * 0.04}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-current={current ? "true" : undefined}
                    className={`flex w-full items-center gap-4 border-b border-dune py-3.5 text-left transition-colors hover:bg-paper/60 ${current ? "bg-paper" : ""}`}
                  >
                    <span className="w-8 pl-1 font-display text-sm font-bold tabular-nums text-ochre">{String(i + 1).padStart(2, "0")}</span>
                    <img src={tr.photo} alt="" loading="lazy" className="h-11 w-11 flex-none rounded-lg object-cover" style={{ objectPosition: tr.pos }} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <strong className="flex min-w-0 items-center gap-2 text-base"><span className="truncate">{t(tr.title)}</span>{tr.isNew && <NewBadge className="flex-none" />}</strong>
                      <span className="truncate text-sm text-bark">{t(tr.artist)}</span>
                    </span>
                    <span className="pr-1 font-mono text-[13px] tabular-nums text-bark">
                      {current && playing ? t("Playing") : fmt(tr.length)}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ol>
          <a href="#" className="mt-5 inline-flex min-h-[44px] items-center font-bold text-ochre hover:underline">
            {t("Open the full player →")}
          </a>
        </div>
      </div>
    </section>
  );
}
