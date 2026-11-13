import { useLang } from "../lib/i18n.jsx";
import { Accent } from "./ui/Accent.jsx";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Camera, Check, FileText, Link2, Loader2, Mic, Music, UploadCloud, UserRound, Video, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { CurtainText, Reveal } from "./ui/Reveal.jsx";
import { SpotlightCard } from "./ui/SpotlightCard.jsx";
import { BlockNewsletter } from "@/components/ui/newsletter-signup-ticket";
import { HOST } from "../lib/data.js";
import { useAuth, initials } from "../lib/auth.jsx";
import { submissions, LIVE } from "../lib/api.js";
import { kindCheck } from "../lib/kind-words.js";
import { Link } from "../lib/router.jsx";

export const KINDS = [
  { id: "video", label: "Video", icon: Video, accept: "video/*", hint: "MP4 or MOV" },
  { id: "music", label: "Music", icon: Music, accept: "audio/*", hint: "MP3 or WAV" },
  { id: "podcast", label: "Podcast", icon: Mic, accept: "audio/*,video/*", hint: "Audio or video episode" },
  { id: "news", label: "News tip", icon: FileText, accept: ".pdf,.doc,.docx,image/*", hint: "Text, PDF or a photo" },
  { id: "photo", label: "Photo", icon: Camera, accept: "image/*", hint: "JPG or PNG" },
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

const input = "h-12 w-full rounded-xl border border-input bg-bone px-3.5 text-base font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/40";

/* Guests see this instead of the form */
function SignInFirst() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const back = encodeURIComponent(pathname === "/" ? "/#upload" : pathname);
  return (
    <motion.div
      key="guest"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-4 rounded-3xl bg-cream p-8 text-center shadow-[0_30px_60px_rgba(43,29,23,0.12)] sm:p-10"
    >
      <span className="grid h-14 w-14 place-items-center rounded-full bg-gold/25 text-ochre"><UploadCloud aria-hidden className="h-7 w-7" /></span>
      <strong className="font-display text-2xl font-semibold">{t("Sign in to send something to Felipe")}</strong>
      <p className="max-w-[460px] text-[17px] leading-relaxed text-loam">
        {t("With a free account you can send videos, songs, photos and news, and see when Felipe answers.")}
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Link to={`/cuenta?volver=${back}`} className="pill-dark min-h-[52px] px-6 text-base">{t("Sign in")}</Link>
        <Link to={`/cuenta?nueva=1&volver=${back}`} className="pill min-h-[52px] border border-dune bg-bone px-6 text-base font-semibold hover:border-umber">{t("Create an account")}</Link>
      </div>
    </motion.div>
  );
}

