import { call, LIVE } from "./api.js";
/* Daily Bible verse.
 * The text comes from the free getBible API (api.getbible.net), which works
 * from the browser: Spanish is the Reina-Valera 1909 ("valera") and English
 * is the King James Version ("kjv"), both in the public domain.
 *
 * Each day of the year gets the next verse in VERSES, so everyone sees the
 * same verse on the same day. To add or change verses, edit the list:
 * book = book number (Genesis 1 … Revelation 66), chapter, and the first and
 * last verse. Later this list can come from Felipe's own picks. */

export const VERSES = [
  { book: 23, chapter: 35, from: 1, to: 1 },   // Isaías 35:1 (the desert shall blossom)
  { book: 19, chapter: 23, from: 1, to: 1 },   // Salmos 23:1
  { book: 19, chapter: 46, from: 1, to: 1 },   // Salmos 46:1
  { book: 19, chapter: 121, from: 1, to: 2 },  // Salmos 121:1-2
  { book: 20, chapter: 3, from: 5, to: 6 },    // Proverbios 3:5-6
  { book: 23, chapter: 40, from: 31, to: 31 }, // Isaías 40:31
  { book: 24, chapter: 29, from: 11, to: 11 }, // Jeremías 29:11
  { book: 25, chapter: 3, from: 22, to: 23 },  // Lamentaciones 3:22-23
  { book: 6, chapter: 1, from: 9, to: 9 },     // Josué 1:9
  { book: 40, chapter: 11, from: 28, to: 28 }, // Mateo 11:28
  { book: 40, chapter: 6, from: 34, to: 34 },  // Mateo 6:34
  { book: 43, chapter: 14, from: 27, to: 27 }, // Juan 14:27
  { book: 43, chapter: 3, from: 16, to: 16 },  // Juan 3:16
  { book: 45, chapter: 8, from: 28, to: 28 },  // Romanos 8:28
  { book: 50, chapter: 4, from: 13, to: 13 },  // Filipenses 4:13
  { book: 50, chapter: 4, from: 6, to: 7 },    // Filipenses 4:6-7
  { book: 19, chapter: 118, from: 24, to: 24 },// Salmos 118:24
  { book: 19, chapter: 37, from: 5, to: 5 },   // Salmos 37:5
  { book: 23, chapter: 41, from: 10, to: 10 }, // Isaías 41:10
  { book: 47, chapter: 5, from: 7, to: 7 },    // 2 Corintios 5:7
  { book: 58, chapter: 11, from: 1, to: 1 },   // Hebreos 11:1
  { book: 46, chapter: 13, from: 4, to: 4 },   // 1 Corintios 13:4
  { book: 48, chapter: 6, from: 9, to: 9 },    // Gálatas 6:9
  { book: 19, chapter: 90, from: 12, to: 12 }, // Salmos 90:12
  { book: 19, chapter: 27, from: 1, to: 1 },   // Salmos 27:1
  { book: 33, chapter: 6, from: 8, to: 8 },    // Miqueas 6:8
  { book: 20, chapter: 16, from: 3, to: 3 },   // Proverbios 16:3
  { book: 59, chapter: 1, from: 17, to: 17 },  // Santiago 1:17
  { book: 60, chapter: 5, from: 7, to: 7 },    // 1 Pedro 5:7
  { book: 19, chapter: 19, from: 1, to: 1 },   // Salmos 19:1
  { book: 19, chapter: 104, from: 24, to: 24 },// Salmos 104:24
];

const TRANSLATION = { es: "valera", en: "kjv" };

// local calendar day number, so the verse changes at the visitor's midnight
export const dayNumber = (date = new Date()) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

export const verseForDay = day => VERSES[((day % VERSES.length) + VERSES.length) % VERSES.length];

// day number → "2026-11-14"
export const isoDay = day => new Date(day * 86400000).toISOString().slice(0, 10);

/* The verse for a day: the one Felipe picked in his panel (verses table),
 * or, if he didn't pick one, the site's own rotation from the Bible API.
 * Returns { text, reference, reflection?, fromFelipe? } */
export async function loadDayVerse(day, lang) {
  if (LIVE) {
    try {
      const v = await call("verses.php", { params: { day: isoDay(day) } });
      return { text: v.text, reference: v.reference, reflection: v.reflection || "", fromFelipe: true };
    } catch {
      // 404 = he didn't pick one for this day: use the rotation below
    }
  }
  return loadVerse(verseForDay(day), lang);
}

