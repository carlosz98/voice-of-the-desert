import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, LayoutDashboard, LogOut, MessageCircle, Music, PenLine, Trash2, UploadCloud, UserRound } from "lucide-react";
import { MySubmissions } from "../components/Submissions.jsx";
import { AvatarPicker, UserAvatar } from "../components/Avatar.jsx";
import { kindCheck } from "../lib/kind-words.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, initials } from "../lib/auth.jsx";
import { LIVE } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { HOST, PHOTOS } from "../lib/data.js";
import { Accent } from "../components/ui/Accent.jsx";
import { EASE } from "../components/ui/Reveal.jsx";

/* /cuenta: sign in, create an account, or (once signed in) your account.
 * ?volver=/noticias/... sends people back where they were after signing in. */

const TOWNS = ["Chihuahua", "Ciudad Juárez", "Delicias", "Cuauhtémoc", "Parral", "Nuevo Casas Grandes", "Camargo", "Jiménez", "Ojinaga", "Creel"];

const field =
  "h-14 w-full rounded-xl border border-dune bg-bone px-4 text-[17px] font-normal text-umber outline-none transition-colors placeholder:text-bark/60 focus:border-gold focus:ring-2 focus:ring-gold/40 aria-[invalid=true]:border-[#9A3412]";

// only send people back to a page on this site
const safeBack = v => (v && v.startsWith("/") && !v.startsWith("//") ? v : null);

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-[15px] font-semibold text-umber">
      <span>
        {label} {hint && <span className="font-normal text-bark">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function PasswordInput({ value, onChange, autoComplete, invalid, id }) {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        minLength={autoComplete === "new-password" ? 8 : undefined}
        maxLength={autoComplete === "new-password" ? 72 : 200}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={`${field} pr-14`}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? t("Hide password") : t("Show password")}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-bark transition-colors hover:text-umber"
      >
        {show ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
      </button>
    </div>
  );
}

