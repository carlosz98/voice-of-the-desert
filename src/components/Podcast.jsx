import { useLang } from "../lib/i18n.jsx";
import { Accent } from "./ui/Accent.jsx";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { EPISODES } from "../lib/data.js";
import { tuneIn } from "../lib/radio.js";
import { Reveal, SectionHead } from "./ui/Reveal.jsx";
import { NewBadge } from "./ui/NewBadge.jsx";
import NextEpisode from "./NextEpisode.jsx";

const STARS = [
  [8, 14, 2, 0], [22, 30, 3, 0.8], [35, 10, 2, 1.6], [51, 22, 2, 0.4], [63, 8, 3, 2.2],
  [76, 34, 2, 1.1], [89, 16, 2, 1.9], [15, 55, 2, 2.6], [44, 48, 2, 0.2], [70, 58, 2, 1.4],
];

export default function Podcast() {
  const { t } = useLang();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const ep = EPISODES[current];

  // placeholder clock until the real episode audio is connected
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress(p => Math.min(p + 0.002, 1)), 300);
    return () => clearInterval(t);
  }, [playing]);

  const pick = i => {
    tuneIn();
    setCurrent(i);
    setProgress(0);
    setPlaying(true);
  };

  return (
    <section id="podcast" aria-labelledby="pod-h" className="relative scroll-mt-20 overflow-hidden bg-night">
      <div aria-hidden className="absolute inset-0">
        {STARS.map(([l, t, s, d], i) => (
          <span key={i} className="absolute animate-twinkle rounded-full bg-[#F6E3B8]" style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${d}s` }} />
        ))}
        <span className="absolute right-[8%] top-[70px] h-[90px] w-[90px] rounded-full bg-[#F3E2C2] shadow-[0_0_70px_14px_rgba(230,176,74,0.22)]" />
        <span className="absolute right-[calc(8%-22px)] top-[58px] h-[90px] w-[90px] rounded-full bg-night" />
        <svg className="absolute inset-x-0 bottom-0 h-[150px] w-full" viewBox="0 0 1440 150" preserveAspectRatio="none">
          <path d="M0 110 C 240 80 480 90 720 106 S 1200 120 1440 96 L 1440 150 L 0 150 Z" fill="#2B1D17" />
          <g fill="#140E0B">
            {[[90, 118, 22], [130, 114, 16], [300, 120, 18], [520, 116, 26], [560, 120, 14], [760, 114, 20], [980, 118, 24], [1015, 114, 14], [1210, 116, 20], [1380, 114, 22]].map(([cx, cy, r]) => (
              <circle key={cx} cx={cx} cy={cy} r={r} />
            ))}
          </g>
        </svg>
      </div>

      <div className="container-x relative flex flex-wrap items-center gap-12 pb-44 pt-24 sm:pt-28">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-5">
          <SectionHead number="03" label="The podcast">
            <span id="pod-h">
              {t("Voices of the")} <Accent className="text-sun">{t("world")}</Accent>
            </span>
          </SectionHead>
          <Reveal as="p" className="max-w-[520px] text-[17px] leading-relaxed text-[#D9C9B2]">
            {t("Conversations with people from everywhere: their stories, their music, and what the news leaves out. Hosted by Felipe Lerma.")}
          </Reveal>
          <NextEpisode />
          <motion.p key={ep.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-[26px] italic leading-snug text-bone">
            Ep. {ep.number} — {t(ep.title)}
          </motion.p>
          <Reveal className="flex flex-wrap gap-2.5">
            {["All episodes", "Watch on video", "Subscribe"].map(l => (
              <a key={l} href="#" className="pill border border-bone/40 font-semibold text-bone hover:border-gold hover:text-gold">{t(l)}</a>
            ))}
          </Reveal>
        </div>

        <Reveal className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 rounded-3xl border border-[#F3E2C2]/20 bg-[#F3E2C2]/[0.07] p-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => { if (!playing) tuneIn(); setPlaying(p => !p); }}
              aria-label={t(playing ? "Pause episode" : "Play episode")}
              className="grid h-[60px] w-[60px] flex-none place-items-center rounded-full bg-gold text-umber transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              {playing ? <Pause aria-hidden className="h-5 w-5" fill="currentColor" /> : <Play aria-hidden className="ml-0.5 h-5 w-5" fill="currentColor" />}
            </button>
            <div className="flex flex-col gap-1">
              <strong className="flex items-center gap-2 text-[17px]">{current === 0 ? t("Latest episode") : `${t("Episode")} ${ep.number}`}{current === 0 && <NewBadge />}</strong>
              <span className="font-mono text-[13px] tabular-nums text-dust">{t(playing ? "Playing" : "Paused")} · {ep.length}</span>
            </div>
          </div>
          <div aria-hidden className="h-1 overflow-hidden rounded-full bg-[#F3E2C2]/20">
            <div className="h-full origin-left rounded-full bg-gold transition-transform duration-300" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <ul className="flex flex-col">
            {EPISODES.slice(1).map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => pick(i + 1)}
                  className={`flex min-h-[48px] w-full items-center justify-between gap-3 border-t border-[#F3E2C2]/15 py-3 text-left text-[15px] transition-colors hover:text-gold ${current === i + 1 ? "text-gold" : ""}`}
                >
                  <span>Ep. {e.number} — {t(e.title)}</span>
                  <span className="font-mono text-[13px] tabular-nums text-dust">{e.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