// The 1909 text spells the old preposition "á"/"ó"; show it the modern way.
const tidy = (text, lang) => {
  let t = text.replace(/\s+/g, " ").trim();
  if (lang === "es") t = t.replace(/(^|[\s(])á(?=[\s,.;:])/g, "$1a").replace(/(^|[\s(])ó(?=[\s,.;:])/g, "$1o");
  return t;
};

const chapters = new Map(); // one fetch per chapter per page visit

async function getChapter(lang, book, chapter) {
  const key = `${TRANSLATION[lang]}/${book}/${chapter}`;
  if (!chapters.has(key)) {
    chapters.set(
      key,
      fetch(`https://api.getbible.net/v2/${key}.json`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }).catch(err => {
        chapters.delete(key); // let a later try fetch it again
        throw err;
      })
    );
  }
  return chapters.get(key);
}

/* Resolves to { text, reference } in the given language ("es" or "en"). */
export async function loadVerse(v, lang) {
  const data = await getChapter(lang, v.book, v.chapter);
  const picked = data.verses.filter(x => x.verse >= v.from && x.verse <= v.to);
  if (!picked.length) throw new Error("Verse not found");
  const range = v.from === v.to ? `${v.from}` : `${v.from}-${v.to}`;
  return {
    text: tidy(picked.map(x => x.text).join(" "), lang),
    reference: `${data.book_name} ${v.chapter}:${range}`,
  };
}

/* ───────── The reader ("Lee la Biblia") ─────────
 * The whole Bible, 66 books, in the book on /versiculo. Same API and
 * translations as the daily verse. Each book: [Spanish name, English name, chapters].
 * The book number is its place in the list (Génesis = 1 … Apocalipsis = 66). */
export const BOOKS = [
  ["Génesis", "Genesis", 50], ["Éxodo", "Exodus", 40], ["Levítico", "Leviticus", 27], ["Números", "Numbers", 36],
  ["Deuteronomio", "Deuteronomy", 34], ["Josué", "Joshua", 24], ["Jueces", "Judges", 21], ["Rut", "Ruth", 4],
  ["1 Samuel", "1 Samuel", 31], ["2 Samuel", "2 Samuel", 24], ["1 Reyes", "1 Kings", 22], ["2 Reyes", "2 Kings", 25],
  ["1 Crónicas", "1 Chronicles", 29], ["2 Crónicas", "2 Chronicles", 36], ["Esdras", "Ezra", 10], ["Nehemías", "Nehemiah", 13],
  ["Ester", "Esther", 10], ["Job", "Job", 42], ["Salmos", "Psalms", 150], ["Proverbios", "Proverbs", 31],
  ["Eclesiastés", "Ecclesiastes", 12], ["Cantares", "Song of Songs", 8], ["Isaías", "Isaiah", 66], ["Jeremías", "Jeremiah", 52],
  ["Lamentaciones", "Lamentations", 5], ["Ezequiel", "Ezekiel", 48], ["Daniel", "Daniel", 12], ["Oseas", "Hosea", 14],
  ["Joel", "Joel", 3], ["Amós", "Amos", 9], ["Abdías", "Obadiah", 1], ["Jonás", "Jonah", 4],
  ["Miqueas", "Micah", 7], ["Nahúm", "Nahum", 3], ["Habacuc", "Habakkuk", 3], ["Sofonías", "Zephaniah", 3],
  ["Hageo", "Haggai", 2], ["Zacarías", "Zechariah", 14], ["Malaquías", "Malachi", 4],
  ["Mateo", "Matthew", 28], ["Marcos", "Mark", 16], ["Lucas", "Luke", 24], ["Juan", "John", 21],
  ["Hechos", "Acts", 28], ["Romanos", "Romans", 16], ["1 Corintios", "1 Corinthians", 16], ["2 Corintios", "2 Corinthians", 13],
  ["Gálatas", "Galatians", 6], ["Efesios", "Ephesians", 6], ["Filipenses", "Philippians", 4], ["Colosenses", "Colossians", 4],
  ["1 Tesalonicenses", "1 Thessalonians", 5], ["2 Tesalonicenses", "2 Thessalonians", 3], ["1 Timoteo", "1 Timothy", 6],
  ["2 Timoteo", "2 Timothy", 4], ["Tito", "Titus", 3], ["Filemón", "Philemon", 1], ["Hebreos", "Hebrews", 13],
  ["Santiago", "James", 5], ["1 Pedro", "1 Peter", 5], ["2 Pedro", "2 Peter", 3], ["1 Juan", "1 John", 5],
  ["2 Juan", "2 John", 1], ["3 Juan", "3 John", 1], ["Judas", "Jude", 1], ["Apocalipsis", "Revelation", 22],
];
export const OLD_TESTAMENT = 39; // books 1–39; the New Testament is 40–66
export const bookName = (book, lang) => BOOKS[book - 1]?.[lang === "es" ? 0 : 1] || "";
export const chapterCount = book => BOOKS[book - 1]?.[2] || 1;

// a few favorites as quick buttons above the book
export const FAVORITES = [
  { book: 19, chapter: 23 },
  { book: 19, chapter: 91 },
  { book: 19, chapter: 121 },
  { book: 20, chapter: 3 },
  { book: 43, chapter: 14 },
  { book: 46, chapter: 13 },
];

// the chapter after / before this one, across books (null at the ends)
export function nextChapter({ book, chapter }, d = 1) {
  if (d > 0) return chapter < chapterCount(book) ? { book, chapter: chapter + 1 } : book < 66 ? { book: book + 1, chapter: 1 } : null;
  return chapter > 1 ? { book, chapter: chapter - 1 } : book > 1 ? { book: book - 1, chapter: chapterCount(book - 1) } : null;
}

export async function loadChapter(lang, book, chapter) {
  const data = await getChapter(lang, book, chapter);
  return {
    name: `${data.book_name} ${chapter}`,
    verses: data.verses.map(v => ({ n: v.verse, text: tidy(v.text, lang) })),
  };
}

/* Where this visitor is reading. Kept in their own browser only.
 *   { book: 19, chapter: 23, page: 0, done: ["19-23", "43-14"] } */
const KEY = "votd-reading";
const START = { book: 19, chapter: 23, page: 0, done: [] };
// the first version saved ids like "sal-23": turn them into "19-23"
const OLD_IDS = { "sal-23": "19-23", "sal-91": "19-91", "sal-121": "19-121", "pro-3": "20-3", "jn-14": "43-14", "1co-13": "46-13" };
export function readProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (!p) return START;
    const done = (p.done || []).map(id => OLD_IDS[id] || id);
    if (p.book) return { ...START, ...p, done };
    const [book, chapter] = (OLD_IDS[p.id] || "19-23").split("-").map(Number);
    return { book, chapter, page: p.page || 0, done };
  } catch {
    return START;
  }
}
export function writeProgress(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}
