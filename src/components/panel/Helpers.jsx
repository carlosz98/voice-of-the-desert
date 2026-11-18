import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ExternalLink, Flame, Link2, Loader2, Music, Newspaper, PenLine, RefreshCw, RotateCcw, Search, Sparkles, Youtube } from "lucide-react";
import { useLang } from "../../lib/i18n.jsx";
import { agoFrom } from "../../lib/content.jsx";
import { newsTopic, searchMusic, searchNews, TOOLS_LIVE, TOPICS, videoInfo, writeHelp } from "../../lib/tools.js";

/* ============================================================
 *  The helpers inside Felipe's forms (panel):
 *    <HappeningNow onWrite={story => …} />       "what's happening today" board
 *    <NewsFinder onPick={story => …} />          find news on the web
 *    <WriteHelper kind="news" … onDraft={…} />   "Ayúdame a escribir"
 *    <MusicFinder onPick={song => …} />          find a song's details
 *    <YouTubeLink onPick={video => …} />         paste a YouTube link
 *  Big buttons and plain words: Felipe is not a computer person.
 * ============================================================ */

const input = "h-12 w-full rounded-xl border border-dune bg-cream px-4 text-[17px] outline-none placeholder:text-bark/70 focus:border-gold focus:ring-2 focus:ring-gold/40";
const box = "flex flex-col gap-4 rounded-[20px] border-2 p-4 sm:col-span-2 sm:p-5";

function ErrorLine({ text }) {
  const { t } = useLang();
  return text ? <p role="alert" className="rounded-xl bg-[#9A3412]/10 px-4 py-3 font-semibold text-[#9A3412]">{t(text)}</p> : null;
}

function DemoLine({ text }) {
  const { t } = useLang();
  return TOOLS_LIVE ? null : <p className="text-sm text-bark">{t(text)}</p>;
}

/* a search box with a big button; Enter also searches */
function SearchBar({ label, placeholder, value, onChange, onSearch, busy, buttonLabel = "Search" }) {
  const { t } = useLang();
  return (
    <form onSubmit={e => { e.preventDefault(); onSearch(); }} className="flex flex-wrap gap-2">
      <label className="min-w-0 flex-[1_1_240px]">
        <span className="sr-only">{label}</span>
        <input className={input} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={100} enterKeyHint="search" />
      </label>
      <button type="submit" disabled={busy || !value.trim()} className="pill-dark min-h-[48px] px-6 disabled:opacity-50">
        {busy ? <Loader2 aria-hidden className="h-5 w-5 animate-spin" /> : <Search aria-hidden className="h-5 w-5" />} {t(buttonLabel)}
      </button>
    </form>
  );
}

/* the news story's small picture; when there's none (or it won't load) a newspaper icon */
function NewsThumb({ src, size = 72, dark = false }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size };
  if (!src || broken) {
    return (
      <span aria-hidden style={style} className={`grid flex-none place-items-center rounded-xl ${dark ? "bg-bone/10 text-dust" : "bg-dune text-bark"}`}>
        <Newspaper className="h-6 w-6" />
      </span>
    );
  }
  // no-referrer: the newspaper doesn't learn where the picture was seen
  return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} style={style} className="flex-none rounded-xl object-cover" />;
}

