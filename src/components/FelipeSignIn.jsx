import { motion } from "framer-motion";
import { LayoutDashboard, Lock, LogOut } from "lucide-react";
import { HOST } from "../lib/data.js";
import { useAuth } from "../lib/auth.jsx";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";

/* A quiet line at the bottom of Felipe's profile. Felipe signs in with his
 * account like everyone else (on /cuenta); because his account is the
 * host's, "Mi panel" appears in the menu. */
export default function FelipeSignIn() {
  const { t } = useLang();
  const { isFelipe, signOut } = useAuth();

  return (
    <section id="entrar" aria-label={t("Are you Felipe?")} className="scroll-mt-28 border-t border-dune bg-bone">
      <div className="container-x flex flex-col items-center gap-4 py-8 text-center">
        {isFelipe ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
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
        ) : (
          <Link
            to={`/cuenta?volver=${encodeURIComponent("/panel")}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold text-bark transition-colors hover:text-umber"
          >
            <Lock aria-hidden className="h-4 w-4" /> {t("Are you Felipe?")} <span className="underline underline-offset-4">{t("Sign in")}</span>
          </Link>
        )}
      </div>
    </section>
  );
}
