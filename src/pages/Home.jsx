import { useEffect } from "react";
import { useLang } from "../lib/i18n.jsx";
import Hero from "../components/Hero.jsx";
import Watch from "../components/Watch.jsx";
import Listen from "../components/Listen.jsx";
import Host from "../components/Host.jsx";
import Podcast from "../components/Podcast.jsx";
import Verse from "../components/Verse.jsx";
import News from "../components/News.jsx";
import Upload from "../components/Upload.jsx";
import { Marquee } from "../components/ui/Marquee.jsx";

const TOPICS = ["Music videos", "Live sessions", "Local news", "The podcast", "New releases", "Felipe's notes", "Creators"];

export default function Home() {
  const { t } = useLang();
  useEffect(() => {
    document.title = t("Voice of the Desert");
  }, [t]);
  return (
    <>
      <div id="top" />
      <Hero />
      {/* topic strip */}
      <div className="border-y border-bone/10 bg-earth py-5">
        <Marquee className="font-serif text-[28px] italic text-dust">
          {TOPICS.map(topic => (
            <span key={topic} className="mx-7 inline-flex items-center gap-14">
              {t(topic)} <span className="font-sans text-base not-italic text-gold">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
      <Watch />
      <Listen />
      <Host />
      <Verse />
      <Podcast />
      <News />
      <Upload />
    </>
  );
}
