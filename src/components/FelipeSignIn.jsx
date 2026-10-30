import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Lock, LogOut } from "lucide-react";
import { HOST } from "../lib/data.js";
import { useAuth } from "../lib/auth.jsx";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";

/* A quiet line at the bottom of Felipe's profile. Visitors can ignore it;
 * Felipe taps it, types his code, and "Mi panel" appears in the menu. */
export default function FelipeSignIn() {
  const { t } = useLang();
  const { isFelipe, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);

  const submit = e => {
    e.preventDefault();
    if (!signIn(code)) {
      setWrong(true);
      setCode("");
    }
  };

  return (
    <section id="entrar" aria-label={t("Are you Felipe?")} className="scroll-mt-28 border-t border-dune bg-bone">
      <div className="container-x flex flex-col items-center gap-4 py-8 text-center">
        <AnimatePresence mode="wait" initial={false}>
          {isFelipe ? (
            <motion.div key="in" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
              <img src={HOST.face} alt="" className="h-14 w-14 rounded-full border-2 border-gold object-cover" />
              <p className="font-display text-2xl font-semibold">{t("Hello, Felipe")}</p>
              <p className="text-loam">{t("You're signed in. Your panel is in the menu.")}</p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <Link to="/panel" className="pill-gold min-h-[52px] px-6 text-base">
                  <LayoutDashboard aria-hidden className="h-5 w-5" /> {t("Go to my panel")}
                </Link>
                <button type="button" onClick={signOut} className="pill border border-dune min-h-[52px] px-5 font-semibold hover:border-umber">
                  <LogOut aria-hidden className="h-4 w-4" /> {t("Sign out")}
                </button>
              </div>
            </motion.div>
          ) : !open ? (
            <motion.button
              key="ask"
              type="button"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold text-bark transition-colors hover:text-umber"
            >
              <Lock aria-hidden className="h-4 w-4" /> {t("Are you Felipe?")} <span className="underline underline-offset-4">{t("Sign in")}</span>
            </motion.button>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 8 }}
              animate={wrong ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex w-full max-w-[380px] flex-col items-center gap-3"
            >
              <img src={HOST.face} alt="" className="h-14 w-14 rounded-full border-2 border-gold object-cover" />
              <p className="font-display text-xl font-semibold">{t("Sign in to write and upload.")}</p>
              <label className="w-full">
                <span className="sr-only">{t("Code")}</span>
                <input
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  value={code}
                  onChange={e => { setCode(e.target.value); setWrong(false); }}
                  aria-invalid={wrong}
                  placeholder={t("Code")}
                  className="h-14 w-full rounded-xl border border-dune bg-cream px-4 text-center text-xl tracking-[0.3em] outline-none placeholder:tracking-normal focus:border-gold focus:ring-2 focus:ring-gold/40"
                />
              </label>
              {wrong && <p role="alert" className="font-semibold text-[#9A3412]">{t("That code isn't right. Try again.")}</p>}
              <div className="flex w-full gap-2">
                <button type="submit" className="pill-dark min-h-[52px] flex-1 text-base">{t("Enter")}</button>
                <button type="button" onClick={() => { setOpen(false); setWrong(false); setCode(""); }} className="pill border border-dune min-h-[52px] px-5 font-semibold hover:border-umber">{t("Cancel")}</button>
              </div>
              <p className="text-xs text-bark">{t("Demo: in the real site this will be a proper login.")}</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
