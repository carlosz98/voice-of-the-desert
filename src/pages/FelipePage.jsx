import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Mountain, Music, Newspaper, Send } from "lucide-react";
import { HOST, SLIDES } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import Host from "../components/Host.jsx";
import FelipeSignIn from "../components/FelipeSignIn.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { Reveal } from "../components/ui/Reveal.jsx";

const LOVES = [
  { icon: Music, title: "Music", text: "Rancheras, boleros and norteñas: the songs he grew up with and the ones he keeps discovering." },
  { icon: Newspaper, title: "The news", text: "Sharing what's going on in Chihuahua and the world, with an honest opinion." },
  { icon: BookOpen, title: "The Word", text: "A Bible verse every morning, to start the day well." },
  { icon: Mountain, title: "Chihuahua", text: "His home: the Sierra, the plains, the plazas and its people." },
];

// Only what we know for sure; the brackets get filled in with Felipe.
const MOMENTS = [
  { title: "Born in Chihuahua", text: "[Year and place, and a few words about his family.]" },
  { title: "Growing up", text: "[A memory from his childhood or youth.]" },
  { title: "His work", text: "[What he did for a living, and what it taught him.]" },
  { title: "La Voz del Desierto", text: "[Why he started this site and what he hopes it gives people.]" },
];

function WriteToFelipe() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  const field = "h-12 rounded-xl border border-dune bg-bone px-3.5 text-base font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/40";
  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="sent" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 rounded-[22px] bg-cream p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-umber"><Check aria-hidden className="h-7 w-7" /></span>
          <p className="font-display text-xl font-semibold">{t("Thank you! Felipe will read your message soon.")}</p>
          <p className="text-sm text-bark">{t("Demo: nothing is sent yet.")}</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          exit={{ opacity: 0 }}
          onSubmit={e => { e.preventDefault(); setSent(true); }}
          className="flex flex-col gap-4 rounded-[22px] bg-cream p-6 shadow-[0_24px_60px_rgba(43,29,23,0.1)] sm:p-8"
        >
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("Your name")}
            <input required autoComplete="name" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("Message")}
            <textarea required rows={5} className={`${field} h-auto py-3`} />
          </label>
          <button type="submit" className="pill-dark min-h-[52px] text-base">
            <Send aria-hidden className="h-4 w-4" /> {t("Send message")}
          </button>
          <p className="text-xs text-bark">{t("Demo: nothing is sent yet.")}</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

export default function FelipePage() {
  const { t } = useLang();
  useEffect(() => {
    document.title = `${HOST.name} · ${t("Voice of the Desert")}`;
  }, [t]);

  return (
    <>
      {/* his postcard, bio and signature, same as on the home page */}
      <div className="bg-earth pt-[90px] text-bone sm:pt-[100px]">
        <Host pageTitle />
      </div>

      <div className="paper bg-bone text-umber">
        {/* what he loves */}
        <section aria-labelledby="loves-h" className="container-x py-16 sm:py-20">
          <h2 id="loves-h" className="h-display mb-8 text-[clamp(30px,3.8vw,48px)]">
            {t("What he")} <Accent className="text-ochre">{t("loves")}</Accent>
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LOVES.map((l, i) => (
              <Reveal as="li" key={l.title} delay={i * 0.06} className="flex flex-col gap-3 rounded-[20px] border border-dune bg-cream p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-ochre"><l.icon aria-hidden className="h-6 w-6" /></span>
                <h3 className="font-display text-xl font-semibold">{t(l.title)}</h3>
                <p className="leading-relaxed text-loam">{t(l.text)}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* his story, to fill in with him */}
        <section aria-labelledby="story-h" className="border-y border-dune bg-sand/40">
          <div className="container-x grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
            <div className="flex flex-col gap-4">
              <h2 id="story-h" className="h-display text-[clamp(30px,3.8vw,48px)]">{t("Moments in his life")}</h2>
              <p className="text-lg leading-relaxed text-loam">{t("Felipe's life story goes here, in his own words.")}</p>
              <p className="leading-relaxed text-bark">{t("We'll write it with him: where he grew up, his family, his work, and the moment he decided to start La Voz del Desierto.")}</p>
              <span className="w-fit rounded-full border border-dashed border-rust/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-rust">{t("Fill these in with Felipe")}</span>
            </div>
            <ol className="relative flex flex-col gap-8 border-l-2 border-gold/50 pl-8">
              {MOMENTS.map((m, i) => (
                <Reveal as="li" key={m.title} delay={i * 0.06} className="relative">
                  <span aria-hidden className="absolute -left-[41px] top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-gold bg-bone">
                    <span className="h-2 w-2 rounded-full bg-gold" />
                  </span>
                  <h3 className="font-display text-xl font-semibold">{t(m.title)}</h3>
                  <p className="mt-1 text-loam">{t(m.text)}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* his Chihuahua */}
        <section aria-labelledby="chih-h" className="container-x py-16 sm:py-20">
          <h2 id="chih-h" className="h-display mb-8 text-[clamp(30px,3.8vw,48px)]">{t("His Chihuahua")}</h2>
          <ul className="grid auto-rows-[200px] gap-4 sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-4">
            {SLIDES.map((s, i) => (
              <Reveal
                as="li"
                key={s.id}
                delay={i * 0.05}
                className={`group relative overflow-hidden rounded-[18px] ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""} ${i === 3 ? "lg:col-span-2" : ""}`}
              >
                <img src={s.src} alt={t(s.alt)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: s.pos }} />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 right-4 text-sm font-semibold text-cream">{t(s.caption)}</span>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* write to him */}
        <section aria-labelledby="write-h" className="border-t border-dune bg-sand/40">
          <div className="container-x grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.2fr]">
            <div className="flex flex-col gap-4">
              <h2 id="write-h" className="h-display text-[clamp(30px,3.8vw,48px)]">{t("Write to Felipe")}</h2>
              <p className="text-lg leading-relaxed text-loam">{t("Send him a story, a question or just a hello. He reads every message.")}</p>
              <div className="mt-2 flex flex-col gap-1">
                <span className="eyebrow text-[12px] text-ochre">{t("Where to find him")}</span>
                <span className="font-semibold">{t(HOST.social)}</span>
              </div>
              <p className="mt-4 font-script text-[40px] leading-none text-rust">— Felipe</p>
            </div>
            <WriteToFelipe />
          </div>
        </section>
        <FelipeSignIn />
      </div>
    </>
  );
}
