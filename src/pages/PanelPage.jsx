import { useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, Check, ChevronRight, Clapperboard, Eye, EyeOff, FileText, Home as HomeIcon, ImagePlus, LogOut,
  Inbox, MessageCircle, Mic, Music, NotebookPen, Plus, Send, Trash2, Upload, X,
} from "lucide-react";
import { ReviewDesk, usePendingCount } from "../components/Submissions.jsx";
import { ALL_STORIES, ALL_VIDEOS, EPISODES, GENRES, HOST, NEWS_FILTERS, PHOTOS, PLAYLISTS, TRACKS } from "../lib/data.js";
import { agoFrom, useContent, writes } from "../lib/content.jsx";
import { greetingFor, useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { useAuth } from "../lib/auth.jsx";
import { Navigate } from "react-router-dom";
import { StoryCard } from "../components/news/parts.jsx";
import { VideoCard } from "../pages/VideosPage.jsx";
import NextEpisode from "../components/NextEpisode.jsx";

/* ───────────────────────────────────────────────────────────────────────
 * Felipe's panel (/panel).
 *
 * Only Felipe sees it: he signs in on /cuenta with his account (role "felipe")
 * and a "Mi panel" tab appears in the menu (see lib/auth.jsx).
 * Submissions are real (through lib/api.js); the publish forms are still
 * demo only until the site is connected to the API.
 * ─────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "home", icon: HomeIcon, label: "Overview" },
  { id: "article", icon: FileText, label: "Write news" },
  { id: "video", icon: Clapperboard, label: "Upload video" },
  { id: "song", icon: Music, label: "Upload song" },
  { id: "podcast", icon: Mic, label: "Podcast episode" },
  { id: "verse", icon: BookOpen, label: "Verse of the day" },
  { id: "note", icon: NotebookPen, label: "Quick note" },
  { id: "comments", icon: MessageCircle, label: "Comments" },
  { id: "submissions", icon: Inbox, label: "Submissions" },
];

const PHOTO_CHOICES = Object.entries(PHOTOS);

/* LIVE helpers */
// "/voice-of-the-desert/img/sunset.webp" → "img/sunset.webp" (what the database keeps).
// A photo picked from the computer can't be saved until Cloud Storage is set up.
const photoForDb = p => (!p || p.startsWith("blob:") ? null : p.startsWith(import.meta.env.BASE_URL) ? p.slice(import.meta.env.BASE_URL.length) : p);
// the length of an audio file, read in the browser (seconds), or null
const durationOf = file =>
  new Promise(resolve => {
    if (!file) return resolve(null);
    const a = document.createElement("audio");
    a.preload = "metadata";
    a.onloadedmetadata = () => resolve(Math.round(a.duration) || null);
    a.onerror = () => resolve(null);
    a.src = URL.createObjectURL(file);
  });
const paragraphs = text => text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

/* ───────── small building blocks (big and clear, for easy use) ───────── */

const input = "h-12 w-full rounded-xl border border-dune bg-cream px-4 text-[17px] outline-none placeholder:text-bark/70 focus:border-gold focus:ring-2 focus:ring-gold/40";
const area = "w-full rounded-xl border border-dune bg-cream px-4 py-3 text-[17px] leading-relaxed outline-none placeholder:text-bark/70 focus:border-gold focus:ring-2 focus:ring-gold/40";

function Field({ label, hint, children, wide = true }) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[15px] font-bold text-umber">{label}</span>
      {children}
      {hint && <span className="text-sm text-bark">{hint}</span>}
    </label>
  );
}

function Choice({ options, value, onChange, label }) {
  const { t } = useLang();
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`min-h-[44px] rounded-full border px-4 text-[15px] font-semibold transition-colors ${value === o ? "border-umber bg-umber text-bone" : "border-dune bg-cream hover:border-umber"}`}
        >
          {t(o)}
        </button>
      ))}
    </div>
  );
}

/* pick one of the site's photos or upload one (shown right away, not uploaded) */
function PhotoPicker({ value, onChange }) {
  const { t } = useLang();
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-bold text-umber">{t("Photo")}</span>
      <div className="flex flex-wrap gap-2">
        {PHOTO_CHOICES.map(([k, src]) => (
          <button key={k} type="button" onClick={() => onChange(src)} aria-pressed={value === src} aria-label={k} className={`relative h-16 w-20 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-bone transition ${value === src ? "ring-gold" : "ring-transparent hover:ring-dune"}`}>
            <img src={src} alt="" className="h-full w-full object-cover" />
            {value === src && <span className="absolute inset-0 grid place-items-center bg-night/40 text-cream"><Check className="h-5 w-5" /></span>}
          </button>
        ))}
        <label htmlFor={id} className="grid h-16 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-bark/50 text-bark hover:border-umber hover:text-umber">
          <ImagePlus aria-hidden className="h-6 w-6" />
          <span className="sr-only">{t("Upload a photo")}</span>
        </label>
        <input id={id} type="file" accept="image/*" className="sr-only" onChange={e => e.target.files?.[0] && onChange(URL.createObjectURL(e.target.files[0]))} />
      </div>
    </div>
  );
}

