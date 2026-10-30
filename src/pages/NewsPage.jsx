import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Search, X } from "lucide-react";
import { ALL_STORIES, NEWS_FILTERS, PHOTOS } from "../lib/data.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { Accent } from "../components/ui/Accent.jsx";
import { EASE, Reveal } from "../components/ui/Reveal.jsx";
import { LeadStory } from "../components/News.jsx";
import { Desk, StoryCard, StoryRow } from "../components/news/parts.jsx";

const PAGE = 6; // stories per "show more"

// compare without accents or case, so "cuauhtemoc" finds "Cuauhtémoc"
const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function NewsPage() {
  const { t, lang } = useLang();
  const [params, setParams] = useSearchParams();
  const topic = NEWS_FILTERS.includes(params.get("tema")) ? params.get("tema") : "All";
  const query = params.get("q") || "";
  const [sort, setSort] = useState("new");
  const [count, setCount] = useState(PAGE);

  useEffect(() => {
    document.title = `${t("News")} · ${t("Voice of the Desert")}`;
  }, [t]);

  // keep topic and search in the address, so a filtered page can be shared
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "All") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    setCount(PAGE);
  };

  const results = useMemo(() => {
    const q = fold(query.trim());
    let list = ALL_STORIES.filter(a => topic === "All" || a.category === topic);
    if (q) {
      list = list.filter(a =>
        [a.title, a.summary, a.take, a.source, a.category, ...(a.body || [])].some(s => fold(t(s) || "").includes(q) || fold(s || "").includes(q))
      );
    }
    if (sort === "comments") list = [...list].sort((x, y) => y.comments - x.comments);
    return list;
  }, [topic, query, sort, t]);

  const counts = useMemo(
    () => Object.fromEntries(NEWS_FILTERS.map(f => [f, f === "All" ? ALL_STORIES.length : ALL_STORIES.filter(a => a.category === f).length])),
    []
  );
  const mostCommented = useMemo(() => [...ALL_STORIES].sort((x, y) => y.comments - x.comments).slice(0, 4), []);

  // the big lead treatment only for the plain, newest-first view
  const plain = topic === "All" && !query && sort === "new";
  const [lead, ...rest] = results;
  const grid = plain ? rest : results;
  const visible = grid.slice(0, count);

  return (
    <>
      {/* page header */}
      <header className="relative overflow-hidden bg-earth pb-14 pt-[150px] text-bone sm:pb-16 sm:pt-[170px]">
        <img src={PHOTOS.cathedral} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" style={{ objectPosition: "50% 35%" }} />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,26,21,0.85)_0%,rgba(35,26,21,0.55)_45%,#231A15_100%)]" />
        <div className="container-x relative flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-dust">
            <Link to="/" className="hover:text-gold">{t("Home")}</Link>
            <ChevronRight aria-hidden className="h-4 w-4" />
            <span aria-current="page" className="text-bone">{t("News")}</span>
          </nav>
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="eyebrow flex items-center gap-2.5 text-gold">
            <span aria-hidden>✦</span> {t("Chapter")} {t("four")} · {t("News & commentary")}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.08 }} className="h-display text-[clamp(40px,6vw,80px)]">
            {t("Echoes of the")} <Accent className="text-sun">{t("road")}</Accent>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.25 }} className="max-w-[620px] text-lg leading-relaxed text-haze">
            {t("What's going on in Chihuahua and the world, with Felipe's own take on every story.")}
          </motion.p>
          <p className="text-sm text-dust">
            {ALL_STORIES.length} {t("stories")} · {NEWS_FILTERS.length - 1} {t("Topics").toLowerCase()}
          </p>
        </div>
      </header>

      <div className="paper bg-bone text-umber">
        {/* toolbar: search, topics, sort */}
        <div className="container-x flex flex-col gap-4 pt-7">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex min-w-0 flex-[1_1_320px] items-center">
              <span className="sr-only">{t("Search stories")}</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 h-5 w-5 text-bark" />
              <input
                type="search"
                value={query}
                onChange={e => update("q", e.target.value)}
                placeholder={t("Search by word or place…")}
                className="h-12 w-full rounded-full border border-dune bg-cream pl-12 pr-11 text-base outline-none placeholder:text-bark/80 focus:border-gold focus:ring-2 focus:ring-gold/40"
              />
              {query && (
                <button type="button" onClick={() => update("q", "")} aria-label={t("Clear search")} className="absolute right-1.5 grid h-9 w-9 place-items-center rounded-full text-bark hover:text-umber">
                  <X aria-hidden className="h-4 w-4" />
                </button>
              )}
            </label>
            <div role="group" aria-label={t("Sort by")} className="flex rounded-full border border-dune bg-cream p-1">
              {[["new", "Newest"], ["comments", "Most commented"]].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={sort === id}
                  onClick={() => { setSort(id); setCount(PAGE); }}
                  className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors ${sort === id ? "bg-umber text-bone" : "text-loam hover:text-umber"}`}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
          <div role="group" aria-label={t("Filter stories")} className="flex flex-wrap gap-2">
            {NEWS_FILTERS.map(f => (
              <button
                key={f}
                type="button"
                aria-pressed={topic === f}
                onClick={() => update("tema", f)}
                className={`pill border font-semibold ${topic === f ? "border-umber bg-umber text-bone" : "border-dune text-umber hover:border-umber"}`}
              >
                {t(f)} <span className={`text-xs font-bold ${topic === f ? "text-sun" : "text-bark"}`}>{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="container-x py-10 sm:py-12">
          {plain && lead && <LeadStory story={lead} headingLevel={2} />}

          <div className={`flex flex-wrap items-start gap-8 ${plain ? "border-t border-umber pt-8" : ""}`}>
            <div className="min-w-0 flex-[1_1_560px]">
              <p className="mb-5 text-sm text-bark" aria-live="polite">
                {results.length} {results.length === 1 ? t("story") : t("stories")}
                {query && <> · “{query}”</>}
              </p>

              {visible.length > 0 ? (
                <motion.ul layout className="grid gap-6 sm:grid-cols-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {visible.map(a => (
                      <motion.li key={a.id + lang} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE }}>
                        <StoryCard story={a} headingLevel={plain ? 3 : 2} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              ) : (
                results.length === 0 && (
                  <div className="flex flex-col items-start gap-4 rounded-[18px] border border-dashed border-dune bg-cream/60 p-8">
                    <p className="font-display text-xl font-semibold">{t("No stories match your search.")}</p>
                    <button type="button" onClick={() => setParams({}, { replace: true })} className="pill-dark">{t("Clear search")}</button>
                  </div>
                )
              )}

              {grid.length > count && (
                <div className="mt-10 flex justify-center">
                  <button type="button" onClick={() => setCount(c => c + PAGE)} className="pill-dark min-h-[52px] px-8 text-base">
                    {t("Show more stories")}
                  </button>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6 lg:max-w-[380px]">
              <Reveal className="rounded-[22px] border border-dune bg-cream p-5 sm:p-6">
                <h2 className="mb-2 font-display text-xl font-semibold">{t("Most commented")}</h2>
                <ol className="flex flex-col divide-y divide-dune">
                  {mostCommented.map((a, i) => (
                    <li key={a.id}><StoryRow story={a} rank={i + 1} /></li>
                  ))}
                </ol>
              </Reveal>
              <Reveal className="rounded-[22px] border border-dune bg-cream p-5 sm:p-6">
                <h2 className="mb-3 font-display text-xl font-semibold">{t("Topics")}</h2>
                <ul className="flex flex-col">
                  {NEWS_FILTERS.filter(f => f !== "All").map(f => (
                    <li key={f}>
                      <button
                        type="button"
                        onClick={() => { update("tema", f); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="flex min-h-[44px] w-full items-center justify-between border-b border-dune text-left font-semibold last:border-b-0 hover:text-ochre"
                      >
                        {t(f)} <span className="text-sm text-bark">{counts[f]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Desk sticky={false} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
