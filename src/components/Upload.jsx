import { useLang } from "../lib/i18n.jsx";
import { Accent } from "./ui/Accent.jsx";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Loader2, Mic, Music, UploadCloud, Video } from "lucide-react";
import { CurtainText, Reveal } from "./ui/Reveal.jsx";
import { SpotlightCard } from "./ui/SpotlightCard.jsx";
import { BlockNewsletter } from "@/components/ui/newsletter-signup-ticket";

const KINDS = [
  { id: "video", label: "Video", icon: Video, accept: "video/*", hint: "MP4 or MOV" },
  { id: "music", label: "Music", icon: Music, accept: "audio/*", hint: "MP3 or WAV" },
  { id: "podcast", label: "Podcast", icon: Mic, accept: "audio/*,video/*", hint: "Audio or video episode" },
  { id: "news", label: "News tip", icon: FileText, accept: ".pdf,.doc,.docx,image/*", hint: "Text, PDF or a photo" },
];

const CLOUDS = [
  ["6%", 10, 180, "#F4EADA"], ["9%", 0, 90, "#F4EADA"], ["30%", 50, 240, "#EFE2CB"],
  ["56%", 10, 180, "#F4EADA"], ["59%", 0, 90, "#F4EADA"], ["80%", 50, 240, "#EFE2CB"],
];

export default function Upload() {
  const { t } = useLang();
  const [kind, setKind] = useState("video");
  const [file, setFile] = useState(null);
  const [state, setState] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");
  const fileRef = useRef(null);
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
    <section id="upload" aria-labelledby="up-h" className="paper relative scroll-mt-20 overflow-hidden bg-sand text-umber">
      <div aria-hidden className="absolute left-0 top-10 h-[120px] w-[200%] animate-drift">
        {CLOUDS.map(([l, t, w, c], i) => (
          <span key={i} className="absolute h-[34px] rounded-full" style={{ left: l, top: t, width: w, background: c }} />
        ))}
      </div>
      <svg aria-hidden className="absolute inset-x-0 bottom-0 h-[150px] w-full" viewBox="0 0 1440 150" preserveAspectRatio="none">
        <path d="M0 70 L 1440 64 L 1440 150 L 0 150 Z" fill="#C9A06A" />
        <g fill="#D99A2B">
          {[[60, 80, 34], [120, 88, 26], [340, 84, 30], [600, 90, 38], [650, 80, 22], [880, 86, 28], [1120, 82, 36], [1170, 92, 24], [1390, 84, 32]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} />)}
        </g>
        <g fill="#A9772C">
          {[[240, 112, 30], [760, 118, 34], [1290, 116, 28]].map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} />)}
        </g>
      </svg>

      <div className="container-x relative flex flex-col items-center gap-6 pb-48 pt-28 text-center">
        <Reveal as="span" className="eyebrow flex items-center gap-2.5 text-rust"><span aria-hidden>✦</span> {t("Chapter")} {t("five")} · {t("Upload")}</Reveal>
        <h2 id="up-h" className="h-display text-[clamp(30px,5vw,68px)]">
          <CurtainText delay={0.05}>
            {t("Add your")} <Accent className="text-rust">{t("voice")}</Accent>
          </CurtainText>
        </h2>
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
      </div>
    </section>
  );
}
