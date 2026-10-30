import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { tuneIn } from "./radio.js";

/* Live radio: real stations from Chihuahua and the rest of Mexico.
 *
 * Stations come from Radio Browser (radio-browser.info), a free, open
 * directory of internet radio that apps and websites use. We only list the
 * stations and play their public streams; nothing is stored on our side.
 * One <audio> element lives here for the whole site, so the radio keeps
 * playing while the visitor moves between pages. */

const MIRRORS = ["https://de1.api.radio-browser.info", "https://de2.api.radio-browser.info", "https://fi1.api.radio-browser.info"];

async function api(path) {
  let lastError;
  for (const base of MIRRORS) {
    try {
      const r = await fetch(`${base}${path}`, { headers: { Accept: "application/json" } });
      if (r.ok) return await r.json();
      lastError = new Error(`HTTP ${r.status}`);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

// the site is https, so only streams that can play over https are useful
const secure = u => (u || "").replace(/^http:\/\//, "https://");

function clean(list) {
  const seen = new Set();
  return list
    .filter(s => s.url_resolved && s.lastcheckok !== 0)
    .filter(s => {
      const key = s.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(s => ({
      id: s.stationuuid,
      name: s.name.trim(),
      stream: secure(s.url_resolved),
      httpsNative: s.url_resolved.startsWith("https://"),
      logo: s.favicon ? secure(s.favicon) : "",
      city: s.state || "",
      country: s.country || "México",
      tags: (s.tags || "").split(",").map(t => t.trim()).filter(Boolean).slice(0, 3),
      bitrate: s.bitrate || 0,
      homepage: s.homepage || "",
      votes: s.votes || 0,
    }))
    // streams that already speak https first: they're the ones that play
    .sort((a, b) => Number(b.httpsNative) - Number(a.httpsNative) || b.votes - a.votes);
}

const cache = new Map();
export async function fetchStations(scope, query = "") {
  const key = `${scope}|${query}`;
  if (cache.has(key)) return cache.get(key);
  const q = new URLSearchParams({ countrycode: "MX", hidebroken: "true", order: "votes", reverse: "true", limit: "80" });
  if (scope === "chihuahua") q.set("state", "Chihuahua");
  if (query) q.set("name", query);
  const promise = api(`/json/stations/search?${q}`).then(clean).catch(e => {
    cache.delete(key);
    throw e;
  });
  cache.set(key, promise);
  return promise;
}

/* A made-up but steady spot on the dial (88.1–107.9) for each station,
 * so the needle always goes to the same place for the same station. */
export function dialFor(station) {
  if (!station) return 98.7;
  // if the name says where it is on the dial ("La Caliente 90.9"), use that
  const m = station.name.match(/(?:^|\D)(\d{2,3}[.,]\d)(?!\d)/);
  if (m) {
    const f = parseFloat(m[1].replace(",", "."));
    if (f >= 87.5 && f <= 108) return f;
  }
  let h = 0;
  for (const c of station.name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Math.round((88.1 + (h % 199) / 10) * 10) / 10;
}

const FAV_KEY = "votd-radio-favorites";
const readFavs = () => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
};

const RadioContext = createContext(null);

export function RadioProvider({ children }) {
  const audio = useRef(null);
  const [station, setStation] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | playing | paused | error
  const [volume, setVolumeState] = useState(0.8);
  const [favorites, setFavorites] = useState(readFavs);

  if (!audio.current && typeof Audio !== "undefined") {
    audio.current = new Audio();
    audio.current.preload = "none";
  }

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const on = {
      playing: () => setStatus("playing"),
      waiting: () => setStatus(s => (s === "paused" ? s : "loading")),
      pause: () => setStatus(s => (s === "error" ? s : "paused")),
      error: () => setStatus("error"),
      // a live stream that drops: reconnect once by itself
      ended: () => {
        setStatus("loading");
        a.load();
        a.play().catch(() => setStatus("error"));
      },
    };
    Object.entries(on).forEach(([k, f]) => a.addEventListener(k, f));
    return () => Object.entries(on).forEach(([k, f]) => a.removeEventListener(k, f));
  }, []);

  const play = useCallback(s => {
    const a = audio.current;
    if (!a || !s) return;
    tuneIn();
    setStation(s);
    setStatus("loading");
    a.src = s.stream;
    a.volume = volume;
    a.play().catch(() => setStatus("error"));
  }, [volume]);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!a || !station) return;
    if (status === "playing" || status === "loading") {
      a.pause();
    } else {
      tuneIn();
      setStatus("loading");
      // reconnect to the live stream instead of resuming old audio
      a.src = station.stream;
      a.play().catch(() => setStatus("error"));
    }
  }, [station, status]);

  const stop = useCallback(() => {
    const a = audio.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
    setStation(null);
    setStatus("idle");
  }, []);

  const setVolume = useCallback(v => {
    setVolumeState(v);
    if (audio.current) audio.current.volume = v;
  }, []);

  const toggleFavorite = useCallback(s => {
    setFavorites(list => {
      const next = list.some(f => f.id === s.id) ? list.filter(f => f.id !== s.id) : [...list, s];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ station, status, volume, favorites, play, toggle, stop, setVolume, toggleFavorite, isFavorite: s => favorites.some(f => f.id === s.id) }),
    [station, status, volume, favorites, play, toggle, stop, setVolume, toggleFavorite]
  );
  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export const useRadio = () => useContext(RadioContext);
