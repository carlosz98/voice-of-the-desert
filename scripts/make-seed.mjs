// Turns the site's sample content (src/lib/data.js + media.js) into
// server/database/02_seed.sql, so the database starts with the same
// stories, videos, songs, episodes and comments the demo shows.
//
//   node scripts/make-seed.mjs
//
// It only has to run once (or again if the sample content changes).

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

// data.js uses Vite's import.meta.env, so bundle it with that filled in
const out = join(mkdtempSync(join(tmpdir(), "seed-")), "data.mjs");
await build({
  entryPoints: ["src/lib/data.js"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  define: { "import.meta.env.BASE_URL": '"/voice-of-the-desert/"' },
  logLevel: "silent",
});
const d = await import(out);

// ---------- helpers ----------
const q = v => (v === undefined || v === null || v === "" ? "NULL" : `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`);
const photo = p => (p ? p.replace("/voice-of-the-desert/", "") : null); // "img/sunset.webp"

// "3h ago" → NOW() - INTERVAL 3 HOUR
function when(ago = "") {
  if (/just now/i.test(ago)) return "NOW()";
  if (/yesterday/i.test(ago)) return "NOW() - INTERVAL 1 DAY";
  const m = ago.match(/(\d+)\s*(m|h|d|w|mo)\b/);
  if (!m) return "NOW()";
  const unit = { m: "MINUTE", h: "HOUR", d: "DAY", w: "WEEK", mo: "MONTH" }[m[2]];
  return `NOW() - INTERVAL ${m[1]} ${unit}`;
}
// "18K" / "3.1K views" → 18000 / 3100
function count(s = "0") {
  const m = String(s).match(/([\d.]+)\s*(K|M)?/i);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]) * ({ k: 1e3, m: 1e6 }[(m[2] || "").toLowerCase()] || 1));
}

const lines = [];
const add = s => lines.push(s);
add("-- ============================================================");
add("--  Sample content (the same the demo site shows).");
add("--  Made by scripts/make-seed.mjs. Run AFTER 01_schema.sql.");
add("-- ============================================================");
add("");
add("USE voz_del_desierto;");
add("SET NAMES utf8mb4;");
add("SET time_zone = '+00:00';  -- dates in UTC, same as the API");
add("");

// ---------- Felipe's login ----------
// The hash is made by PHP itself, same as the API will check it.
// the password goes to PHP as a separate argument, never inside the PHP code
const hashOf = password => execFileSync("php", ["-r", "echo password_hash($argv[1], PASSWORD_DEFAULT);", password]).toString();
// Felipe's password is NEVER written in the code or the repo.
// Give it when running the script:  FELIPE_PASSWORD='...' node scripts/make-seed.mjs
// If you don't, a random one is made and shown once on the screen.
const felipePassword = process.env.FELIPE_PASSWORD || randomBytes(18).toString("base64url");
if (!process.env.FELIPE_PASSWORD) console.log(`Felipe's password (save it now, it isn't stored anywhere): ${felipePassword}`);
add("-- Felipe is user 1, with role 'felipe'. His password is not in this file, only its bcrypt hash.");
add("-- A visitor account for testing: rosa@example.com / demo1234");
add("-- (only the hashes are stored; change both before going live)");
add(`INSERT INTO users (id, name, email, password_hash, role, town) VALUES (1, 'Felipe Lerma', 'felipe@example.com', ${q(hashOf(felipePassword))}, 'felipe', 'Chihuahua');`);
add(`INSERT INTO users (id, name, email, password_hash, role, town, avatar) VALUES (2, 'Rosa M.', 'rosa@example.com', ${q(hashOf("demo1234"))}, 'user', 'Chihuahua', 'preset:sun');`);
add("");

// comments are added after their item, using the id MySQL just gave it.
// Felipe's are linked to his account (user 1); the rest are sample names.
function comments(type, thread = []) {
  for (const c of thread) {
    add(`INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('${type}', @item, ${c.host ? 1 : "NULL"}, ${q(c.name)}, ${q(c.text)}, ${c.host ? "TRUE" : "FALSE"}, ${when(c.ago)});`);
  }
}

