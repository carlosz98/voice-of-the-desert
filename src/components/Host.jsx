import { useLang } from "../lib/i18n.jsx";
import { Accent } from "./ui/Accent.jsx";
import { motion } from "framer-motion";
import { Play, UserRound } from "lucide-react";
import { HOST } from "../lib/data.js";
import { Link } from "../lib/router.jsx";
import { CurtainText, ImageReveal, Reveal } from "./ui/Reveal.jsx";

export default function Host({ pageTitle = false }) {
  // on its own page this is the page title (h1); on the home page a section (h2)
  const Heading = pageTitle ? "h1" : "h2";
  const { t } = useLang();
  return (
    <section id="host" aria-labelledby="host-h" className="scroll-mt-20 overflow-x-clip bg-earth">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-5 py-20 sm:px-8 sm:py-24">
        {/* his photo as an old postcard: cream border, a little tilt, tape on the corners */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -6 }}
          whileInView={{ opacity: 1, y: 0, rotate: -2.5 }}
          whileHover={{ rotate: -1, y: -4 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 70, damping: 14 }}
          className="relative mx-auto min-w-[240px] max-w-[340px] flex-[0_1_340px] rounded-[6px] bg-cream p-3 pb-16 shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
        >
          <span aria-hidden className="absolute -left-4 -top-2 h-7 w-20 -rotate-[24deg] bg-[#E8D8BC]/80 shadow-sm" />
          <span aria-hidden className="absolute -right-4 -top-1 h-7 w-20 rotate-[28deg] bg-[#E8D8BC]/80 shadow-sm" />
          {HOST.photo ? (
            <ImageReveal radius={3} className="aspect-[4/5] w-full">
              <img src={HOST.photo} alt={t(`Portrait of ${HOST.name}`)} className="h-full w-full object-cover object-[50%_30%] sepia-[.12]" />
            </ImageReveal>
          ) : (
            <div
              role="img"
              aria-label={`Photo of ${HOST.name} (coming soon)`}
              className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-[3px] border-2 border-dashed border-bark/50 bg-paper text-bark"
            >
              <UserRound aria-hidden className="h-14 w-14" strokeWidth={1.2} />
              <span className="font-display text-sm italic">Felipe's photo goes here</span>
            </div>
          )}
          <span className="absolute bottom-4 left-5 font-script text-[23px] sm:text-[28px] leading-none text-umber">
            {t("Greetings from Chihuahua")}
          </span>
          {/* round postmark that turns slowly */}
          <motion.svg
            aria-hidden
            viewBox="0 0 120 120"
            className="absolute -bottom-9 -right-3 h-[96px] w-[96px] text-gold sm:-right-9 sm:h-[112px] sm:w-[112px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="60" cy="60" r="56" fill="#231A15" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
            <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
            <defs><path id="ring" d="M60 60 m-41 0 a41 41 0 1 1 82 0 a41 41 0 1 1 -82 0" /></defs>
            <text fill="currentColor" fontFamily="Fraunces, serif" fontSize="10.5" letterSpacing="2.2">
              <textPath href="#ring" textLength="252" lengthAdjust="spacingAndGlyphs">{t("VOICE OF THE DESERT ✦ STORIES ✦ MUSIC ✦")}</textPath>
            </text>
            <text x="60" y="68" textAnchor="middle" fill="currentColor" fontFamily="Caveat, cursive" fontSize="24">FL</text>
          </motion.svg>
        </motion.div>

        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-4 sm:pl-6">
          <Reveal as="span" className="eyebrow flex items-center gap-2.5 text-gold"><span aria-hidden>✦</span> {t("Meet your host")}</Reveal>
          <Heading id="host-h" className="h-display text-[clamp(30px,4.2vw,56px)]">
            <CurtainText delay={0.05}>
              Felipe <Accent className="text-[1.2em] text-sun">Lerma</Accent>
            </CurtainText>
          </Heading>
          <Reveal as="p" delay={0.1} className="font-serif text-[26px] italic leading-snug text-bone">
            “{t(HOST.welcome)}”
          </Reveal>
          <Reveal as="p" delay={0.15} className="max-w-[600px] text-[17px] leading-relaxed text-dust">
            {t(HOST.bio)}
          </Reveal>
          <Reveal as="p" delay={0.18} aria-label={t("Signed, Felipe")} className="-mt-1 font-script text-[40px] leading-none text-sun">
            — Felipe
          </Reveal>
          <Reveal as="ul" delay={0.2} className="mt-1 flex flex-wrap gap-2.5">
            {HOST.roles.map(r => (
              <li key={r} className="rounded-full border border-line px-4 py-2 text-sm font-semibold">{t(r)}</li>
            ))}
          </Reveal>
          <Reveal delay={0.25} className="mt-2 flex flex-wrap items-center gap-3">
            <Link to="/podcast" className="pill-gold">
              <Play aria-hidden className="h-3.5 w-3.5" fill="currentColor" /> {t("Hear his podcast")}
            </Link>
            <Link to="/noticias" className="pill-ghost">{t("Read his takes")}</Link>
            <a href="#" className="inline-flex min-h-[44px] items-center px-1.5 font-semibold text-dust hover:text-gold">{t(HOST.social)}</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