function ErrorNote({ error }) {
  const { t } = useLang();
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          key={error}
          role="alert"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-[#9A3412]/30 bg-[#9A3412]/[0.07] px-4 py-3 text-[15px] font-semibold text-[#9A3412]"
        >
          {t(error)}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function SubmitButton({ busy, children }) {
  const { t } = useLang();
  return (
    <button type="submit" disabled={busy} className="pill-dark min-h-[56px] w-full text-[17px] disabled:cursor-wait disabled:opacity-70">
      {busy ? (
        <>
          <motion.span aria-hidden animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} className="h-5 w-5 rounded-full border-2 border-bone/30 border-t-bone" />
          {t("One moment…")}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ---------- signed out: the two forms ---------- */

function SignInForm({ onDone, switchTo }) {
  const { t } = useLang();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pw = useId();

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      onDone(await signIn(email, password));
    } catch (err) {
      setError(err.message);
      setPassword("");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate={false}>
      <Field label={t("Email")}>
        <input type="email" required autoComplete="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} className={field} />
      </Field>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={pw} className="text-[15px] font-semibold text-umber">{t("Password")}</label>
        <PasswordInput id={pw} value={password} onChange={setPassword} autoComplete="current-password" invalid={!!error} />
      </div>
      <ErrorNote error={error} />
      <SubmitButton busy={busy}>{t("Sign in")}</SubmitButton>
      <p className="text-center text-[15px] text-loam">
        {t("New here?")}{" "}
        <button type="button" onClick={switchTo} className="font-bold text-rust underline underline-offset-4 hover:text-umber">
          {t("Create an account")}
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onDone, switchTo }) {
  const { t } = useLang();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", town: "", password: "", avatar: null });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));
  const pw = useId();
  const longEnough = form.password.length >= 8;

  const submit = async e => {
    e.preventDefault();
    const unkind = kindCheck(form.name, form.town); // no bad words in names
    if (unkind) return setError(unkind);
    setBusy(true);
    setError("");
    try {
      onDone(await register(form));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label={t("Name")} hint={t("(it shows next to your comments)")}>
        <input required maxLength={100} autoComplete="name" value={form.name} onChange={set("name")} className={field} />
      </Field>
      {/* optional picture: a photo (made small here) or one of the drawings */}
      <AvatarPicker name={form.name} value={form.avatar} onChange={avatar => setForm(f => ({ ...f, avatar }))} />
      <Field label={t("Email")} hint={t("(nobody else sees it)")}>
        <input type="email" required maxLength={150} autoComplete="email" inputMode="email" value={form.email} onChange={set("email")} className={field} />
      </Field>
      <Field label={t("Your town")} hint={t("(optional)")}>
        <input list="votd-towns" maxLength={100} autoComplete="address-level2" value={form.town} onChange={set("town")} className={field} />
        <datalist id="votd-towns">{TOWNS.map(town => <option key={town} value={town} />)}</datalist>
      </Field>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={pw} className="text-[15px] font-semibold text-umber">{t("Password")}</label>
        <PasswordInput id={pw} value={form.password} onChange={set("password")} autoComplete="new-password" />
        <p className={`flex items-center gap-1.5 text-sm transition-colors ${longEnough ? "font-semibold text-[#3F6212]" : "text-bark"}`}>
          <span className={`grid h-5 w-5 place-items-center rounded-full border transition-colors ${longEnough ? "border-[#3F6212] bg-[#3F6212] text-bone" : "border-dune"}`}>
            {longEnough && <Check aria-hidden className="h-3.5 w-3.5" />}
          </span>
          {t("At least 8 characters")}
        </p>
      </div>
      <ErrorNote error={error} />
      <SubmitButton busy={busy}>{t("Create my account")}</SubmitButton>
      <p className="text-center text-sm text-bark">
        {t("We keep only what the site needs.")}{" "}
        <Link to="/privacidad" className="font-semibold text-rust underline underline-offset-4 hover:text-umber">{t("How we protect it")}</Link>
      </p>
      <p className="text-center text-[15px] text-loam">
        {t("Already have an account?")}{" "}
        <button type="button" onClick={switchTo} className="font-bold text-rust underline underline-offset-4 hover:text-umber">
          {t("Sign in")}
        </button>
      </p>
    </form>
  );
}

function SignedOut({ back }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("nueva") === "1" ? "register" : "signin";
  const setTab = next => {
    const p = new URLSearchParams(params);
    next === "register" ? p.set("nueva", "1") : p.delete("nueva");
    setParams(p, { replace: true });
  };
  const done = user => {
    const to = back === "/panel" && user.role !== "felipe" ? null : back;
    if (to) return navigate(to, { replace: true });
    // stay here (now showing the account), and forget "?nueva=1" so signing
    // out later shows "Sign in" again
    const p = new URLSearchParams(params);
    p.delete("nueva");
    setParams(p, { replace: true });
  };

  const perks = [
    { icon: MessageCircle, text: "Comment on the news, videos and the podcast" },
    { icon: Music, text: "Your name on your song dedications" },
    { icon: PenLine, text: "Felipe can answer you" },
  ];

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-[1.05fr_1fr]">
      {/* the photo side */}
      <div className="relative flex overflow-hidden bg-earth px-5 pb-10 pt-[140px] text-bone sm:px-10 lg:min-h-[100svh] lg:items-end lg:pb-16 lg:pt-[170px]">
        <motion.img
          src={PHOTOS.sunset}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          style={{ objectPosition: "50% 60%" }}
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,26,21,0.75)_0%,rgba(35,26,21,0.35)_45%,rgba(35,26,21,0.92)_100%)]" />
        <div className="relative flex max-w-[520px] flex-col gap-5">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="eyebrow flex items-center gap-2.5 text-gold">
            <span aria-hidden>✦</span> {t("Your account")}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.08 }} className="h-display text-[clamp(38px,5vw,68px)]">
            {t("Join the")} <Accent className="text-sun">{t("conversation")}</Accent>
          </motion.h1>
          <ul className="flex flex-col gap-3">
            {perks.map((p, i) => (
              <motion.li
                key={p.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 text-[17px] text-haze"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold"><p.icon aria-hidden className="h-5 w-5" /></span>
                {t(p.text)}
              </motion.li>
            ))}
          </ul>
          <div className="mt-2 hidden items-center gap-3 sm:flex">
            <img src={HOST.face} alt="" className="h-12 w-12 rounded-full border-2 border-gold object-cover" />
            <p className="text-sm text-dust">{t("Reading, listening and sharing is open to everyone, with or without an account.")}</p>
          </div>
        </div>
      </div>

      {/* the form side */}
      <div className="paper flex items-start justify-center bg-bone px-5 py-10 sm:px-10 lg:items-center lg:pt-[120px]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }} className="w-full max-w-[460px]">
          <div role="tablist" aria-label={t("Your account")} className="mb-7 grid grid-cols-2 rounded-full border border-dune bg-cream p-1.5">
            {[["signin", "Sign in"], ["register", "Create an account"]].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`relative min-h-[48px] rounded-full px-3 text-[15px] font-bold transition-colors ${tab === id ? "text-bone" : "text-loam hover:text-umber"}`}
              >
                {tab === id && <motion.span layoutId="account-tab" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-umber" />}
                <span className="relative">{t(label)}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={tab}
              role="tabpanel"
              initial={{ opacity: 0, x: tab === "register" ? 24 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "register" ? -24 : 24 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <h2 className="mb-1 font-display text-[30px] font-semibold leading-tight text-umber">
                {tab === "register" ? t("Create your account") : t("Welcome back")}
              </h2>
              <p className="mb-6 text-[16px] text-loam">
                {tab === "register" ? t("It takes less than a minute.") : t("Sign in with your email and password.")}
              </p>
              {tab === "register" ? <RegisterForm onDone={done} switchTo={() => setTab("signin")} /> : <SignInForm onDone={done} switchTo={() => setTab("register")} />}
            </motion.div>
          </AnimatePresence>

          {!LIVE && (
            <p className="mt-6 rounded-xl border border-dashed border-dune px-4 py-3 text-sm leading-relaxed text-bark">
              {t("Demo: accounts are saved only in this browser for now. To try it:")} <strong className="font-semibold text-loam">rosa@example.com</strong> · <strong className="font-semibold text-loam">demo1234</strong>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- signed in: your account ---------- */

function Card({ title, children, tone = "" }) {
  return (
    <section className={`flex flex-col gap-4 rounded-[22px] border p-6 sm:p-7 ${tone || "border-dune bg-cream"}`}>
      <h2 className="font-display text-[22px] font-semibold text-umber">{title}</h2>
      {children}
    </section>
  );
}

function Saved({ show }) {
  const { t } = useLang();
  return (
    <AnimatePresence>
      {show && (
        <motion.span role="status" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 font-semibold text-[#3F6212]">
          <Check aria-hidden className="h-4 w-4" /> {t("Saved")}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function ProfileCard() {
  const { t } = useLang();
  const { user, isFelipe, update } = useAuth();
  const [name, setName] = useState(user.name);
  const [town, setTown] = useState(user.town || "");
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const changed = name.trim() !== user.name || town.trim() !== (user.town || "") || avatar !== (user.avatar || null);

  const submit = async e => {
    e.preventDefault();
    const unkind = kindCheck(name, town); // no bad words in names
    if (unkind) return setError(unkind);
    setBusy(true);
    setError("");
    try {
      await update({ name, town, avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <Card title={t("Your details")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {!isFelipe && <AvatarPicker name={name} value={avatar} onChange={setAvatar} />}
        <Field label={t("Name")}>
          <input required maxLength={100} value={name} onChange={e => setName(e.target.value)} className={field} />
        </Field>
        <Field label={t("Your town")} hint={t("(optional)")}>
          <input list="votd-towns-2" maxLength={100} value={town} onChange={e => setTown(e.target.value)} className={field} />
          <datalist id="votd-towns-2">{TOWNS.map(x => <option key={x} value={x} />)}</datalist>
        </Field>
        <Field label={t("Email")}>
          <input value={user.email} readOnly disabled className={`${field} cursor-not-allowed opacity-70`} />
        </Field>
        <ErrorNote error={error} />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={!changed || busy} className="pill-dark min-h-[52px] px-6 text-base disabled:opacity-50">{t("Save changes")}</button>
          <Saved show={saved} />
        </div>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const { t } = useLang();
  const { update } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const a = useId();
  const b = useId();

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await update({ current_password: current, new_password: next });
      setCurrent("");
      setNext("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <Card title={t("Change password")}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={a} className="text-[15px] font-semibold text-umber">{t("Current password")}</label>
          <PasswordInput id={a} value={current} onChange={setCurrent} autoComplete="current-password" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={b} className="text-[15px] font-semibold text-umber">{t("New password")} <span className="font-normal text-bark">{t("(at least 8 characters)")}</span></label>
          <PasswordInput id={b} value={next} onChange={setNext} autoComplete="new-password" />
        </div>
        <ErrorNote error={error} />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={!current || next.length < 8 || busy} className="pill-dark min-h-[52px] px-6 text-base disabled:opacity-50">{t("Change password")}</button>
          <Saved show={saved} />
        </div>
      </form>
    </Card>
  );
}

function DeleteCard() {
  const { t } = useLang();
  const { remove } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await remove(password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Card title={t("Delete my account")} tone="border-[#9A3412]/25 bg-bone">
      <p className="text-[16px] leading-relaxed text-loam">{t("Your account and your comments are removed for good. This can't be undone.")}</p>
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <motion.button key="ask" type="button" exit={{ opacity: 0 }} onClick={() => setOpen(true)} className="pill w-fit min-h-[48px] border border-[#9A3412]/40 px-5 font-semibold text-[#9A3412] hover:bg-[#9A3412]/[0.06]">
            <Trash2 aria-hidden className="h-4 w-4" /> {t("Delete my account")}
          </motion.button>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col gap-3 overflow-hidden">
            <label htmlFor={id} className="text-[15px] font-semibold text-umber">{t("Type your password to confirm")}</label>
            <PasswordInput id={id} value={password} onChange={setPassword} autoComplete="current-password" />
            <ErrorNote error={error} />
            <div className="flex flex-wrap gap-2.5">
              <button type="submit" disabled={!password || busy} className="pill min-h-[52px] bg-[#9A3412] px-6 font-bold text-bone disabled:opacity-50">{t("Yes, delete it")}</button>
              <button type="button" onClick={() => { setOpen(false); setPassword(""); setError(""); }} className="pill min-h-[52px] border border-dune px-5 font-semibold hover:border-umber">{t("Cancel")}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* What an account lets you do, one tap away */
function QuickLinks() {
  const { t } = useLang();
  const links = [
    { to: "/subir", icon: UploadCloud, title: "Send something", text: "A video, song, photo or news tip" },
    { to: "/noticias", icon: MessageCircle, title: "Comment", text: "On the news, videos and the podcast" },
    { to: "/musica#ded-h", icon: Music, title: "Dedicate a song", text: "To someone you love" },
    { to: "/felipe#write-h", icon: PenLine, title: "Write to Felipe", text: "He reads every message" },
  ];
  return (
    <ul className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 lg:grid-cols-4">
      {links.map((l, i) => (
        <motion.li key={l.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}>
          <Link to={l.to} className="group flex h-full items-center gap-3 rounded-2xl border border-dune bg-cream p-4 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-bark">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gold/20 text-ochre transition-colors group-hover:bg-gold group-hover:text-umber"><l.icon aria-hidden className="h-5 w-5" /></span>
            <span className="flex min-w-0 flex-col">
              <strong className="text-[16px] text-umber">{t(l.title)}</strong>
              <span className="text-sm text-bark">{t(l.text)}</span>
            </span>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}

function SignedIn({ back }) {
  const { t, lang } = useLang();
  const { user, isFelipe, signOut } = useAuth();
  const since = user.member_since ? new Date(user.member_since).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "long", year: "numeric" }) : null;

  return (
    <>
      <header className="relative overflow-hidden bg-earth pb-12 pt-[150px] text-bone sm:pt-[170px]">
        <img src={PHOTOS.sunset} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" style={{ objectPosition: "50% 60%" }} />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,26,21,0.85)_0%,rgba(35,26,21,0.55)_45%,#231A15_100%)]" />
        <div className="container-x relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <UserAvatar name={user.name} avatar={user.avatar} host={isFelipe} size={80} onDark />
          </motion.span>
          <div className="flex flex-col gap-1.5">
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="h-display text-[clamp(34px,5vw,60px)]">
              {t("Hello,")} <Accent className="text-sun">{user.name.split(" ")[0]}</Accent>
            </motion.h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] text-haze">
              {isFelipe && <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.1em] text-umber">{t("Host")}</span>}
              {user.town && <span>{user.town}</span>}
              {since && <span className="text-dust">{t("Member since")} {since}</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:ml-auto">
            {back && (
              <Link to={back} className="pill-gold min-h-[52px] px-6 text-base">{t("Continue where I was")}</Link>
            )}
            {isFelipe && !back && (
              <Link to="/panel" className="pill-gold min-h-[52px] px-6 text-base">
                <LayoutDashboard aria-hidden className="h-5 w-5" /> {t("Go to my panel")}
              </Link>
            )}
            <button type="button" onClick={signOut} className="pill-ghost min-h-[52px] px-5 text-base">
              <LogOut aria-hidden className="h-4 w-4" /> {t("Sign out")}
            </button>
          </div>
        </div>
      </header>
      <div className="paper bg-bone">
        <div className="container-x flex flex-col gap-6 pt-12">
          <QuickLinks />
          <MySubmissions />
        </div>
        <div className="container-x grid gap-6 py-6 pb-12 lg:grid-cols-2">
          <ProfileCard />
          <div className="flex flex-col gap-6">
            <PasswordCard />
            {!isFelipe && <DeleteCard />}
          </div>
        </div>
        {!LIVE && <p className="container-x pb-12 text-sm text-bark">{t("Demo: accounts are saved only in this browser for now.")}</p>}
      </div>
    </>
  );
}

export default function AccountPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const back = safeBack(params.get("volver"));

  useEffect(() => {
    document.title = `${t(user ? "Your account" : "Sign in")} · ${t("Voice of the Desert")}`;
  }, [t, user]);

  return user ? <SignedIn back={back} /> : <SignedOut back={back} />;
}

/* Small round button for the menu bar: "Sign in", or your picture */
export function AccountButton({ className = "" }) {
  const { t } = useLang();
  const { user, isFelipe } = useAuth();
  if (!user) {
    return (
      <Link to="/cuenta" aria-label={t("Sign in")} className={`pill-ghost bg-earth/35 backdrop-blur-md max-lg:px-3.5 ${className}`}>
        <UserRound aria-hidden className="h-4 w-4" /> <span aria-hidden className="hidden lg:inline">{t("Sign in")}</span>
      </Link>
    );
  }
  return (
    <Link to="/cuenta" aria-label={`${t("Your account")}: ${user.name}`} title={user.name} className={`inline-flex shrink-0 rounded-full transition-transform hover:-translate-y-0.5 ${className}`}>
      <UserAvatar name={user.name} avatar={user.avatar} host={isFelipe} size={44} onDark />
    </Link>
  );
}