// ---------- articles ----------
add("-- ---------- articles (+ their comments) ----------");
for (const a of d.ALL_STORIES) {
  add(
    `INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES (` +
      [q(a.slug), q(a.category), q(a.title), q(a.summary), q((a.body || []).join("\n\n")), q(a.source), q(a.take), q(a.longTake), q(photo(a.photo)), q(a.pos),
       parseInt(a.read) || 3, a.id === "lead" ? "TRUE" : "FALSE", when(a.ago)].join(", ") + ");"
  );
  add("SET @item = LAST_INSERT_ID();");
  comments("article", a.thread);
}
add("");

// ---------- videos ----------
add("-- ---------- videos (+ their comments) ----------");
for (const v of d.ALL_VIDEOS) {
  add(
    `INSERT INTO videos (slug, title, from_who, creator, description, note, length, views, photo, photo_pos, published_at) VALUES (` +
      [q(v.slug), q(v.title), q(v.from === "From Felipe" ? "felipe" : "community"), q(v.creator), q(v.description), q(v.note), q(v.length), count(v.views), q(photo(v.photo)), q(v.pos), when(v.ago)].join(", ") + ");"
  );
  add("SET @item = LAST_INSERT_ID();");
  comments("video", v.thread);
}
add("");

// ---------- songs ----------
add("-- ---------- songs ----------");
const songIds = {}; // "t1" → 1, so dedications can point to the right song
d.TRACKS.forEach((t, i) => {
  songIds[t.id] = i + 1;
  add(
    `INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (` +
      [i + 1, q(t.title), q(t.artist), q(t.album), q(t.genre), t.length, count(t.plays), q(photo(t.photo)), q(t.pos), t.isNew ? "NOW() - INTERVAL 1 DAY" : `NOW() - INTERVAL ${10 + i} DAY`].join(", ") + ");"
  );
});
add("");

// ---------- dedications ----------
add("-- ---------- dedications ----------");
for (const x of d.DEDICATIONS) {
  add(`INSERT INTO dedications (name, to_whom, song_id, message, created_at) VALUES (${q(x.name)}, ${q(x.to)}, ${songIds[x.song]}, ${q(x.text)}, ${when(x.ago)});`);
}
add("");

// ---------- episodes ----------
add("-- ---------- podcast episodes (+ their comments) ----------");
for (const e of d.EPISODES) {
  add(
    `INSERT INTO episodes (number, slug, title, guest, guest_role, summary, note, chapters, length, photo, photo_pos, published_at) VALUES (` +
      [e.number, q(e.slug), q(e.title), q(e.guest), q(e.guestRole), q(e.summary), q(e.note), q((e.chapters || []).map(([t, n]) => `${t} ${n}`).join("\n")), q(e.length), q(photo(e.photo)), q(e.pos), when(e.ago)].join(", ") + ");"
  );
  add("SET @item = LAST_INSERT_ID();");
  comments("episode", e.thread);
}
add("");

// ---------- Felipe's desk ----------
add("-- ---------- From Felipe's desk ----------");
for (const n of d.DESK) {
  add(`INSERT INTO desk_notes (kind, text, meta, photo, created_at) VALUES (${q(n.kind)}, ${q(n.text)}, ${q(n.meta)}, ${q(photo(n.photo))}, ${when(n.ago)});`);
}
add("");

// ---------- submissions (from the test account, for Felipe to review) ----------
const { SAMPLE_SUBMISSIONS } = await import("../src/lib/sample-submissions.js");
add("-- ---------- submissions from the Upload page ----------");
for (const s of SAMPLE_SUBMISSIONS) {
  add(
    `INSERT INTO submissions (user_id, kind, title, description, link, file_name, status, felipe_note, created_at, reviewed_at) VALUES (` +
      [s.user_id, q(s.kind), q(s.title), q(s.description), q(s.link), q(s.file_name), q(s.status), q(s.felipe_note), `NOW() - INTERVAL ${s.days_ago} DAY`,
       s.status === "pending" ? "NULL" : `NOW() - INTERVAL ${s.days_ago - 1} DAY`].join(", ") + ");"
  );
}
add("");

writeFileSync("server/database/02_seed.sql", lines.join("\n") + "\n");
console.log(`wrote server/database/02_seed.sql (${lines.length} lines)`);
