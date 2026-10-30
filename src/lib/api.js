/* ============================================================
 *  api.js: the ONLY file that talks to the back end.
 *
 *  Every page asks this file for data; no page calls PHP directly.
 *  That way, when we move from PHP + MySQL to Firestore later,
 *  only this file changes.
 *
 *  Two modes:
 *    LIVE: VITE_API_URL is set (e.g. https://voz-api-xxxx.run.app),
 *          so everything goes to the PHP API.
 *    DEMO: no API yet, so accounts are kept in this browser
 *          (localStorage) so the site can be tried today. Same answers,
 *          same error messages as the real API.
 * ============================================================ */

import { SAMPLE_SUBMISSIONS } from "./sample-submissions.js";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const LIVE = Boolean(API_URL);

/* ---------- the signed-in session (both modes) ---------- */
const SESSION_KEY = "votd-session";
export const session = {
  get() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
  },
  set(token, user) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user })); } catch {}
  },
  clear() {
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  },
};

/* An error with the API's message and status (401, 409...) */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/* ---------- LIVE: call a PHP file ---------- */
async function call(file, { method = "GET", body, params } = {}) {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const token = session.get()?.token;
  let res;
  try {
    res = await fetch(`${API_URL}/${file}${qs}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("We couldn't reach the server. Check your internet and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Something went wrong. Please try again.", res.status);
  return data;
}

/* ---------- DEMO: a tiny pretend server in this browser ---------- */
const USERS_KEY = "votd-demo-users";
const wait = (ms = 450) => new Promise(r => setTimeout(r, ms)); // feels like a real request

async function hash(text) {
  // never keep the plain password, even in the demo
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`votd:${text}`));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0;
  for (const c of `votd:${text}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `weak-${h}`;
}

async function demoUsers() {
  let users;
  try { users = JSON.parse(localStorage.getItem(USERS_KEY)); } catch {}
  if (!Array.isArray(users)) {
    // the same two accounts as the database's 02_seed.sql
    users = [
      { id: 1, name: "Felipe Lerma", email: "felipe@example.com", role: "felipe", town: "Chihuahua", hash: await hash("desierto"), created_at: "2026-10-01T12:00:00Z" },
      { id: 2, name: "Rosa M.", email: "rosa@example.com", role: "user", town: "Chihuahua", hash: await hash("demo1234"), created_at: "2026-10-02T12:00:00Z" },
    ];
    saveDemoUsers(users);
  }
  return users;
}
function saveDemoUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role, town: u.town || null, member_since: u.created_at });
const newToken = () => [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

async function demoMe() {
  const s = session.get();
  if (!s) throw new ApiError("Please sign in first.", 401);
  const user = (await demoUsers()).find(u => u.id === s.user?.id);
  if (!user) throw new ApiError("Please sign in first.", 401);
  return user;
}

const demo = {
  async register({ name, email, password, town }) {
    await wait();
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    if (!name) throw new ApiError("Missing: name", 400);
    if (!validEmail(email)) throw new ApiError("That email doesn't look right.", 400);
    if ((password || "").length < 8) throw new ApiError("The password needs at least 8 characters.", 400);
    const users = await demoUsers();
    if (users.some(u => u.email === email)) throw new ApiError("There is already an account with that email. Try signing in.", 409);
    const user = { id: Math.max(...users.map(u => u.id)) + 1, name, email, role: "user", town: (town || "").trim() || null, hash: await hash(password), created_at: new Date().toISOString() };
    saveDemoUsers([...users, user]);
    return { token: newToken(), user: publicUser(user) };
  },
  async login({ email, password }) {
    await wait();
    const user = (await demoUsers()).find(u => u.email === (email || "").trim().toLowerCase());
    if (!user || user.hash !== (await hash(password || ""))) {
      await wait(600);
      throw new ApiError("Wrong email or password", 401);
    }
    return { token: newToken(), user: publicUser(user) };
  },
  async me() {
    return publicUser(await demoMe());
  },
  async logout() {
    return { ok: true };
  },
  async update(changes) {
    await wait();
    const me = await demoMe();
    const users = await demoUsers();
    const u = users.find(x => x.id === me.id);
    if (changes.new_password !== undefined) {
      if (u.hash !== (await hash(changes.current_password || ""))) throw new ApiError("Your current password isn't right.", 401);
      if (changes.new_password.length < 8) throw new ApiError("The new password needs at least 8 characters.", 400);
      u.hash = await hash(changes.new_password);
    }
    if (changes.name !== undefined) {
      const name = changes.name.trim();
      if (!name || name.length > 100) throw new ApiError("Name must be 1 to 100 characters.", 400);
      u.name = name;
    }
    if (changes.town !== undefined) u.town = changes.town.trim() || null;
    saveDemoUsers(users);
    return publicUser(u);
  },
  async remove(password) {
    await wait();
    const me = await demoMe();
    if (me.role === "felipe") throw new ApiError("Felipe's account can't be deleted from the website.", 403);
    if (me.hash !== (await hash(password || ""))) throw new ApiError("That password isn't right.", 401);
    saveDemoUsers((await demoUsers()).filter(u => u.id !== me.id));
    saveDemoSubs(demoSubs().filter(s => s.user_id !== me.id)); // like CASCADE in the database
    return { ok: true };
  },
};

/* ---------- DEMO submissions ---------- */
const SUBS_KEY = "votd-demo-submissions";
const KINDS = ["video", "music", "podcast", "news", "photo"];

function demoSubs() {
  let list;
  try { list = JSON.parse(localStorage.getItem(SUBS_KEY)); } catch {}
  if (!Array.isArray(list)) {
    const day = 864e5;
    list = SAMPLE_SUBMISSIONS.map(({ days_ago, ...s }) => ({
      ...s,
      created_at: new Date(Date.now() - days_ago * day).toISOString(),
      reviewed_at: s.status === "pending" ? null : new Date(Date.now() - (days_ago - 1) * day).toISOString(),
    }));
    saveDemoSubs(list);
  }
  return list;
}
function saveDemoSubs(list) {
  try { localStorage.setItem(SUBS_KEY, JSON.stringify(list)); } catch {}
}
async function withSender(s) {
  const u = (await demoUsers()).find(x => x.id === s.user_id);
  return { ...s, sender_name: u?.name || "?", sender_email: u?.email || "", sender_town: u?.town || null };
}

const demoSubmissions = {
  async mine() {
    await wait(250);
    const me = await demoMe();
    return demoSubs().filter(s => s.user_id === me.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async all(status) {
    await wait(250);
    const me = await demoMe();
    if (me.role !== "felipe") throw new ApiError("Only Felipe can do this.", 403);
    const list = demoSubs().filter(s => !status || s.status === status);
    list.sort((a, b) => (b.status === "pending") - (a.status === "pending") || b.created_at.localeCompare(a.created_at));
    return Promise.all(list.map(withSender));
  },
  async create({ kind, title, description, link, file_name }) {
    await wait(900);
    const me = await demoMe();
    title = (title || "").trim();
    link = (link || "").trim();
    if (!title) throw new ApiError("Missing: title", 400);
    if (!KINDS.includes(kind)) throw new ApiError("Missing: kind", 400);
    if (link && !/^https?:\/\/\S+\.\S+/i.test(link)) throw new ApiError("That link doesn't look right. It should start with https://", 400);
    if (!link && !file_name) throw new ApiError("Add a file or a link.", 400);
    const list = demoSubs();
    const today = list.filter(s => s.user_id === me.id && Date.now() - new Date(s.created_at) < 864e5).length;
    if (today >= 10) throw new ApiError("You've sent 10 today. Please try again tomorrow.", 429);
    const s = {
      id: Math.max(0, ...list.map(x => x.id)) + 1,
      user_id: me.id,
      kind,
      title,
      description: (description || "").trim() || null,
      link: link || null,
      file_name: file_name || null,
      status: "pending",
      felipe_note: null,
      created_at: new Date().toISOString(),
      reviewed_at: null,
    };
    saveDemoSubs([s, ...list]);
    return withSender(s);
  },
  async review(id, { status, felipe_note }) {
    await wait(400);
    const me = await demoMe();
    if (me.role !== "felipe") throw new ApiError("Only Felipe can do this.", 403);
    const list = demoSubs();
    const s = list.find(x => x.id === id);
    if (!s) throw new ApiError("Submission not found", 404);
    if (status) s.status = status;
    if (felipe_note !== undefined) s.felipe_note = felipe_note.trim() || null;
    s.reviewed_at = s.status === "pending" ? null : new Date().toISOString();
    saveDemoSubs(list);
    return withSender(s);
  },
  async remove(id) {
    await wait(300);
    const me = await demoMe();
    const list = demoSubs();
    const s = list.find(x => x.id === id);
    if (!s) throw new ApiError("Submission not found", 404);
    if (me.role !== "felipe") {
      if (s.user_id !== me.id) throw new ApiError("You can only remove your own submissions.", 403);
      if (s.status !== "pending") throw new ApiError("Felipe already reviewed this one, so it can't be removed.", 409);
    }
    saveDemoSubs(list.filter(x => x.id !== id));
    return { ok: true };
  },
};

/* ---------- submissions: what the pages use ---------- */
export const submissions = LIVE
  ? {
      mine: () => call("submissions.php"),
      all: status => call("submissions.php", { params: status ? { all: 1, status } : { all: 1 } }),
      create: data => call("submissions.php", { method: "POST", body: data }),
      review: (id, changes) => call("submissions.php", { method: "PUT", params: { id }, body: changes }),
      remove: id => call("submissions.php", { method: "DELETE", params: { id } }),
    }
  : demoSubmissions;

/* ---------- accounts: what the pages use ---------- */
export const accounts = LIVE
  ? {
      register: data => call("register.php", { method: "POST", body: data }),
      login: data => call("login.php", { method: "POST", body: data }),
      me: () => call("account.php"),
      logout: () => call("login.php", { method: "DELETE" }),
      update: changes => call("account.php", { method: "PUT", body: changes }),
      remove: password => call("account.php", { method: "DELETE", body: { password } }),
    }
  : demo;