function FileDrop({ label, accept, hint, file, onFile }) {
  const { t } = useLang();
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <span className="text-[15px] font-bold text-umber">{label}</span>
      <label
        htmlFor={id}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        className={`flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${file ? "border-gold bg-gold/10" : "border-bark/50 bg-cream hover:border-umber"}`}
      >
        {file ? <Check aria-hidden className="h-7 w-7 text-ochre" /> : <Upload aria-hidden className="h-7 w-7 text-ochre" />}
        <strong className="text-base">{file ? file.name : t("Drop a file here or choose one")}</strong>
        <span className="text-sm text-bark">{hint}</span>
      </label>
      <input id={id} type="file" accept={accept} className="sr-only" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}

/* the two buttons at the bottom of every form, plus the "it worked" message */
function Actions({ onPublish, ready, publishLabel = "Publish", needs = "Fill in the title to publish." }) {
  const { t } = useLang();
  const { live } = useContent();
  const [state, setState] = useState(null); // "draft" | "published" | "saved"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const go = async kind => {
    setError("");
    if (kind === "published") {
      setBusy(true);
      try {
        // LIVE: onPublish saves it in MySQL and answers "saved"
        const result = await onPublish();
        kind = result === "saved" ? "saved" : "published";
      } catch (err) {
        setBusy(false);
        return setError(err.message);
      }
      setBusy(false);
    }
    setState(kind);
    setTimeout(() => setState(null), 4000);
  };
  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => go("published")} disabled={!ready || busy} className="pill-gold min-h-[56px] px-8 text-[17px] disabled:cursor-not-allowed disabled:opacity-50">
          <Send aria-hidden className="h-5 w-5" /> {t(busy ? "Publishing…" : publishLabel)}
        </button>
        {!live && (
          <button type="button" onClick={() => go("draft")} className="pill border border-dune bg-cream min-h-[56px] px-6 text-[17px] font-semibold hover:border-umber">
            {t("Save draft")}
          </button>
        )}
      </div>
      {!ready && <p className="text-sm text-bark">{t(needs)}</p>}
      {error && <p role="alert" className="rounded-xl bg-[#9A3412]/10 px-4 py-3 font-semibold text-[#9A3412]">{t(error)}</p>}
      <AnimatePresence>
        {state && (
          <motion.p role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-xl bg-[#2B6B3F] px-4 py-3 font-semibold text-cream">
            <Check aria-hidden className="h-5 w-5" />
            {state === "saved" ? t("Published! It's on the site now.") : state === "published" ? t("Published! (Demo: nothing is saved yet.)") : t("Draft saved. (Demo: nothing is saved yet.)")}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* form on the left, live preview on the right */
function Editor({ title, intro, form, preview }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h-display text-[clamp(28px,3.4vw,42px)]">{t(title)}</h1>
        {intro && <p className="mt-1 text-lg text-loam">{t(intro)}</p>}
      </div>
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
        <div className="grid grid-cols-1 gap-5 rounded-[22px] bg-bone p-5 shadow-[0_20px_50px_rgba(43,29,23,0.08)] ring-1 ring-dune sm:grid-cols-2 sm:p-7 [&>*]:min-w-0">{form}</div>
        <div className="flex flex-col gap-3 xl:sticky xl:top-6">
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-bark"><Eye aria-hidden className="h-4 w-4" /> {t("How it will look")}</span>
          {/* previews are just pictures of the post: links inside don't navigate */}
          <div className="pointer-events-none select-none">{preview}</div>
        </div>
      </div>
    </div>
  );
}

/* ───────── sections ───────── */

function Overview({ go, recent, pending }) {
  const { t } = useLang();
  const g = greetingFor();
  const content = useContent();
  const [recentComments] = useRecentComments();
  // LIVE: real counts from the database. DEMO: sample numbers.
  const stats = content.live
    ? [
        ["Stories", String(content.stories.length)],
        ["Videos", String(content.videos.length)],
        ["Songs", String(content.tracks.length)],
        ["Song dedications", String(content.dedications.length)],
      ]
    : [
        ["Visits this week", "1,284"],
        ["New comments", "47"],
        ["Song dedications", "6"],
        ["People on the letter", "312"],
      ];
  const quick = SECTIONS.slice(1, 7);
  const toAnswer = content.live
    ? (recentComments || []).slice(0, 3)
    : ALL_STORIES.flatMap(s => (s.thread || []).filter(c => !c.host).map(c => ({ ...c, where: s.title }))).slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-5">
        <img src={HOST.face} alt="" className="h-20 w-20 rounded-full border-2 border-gold object-cover" />
        <div>
          <h1 className="h-display text-[clamp(30px,3.6vw,46px)]">{t(g.key)}, Felipe</h1>
          <p className="text-lg text-loam">{t("What would you like to share today?")}</p>
        </div>
      </div>

      <AnimatePresence>
        {pending > 0 && (
          <motion.button
            type="button"
            onClick={() => go("submissions")}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="group flex w-full items-center gap-4 rounded-2xl bg-gold px-5 py-4 text-left text-umber shadow-[0_14px_30px_rgba(212,160,74,0.35)] transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-umber text-gold"><Inbox aria-hidden className="h-6 w-6" /></span>
            <span className="flex-1">
              <strong className="block text-lg">{pending === 1 ? t("1 submission is waiting for you") : `${pending} ${t("submissions are waiting for you")}`}</strong>
              <span className="text-[15px]">{t("Videos, songs and news your readers sent.")}</span>
            </span>
            <ChevronRight aria-hidden className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </motion.button>
        )}
      </AnimatePresence>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, n]) => (
          <li key={label} className="rounded-2xl bg-bone p-5 ring-1 ring-dune">
            <p className="font-display text-4xl font-semibold text-ochre">{n}</p>
            <p className="mt-1 font-semibold text-loam">{t(label)}</p>
          </li>
        ))}
      </ul>
      {!content.live && <p className="-mt-5 text-sm text-bark">{t("Sample numbers for the demo.")}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">{t("Share something new")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quick.map(s => (
            <li key={s.id}>
              <button type="button" onClick={() => go(s.id)} className="group flex min-h-[76px] w-full items-center gap-4 rounded-2xl bg-umber px-5 text-left text-bone transition-transform hover:-translate-y-0.5">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-gold text-umber"><s.icon aria-hidden className="h-6 w-6" /></span>
                <span className="flex-1 text-lg font-semibold">{t(s.label)}</span>
                <ChevronRight aria-hidden className="h-5 w-5 text-sun transition-transform group-hover:translate-x-1" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-[22px] bg-bone p-5 ring-1 ring-dune sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{t("Waiting for your answer")}</h2>
            <button type="button" onClick={() => go("comments")} className="text-sm font-bold text-ochre hover:underline">{t("See all")}</button>
          </div>
          <ul className="flex flex-col divide-y divide-dune">
            {toAnswer.map((c, i) => (
              <li key={i} className="py-3">
                <p className="text-sm text-bark"><strong className="text-umber">{c.name}</strong> · {t(c.where)}</p>
                <p className="mt-1 font-serif text-lg italic leading-snug">“{t(c.text)}”</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-3 rounded-[22px] bg-bone p-5 ring-1 ring-dune sm:p-6">
          <h2 className="font-display text-2xl font-semibold">{t("Published recently")}</h2>
          {recent.length === 0 ? (
            <p className="text-loam">{t("What you publish here shows up in this list.")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-dune">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gold/20 text-ochre"><Check aria-hidden className="h-4 w-4" /></span>
                  <span className="min-w-0"><strong className="block truncate">{r.title}</strong><span className="text-sm text-bark">{t(r.kind)} · {t("Just now")}</span></span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 w-fit rounded-2xl bg-night p-1.5"><NextEpisode /></div>
        </section>
      </div>
    </div>
  );
}

function ArticleForm({ onPublish }) {
  const { t } = useLang();
  const [kind, setKind] = useState("News with my take");
  const [f, setF] = useState({ category: "Local", title: "", summary: "", source: "", link: "", body: "", take: "", photo: PHOTOS.cathedral });
  const set = k => e => setF(x => ({ ...x, [k]: e?.target ? e.target.value : e }));
  const isNews = kind === "News with my take";
  const preview = {
    title: f.title || t("Your title shows here"),
    category: f.category, ago: "Just now", source: isNews ? f.source || t("Name of the newspaper") : HOST.name,
    take: f.take || t("Your opinion shows here, in your own words."), comments: 0, photo: f.photo, pos: "50% 50%", slug: "preview",
  };
  return (
    <Editor
      title="Write news"
      intro="Share a news story with your opinion, or write an article of your own."
      form={
        <>
          <Field label={t("What are you writing?")}><Choice options={["News with my take", "My own article"]} value={kind} onChange={setKind} label={t("What are you writing?")} /></Field>
          <Field label={t("Topic")}><Choice options={NEWS_FILTERS.filter(x => x !== "All")} value={f.category} onChange={set("category")} label={t("Topic")} /></Field>
          <Field label={t("Title")}><input className={input} value={f.title} onChange={set("title")} placeholder={t("e.g. The night market is back in the Plaza de Armas")} /></Field>
          <Field label={t("Short summary")} hint={t("One or two sentences. It shows under the title.")}><textarea rows={2} className={area} value={f.summary} onChange={set("summary")} /></Field>
          {isNews && (
            <>
              <Field label={t("Newspaper or source")} wide={false}><input className={input} value={f.source} onChange={set("source")} placeholder="El Heraldo de Chihuahua" /></Field>
              <Field label={t("Link to the original story")} wide={false}><input className={input} type="url" value={f.link} onChange={set("link")} placeholder="https://" /></Field>
            </>
          )}
          {!isNews && <Field label={t("Your article")}><textarea rows={7} className={area} value={f.body} onChange={set("body")} placeholder={t("Write here as long as you like…")} /></Field>}
          <Field label={t("Your opinion")} hint={t("This is what readers come for. Write it like you'd say it on the radio.")}>
            <textarea rows={4} className={`${area} border-gold/60 bg-[#FFF8E9] font-serif text-[20px] italic`} value={f.take} onChange={set("take")} placeholder={t("What do you think about this story?")} />
          </Field>
          <div className="sm:col-span-2"><PhotoPicker value={f.photo} onChange={set("photo")} /></div>
          <Actions
            ready={!!f.title.trim()}
            onPublish={() =>
              onPublish({
                kind: "Write news",
                title: f.title,
                save: () => {
                  const body = paragraphs(f.body);
                  const words = [f.summary, f.body, f.take].join(" ").split(/\s+/).length;
                  return writes.addArticle({
                    category: f.category,
                    title: f.title.trim(),
                    summary: f.summary.trim() || f.title.trim(),
                    body: body.length ? body : [f.summary.trim() || f.title.trim()],
                    source: isNews ? f.source.trim() || null : HOST.name,
                    take: f.take.trim() || null,
                    photo: photoForDb(f.photo),
                    read_minutes: Math.max(1, Math.round(words / 200)),
                  });
                },
              })
            }
          />
        </>
      }
      preview={<div className="max-w-[420px]"><StoryCard story={preview} /></div>}
    />
  );
}

function VideoForm({ onPublish }) {
  const { t } = useLang();
  const [f, setF] = useState({ title: "", description: "", note: "", photo: PHOTOS.adobe, file: null });
  const set = k => e => setF(x => ({ ...x, [k]: e?.target ? e.target.value : e }));
  const preview = { slug: "preview", title: f.title || t("Your title shows here"), creator: HOST.name, views: "0 views", length: "0:00", ago: "Just now", isNew: true, photo: f.photo, pos: "50% 50%" };
  return (
    <Editor
      title="Upload video"
      intro="Add a video and a note so people know why you're sharing it."
      form={
        <>
          <FileDrop label={t("Video file")} accept="video/*" hint="MP4 / MOV" file={f.file} onFile={set("file")} />
          <Field label={t("Title")}><input className={input} value={f.title} onChange={set("title")} placeholder={t("e.g. Sunrise over the Sierra")} /></Field>
          <Field label={t("Description")}><textarea rows={3} className={area} value={f.description} onChange={set("description")} /></Field>
          <Field label={t("Your note")}><textarea rows={3} className={`${area} border-gold/60 bg-[#FFF8E9] font-serif text-[20px] italic`} value={f.note} onChange={set("note")} placeholder={t("Why are you sharing this video?")} /></Field>
          <div className="sm:col-span-2"><PhotoPicker value={f.photo} onChange={set("photo")} /></div>
          <Actions
            ready={!!f.title.trim()}
            onPublish={() =>
              onPublish({
                kind: "Upload video",
                title: f.title,
                save: () => writes.addVideo({ title: f.title.trim(), description: f.description.trim() || null, note: f.note.trim() || null, photo: photoForDb(f.photo), from_who: "felipe" }),
              })
            }
          />
        </>
      }
      preview={
        <div className="flex max-w-[460px] flex-col gap-4 rounded-2xl bg-bone p-4">
          <VideoCard video={preview} big />
          {f.note && <p className="rounded-xl bg-umber p-4 font-serif text-lg italic text-cream">“{f.note}”</p>}
        </div>
      }
    />
  );
}

function SongForm({ onPublish }) {
  const { t } = useLang();
  const [f, setF] = useState({ title: "", artist: "", album: "", genre: "Ranchera", photo: PHOTOS.sunset, file: null, lists: [] });
  const set = k => e => setF(x => ({ ...x, [k]: e?.target ? e.target.value : e }));
  const toggle = id => setF(x => ({ ...x, lists: x.lists.includes(id) ? x.lists.filter(l => l !== id) : [...x.lists, id] }));
  return (
    <Editor
      title="Upload song"
      intro="Add a song to the site and to your playlists."
      form={
        <>
          <FileDrop label={t("Song file")} accept="audio/*" hint="MP3 / WAV" file={f.file} onFile={set("file")} />
          <Field label={t("Song title")}><input className={input} value={f.title} onChange={set("title")} placeholder="Viento del norte" /></Field>
          <Field label={t("Artist")} wide={false}><input className={input} value={f.artist} onChange={set("artist")} /></Field>
          <Field label={t("Album")} wide={false}><input className={input} value={f.album} onChange={set("album")} /></Field>
          <Field label={t("Genre")}><Choice options={GENRES.filter(g => g !== "All")} value={f.genre} onChange={set("genre")} label={t("Genre")} /></Field>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[15px] font-bold text-umber">{t("Add to my playlists")}</span>
            <div className="flex flex-wrap gap-2">
              {PLAYLISTS.map(p => (
                <button key={p.id} type="button" aria-pressed={f.lists.includes(p.id)} onClick={() => toggle(p.id)} className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 font-semibold ${f.lists.includes(p.id) ? "border-umber bg-umber text-bone" : "border-dune bg-cream hover:border-umber"}`}>
                  {f.lists.includes(p.id) && <Check aria-hidden className="h-4 w-4 text-gold" />} {t(p.title)}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2"><PhotoPicker value={f.photo} onChange={set("photo")} /></div>
          <Actions
            ready={!!f.title.trim()}
            onPublish={() =>
              onPublish({
                kind: "Upload song",
                title: f.title,
                save: async () =>
                  writes.addSong({
                    title: f.title.trim(),
                    artist: f.artist.trim() || HOST.name,
                    album: f.album.trim() || null,
                    genre: f.genre,
                    length_seconds: (await durationOf(f.file)) || 180,
                    photo: photoForDb(f.photo),
                  }),
              })
            }
          />
        </>
      }
      preview={
        <div className="flex max-w-[460px] items-center gap-4 rounded-2xl bg-umber p-4 text-bone">
          <img src={f.photo} alt="" className="h-20 w-20 rounded-xl object-cover" />
          <div className="flex min-w-0 flex-col">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{t(f.genre)} · {t("New")}</span>
            <strong className="truncate font-display text-2xl">{f.title || t("Song title")}</strong>
            <span className="truncate text-dust">{f.artist || t("Artist")}{f.album && ` · ${f.album}`}</span>
            {f.lists.length > 0 && <span className="mt-1 text-sm text-sun">{f.lists.map(id => t(PLAYLISTS.find(p => p.id === id).title)).join(" · ")}</span>}
          </div>
        </div>
      }
    />
  );
}

function PodcastForm({ onPublish }) {
  const { t } = useLang();
  const { episodes = EPISODES } = useContent();
  const number = (episodes[0]?.number || 0) + 1; // the next episode number
  const [f, setF] = useState({ title: "", guest: "", role: "", summary: "", note: "", photo: PHOTOS.sunset, file: null });
  const [chapters, setChapters] = useState([["0:00", t("Welcome")], ["", ""]]);
  const set = k => e => setF(x => ({ ...x, [k]: e?.target ? e.target.value : e }));
  const setCh = (i, j) => e => setChapters(c => c.map((row, k) => (k === i ? (j === 0 ? [e.target.value, row[1]] : [row[0], e.target.value]) : row)));
  return (
    <Editor
      title="Podcast episode"
      intro="Upload the recording, say who your guest is and mark the chapters."
      form={
        <>
          <FileDrop label={`${t("Episode")} ${number} · ${t("audio or video")}`} accept="audio/*,video/*" hint="MP3 / MP4" file={f.file} onFile={set("file")} />
          <Field label={t("Episode title")}><input className={input} value={f.title} onChange={set("title")} /></Field>
          <Field label={t("Guest")} wide={false}><input className={input} value={f.guest} onChange={set("guest")} /></Field>
          <Field label={t("Who is the guest?")} wide={false}><input className={input} value={f.role} onChange={set("role")} placeholder={t("e.g. Guitar maker in Delicias")} /></Field>
          <Field label={t("What is the episode about?")}><textarea rows={3} className={area} value={f.summary} onChange={set("summary")} /></Field>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <span className="text-[15px] font-bold text-umber">{t("Chapters")}</span>
            {chapters.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input aria-label={t("Time")} className={`${input.replace("w-full", "")} w-[84px] flex-none px-3 font-mono`} value={row[0]} onChange={setCh(i, 0)} placeholder="12:30" />
                <input aria-label={t("Chapter name")} className={`${input} min-w-0`} value={row[1]} onChange={setCh(i, 1)} placeholder={t("Chapter name")} />
                <button type="button" onClick={() => setChapters(c => c.filter((_, k) => k !== i))} aria-label={t("Remove")} className="grid h-12 w-12 flex-none place-items-center rounded-xl border border-dune text-bark hover:border-umber hover:text-umber"><Trash2 aria-hidden className="h-5 w-5" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setChapters(c => [...c, ["", ""]])} className="flex min-h-[44px] w-fit items-center gap-2 rounded-full border border-dashed border-bark/60 px-4 font-semibold text-loam hover:border-umber"><Plus aria-hidden className="h-4 w-4" /> {t("Add chapter")}</button>
          </div>
          <Field label={t("Your note")}><textarea rows={3} className={`${area} border-gold/60 bg-[#FFF8E9] font-serif text-[20px] italic`} value={f.note} onChange={set("note")} /></Field>
          <div className="sm:col-span-2"><PhotoPicker value={f.photo} onChange={set("photo")} /></div>
          <Actions
            ready={!!f.title.trim()}
            onPublish={() =>
              onPublish({
                kind: "Podcast episode",
                title: f.title,
                save: () =>
                  writes.addEpisode({
                    title: f.title.trim(),
                    guest: f.guest.trim() || null,
                    guest_role: f.role.trim() || null,
                    summary: f.summary.trim() || null,
                    note: f.note.trim() || null,
                    chapters: chapters.filter(c => c[0].trim() && c[1].trim()),
                    photo: photoForDb(f.photo),
                  }),
              })
            }
          />
        </>
      }
      preview={
        <div className="flex max-w-[480px] flex-col gap-4 rounded-[20px] bg-night p-5 text-bone">
          <div className="flex gap-4">
            <img src={f.photo} alt="" className="h-24 w-24 flex-none rounded-2xl object-cover" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-sun">Ep. {number} · {t("New")}</span>
              <strong className="font-display text-xl leading-snug text-cream">{f.title || t("Episode title")}</strong>
              <span className="text-sm text-dust">{t("with")} {f.guest || t("Guest")}{f.role && ` · ${f.role}`}</span>
            </div>
          </div>
          {f.summary && <p className="text-[15px] leading-relaxed text-haze">{f.summary}</p>}
          <ol className="flex flex-col border-t border-line pt-3">
            {chapters.filter(c => c[1]).map(([at, label], i) => <li key={i} className="flex gap-3 py-1 text-sm"><span className="w-12 font-mono text-sun">{at}</span>{label}</li>)}
          </ol>
        </div>
      }
    />
  );
}

function VerseForm({ onPublish }) {
  const { t } = useLang();
  const [f, setF] = useState({ reference: "", text: "", reflection: "", when: "Tomorrow morning" });
  const set = k => e => setF(x => ({ ...x, [k]: e?.target ? e.target.value : e }));
  return (
    <Editor
      title="Verse of the day"
      intro="Choose the verse for the morning and, if you like, add a few words of your own."
      form={
        <>
          <Field label={t("Verse")} hint={t("e.g. Salmos 23:1")}><input className={input} value={f.reference} onChange={set("reference")} placeholder="Salmos 23:1" /></Field>
          <Field label={t("Text of the verse")} hint={t("Later this will fill in by itself from the Bible.")}><textarea rows={3} className={`${area} font-serif text-[20px] italic`} value={f.text} onChange={set("text")} placeholder="Jehová es mi pastor; nada me faltará." /></Field>
          <Field label={t("Your reflection")}><textarea rows={4} className={area} value={f.reflection} onChange={set("reflection")} placeholder={t("What does this verse say to you today?")} /></Field>
          <Field label={t("When should it appear?")}><Choice options={["Now", "Tomorrow morning"]} value={f.when} onChange={set("when")} label={t("When should it appear?")} /></Field>
          <Actions ready={!!f.reference.trim()} onPublish={() => onPublish({ kind: "Verse of the day", title: f.reference })} publishLabel={f.when === "Now" ? "Publish" : "Schedule"} needs="Write the verse to publish." />
        </>
      }
      preview={
        <figure className="relative max-w-[480px] overflow-hidden rounded-[18px] p-7 text-center text-bone">
          <img src={PHOTOS.sunset} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-earth/70 to-earth" />
          <div className="relative flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{t(f.when)}</span>
            <blockquote className="font-serif text-2xl font-semibold italic leading-snug text-cream">“{f.text || t("The verse shows here.")}”</blockquote>
            <figcaption className="font-display font-semibold text-sun">— {f.reference || "Salmos 23:1"}</figcaption>
            {f.reflection && <p className="mt-2 rounded-xl bg-night/60 p-3 text-left text-[15px] text-haze">{f.reflection}</p>}
            <span className="font-script text-2xl text-sun">{t("Shared by Felipe")}</span>
          </div>
        </figure>
      }
    />
  );
}

function NoteForm({ onPublish }) {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  return (
    <Editor
      title="Quick note"
      intro="A few words for your desk, like a message to your listeners."
      form={
        <>
          <Field label={t("Your note")}><textarea rows={5} className={`${area} font-serif text-[20px] italic`} value={text} onChange={e => setText(e.target.value)} placeholder={t("Good morning to everyone. Today…")} /></Field>
          <div className="sm:col-span-2"><PhotoPicker value={photo} onChange={setPhoto} /></div>
          {photo && <button type="button" onClick={() => setPhoto(null)} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-bark hover:text-umber"><X aria-hidden className="h-4 w-4" /> {t("No photo")}</button>}
          <Actions
            ready={!!text.trim()}
            onPublish={() => onPublish({ kind: "Quick note", title: text.slice(0, 60), save: () => writes.addDesk({ text: text.trim(), kind: photo ? "photo" : "note", photo: photoForDb(photo) }) })}
            needs="Write your note to publish."
          />
        </>
      }
      preview={
        <div className="flex max-w-[420px] gap-3 rounded-[22px] bg-umber p-5 text-bone">
          <img src={HOST.face} alt="" className="h-10 w-10 flex-none rounded-full border-2 border-gold object-cover" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs text-dust">{t("Wrote a note")} · <span className="font-bold text-sun">{t("Just now")}</span></span>
            <p className="font-serif text-[19px] italic leading-snug text-cream">{text || t("Your note shows here.")}</p>
            {photo && <img src={photo} alt="" className="mt-1 aspect-video w-full rounded-xl object-cover" />}
          </div>
        </div>
      }
    />
  );
}

/* LIVE: the latest comments from readers (comments.php?recent=1), or null while loading */
function useRecentComments() {
  const { live } = useContent();
  const [list, setList] = useState(live ? null : []);
  useEffect(() => {
    if (!live) return;
    writes
      .recentComments()
      .then(rows => setList(rows.map(c => ({ ...c, ago: agoFrom(c.created_at), where: c.item_title, key: c.id }))))
      .catch(() => setList([]));
  }, [live]);
  return [list, setList];
}

function CommentsDesk() {
  const { t } = useLang();
  const { live } = useContent();
  const [liveList, setLiveList] = useRecentComments();
  const sample = useMemo(
    () => [...ALL_STORIES, ...ALL_VIDEOS, ...EPISODES].flatMap(item => (item.thread || []).filter(c => !c.host).map((c, i) => ({ ...c, where: item.title, key: `${item.id}-${i}` }))),
    []
  );
  const all = live ? liveList || [] : sample;
  const [replies, setReplies] = useState({});
  const [drafts, setDrafts] = useState({});
  const [hidden, setHidden] = useState({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  // LIVE: Felipe's answer is a real comment on the same story/video/episode
  const answer = async c => {
    const text = drafts[c.key]?.trim();
    if (!text) return;
    setError("");
    if (live) {
      setBusy(c.key);
      try {
        await writes.comment(c.item_type, c.item_id, text);
      } catch (err) {
        setBusy("");
        return setError(err.message);
      }
      setBusy("");
    }
    setReplies(r => ({ ...r, [c.key]: text }));
  };

  // LIVE: hiding deletes the comment from the site (Felipe can delete any)
  const hide = async c => {
    setError("");
    if (live) {
      try {
        await writes.deleteComment(c.id);
      } catch (err) {
        return setError(err.message);
      }
      return setLiveList(l => l.filter(x => x.id !== c.id));
    }
    setHidden(h => ({ ...h, [c.key]: !h[c.key] }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h-display text-[clamp(28px,3.4vw,42px)]">{t("Comments")}</h1>
        <p className="mt-1 text-lg text-loam">{t(live ? "Answer your readers, or remove a comment that doesn't belong." : "Answer your readers, or hide a comment that doesn't belong.")}</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-[#9A3412]/10 px-4 py-3 font-semibold text-[#9A3412]">{t(error)}</p>}
      {live && liveList === null && <p className="text-loam">{t("One moment…")}</p>}
      {live && liveList?.length === 0 && <p className="text-loam">{t("No comments from readers yet.")}</p>}
      <ul className="flex flex-col gap-4">
        {all.map(c => (
          <li key={c.key} className={`rounded-[20px] bg-bone p-5 ring-1 ring-dune transition-opacity ${hidden[c.key] ? "opacity-50" : ""}`}>
            <p className="text-sm text-bark"><strong className="text-umber">{c.name}</strong> · {t(c.ago)} · {t("on")} <em>{t(c.where)}</em></p>
            <p className="mt-1.5 text-[17px] leading-relaxed">{t(c.text)}</p>
            {replies[c.key] ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-umber p-3 text-bone"><img src={HOST.face} alt="" className="h-7 w-7 rounded-full" /> {replies[c.key]}</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  aria-label={t("Your answer")}
                  value={drafts[c.key] || ""}
                  maxLength={2000}
                  onChange={e => setDrafts(d => ({ ...d, [c.key]: e.target.value }))}
                  placeholder={t("Write your answer…")}
                  className={`${input} min-w-0 flex-[1_1_240px]`}
                />
                <button type="button" disabled={!drafts[c.key]?.trim() || busy === c.key} onClick={() => answer(c)} className="pill-dark min-h-[48px] disabled:opacity-50">
                  <Send aria-hidden className="h-4 w-4" /> {t("Answer")}
                </button>
                <button type="button" onClick={() => hide(c)} className="pill border border-dune min-h-[48px] font-semibold hover:border-umber">
                  {live ? <Trash2 aria-hidden className="h-4 w-4" /> : hidden[c.key] ? <Eye aria-hidden className="h-4 w-4" /> : <EyeOff aria-hidden className="h-4 w-4" />} {t(live ? "Remove" : hidden[c.key] ? "Show" : "Hide")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {!live && <p className="text-sm text-bark">{t("Demo: answers and hidden comments stay on this page only.")}</p>}
    </div>
  );
}

/* ───────── the panel ───────── */

export default function PanelPage() {
  const { t } = useLang();
  const { isFelipe, signOut } = useAuth();
  const [section, setSection] = useState("home");
  const [recent, setRecent] = useState([]);
  const [pending, refreshPending] = usePendingCount();
  const { live, reload } = useContent();

  useEffect(() => {
    document.title = `${t("My panel")} · ${t("Voice of the Desert")}`;
    // keep this page out of search engines
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [t]);

  // only for Felipe: anyone else is sent to the sign-in page
  if (!isFelipe) return <Navigate to={`/cuenta?volver=${encodeURIComponent("/panel")}`} replace />;

  // LIVE: save it in MySQL, then reload the site's content so it shows everywhere.
  // DEMO: only listed under "Published recently".
  const publish = async ({ save, ...item }) => {
    let result;
    if (live && save) {
      await save(); // an error here shows under the Publish button
      await reload();
      result = "saved";
    }
    setRecent(r => [item, ...r].slice(0, 6));
    return result;
  };
  const go = id => {
    setSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const forms = {
    home: <Overview go={go} recent={recent} pending={pending} />,
    article: <ArticleForm onPublish={publish} />,
    video: <VideoForm onPublish={publish} />,
    song: <SongForm onPublish={publish} />,
    podcast: <PodcastForm onPublish={publish} />,
    verse: <VerseForm onPublish={publish} />,
    note: <NoteForm onPublish={publish} />,
    comments: <CommentsDesk />,
    submissions: <ReviewDesk onChange={refreshPending} />,
  };

  return (
    <div className="paper min-h-screen bg-[#EFE6D6] pb-16 pt-[128px] text-umber sm:pt-[140px]">
      <div className="container-x grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] [&>*]:min-w-0">
        {/* panel menu: a column on computers, a scrolling row on phones */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[22px] bg-umber p-3 text-bone shadow-[0_20px_50px_rgba(43,29,23,0.18)]">
            <div className="flex items-center gap-3 px-2 py-2 lg:py-3">
              <img src={HOST.face} alt="" className="h-11 w-11 rounded-full border-2 border-gold object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold leading-tight">{t("My panel")}</p>
                <p className="text-xs text-dust">{HOST.name}</p>
              </div>
            </div>
            <nav aria-label={t("My panel")} className="overflow-x-auto">
              <ul className="flex gap-1 lg:flex-col">
                {SECTIONS.map(s => (
                  <li key={s.id} className="flex-none">
                    <button
                      type="button"
                      onClick={() => go(s.id)}
                      aria-current={section === s.id ? "page" : undefined}
                      className={`flex min-h-[48px] w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 text-left text-[16px] font-semibold transition-colors ${section === s.id ? "bg-gold text-umber" : "text-haze hover:bg-bone/10 hover:text-cream"}`}
                    >
                      <s.icon aria-hidden className="h-5 w-5 flex-none" /> {t(s.label)}
                      {s.id === "submissions" && pending > 0 && (
                        <span aria-label={`${pending} ${t("waiting")}`} className={`ml-auto grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${section === s.id ? "bg-umber text-gold" : "bg-gold text-umber"}`}>{pending}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <button type="button" onClick={signOut} className="mt-2 flex min-h-[44px] w-full items-center gap-2 rounded-xl px-4 text-sm font-semibold text-dust hover:text-gold">
              <LogOut aria-hidden className="h-4 w-4" /> {t("Sign out")}
            </button>
          </div>
        </aside>

        <div>
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {forms[section]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
