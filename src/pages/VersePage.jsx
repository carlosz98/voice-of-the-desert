import { useEffect, useState } from "react";
import { HOST, PHOTOS } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { dayNumber, loadVerse, verseForDay } from "../lib/verses.js";
import PageHeader from "../components/PageHeader.jsx";
import Verse, { dateFor } from "../components/Verse.jsx";
import { WhatsAppGlyph, whatsappLink } from "../components/TopStrip.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { Reveal } from "../components/ui/Reveal.jsx";

const TODAY = dayNumber();
const PAST = [1, 2, 3, 4, 5, 6].map(n => TODAY - n);

function DayCard({ day }) {
  const { t, lang } = useLang();
  const [v, setV] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setFailed(false);
    loadVerse(verseForDay(day), lang).then(r => alive && setV(r)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [day, lang]);

  return (
    <article className="flex h-full flex-col gap-3 rounded-[6px] border border-dune bg-cream p-6 shadow-[0_16px_40px_rgba(43,29,23,0.07)]">
      <p className="font-display text-[13px] font-semibold uppercase tracking-[0.16em] text-bark">{dateFor(day, lang)}</p>
      {v ? (
        <>
          <blockquote className="font-serif text-[21px] italic leading-snug text-umber">{v.text}</blockquote>
          <p className="mt-auto font-display font-semibold text-ochre">— {v.reference}</p>
          <a
            href={whatsappLink(`“${v.text}” — ${v.reference}\n\n${t("Shared from Voice of the Desert")}: ${location.origin + location.pathname}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] w-fit items-center gap-2 text-sm font-semibold text-[#2B6B3F] hover:underline"
          >
            <WhatsAppGlyph /> WhatsApp
          </a>
        </>
      ) : failed ? (
        <p className="text-loam">{t("We couldn't load the verse right now.")}</p>
      ) : (
        <div aria-hidden className="flex flex-col gap-2.5 pt-1">
          {[95, 85, 60].map(w => <span key={w} className="h-4 animate-pulse rounded-full bg-paper" style={{ width: `${w}%` }} />)}
        </div>
      )}
    </article>
  );
}

export default function VersePage() {
  const { t } = useLang();
  return (
    <>
      <PageHeader
        page="Verse"
        eyebrow={t("Every morning")}
        title={<>{t("The Word")} <Accent className="text-sun">{t("of the day")}</Accent></>}
        subtitle={t("A Bible verse every morning, to start the day well.")}
        meta="Reina-Valera 1909 · King James · getBible"
        photo={PHOTOS.cathedral}
        pos="50% 20%"
      />
      <Verse />
      <div className="paper bg-bone text-umber">
        <section aria-labelledby="week-h" className="container-x border-t border-dune py-16 sm:py-20">
          <div className="mb-8 flex flex-col gap-3">
            <h2 id="week-h" className="h-display text-[clamp(28px,3.6vw,46px)]">{t("This week's verses")}</h2>
            <p className="max-w-[620px] text-lg text-loam">{t("Felipe shares a verse every morning. These are the ones from the past days.")}</p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PAST.map((d, i) => (
              <Reveal as="li" key={d} delay={i * 0.05}><DayCard day={d} /></Reveal>
            ))}
          </ul>
        </section>
        <section aria-labelledby="why-h" className="border-t border-dune bg-sand/40">
          <div className="container-x flex max-w-[820px] flex-col items-center gap-5 py-16 text-center sm:py-20">
            <img src={HOST.face} alt="" className="h-20 w-20 rounded-full border-2 border-gold object-cover" />
            <h2 id="why-h" className="h-display text-[clamp(26px,3.2vw,40px)]">{t("Why a verse every day")}</h2>
            <p className="font-serif text-[clamp(22px,2.6vw,28px)] italic leading-snug text-loam">{t("[A few words from Felipe about his faith and why he shares the Word here.]")}</p>
            <p className="font-script text-[38px] leading-none text-rust">— Felipe</p>
          </div>
        </section>
      </div>
    </>
  );
}