function SubmitForm({ onSent }) {
  const { t } = useLang();
  const { user, isFelipe } = useAuth();
  const [kind, setKind] = useState("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const id = useId();
  const current = KINDS.find(k => k.id === kind);

  const submit = async e => {
    e.preventDefault();
    if (!title.trim()) return setError(t("Give it a title."));
    const unkind = !isFelipe && kindCheck(title, description, file?.name); // no bad words
    if (unkind) return setError(t(unkind));
    if (!file && !link.trim()) {
      setError(t("Add a file or a link."));
      fileRef.current?.focus();
      return;
    }
    setError("");
    setBusy(true);
    try {
      onSent(await submissions.create({ kind, title, description, link: link.trim(), file_name: file?.name }));
    } catch (err) {
      setError(t(err.message));
      setBusy(false);
    }
  };

  return (
    <motion.form
      key="form"
      onSubmit={submit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      noValidate
      className="flex flex-col gap-5 rounded-3xl bg-cream p-5 text-left shadow-[0_30px_60px_rgba(43,29,23,0.12)] sm:p-7"
    >
      {/* who it's from */}
      <div className="flex items-center gap-3 rounded-2xl bg-bone px-4 py-3">
        <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-full border-2 border-gold bg-gold/20 font-display text-sm font-semibold text-ochre">
          {isFelipe ? <img src={HOST.face} alt="" className="h-full w-full object-cover" /> : initials(user.name)}
        </span>
        <p className="min-w-0 flex-1 text-[15px] text-loam">
          {t("Sending as")} <strong className="text-umber">{user.name}</strong>
          {user.town && <span className="text-bark"> · {user.town}</span>}
        </p>
        <Link to="/cuenta#envios" className="hidden text-sm font-semibold text-rust underline underline-offset-4 hover:text-umber sm:inline">{t("My submissions")}</Link>
      </div>

      <fieldset>
        <legend className="eyebrow mb-3 text-[12px] font-medium text-bark">{t("What are you sending?")}</legend>
        <div className="grid grid-cols-2 gap-3 min-[460px]:grid-cols-3 sm:grid-cols-5">
          {KINDS.map(k => {
            const on = kind === k.id;
            const Icon = k.icon;
            return (
              <SpotlightCard
                key={k.id}
                as="label"
                className={`flex min-h-[88px] cursor-pointer flex-col justify-between gap-2 rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${on ? "border-umber bg-umber text-bone" : "border-dune bg-bone hover:border-bark"}`}
              >
                <input type="radio" name="kind" value={k.id} checked={on} onChange={() => setKind(k.id)} className="sr-only" />
                <Icon aria-hidden className={`h-6 w-6 ${on ? "text-gold" : "text-ochre"}`} />
                <strong className="text-[15px]">{t(k.label)}</strong>
              </SpotlightCard>
            );
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("Title")}
        <input required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} className={input} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        <span>{t("Tell Felipe about it")} <span className="font-normal text-bark">{t("(optional)")}</span></span>
        <textarea rows={3} maxLength={3000} value={description} onChange={e => setDescription(e.target.value)} className={`${input} h-auto py-3 leading-relaxed`} />
      </label>

      <div>
        {file ? (
          <div className="flex min-h-[72px] items-center gap-3 rounded-2xl border-2 border-umber bg-bone px-4">
            <current.icon aria-hidden className="h-6 w-6 flex-none text-ochre" />
            <strong className="min-w-0 flex-1 truncate text-base">{file.name}</strong>
            <button type="button" onClick={() => setFile(null)} aria-label={t("Remove file")} className="grid h-11 w-11 place-items-center rounded-full text-bark hover:bg-dune/50 hover:text-umber">
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={`${id}-file`}
            className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${error && !link ? "border-[#9A3412] bg-[#FBEDE6]" : "border-bark/60 bg-bone hover:border-umber"}`}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { setFile(f); setError(""); } }}
          >
            <UploadCloud aria-hidden className="h-7 w-7 text-ochre" />
            <strong className="text-base">{t("Drop a file here or choose one")}</strong>
            <span className="font-mono text-xs text-bark">{t(current.hint)}</span>
          </label>
        )}
        <input
          ref={fileRef}
          id={`${id}-file`}
          type="file"
          accept={current.accept}
          onChange={e => { setFile(e.target.files?.[0] || null); setError(""); }}
          className="sr-only"
        />
      </div>

      <div className="flex items-center gap-3 text-sm font-semibold text-bark">
        <span className="h-px flex-1 bg-dune" /> {t("or paste a link")} <span className="h-px flex-1 bg-dune" />
      </div>
      <label className="relative flex flex-col">
        <span className="sr-only">{t("Link")}</span>
        <Link2 aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-bark" />
        <input
          type="url"
          inputMode="url"
          maxLength={500}
          value={link}
          onChange={e => { setLink(e.target.value); setError(""); }}
          placeholder={t("https://youtube.com/… or a news article")}
          className={`${input} pl-11`}
        />
      </label>

      {error && <p role="alert" className="text-[15px] font-semibold text-[#9A3412]">{error}</p>}

      <button type="submit" disabled={busy} className="pill-dark min-h-[56px] text-[17px] disabled:opacity-70">
        {busy ? <><Loader2 aria-hidden className="h-5 w-5 animate-spin" /> {t("Sending…")}</> : <>{t("Send to Felipe")}</>}
      </button>
      {!LIVE && <p className="text-center text-xs text-bark">{t("Demo: files aren't uploaded yet; only the details are saved in this browser.")}</p>}
    </motion.form>
  );
}

function Sent({ sent, again }) {
  const { t } = useLang();
  return (
    <motion.div
      key="sent"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      role="status"
      className="flex flex-col items-center gap-3 rounded-3xl bg-cream p-10 text-center shadow-[0_30px_60px_rgba(43,29,23,0.12)]"
    >
      <motion.span
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-gold text-umber"
      >
        <Check aria-hidden className="h-8 w-8" />
      </motion.span>
      <strong className="font-display text-2xl font-semibold">{t("Got it, thank you!")}</strong>
      <p className="max-w-[440px] text-[17px] leading-relaxed text-loam">
        “{sent.title}” {t("is with Felipe now. He reviews every submission, and you can see how it's going in your account.")}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Link to="/cuenta#envios" className="pill-dark min-h-[52px] px-6 text-base">{t("See my submissions")}</Link>
        <button type="button" onClick={again} className="pill min-h-[52px] border border-dune bg-bone px-6 text-base font-semibold hover:border-umber">{t("Send another")}</button>
      </div>
    </motion.div>
  );
}

export default function Upload({ pageTitle = false }) {
  // on its own page this is the page title (h1); on the home page a section (h2)
  const Heading = pageTitle ? "h1" : "h2";
  const { t } = useLang();
  const { user } = useAuth();
  const [sent, setSent] = useState(null);
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end end"] });

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
          {t("Send Felipe a video, a song, a podcast, a photo or a news tip. He reviews everything and may share it on the site.")}
        </Reveal>

        <Reveal delay={0.15} className="w-full max-w-[760px]">
          <AnimatePresence mode="wait" initial={false}>
            {!user ? (
              <SignInFirst key="guest" />
            ) : sent ? (
              <Sent key="sent" sent={sent} again={() => setSent(null)} />
            ) : (
              <SubmitForm key="form" onSent={setSent} />
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
