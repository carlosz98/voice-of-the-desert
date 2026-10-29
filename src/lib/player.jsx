import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TRACKS } from "./data.js";
import { tuneIn } from "./radio.js";

/* One music player for the whole page: the hero "Now playing" card,
 * the Listen section and the mini player all read and control it.
 * There's no audio yet (placeholder tracks); the clock just runs so the
 * UI behaves like the real thing. Swap in an <audio> element later. */
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(52);
  const track = TRACKS[index];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setTime(s => {
        if (s + 1 >= track.length) {
          setIndex(i => (i + 1) % TRACKS.length);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, track.length]);

  const select = useCallback(i => {
    tuneIn();
    setIndex(i);
    setTime(0);
    setPlaying(true);
  }, []);
  const next = useCallback(() => select((index + 1) % TRACKS.length), [index, select]);
  const prev = useCallback(() => select((index - 1 + TRACKS.length) % TRACKS.length), [index, select]);
  const toggle = useCallback(() => {
    if (!playing) tuneIn();
    setPlaying(p => !p);
  }, [playing]);

  const value = useMemo(
    () => ({ tracks: TRACKS, index, track, playing, time, progress: time / track.length, select, next, prev, toggle }),
    [index, track, playing, time, select, next, prev, toggle]
  );
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  return useContext(PlayerContext);
}

export function fmt(s) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
