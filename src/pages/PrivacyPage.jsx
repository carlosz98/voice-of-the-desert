import { useEffect } from "react";
import { Database, EyeOff, KeyRound, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { PHOTOS } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { Reveal } from "../components/ui/Reveal.jsx";

/* /privacidad: what the site keeps about people, and why, in plain words. */

const KEPT = [
  ["Your account", "Your name, email and town (if you give it), so you can sign in and so your name shows next to your comments."],
  ["Your picture (optional)", "Only if you add one. It's shown next to your comments, so anyone can see it. You can change or remove it anytime in My account."],
  ["What you write", "Comments, song dedications, messages to Felipe and what you send from the Upload page."],
  ["The letter", "Your email, only if you join The caravan letter."],
  ["Signing in", "A random sign-in ticket, so you don't have to type your password on every page. It ends when you sign out or after 30 days."],
];

const PROMISES = [
  { icon: KeyRound, title: "Your password is never stored", text: "Only a scrambled version (a hash) is kept. Nobody can read it, not even Felipe or the people who built the site." },
  { icon: EyeOff, title: "Your email stays private", text: "Other visitors never see it. Only Felipe can see it, so he can answer you." },
  { icon: ShieldCheck, title: "No ads, no selling", text: "We don't sell or share your information, and the site has no ads or trackers." },
  { icon: Database, title: "Where it's kept", text: "In the site's database on Google Cloud, in the United States." },
];

export default function PrivacyPage() {
  const { t } = useLang();
  useEffect(() => {
    document.title = `${t("Privacy")} · ${t("Voice of the Desert")}`;
  }, [t]);

  return (
    <>
      <PageHeader
        page="Privacy"
        eyebrow={t("Your information")}
        title={<>{t("What we keep, and")} <Accent className="text-sun">{t("why")}</Accent></>}
        subtitle={t("La Voz del Desierto keeps as little as it can, only what the site needs to work.")}
        meta={t("Updated November 2026")}
        photo={PHOTOS.sunset}
        pos="50% 60%"
      />
      <div className="paper bg-bone text-umber">
        <div className="container-x flex max-w-[860px] flex-col gap-14 py-14 sm:py-16">
          <section aria-labelledby="kept-h" className="flex flex-col gap-5">
            <h2 id="kept-h" className="h-display text-[clamp(26px,3.2vw,38px)]">{t("What the site keeps")}</h2>
            <p className="text-lg leading-relaxed text-loam">{t("Reading, listening and watching never needs an account, and nothing is kept about it.")}</p>
            <dl className="divide-y divide-dune rounded-[20px] border border-dune bg-cream">
              {KEPT.map(([term, text]) => (
                <div key={term} className="grid gap-1 p-5 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="font-display text-lg font-semibold">{t(term)}</dt>
                  <dd className="text-[17px] leading-relaxed text-loam">{t(text)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="promise-h" className="flex flex-col gap-5">
            <h2 id="promise-h" className="h-display text-[clamp(26px,3.2vw,38px)]">{t("How it's protected")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {PROMISES.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 0.05} className="flex flex-col gap-2 rounded-[20px] border border-dune bg-cream p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gold/20 text-ochre"><p.icon aria-hidden className="h-5 w-5" /></span>
                  <h3 className="font-display text-lg font-semibold">{t(p.title)}</h3>
                  <p className="leading-relaxed text-loam">{t(p.text)}</p>
                </Reveal>
              ))}
            </ul>
          </section>

          <section aria-labelledby="others-h" className="flex flex-col gap-3">
            <h2 id="others-h" className="h-display text-[clamp(26px,3.2vw,38px)]">{t("Other services the site uses")}</h2>
            <ul className="flex list-disc flex-col gap-2 pl-6 text-[17px] leading-relaxed text-loam">
              <li>{t("The Bible text comes from getBible.net, and the Chihuahua weather from Open-Meteo. Your browser asks them directly; we don't send them anything about you.")}</li>
              <li>{t("Your browser remembers a few things on your device: that you're signed in, your language, the text size, and your place in the Bible.")}</li>
            </ul>
          </section>

          <section aria-labelledby="yours-h" className="flex flex-col gap-4 rounded-[22px] bg-umber p-6 text-bone sm:p-8">
            <h2 id="yours-h" className="h-display text-[clamp(24px,3vw,34px)]">{t("It's yours")}</h2>
            <p className="flex items-start gap-3 text-[17px] leading-relaxed text-haze">
              <Trash2 aria-hidden className="mt-1 h-5 w-5 flex-none text-sun" />
              <span>{t("You can delete your account at any time from My account. Your comments and submissions are deleted with it.")}</span>
            </p>
            <p className="flex items-start gap-3 text-[17px] leading-relaxed text-haze">
              <Mail aria-hidden className="mt-1 h-5 w-5 flex-none text-sun" />
              <span>{t("To see what we have about you, fix it, or remove anything else (like a dedication or your email from the letter), write to Felipe.")}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/cuenta" className="pill-gold min-h-[52px] px-6">{t("My account")}</Link>
              <Link to="/felipe#write-h" className="pill-ghost min-h-[52px] px-6">{t("Write to Felipe")}</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
