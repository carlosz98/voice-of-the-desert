import { useLang } from "../lib/i18n.jsx";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Navbar.jsx";
import { Link } from "../lib/router.jsx";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-earth">
      <div className="container-x flex flex-wrap items-center justify-between gap-5 py-10 text-sm text-dust">
        <Logo className="text-bone" />
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-2">
            {[["About", "/felipe"], ["News", "/noticias"], ["Music", "/musica"], ["Podcast", "/podcast"], ["Upload", "/subir"]].map(([l, to]) => (
              <li key={l}>
                <Link to={to} className="inline-flex min-h-[44px] items-center px-2 hover:text-gold">{t(l)}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="w-full text-xs text-dust/80">© {new Date().getFullYear()} {t("Voice of the Desert")} · {t("Hosted by Felipe Lerma")}</p>
      </div>

      {/* site credit */}
      <div className="border-t border-bone/10 bg-night">
        <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 text-sm text-dust">
          <p>
            {t("Website designed & built by")}{" "}
            <a
              href="https://carlosz98.github.io/MyPortFolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sun underline-offset-4 hover:underline"
            >
              Carlos Zabala
            </a>
          </p>
          <ul className="flex flex-wrap gap-x-1">
            <li>
              <a href="https://carlosz98.github.io/MyPortFolio/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1 px-2 hover:text-gold">
                {t("Portfolio")} <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a href="https://github.com/carlosz98" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1 px-2 hover:text-gold">
                GitHub <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/carloszabala98/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1 px-2 hover:text-gold">
                LinkedIn <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
