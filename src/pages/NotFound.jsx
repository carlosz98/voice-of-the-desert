import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";

export default function NotFound() {
  const { t } = useLang();
  return (
    <section className="paper flex min-h-[80vh] flex-col items-center justify-center gap-5 bg-bone px-5 pb-20 pt-40 text-center text-umber">
      <p className="font-script text-[48px] leading-none text-rust">404</p>
      <h1 className="h-display text-[clamp(32px,4vw,52px)]">{t("Page not found")}</h1>
      <p className="max-w-md text-lg text-loam">{t("It may have moved, or the link is incomplete.")}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="pill-dark">{t("Back to home")}</Link>
        <Link to="/noticias" className="pill border border-dune font-semibold hover:border-umber">{t("News")}</Link>
      </div>
    </section>
  );
}
