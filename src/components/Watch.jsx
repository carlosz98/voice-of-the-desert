import { useLang } from "../lib/i18n.jsx";
import { Accent } from "./ui/Accent.jsx";
import { Play } from "lucide-react";
import { FEATURED_VIDEO, VIDEOS } from "../lib/data.js";
import { ImageReveal, Reveal, SectionHead } from "./ui/Reveal.jsx";

export default function Watch() {
  const { t } = useLang();
  return (
    <section id="watch" aria-labelledby="watch-h" className="scroll-mt-20 bg-earth">
      <div className="container-x py-20 sm:py-24">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <SectionHead number="01" label="Watch">
            <span id="watch-h">
              {t("Views of the")} <Accent className="text-sun">{t("horizon")}</Accent>
            </span>
          </SectionHead>
          <a href="#" className="inline-flex min-h-[44px] items-center font-bold text-bone transition-colors hover:text-gold">
            {t("All videos →")}
          </a>
        </div>

        <ImageReveal radius={20} className="mb-6 aspect-[16/9] max-w-full bg-clay sm:aspect-[2.39/1]">
          <a href="#" className="group absolute inset-0 block overflow-hidden">
            <img
              src={FEATURED_VIDEO.photo}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              style={{ objectPosition: FEATURED_VIDEO.pos }}
            />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(35,26,21,0.85)_0%,rgba(35,26,21,0.35)_50%,rgba(35,26,21,0)_75%),linear-gradient(0deg,rgba(35,26,21,0.75)_0%,rgba(35,26,21,0)_55%)]" />
            <span aria-hidden className="absolute inset-x-0 top-0 hidden h-[9%] bg-[#120D0A] sm:block" />
            <span aria-hidden className="absolute inset-x-0 bottom-0 hidden h-[9%] bg-[#120D0A] sm:block" />
            <span className="absolute bottom-[12%] left-6 flex max-w-[70%] flex-col gap-2.5 sm:bottom-[16%] sm:left-10">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-sun">{t("Featured")} · {FEATURED_VIDEO.length}</span>
              <strong className="h-display text-[clamp(18px,2.6vw,36px)] leading-tight text-cream">{t(FEATURED_VIDEO.title)}</strong>
            </span>
            <span aria-hidden className="absolute bottom-[12%] right-6 grid h-14 w-14 place-items-center rounded-full bg-cream/95 text-umber transition-transform duration-300 group-hover:scale-110 sm:bottom-[16%] sm:right-10 sm:h-[72px] sm:w-[72px]">
              <Play className="ml-1 h-6 w-6" fill="currentColor" />
            </span>
          </a>
        </ImageReveal>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map((v, i) => (
            <Reveal as="li" key={v.id} delay={i * 0.05}>
              <a href="#" className="group flex flex-col gap-3">
                <span className="relative block aspect-[2.39/1] overflow-hidden rounded-xl bg-clay">
                  <img
                    src={v.photo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    style={{ objectPosition: v.pos }}
                  />
                  <span className="absolute bottom-2.5 right-2.5 rounded bg-earth px-2 py-0.5 font-mono text-xs tabular-nums text-bone">{v.length}</span>
                </span>
                <strong className="text-[17px] leading-snug text-bone transition-colors group-hover:text-sun">{t(v.title)}</strong>
                <span className="text-sm text-dust">
                  {t(v.creator)} · {t(v.views)}
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