/* ───────── 0. what's happening today (top of the panel) ───────── */
export function HappeningNow({ onWrite }) {
  const { t, lang } = useLang();
  const [topic, setTopic] = useState("top");
  const [lists, setLists] = useState({}); // topic → stories (kept while the panel is open)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (id, again = false) => {
    if (lists[id] && !again) return;
    setBusy(true);
    setError("");
    try {
      const list = await newsTopic(id, lang);
      setLists(l => ({ ...l, [id]: list.slice(0, 6) }));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };
  useEffect(() => { load(topic); }, [topic]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = lists[topic];
  return (
    <section aria-labelledby="now-h" className="flex flex-col gap-4 rounded-[22px] bg-night p-5 text-bone shadow-[0_20px_50px_rgba(43,29,23,0.18)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-umber"><Flame aria-hidden className="h-5 w-5" /></span>
          <div>
            <h2 id="now-h" className="font-display text-2xl font-semibold text-cream">{t("What's happening today")}</h2>
            <p className="text-[15px] text-dust">{t("Ideas to write about. Choose one and give your opinion.")}</p>
          </div>
        </div>
        <button type="button" onClick={() => load(topic, true)} disabled={busy} className="pill min-h-[44px] border border-line px-4 text-sm font-semibold text-haze hover:border-dust disabled:opacity-50">
          <RefreshCw aria-hidden className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> {t("Refresh")}
        </button>
      </div>
      <div role="tablist" aria-label={t("What's happening today")} className="flex flex-wrap gap-2">
        {TOPICS.map(tp => (
          <button key={tp.id} type="button" role="tab" aria-selected={topic === tp.id} onClick={() => setTopic(tp.id)} className={`min-h-[44px] rounded-full px-4 text-[15px] font-semibold transition-colors ${topic === tp.id ? "bg-gold text-umber" : "bg-bone/10 text-haze hover:bg-bone/20"}`}>
            {t(tp.label)}
          </button>
        ))}
      </div>
      <ErrorLine text={error} />
      {!list && !error && (
        <ul aria-hidden className="grid gap-2.5 md:grid-cols-2">
          {[0, 1, 2, 3].map(i => <li key={i} className="h-[92px] animate-pulse rounded-2xl bg-bone/10" />)}
        </ul>
      )}
      {list?.length === 0 && <p className="text-dust">{t("Nothing new here right now.")}</p>}
      {list?.length > 0 && (
        <ul role="tabpanel" className="grid gap-2.5 md:grid-cols-2">
          {list.map((s, i) => (
            <motion.li key={s.link + s.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex flex-col gap-2.5 rounded-2xl bg-bone/[0.07] p-3.5 ring-1 ring-line">
              <div className="flex gap-3">
                <NewsThumb src={s.image} size={84} dark />
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold leading-snug text-cream">{s.title}</p>
                  <p className="mt-1 text-sm text-dust">{s.source}{s.published && ` · ${t(agoFrom(s.published))}`}</p>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <button type="button" onClick={() => onWrite(s)} className="pill-gold min-h-[44px] px-4 text-sm">
                  <PenLine aria-hidden className="h-4 w-4" /> {t("Write about this")}
                </button>
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="pill min-h-[44px] border border-line px-3.5 text-sm font-semibold text-haze hover:border-dust">
                  <ExternalLink aria-hidden className="h-4 w-4" /> {t("Read it")}
                </a>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
      {!TOOLS_LIVE && <p className="text-sm text-dust">{t("Demo: these are example headlines. On the real site they come from Google News.")}</p>}
    </section>
  );
}

/* ───────── 1. find news ───────── */
const NEWS_IDEAS = ["Chihuahua", "Ciudad Juárez", "Gobierno de México", "Clima en Chihuahua", "Iglesia", "Música norteña"];

export function NewsFinder({ onPick }) {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState("");

  const search = async (words = q) => {
    if (!words.trim()) return;
    setQ(words);
    setBusy(true);
    setError("");
    try {
      setList(await searchNews(words.trim(), lang));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <section aria-labelledby="news-find-h" className={`${box} border-gold/50 bg-[#FFF8E9]`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gold text-umber"><Newspaper aria-hidden className="h-5 w-5" /></span>
        <div>
          <h2 id="news-find-h" className="font-display text-xl font-semibold">{t("Find news on the web")}</h2>
          <p className="text-[15px] text-loam">{t("Write what it's about, like you'd say it. Then choose a story and give your opinion.")}</p>
        </div>
      </div>
      <SearchBar label={t("Find news on the web")} placeholder={t("e.g. government asks people to prepare")} value={q} onChange={setQ} onSearch={() => search()} busy={busy} />
      {!list && (
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-sm text-bark">{t("Ideas:")}</span>
          {NEWS_IDEAS.map(w => (
            <button key={w} type="button" onClick={() => search(w)} className="min-h-[40px] rounded-full border border-dune bg-cream px-3.5 text-[15px] font-semibold hover:border-umber">{w}</button>
          ))}
        </div>
      )}
      <ErrorLine text={error} />
      {list?.length === 0 && <p className="text-loam">{t("Nothing found. Try other words, or fewer words.")}</p>}
      {list?.length > 0 && (
        <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
          {list.map(s => (
            <li key={s.link + s.title} className={`flex flex-col gap-2 rounded-2xl border bg-cream p-3.5 sm:flex-row sm:items-center ${picked === s.title ? "border-umber" : "border-dune"}`}>
              <div className="flex min-w-0 flex-1 gap-3">
                <NewsThumb src={s.image} size={64} />
                <div className="min-w-0">
                <p className="text-[17px] font-semibold leading-snug">{s.title}</p>
                <p className="mt-0.5 text-sm text-bark">{s.source}{s.published && ` · ${t(agoFrom(s.published))}`}</p>
                </div>
              </div>
              <div className="flex flex-none gap-2">
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="pill min-h-[44px] border border-dune px-3.5 text-sm font-semibold hover:border-umber">
                  <ExternalLink aria-hidden className="h-4 w-4" /> {t("Read it")}
                </a>
                <button type="button" onClick={() => { setPicked(s.title); onPick(s); }} className="pill-gold min-h-[44px] px-4 text-sm">
                  {picked === s.title ? <Check aria-hidden className="h-4 w-4" /> : null} {t(picked === s.title ? "Chosen" : "Use this one")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {picked && <p role="status" className="font-semibold text-[#2B6B3F]">{t("Done: the title, newspaper and link are filled in below. Now write your opinion.")}</p>}
      <DemoLine text="Demo: these are example headlines. On the real site they come from Google News." />
    </section>
  );
}

/* ───────── 2. "Ayúdame a escribir" ───────── */
const NOTES_EXAMPLE = {
  news: "e.g. write that the government is asking families to get ready for the cold, and that I think we should check on our older neighbors",
  article: "e.g. write about the night market coming back, that it's good for families and small businesses",
  video: "e.g. a sunrise in the Sierra, I share it because it reminds me to be thankful",
  episode: "e.g. I talked with a guitar maker from Delicias about his craft and his family",
  verse: "e.g. this verse reminds me that we are never alone, even in hard times",
  note: "e.g. good morning, cold day today, take care of yourselves",
};

/* current: the form's values now (so "Undo" can put them back)
 * about:   the news he chose, or the verse
 * onDraft: puts the draft's fields into the form */
export function WriteHelper({ kind, current, about, onDraft }) {
  const { t, lang } = useLang();
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [before, setBefore] = useState(null); // the form before the draft, for "Undo"

  const write = async () => {
    setBusy(true);
    setError("");
    try {
      const { demo, ...draft } = await writeHelp({ kind, notes, about, lang });
      setBefore(current);
      onDraft(draft);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <section aria-labelledby={`help-${kind}-h`} className={`${box} border-[#3E6A73]/40 bg-[#EEF3F1]`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#3E6A73] text-cream"><Sparkles aria-hidden className="h-5 w-5" /></span>
        <div>
          <h2 id={`help-${kind}-h`} className="font-display text-xl font-semibold">{t("Help me write")}</h2>
          <p className="text-[15px] text-loam">{t("Tell it in your own words, even messy. It writes a draft below for you to check.")}</p>
        </div>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="sr-only">{t("Your notes")}</span>
        <textarea rows={3} maxLength={3000} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t(NOTES_EXAMPLE[kind])} className="w-full rounded-xl border border-dune bg-cream px-4 py-3 text-[17px] leading-relaxed outline-none placeholder:text-bark/70 focus:border-gold focus:ring-2 focus:ring-gold/40" />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={write} disabled={busy || notes.trim().length < 5} className="pill min-h-[52px] bg-[#3E6A73] px-6 text-[17px] font-semibold text-cream hover:bg-[#335a62] disabled:opacity-50">
          {busy ? <Loader2 aria-hidden className="h-5 w-5 animate-spin" /> : <Sparkles aria-hidden className="h-5 w-5" />} {t(busy ? "Writing…" : "Write it for me")}
        </button>
        {before && !busy && (
          <button type="button" onClick={() => { onDraft(before); setBefore(null); }} className="pill min-h-[52px] border border-dune px-5 font-semibold hover:border-umber">
            <RotateCcw aria-hidden className="h-4 w-4" /> {t("Undo")}
          </button>
        )}
      </div>
      <ErrorLine text={error} />
      <AnimatePresence>
        {before && (
          <motion.p role="status" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl bg-[#3E6A73]/10 px-4 py-3 text-[15px] font-semibold text-[#2c5058]">
            {t("Draft ready below. Read it and change anything: it's your name on it. Words in [brackets] are for you to fill in.")}
          </motion.p>
        )}
      </AnimatePresence>
      <DemoLine text="Demo: here it only tidies your words. On the real site, Google's free AI (Gemini) writes the draft." />
    </section>
  );
}

/* ───────── 3. find a song ───────── */
const mmss = s => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "");

export function MusicFinder({ onPick }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState(null);

  const search = async () => {
    setBusy(true);
    setError("");
    try {
      setList(await searchMusic(q.trim()));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <section aria-labelledby="music-find-h" className={`${box} border-gold/50 bg-[#FFF8E9]`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gold text-umber"><Music aria-hidden className="h-5 w-5" /></span>
        <div>
          <h2 id="music-find-h" className="font-display text-xl font-semibold">{t("Find the song")}</h2>
          <p className="text-[15px] text-loam">{t("Write the song or the artist. Choose it and the name, artist, album and cover fill in by themselves.")}</p>
        </div>
      </div>
      <SearchBar label={t("Find the song")} placeholder={t("e.g. Viento del norte")} value={q} onChange={setQ} onSearch={search} busy={busy} />
      <ErrorLine text={error} />
      {list?.length === 0 && <p className="text-loam">{t("Nothing found. Try other words, or fewer words.")}</p>}
      {list?.length > 0 && (
        <ul className="grid max-h-[400px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {list.map((s, i) => {
            const on = picked === i;
            return (
              <li key={i}>
                <button type="button" onClick={() => { setPicked(i); onPick(s); }} aria-pressed={on} className={`flex w-full items-center gap-3 rounded-2xl border bg-cream p-2.5 text-left transition-colors ${on ? "border-umber ring-2 ring-gold" : "border-dune hover:border-umber"}`}>
                  {s.artwork ? <img src={s.artwork} alt="" className="h-14 w-14 flex-none rounded-lg object-cover" /> : <span className="grid h-14 w-14 flex-none place-items-center rounded-lg bg-dune"><Music aria-hidden className="h-5 w-5 text-bark" /></span>}
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate">{s.title}</strong>
                    <span className="block truncate text-sm text-bark">{s.artist}{s.album && ` · ${s.album}`}</span>
                    {s.seconds && <span className="text-xs text-bark tabular-nums">{mmss(s.seconds)}</span>}
                  </span>
                  {on && <Check aria-hidden className="h-5 w-5 flex-none text-ochre" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {picked !== null && <p role="status" className="font-semibold text-[#2B6B3F]">{t("Done: the details are filled in below. You still add the song file.")}</p>}
      <DemoLine text="Demo: these are the site's sample songs. On the real site they come from Apple Music's free search." />
    </section>
  );
}

/* ───────── 4. a YouTube link ───────── */
export function YouTubeLink({ onPick }) {
  const { t } = useLang();
  const [url, setUrl] = useState("");
  const [video, setVideo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const look = async () => {
    setBusy(true);
    setError("");
    setVideo(null);
    try {
      const v = await videoInfo(url.trim());
      setVideo(v);
      onPick(v);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <section aria-labelledby="yt-h" className={`${box} border-gold/50 bg-[#FFF8E9]`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#B3261E] text-cream"><Youtube aria-hidden className="h-5 w-5" /></span>
        <div>
          <h2 id="yt-h" className="font-display text-xl font-semibold">{t("Share a YouTube video")}</h2>
          <p className="text-[15px] text-loam">{t("On YouTube press Share, then Copy. Paste the link here. No file needed.")}</p>
        </div>
      </div>
      <form onSubmit={e => { e.preventDefault(); look(); }} className="flex flex-wrap gap-2">
        <label className="min-w-0 flex-[1_1_240px]">
          <span className="sr-only">{t("YouTube link")}</span>
          <input className={input} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtu.be/…" inputMode="url" />
        </label>
        <button type="submit" disabled={busy || !url.trim()} className="pill-dark min-h-[48px] px-6 disabled:opacity-50">
          {busy ? <Loader2 aria-hidden className="h-5 w-5 animate-spin" /> : <Link2 aria-hidden className="h-5 w-5" />} {t("Bring it")}
        </button>
      </form>
      <ErrorLine text={error} />
      {video && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-umber bg-cream p-2.5">
          <img src={video.thumbnail} alt="" className="aspect-video w-28 flex-none rounded-lg object-cover" />
          <span className="min-w-0">
            <strong className="block">{video.title || t("Video found")}</strong>
            <span className="text-sm text-[#2B6B3F]">{video.channel ? `${video.channel} · ` : ""}{t(video.title ? "Title and picture filled in below." : "Picture filled in below. Write the title.")}</span>
          </span>
        </div>
      )}
    </section>
  );
}
