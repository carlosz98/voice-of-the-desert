import { useLang } from "../lib/i18n.jsx";
import { Accent } from "./ui/Accent.jsx";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check, FileText, Loader2, Mic, Music, UploadCloud, Video } from "lucide-react";
import { CurtainText, Reveal } from "./ui/Reveal.jsx";
import { SpotlightCard } from "./ui/SpotlightCard.jsx";
import { BlockNewsletter } from "@/components/ui/newsletter-signup-ticket";
import { HOST } from "../lib/data.js";

const KINDS = [
  { id: "video", label: "Video", icon: Video, accept: "video/*", hint: "MP4 or MOV" },
  { id: "music", label: "Music", icon: Music, accept: "audio/*", hint: "MP3 or WAV" },
  { id: "podcast", label: "Podcast", icon: Mic, accept: "audio/*,video/*", hint: "Audio or video episode" },
  { id: "news", label: "News tip", icon: FileText, accept: ".pdf,.doc,.docx,image/*", hint: "Text, PDF or a photo" },
];

/* Layered ridges of the Sierra, far to near. The front ridge is the footer's
 * color so the page runs straight into it. Each layer rises a different
 * amount as you scroll in, which gives the range some depth. */
const RIDGES = [
  { fill: "#D9C4A2", rise: 70, d: "M0 118 L70 96 L150 108 L240 70 L320 92 L410 58 L500 86 L590 64 L690 30 L790 72 L880 54 L980 84 L1070 46 L1160 76 L1250 40 L1340 70 L1440 52 L1440 260 L0 260 Z" },
  { fill: "#C8A272", rise: 48, d: "M0 140 L90 112 L170 128 L270 88 L360 118 L450 96 L540 124 L640 84 L730 110 L830 76 L930 116 L1030 92 L1120 122 L1220 86 L1320 114 L1440 92 L1440 260 L0 260 Z" },
  { fill: "#A87848", rise: 30, d: "M0 170 C 60 150 110 138 180 150 S 300 120 380 140 S 500 168 580 146 S 720 112 800 136 S 930 162 1010 144 S 1150 118 1230 140 S 1360 160 1440 136 L1440 260 L0 260 Z" },
  { fill: "#6E4A2E", rise: 16, d: "M0 198 C 90 176 170 170 260 184 S 420 206 520 188 S 700 160 800 180 S 980 204 1080 186 S 1260 166 1350 182 S 1420 190 1440 186 L1440 260 L0 260 Z" },
  { fill: "#231A15", rise: 0, d: "M0 232 C 120 214 240 210 360 222 S 600 240 720 226 S 960 206 1080 220 S 1320 238 1440 222 L1440 260 L0 260 Z" },
];

function Ridge({ ridge, progress, reduce }) {
  const y = useTransform(progress, [0, 1], [reduce ? 0 : ridge.rise, 0]);
  return (
    <motion.svg aria-hidden className="absolute inset-x-0 bottom-0 h-full w-full" viewBox="0 0 1440 260" preserveAspectRatio="none" style={{ y }}>
      <path d={ridge.d} fill={ridge.fill} />
    </motion.svg>
  );
}

const CLOUDS = [
  ["6%", 10, 180, "#F4EADA"], ["9%", 0, 90, "#F4EADA"], ["30%", 50, 240, "#EFE2CB"],
  ["56%", 10, 180, "#F4EADA"], ["59%", 0, 90, "#F4EADA"], ["80%", 50, 240, "#EFE2CB"],
];

