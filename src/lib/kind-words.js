/* ============================================================
 *  kind-words.js: the bad-word filter, in the browser.
 *
 *  The SAME list as the PHP (server/api/_words.json) and the same
 *  steps as kind_text() in _db.php. Here it only gives a quick,
 *  friendly answer before sending. The PHP check is the one that
 *  counts: someone could skip the website, never the server.
 * ============================================================ */
import RAW from "../../server/api/_words.json";

const MAP = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s" };

export function normalize(text) {
  let s = (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // á → a, ñ → n
    .replace(/[013457@$]/g, c => MAP[c]);
  // "p u t a", "p.u.t.a" → "puta" (3 or more single letters in a row)
  s = s.replace(/(?<!\p{L})\p{L}(?:[\s.\-_*·]+\p{L}(?!\p{L})){2,}/gu, m => m.replace(/[^\p{L}]/gu, ""));
  return s;
}

const WORDS = {
  exact: new Set(RAW.exact.map(normalize)),
  prefix: RAW.prefix.map(normalize),
  contains: RAW.contains.map(normalize),
};

export function hasBadWord(text) {
  const s = normalize(text);
  if (WORDS.contains.some(b => b && s.includes(b))) return true;
  for (const word of s.split(/[^\p{L}]+/u).filter(Boolean)) {
    const squeezed = word.replace(/(\p{L})\1+/gu, "$1"); // "puuuuta" → "puta"
    for (const form of [word, squeezed]) {
      if (WORDS.exact.has(form)) return true;
      if (WORDS.prefix.some(p => p && form.startsWith(p))) return true;
      if (WORDS.contains.some(b => b && form.includes(b))) return true;
    }
  }
  return false;
}

// the same message the PHP sends (translated in account-es.js)
export const KIND_MESSAGE = "Please keep it kind: your text has a word we don't allow here. Please change it and try again.";

// kindCheck("text", "name", ...) → the message, or "" if all is fine
export const kindCheck = (...texts) => (texts.some(hasBadWord) ? KIND_MESSAGE : "");
