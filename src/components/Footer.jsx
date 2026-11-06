import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Mic, Music2, Newspaper, Play } from "lucide-react";
import { useLang } from "../lib/i18n.jsx";
import { Logo } from "./Navbar.jsx";
import { Link } from "../lib/router.jsx";

const BASE = import.meta.env.BASE_URL;
const SUNSET = `${BASE}img/sunset.webp`;
const RIDGE = `${BASE}img/sunset-ridge-mask.png`;

const COLUMNS = [
  {
    title: "Voice of the Desert",
    links: [
      ["Home", "/"],
      ["About Felipe", "/felipe"],
      ["Verse of the day", "/versiculo"],
      ["Upload", "/subir"],
    ],
  },
  {
    title: "Listen & watch",
    links: [
      ["News", "/noticias"],
      ["Videos", "/videos"],
      ["Music", "/musica"],
      ["Podcast", "/podcast"],
    ],
  },
];

const CREDITS = [
  ["Portfolio", "https://carlosz98.github.io/MyPortFolio/"],
  ["GitHub", "https://github.com/carlosz98"],
  ["LinkedIn", "https://www.linkedin.com/in/carloszabala98/"],
];

const QUICK = [
  ["Podcast", "/podcast", Mic],
  ["Music", "/musica", Music2],
  ["News", "/noticias", Newspaper],
  ["Videos", "/videos", Play],
];

/* The landscape: the full sunset photo, a giant wordmark, then the same photo
 * cut along the mountain ridge in front, so the letters sit behind the
 * mountains. Scrolling into the footer lifts the layers at different speeds. */
function Landscape({ progress, reduce, lang }) {
  const photoY = useTransform(progress, [0, 1], reduce ? ["0%", "0%"] : ["10%", "0%"]);
  const photoScale = useTransform(progress, [0, 1], reduce ? [1, 1] : [1.12, 1]);
  const wordY = useTransform(progress, [0, 1], reduce ? ["0%", "0%"] : ["60%", "0%"]);
  const wordOpacity = useTransform(progress, [0.15, 0.75], [0, 1]);

  const photo = {
    backgroundImage: `url(${SUNSET})`,
    backgroundSize: "cover",
    backgroundPosition: "50% 62%",
  };
  const ridgeMask = {
    WebkitMaskImage: `url(${RIDGE})`,
    maskImage: `url(${RIDGE})`,
    WebkitMaskSize: "cover",
    maskSize: "cover",
    WebkitMaskPosition: "50% 62%",
    maskPosition: "50% 62%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[640px] overflow-hidden md:inset-0 md:h-auto">
      {/* sky + mountains */}
      <motion.div className="absolute inset-0 origin-bottom" style={{ ...photo, y: photoY, scale: photoScale }} />

      {/* slow, warm sun glow breathing behind the clouds */}
      <motion.div
        className="absolute left-[71%] top-[52%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(240,196,99,.45), rgba(240,196,99,0) 62%)" }}
        animate={reduce ? undefined : { opacity: [0.55, 1, 0.55], scale: [0.95, 1.06, 0.95] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* giant wordmark, tucked behind the ridge */}
      <motion.p
        className="absolute inset-x-0 bottom-[40.5%] select-none md:bottom-[37%] whitespace-nowrap text-center font-display font-semibold leading-none tracking-[-0.04em] text-cream/90"
        style={{ y: wordY, opacity: wordOpacity, fontSize: "clamp(2.6rem, 10.6vw, 11rem)", textShadow: "0 8px 40px rgba(28,20,15,.35)" }}
      >
        {lang === "es" ? (
          <>La Voz <span className="font-normal italic text-sun">del</span> Desierto</>
        ) : (
          <>Voice <span className="font-normal italic text-sun">of the</span> Desert</>
        )}
      </motion.p>

      {/* the mountains again, cut along the ridge, in front of the letters */}
      <motion.div className="absolute inset-0 origin-bottom" style={{ ...photo, ...ridgeMask, y: photoY, scale: photoScale }} />

      {/* warm tint, then fade the sky into the page so the links stay readable */}
      <div className="absolute inset-0 bg-[#D9873A] opacity-10 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-earth via-earth/55 to-transparent [background-size:100%_48%] bg-no-repeat" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night via-night/70 to-transparent" />
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: i => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Footer() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  return (
    <footer ref={ref} className="relative isolate overflow-hidden bg-earth text-dust">
      <Landscape progress={scrollYProgress} reduce={reduce} lang={lang} />

      <div className="container-x relative flex flex-col pb-6 pt-14 md:block md:min-h-[760px] md:pt-16 lg:min-h-[820px]">
        <motion.div
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          {/* brand */}
          <motion.div variants={fadeUp} custom={0} className="col-span-2 max-w-sm md:col-span-1">
            <Logo className="text-bone" />
            <p className="mt-4 text-[15px] leading-relaxed text-haze">
              {t("Music, news and good conversation from the heart of Chihuahua.")}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="font-display text-sm font-semibold text-bone">{t("Tune in")}:</span>
              <ul className="flex gap-2">
                {QUICK.map(([label, to, Icon]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      aria-label={t(label)}
                      title={t(label)}
                      className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 bg-bone/10 text-bone backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-night"
                    >
                      <Icon aria-hidden className="h-[18px] w-[18px]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* link columns */}
          {COLUMNS.map((col, i) => (
            <motion.nav key={col.title} variants={fadeUp} custom={i + 1} aria-label={t(col.title)}>
              <h2 className="font-display text-[15px] font-semibold text-bone">{t(col.title)}</h2>
              <ul className="mt-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="group inline-flex min-h-[40px] items-center gap-1 text-[15px] text-haze transition hover:text-sun">
                      <span className="bg-gradient-to-r from-sun to-sun bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                        {t(label)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}

          {/* site credit */}
          <motion.nav variants={fadeUp} custom={3} aria-label={t("Credits")} className="col-span-2 md:col-span-1">
            <h2 className="font-display text-[15px] font-semibold text-bone">{t("Credits")}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-haze">
              {t("Website designed & built by")}{" "}
              <a href={CREDITS[0][1]} target="_blank" rel="noopener noreferrer" className="font-semibold text-sun underline-offset-4 hover:underline">
                Carlos Zabala
              </a>
            </p>
            <ul className="mt-1">
              {CREDITS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1 text-[15px] text-haze transition hover:text-sun">
                    {t(label)} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        </motion.div>

        {/* room for the landscape on phones */}
        <div className="h-[330px] md:hidden" />

        {/* bottom line, over the dark foreground of the photo */}
        <div className="relative flex md:absolute md:inset-x-8 md:bottom-5 flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs text-dust/90">
          <p>© {new Date().getFullYear()} {t("Voice of the Desert")} · {t("Hosted by Felipe Lerma")}</p>
          <p className="font-serif text-sm italic text-haze">{t("Sunset over the Sierra Tarahumara · Chihuahua")}</p>
        </div>
      </div>
    </footer>
  );
}