export default function Upload({ pageTitle = false }) {
  // on its own page this is the page title (h1); on the home page a section (h2)
  const Heading = pageTitle ? "h1" : "h2";
  const { t } = useLang();
  const [kind, setKind] = useState("video");
  const [file, setFile] = useState(null);
  const [state, setState] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });
  const id = useId();
  const current = KINDS.find(k => k.id === kind);

  const submit = e => {
    e.preventDefault();
    if (!file) {
      setError(t("Choose a file to upload."));
      fileRef.current?.focus();
      return;
    }
    setError("");
    setState("sending");
    // demo only: there's no server yet
    setTimeout(() => setState("sent"), 1200);
  };

  return (
    <section ref={sectionRef} id="upload" aria-labelledby="up-h" className="paper relative scroll-mt-20 overflow-hidden bg-sand text-umber">
      <div aria-hidden className="absolute left-0 top-10 h-[120px] w-[200%] animate-drift">
        {CLOUDS.map(([l, t, w, c], i) => (
          <span key={i} className="absolute h-[34px] rounded-full" style={{ left: l, top: t, width: w, background: c }} />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(150px,19vw,280px)]">
        {RIDGES.map((r, i) => <Ridge key={i} ridge={r} progress={scrollYProgress} reduce={reduce} />)}
      </div>

      <div className="container-x relative flex flex-col items-center gap-6 pb-[clamp(190px,22vw,320px)] pt-28 text-center">
        <Reveal as="span" className="eyebrow flex items-center gap-2.5 text-rust"><span aria-hidden>✦</span> {t("Chapter")} {t("five")} · {t("Upload")}</Reveal>
        <Heading id="up-h" className="h-display text-[clamp(30px,5vw,68px)]">
          <CurtainText delay={0.05}>
            {t("Add your")} <Accent className="text-rust">{t("voice")}</Accent>
          </CurtainText>
        </Heading>
        <Reveal as="p" delay={0.1} className="max-w-[540px] text-lg leading-relaxed text-loam">
          {t("Upload a video, a song, a podcast episode or a news tip, and get your own creator page.")}
        </Reveal>

        <Reveal delay={0.15} className="w-full max-w-[760px]">
          <AnimatePresence mode="wait" initial={false}>
            {state === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                className="flex flex-col items-center gap-3 rounded-3xl bg-cream p-10 shadow-[0_30px_60px_rgba(43,29,23,0.12)]"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-umber"><Check aria-hidden className="h-7 w-7" /></span>
                <strong className="text-xl">{t("Got it, thank you!")}</strong>
                <p className="text-loam">{t("Felipe reviews every upload. You'll hear back by email. (Demo: nothing was sent.)")}</p>
                <button type="button" onClick={() => { setState("idle"); setFile(null); }} className="pill-dark mt-2">{t("Upload another")}</button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={submit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                noValidate
                className="flex flex-col gap-5 rounded-3xl bg-cream p-5 text-left shadow-[0_30px_60px_rgba(43,29,23,0.12)] sm:p-7"
              >
                <fieldset>
                  <legend className="eyebrow mb-3 text-[12px] font-medium text-bark">{t("What are you sending?")}</legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {KINDS.map(k => {
                      const on = kind === k.id;
                      const Icon = k.icon;
                      return (
                        <SpotlightCard
                          key={k.id}
                          as="label"
                          className={`flex min-h-[88px] cursor-pointer flex-col justify-between gap-2 rounded-2xl border-2 p-4 transition-colors ${on ? "border-umber bg-umber text-bone" : "border-dune bg-bone hover:border-bark"}`}
                        >
                          <input type="radio" name="kind" value={k.id} checked={on} onChange={() => setKind(k.id)} className="sr-only" />
                          <Icon aria-hidden className={`h-6 w-6 ${on ? "text-gold" : "text-ochre"}`} />
                          <strong className="text-[15px]">{t(k.label)}</strong>
                        </SpotlightCard>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    {t("Title")}
                    <input required name="title" className="h-12 rounded-xl border border-input bg-bone px-3.5 text-base font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/40" />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold">
                    {t("Your name")}
                    <input required name="name" autoComplete="name" className="h-12 rounded-xl border border-input bg-bone px-3.5 text-base font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/40" />
                  </label>
                </div>

                <div>
                  <label
                    htmlFor={`${id}-file`}
                    className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${error ? "border-[#9A3412] bg-[#FBEDE6]" : "border-bark/60 bg-bone hover:border-umber"}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { setFile(f); setError(""); } }}
                  >
                    <UploadCloud aria-hidden className="h-7 w-7 text-ochre" />
                    <strong className="text-base">{file ? file.name : t("Drop a file here or choose one")}</strong>
                    <span className="font-mono text-xs text-bark">{t(current.hint)}</span>
                  </label>
                  <input
                    ref={fileRef}
                    id={`${id}-file`}
                    type="file"
                    accept={current.accept}
                    aria-describedby={error ? `${id}-err` : undefined}
                    aria-invalid={!!error}
                    onChange={e => { setFile(e.target.files?.[0] || null); setError(""); }}
                    className="sr-only"
                  />
                  {error && <p id={`${id}-err`} role="alert" className="mt-2 text-sm font-semibold text-[#9A3412]">{error}</p>}
                </div>

                <button type="submit" disabled={state === "sending"} className="pill-dark min-h-[52px] text-base disabled:opacity-70">
                  {state === "sending" ? <><Loader2 aria-hidden className="h-5 w-5 animate-spin" /> {t("Uploading…")}</> : <>{t("Upload")} {t(current.label).toLowerCase()}</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>

        {/* 21st.dev newsletter ticket, same treatment as the library site:
            a stub that springs in at a tilt, with notches punched out of the band */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative z-10 mt-10 w-full max-w-lg"
        >
          <span aria-hidden className="absolute -left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-sand" />
          <span aria-hidden className="absolute -right-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-sand" />
          <BlockNewsletter
            className="rounded-lg border-dune bg-cream shadow-2xl shadow-[rgba(43,29,23,0.35)] [&_button]:h-11 [&_button]:font-bold [&_input]:h-11 [&_input]:text-base"
            eyebrow={t("THE CARAVAN LETTER, WEEKLY")}
            title={t("First to hear new episodes and Felipe's picks")}
            successMessage={t("You're on the list. See you Friday.")}
            footnote={t("Demo: no emails are actually sent.")}
            buttonLabel={t("Join")}
            emailLabel={t("Email address")}
          />
        </motion.div>

        {/* a goodbye in his handwriting before the page ends */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-20 flex max-w-[640px] flex-col items-center gap-3"
          aria-label={t("A note from Felipe")}
        >
          <img src={HOST.face} alt="" className="h-16 w-16 rounded-full border-2 border-gold object-cover shadow-lg" />
          <blockquote className="font-script text-[clamp(30px,4.2vw,46px)] leading-[1.15] text-loam">
            {t("Thanks for stopping by.")} {t("There's always coffee and good music here.")} {t("Come back soon.")}
          </blockquote>
          <figcaption className="font-script text-[clamp(30px,3.6vw,40px)] text-rust">— Felipe</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
