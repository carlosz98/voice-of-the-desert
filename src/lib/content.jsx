import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { call, LIVE } from "./api.js";
import Loading from "../components/Loading.jsx";
import { ALL_STORIES, ARTICLES, DESK, LEAD_STORY, PHOTOS } from "./data.js";
import { ALL_VIDEOS, DEDICATIONS, EPISODES, TRACKS } from "./media.js";

/* ============================================================
 *  content.jsx: where every page gets its content.
 *
 *  DEMO (no VITE_API_URL): the sample content in data.js / media.js,
 *        ready at once, exactly as the site works today.
 *  LIVE: the same lists, read from MySQL through the PHP API.
 *
 *  The database answers with its own column names (photo_pos,
 *  comment_count, published_at...). The "shape" functions below
 *  turn each row into the object the pages already use, so the
 *  pages don't need to know where the data came from.
 * ============================================================ */

/* ---------- small helpers ---------- */

// "2026-11-13 11:46:34" (UTC, from MySQL) → a Date
const toDate = s => (s ? new Date(s.includes("T") ? s : `${s.replace(" ", "T")}Z`) : new Date());

// → "Just now", "15m ago", "3h ago", "2d ago", "1w ago", "2mo ago"
// (the same words the sample data uses, so the Spanish translation works)
export function agoFrom(s) {
  const min = Math.max(0, Math.round((Date.now() - toDate(s)) / 60000));
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.round(d / 7)}w ago`;
  return `${Math.max(1, Math.round(d / 30))}mo ago`;
}

// "Nuevo" badge for anything from the last 3 days
const isRecent = s => Date.now() - toDate(s) < 3 * 864e5;

// 18000 → "18K", 9400 → "9.4K", 640 → "640"
export function shortCount(n = 0) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}K`;
}

