import { useLang } from "./lib/i18n.jsx";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Watch from "./components/Watch.jsx";
import Listen from "./components/Listen.jsx";
import Host from "./components/Host.jsx";
import Podcast from "./components/Podcast.jsx";
import News from "./components/News.jsx";
import Upload from "./components/Upload.jsx";
import Footer from "./components/Footer.jsx";
import MiniPlayer from "./components/MiniPlayer.jsx";
import { Marquee } from "./components/ui/Marquee.jsx";
import { ScrollProgress } from "./components/ui/Reveal.jsx";

const TOPICS = ["Music videos", "Live sessions", "Local news", "The podcast", "New releases", "Felipe's notes", "Creators"];

export default function App() {
  const { t } = useLang();
  return (
    <>
      <a href="#main" className="skip-link">{t("Skip to content")}</a>
      <ScrollProgress />
      <Navbar />
      <main id="main">
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
        <Podcast />
        <News />
        <Upload />
      </main>
      <Footer />
      <MiniPlayer />
    </>
  );
}
