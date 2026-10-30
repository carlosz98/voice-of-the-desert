import { Route, Routes } from "react-router-dom";
import { useLang } from "./lib/i18n.jsx";
import { Router, ScrollManager } from "./lib/router.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import MiniPlayer from "./components/MiniPlayer.jsx";
import { ScrollProgress } from "./components/ui/Reveal.jsx";
import Home from "./pages/Home.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import VideosPage, { VideoPage } from "./pages/VideosPage.jsx";
import MusicPage from "./pages/MusicPage.jsx";
import PodcastPage, { EpisodePage } from "./pages/PodcastPage.jsx";
import FelipePage from "./pages/FelipePage.jsx";
import VersePage from "./pages/VersePage.jsx";
import UploadPage from "./pages/UploadPage.jsx";

function SkipLink() {
  const { t } = useLang();
  // a button rather than #main, so it works with hash links too
  return (
    <button
      type="button"
      className="skip-link"
      onClick={() => {
        const main = document.getElementById("main");
        main?.focus();
        main?.scrollIntoView();
      }}
    >
      {t("Skip to content")}
    </button>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollManager />
      <SkipLink />
      <ScrollProgress />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticias" element={<NewsPage />} />
          <Route path="/noticias/:slug" element={<ArticlePage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/videos/:slug" element={<VideoPage />} />
          <Route path="/musica" element={<MusicPage />} />
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/podcast/:slug" element={<EpisodePage />} />
          <Route path="/felipe" element={<FelipePage />} />
          <Route path="/versiculo" element={<VersePage />} />
          <Route path="/subir" element={<UploadPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <MiniPlayer />
    </Router>
  );
}