// "img/sunset.webp" → "/voice-of-the-desert/img/sunset.webp"; full links stay as they are
const photo = p => (!p ? PHOTOS.sunset : /^https?:\/\//.test(p) ? p : `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`);

/* ---------- shapes: database row → what the pages use ---------- */

export const shapeComment = c => ({
  id: c.id,
  userId: c.user_id,
  name: c.name,
  host: !!c.is_felipe,
  ago: agoFrom(c.created_at),
  text: c.text,
  live: true, // written by a real person: shown exactly as typed, not translated
});

export const shapeStory = r => ({
  id: `a${r.id}`,
  dbId: r.id,
  type: "article",
  slug: r.slug,
  category: r.category,
  ago: agoFrom(r.published_at),
  takeAgo: agoFrom(r.published_at),
  read: `${r.read_minutes || 3} min read`,
  title: r.title,
  summary: r.summary,
  source: r.source,
  take: r.take,
  longTake: r.long_take,
  isLead: !!r.is_lead,
  photo: photo(r.photo),
  pos: r.photo_pos || "50% 50%",
  alt: r.title,
  body: r.body || null, // only on the article page
  comments: r.comment_count ?? (r.comments || []).length,
  thread: (r.comments || []).map(shapeComment),
});

export const shapeVideo = r => ({
  id: `v${r.id}`,
  dbId: r.id,
  type: "video",
  slug: r.slug,
  isNew: isRecent(r.published_at),
  from: r.from_who === "community" ? "From the community" : "From Felipe",
  title: r.title,
  creator: r.creator,
  views: `${shortCount(r.views)} views`,
  length: r.length || "",
  ago: agoFrom(r.published_at),
  photo: photo(r.photo),
  pos: r.photo_pos || "50% 50%",
  description: r.description || "",
  note: r.note || "",
  videoUrl: r.video_url,
  comments: r.comment_count ?? (r.comments || []).length,
  thread: (r.comments || []).map(shapeComment),
});

// song ids become "t1", "t2"... like the sample, so the playlists keep working
export const shapeTrack = r => ({
  id: `t${r.id}`,
  dbId: r.id,
  isNew: isRecent(r.added_at),
  title: r.title,
  artist: r.artist,
  album: r.album || "",
  genre: r.genre,
  length: r.length_seconds,
  plays: shortCount(r.plays),
  photo: photo(r.photo),
  pos: r.photo_pos || "50% 50%",
  audioUrl: r.audio_url,
});

export const shapeEpisode = r => ({
  id: `e${r.number}`,
  dbId: r.id,
  type: "episode",
  number: r.number,
  slug: r.slug,
  isNew: isRecent(r.published_at),
  title: r.title,
  guest: r.guest || "",
  guestRole: r.guest_role || "",
  length: r.length || "",
  ago: agoFrom(r.published_at),
  photo: photo(r.photo),
  pos: r.photo_pos || "50% 50%",
  summary: r.summary || "",
  chapters: r.chapters || [],
  note: r.note || "",
  audioUrl: r.audio_url,
  comments: r.comment_count ?? (r.comments || []).length,
  thread: (r.comments || []).map(shapeComment),
});

export const shapeDesk = r => ({
  id: `d${r.id}`,
  dbId: r.id,
  kind: r.kind,
  ago: agoFrom(r.created_at),
  text: r.text,
  meta: r.meta || undefined,
  photo: r.photo ? photo(r.photo) : undefined,
  live: true,
});

export const shapeDedication = r => ({
  id: r.id,
  name: r.name,
  to: r.to_whom,
  song: `t${r.song_id}`,
  text: r.message || "",
  ago: agoFrom(r.created_at),
  live: true,
});

/* ---------- loading everything ---------- */

// the sample content, ready at once (DEMO mode)
const SAMPLE = {
  ready: true,
  live: false,
  stories: ALL_STORIES,
  lead: LEAD_STORY,
  articles: ARTICLES,
  videos: ALL_VIDEOS,
  tracks: TRACKS,
  episodes: EPISODES,
  desk: DESK,
  dedications: DEDICATIONS,
};

// LIVE: six small requests at the same time
async function loadAll() {
  const [articles, videos, songs, episodes, desk, dedications] = await Promise.all([
    call("articles.php"),
    call("videos.php"),
    call("songs.php"),
    call("episodes.php"),
    call("desk.php"),
    call("dedications.php"),
  ]);
  const stories = articles.map(shapeStory);
  const lead = stories.find(s => s.isLead) || stories[0];
  // songs: oldest first like the sample list (t1, t2, ...)
  const tracks = songs.map(shapeTrack).sort((a, b) => a.dbId - b.dbId);
  return {
    ready: true,
    live: true,
    stories: lead ? [lead, ...stories.filter(s => s !== lead)] : stories,
    lead,
    articles: stories.filter(s => s !== lead),
    videos: videos.map(shapeVideo),
    tracks,
    episodes: episodes.map(shapeEpisode),
    desk: desk.map(shapeDesk),
    dedications: dedications.map(shapeDedication),
  };
}

const ContentContext = createContext(SAMPLE);

export function ContentProvider({ children }) {
  const [state, setState] = useState(LIVE ? { ready: false, live: true } : SAMPLE);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!LIVE) return;
    try {
      setState(await loadAll());
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const value = useMemo(() => {
    const s = state;
    return {
      ...s,
      error,
      reload,
      storyBySlug: slug => (s.stories || []).find(a => a.slug === slug),
      videoBySlug: slug => (s.videos || []).find(v => v.slug === slug),
      episodeBySlug: slug => (s.episodes || []).find(e => e.slug === slug),
    };
  }, [state, error, reload]);

  // LIVE: the site waits for its content (a second or two) before showing,
  // so every page and the music player can count on it being there.
  return <ContentContext.Provider value={value}>{state.ready ? children : <Loading tall />}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);

/* ---------- one full item (with its body and comments) ---------- */

const DETAIL = {
  article: { file: "articles.php", shape: shapeStory, find: "storyBySlug" },
  video: { file: "videos.php", shape: shapeVideo, find: "videoBySlug" },
  episode: { file: "episodes.php", shape: shapeEpisode, find: "episodeBySlug" },
};

/* const { item, loading } = useDetail("article", slug)
 * DEMO: the sample item at once. LIVE: asks PHP for it (body + comments). */
export function useDetail(type, slug) {
  const content = useContent();
  const d = DETAIL[type];
  const sample = !LIVE ? content[d.find](slug) : null;
  const [live, setLive] = useState({ slug: null, item: null, loading: LIVE });

  useEffect(() => {
    if (!LIVE) return;
    let alive = true;
    setLive({ slug, item: null, loading: true });
    call(d.file, { params: { slug } })
      .then(row => alive && setLive({ slug, item: d.shape(row), loading: false }))
      .catch(() => alive && setLive({ slug, item: null, loading: false }));
    return () => { alive = false; };
  }, [type, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!LIVE) return { item: sample, loading: false };
  return live.slug === slug ? { item: live.item, loading: live.loading } : { item: null, loading: true };
}

/* ---------- writes ---------- */

export const writes = {
  // comments (signed in)
  comment: (type, itemId, text) => call("comments.php", { method: "POST", body: { type, id: itemId, text } }).then(shapeComment),
  deleteComment: id => call("comments.php", { method: "DELETE", params: { id } }),
  // anyone
  dedicate: ({ name, to, songId, text }) => call("dedications.php", { method: "POST", body: { name, to_whom: to, song_id: songId, message: text } }).then(shapeDedication),
  message: ({ name, message }) => call("messages.php", { method: "POST", body: { name, message } }),
  play: songDbId => call("songs.php", { method: "POST", params: { id: songDbId, play: 1 } }),
  // Felipe
  addArticle: data => call("articles.php", { method: "POST", body: data }).then(shapeStory),
  addVideo: data => call("videos.php", { method: "POST", body: data }).then(shapeVideo),
  addSong: data => call("songs.php", { method: "POST", body: data }).then(shapeTrack),
  addEpisode: data => call("episodes.php", { method: "POST", body: data }).then(shapeEpisode),
  addDesk: data => call("desk.php", { method: "POST", body: data }).then(shapeDesk),
  recentComments: () => call("comments.php", { params: { recent: 1 } }),
};
