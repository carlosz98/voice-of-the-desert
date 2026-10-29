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
