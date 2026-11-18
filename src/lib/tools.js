import { call, LIVE } from "./api.js";
import { PHOTOS, TRACKS } from "./data.js";

/* ============================================================
 *  Felipe's helpers in his panel:
 *    searchNews("gobierno prepararse")   → news headlines from the web
 *    searchMusic("viento del norte")     → song details (name, artist, cover)
 *    videoInfo("https://youtu.be/...")   → a YouTube video's title and picture
 *    writeHelp({ kind, notes, about })   → a draft written from his notes (AI)
 *
 *  LIVE: the PHP asks Google News, iTunes, YouTube and Gemini
 *        (news-search.php, music-search.php, video-info.php, write-help.php).
 *  DEMO: no PHP yet, so each one answers with an example, clearly marked.
 * ============================================================ */

export const TOOLS_LIVE = LIVE;

/* youtube.com/watch?v=ID · youtu.be/ID · /shorts/ID · /embed/ID · /live/ID → "ID" (or null).
 * Same pattern as video-info.php. */
export function youtubeId(link = "") {
  const m = String(link)
    .trim()
    .match(/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/);
  return m ? m[1] : null;
}

const wait = ms => new Promise(r => setTimeout(r, ms));

export async function searchNews(q, lang = "es") {
  if (LIVE) return call("news-search.php", { params: { q, lang } });
  await wait(500);
  // DEMO: example headlines; the link opens the real search on Google News
  const link = `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=es-419&gl=MX&ceid=MX:es-419`;
  const now = Date.now();
  return [
    `${q}: lo que se sabe hasta ahora`,
    `Autoridades hablan sobre ${q}`,
    `Vecinos de Chihuahua reaccionan: ${q}`,
  ].map((title, i) => ({ title, source: "Ejemplo (demo)", link, published: new Date(now - (i + 1) * 3 * 3600e3).toISOString(), image: DEMO_PICS[i], demo: true }));
}

/* "Lo que está pasando hoy": topic = "top" | "world" | "nation" | "chihuahua" | "faith" */
export const TOPICS = [
  { id: "top", label: "Mexico today" },
  { id: "world", label: "The world" },
  { id: "chihuahua", label: "Chihuahua" },
  { id: "faith", label: "Faith" },
];
// DEMO: the site's own photos stand in for the news pictures (the last ones have none, like real news sometimes)
const DEMO_PICS = [PHOTOS.cathedral, PHOTOS.sunset, PHOTOS.adobe, PHOTOS.horses, null, PHOTOS.cactus];
const DEMO_TOPICS = {
  top: ["Lluvias y frío: lo que hay que saber esta semana", "Nuevas medidas para apoyar a pequeños negocios", "Escuelas preparan el regreso después de vacaciones", "Precio de la gasolina: qué cambia este mes", "Selección Mexicana anuncia su lista de jugadores", "Campaña de vacunación de invierno empieza el lunes"],
  world: ["Líderes del mundo se reúnen para hablar del clima", "Ayuda humanitaria llega a zonas afectadas por inundaciones", "Nueva misión espacial despega con éxito", "Acuerdo comercial entre países de América", "Elecciones en Europa: los resultados", "Científicos anuncian avance contra una enfermedad"],
  chihuahua: ["Protección Civil abre refugios por las bajas temperaturas", "Feria en Parral reúne a cientos de familias", "Obras en la carretera a Cuauhtémoc: cuándo terminan", "Agricultores de Delicias celebran buena cosecha", "Juárez: nuevo horario del transporte público", "Tarahumaras reciben cobijas y víveres"],
  faith: ["Parroquias de Chihuahua preparan las posadas", "Mensaje del Papa para las familias", "Iglesias organizan colecta de abrigo para el invierno", "Jóvenes peregrinan a la Catedral", "Coro de niños de Parral canta en la Plaza", "Comunidades de fe ayudan tras las lluvias"],
};
export async function newsTopic(topic, lang = "es") {
  if (LIVE) return call("news-search.php", { params: { topic, lang } });
  await wait(450);
  // DEMO: example headlines; the link opens the real Google News
  const now = Date.now();
  return DEMO_TOPICS[topic].map((title, i) => ({
    title, source: "Ejemplo (demo)", link: "https://news.google.com/?hl=es-419&gl=MX&ceid=MX:es-419", published: new Date(now - (i * 2 + 1) * 3600e3).toISOString(), image: DEMO_PICS[(i + topic.length) % DEMO_PICS.length], demo: true,
  }));
}

export async function searchMusic(q) {
  if (LIVE) return call("music-search.php", { params: { q } });
  await wait(400);
  // DEMO: the site's own sample songs
  const words = q.toLowerCase();
  const found = TRACKS.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(words));
  return (found.length ? found : TRACKS).slice(0, 6).map(s => ({
    title: s.title, artist: s.artist, album: s.album || "", genre: s.genre || "", seconds: s.length || null, artwork: s.photo, link: null, demo: true,
  }));
}

export async function videoInfo(url) {
  if (LIVE) return call("video-info.php", { params: { url } });
  const id = youtubeId(url);
  if (!id) throw new Error("That doesn't look like a YouTube link. Copy it from the Share button on YouTube.");
  // DEMO: the id and picture work without the PHP; the title he types himself
  return { youtube_id: id, video_url: `https://www.youtube.com/watch?v=${id}`, title: "", channel: "", thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, demo: true };
}

/* kind: "news" | "article" | "video" | "episode" | "verse" | "note"
 * about: the news he picked ({ title, source }) or the verse ({ reference, text }) */
export async function writeHelp({ kind, notes, about, lang = "es" }) {
  if (LIVE) return call("write-help.php", { method: "POST", body: { kind, notes, about, lang } });
  await wait(900);
  // DEMO: only tidies his own words (the real helper is Google's Gemini, on cloud day)
  const clean = notes.trim().replace(/\s+/g, " ").replace(/^(escribe|escribir|pon|di) (que )?/i, "");
  const text = clean.charAt(0).toUpperCase() + clean.slice(1) + (/[.!?]$/.test(clean) ? "" : ".");
  const first = text.split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, "");
  const title = about?.title || (first.length > 70 ? `${first.slice(0, 67)}…` : first);
  const drafts = {
    news: { title, summary: first + ".", take: text },
    article: { title, summary: first + ".", body: text },
    video: { title, description: text, note: text },
    episode: { summary: text, note: text },
    verse: { reflection: text },
    note: { text },
  };
  return { ...drafts[kind], demo: true };
}
