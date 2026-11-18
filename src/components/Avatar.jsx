import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bird, Camera, Coffee, Cross, Guitar, Loader2, Moon, Mountain, Sun, Trash2 } from "lucide-react";
import { useLang } from "../lib/i18n.jsx";
import { initials } from "../lib/auth.jsx";
import { HOST } from "../lib/data.js";

/* ============================================================
 *  Profile pictures.
 *
 *  A picture is one short text, saved with the account:
 *    null                       → the person's initials
 *    "preset:sun"               → one of the drawings below
 *    "data:image/webp;base64,…" → their own photo, made small here in the
 *                                 browser (a 192×192 square, about 10 KB)
 *
 *  The PHP checks it again (avatar_value in _db.php): only these drawings
 *  or a real, small image get saved.
 * ============================================================ */

// a little saguaro, drawn by hand (the icon set has no cactus)
function CactusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21V5a2 2 0 0 1 4 0v16" transform="translate(-2 0)" />
      <path d="M6 11V9a1.5 1.5 0 0 1 3 0v4h1" />
      <path d="M18 9v3a2 2 0 0 1-2 2h-2" />
      <path d="M18 9a1.5 1.5 0 0 0-3 0" transform="translate(1.5 0)" />
      <path d="M5 21h14" />
    </svg>
  );
}

// same order and names as AVATAR_PRESETS in server/api/_db.php
export const PRESETS = [
  { id: "cactus", icon: CactusIcon, label: "Cactus", cls: "bg-[#5E7A3A] text-[#F3EEE4]" },
  { id: "sun", icon: Sun, label: "Sun", cls: "bg-gold text-umber" },
  { id: "mountain", icon: Mountain, label: "Mountains", cls: "bg-[#8C5A3C] text-[#F3EEE4]" },
  { id: "guitar", icon: Guitar, label: "Guitar", cls: "bg-[#7A4E0E] text-[#F0C463]" },
  { id: "bird", icon: Bird, label: "Bird", cls: "bg-[#3E6A73] text-[#F3EEE4]" },
  { id: "moon", icon: Moon, label: "Moon", cls: "bg-[#2B1D17] text-[#F0C463]" },
  { id: "coffee", icon: Coffee, label: "Coffee", cls: "bg-[#C8A272] text-umber" },
  { id: "cross", icon: Cross, label: "Cross", cls: "bg-[#E9E0D1] text-[#7A4E0E]" },
];
const presetOf = avatar => (avatar?.startsWith("preset:") ? PRESETS.find(p => p.id === avatar.slice(7)) : null);

/* The round picture, anywhere on the site.
 *   <UserAvatar name="Rosa M." avatar={user.avatar} size={44} />
 *   host = Felipe: always his own photo · onDark = on a dark background */
export function UserAvatar({ name = "", avatar, host = false, size = 40, ring = true, onDark = false, className = "" }) {
  const preset = presetOf(avatar);
  const style = { width: size, height: size };
  const border = ring ? "border-2 border-gold" : "";
  if (host) return <img src={HOST.face} alt="" style={style} className={`flex-none rounded-full object-cover ${border} ${className}`} />;
  if (avatar?.startsWith("data:image/")) {
    return <img src={avatar} alt="" style={style} className={`flex-none rounded-full object-cover ${border} ${className}`} />;
  }
  if (preset) {
    const Icon = preset.icon;
    return (
      <span aria-hidden style={style} className={`grid flex-none place-items-center rounded-full ${preset.cls} ${border} ${className}`}>
        <Icon style={{ width: size * 0.52, height: size * 0.52 }} />
      </span>
    );
  }
  return (
    <span aria-hidden style={{ ...style, fontSize: Math.max(11, size * 0.36) }} className={`grid flex-none place-items-center rounded-full font-display font-semibold ${onDark ? "bg-gold/20 text-gold" : "bg-dune text-loam"} ${border} ${className}`}>
      {initials(name)}
    </span>
  );
}

/* A photo from the computer or the phone's camera → a small square.
 * The middle of the photo is kept (center crop), made 192×192 and saved
 * as WebP (or JPEG on old browsers). Big phone photos (5 MB) end up ~10 KB. */
export async function photoToAvatar(file, size = 192) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Please choose a photo.");
  if (file.size > 15 * 1024 * 1024) throw new Error("That photo is too big. Please choose another one.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That photo can't be opened. Please choose another one."));
      i.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    let data = canvas.toDataURL("image/webp", 0.82);
    if (!data.startsWith("data:image/webp")) data = canvas.toDataURL("image/jpeg", 0.85); // older Safari
    return data;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* The picker: upload a photo / take one, or choose a drawing, or none.
 *   <AvatarPicker name={name} value={avatar} onChange={setAvatar} /> */
export function AvatarPicker({ name, value, onChange, dark = false }) {
  const { t } = useLang();
  const id = useId();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async e => {
    const file = e.target.files?.[0];
    e.target.value = ""; // so the same file can be picked again
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await photoToAvatar(file));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const quiet = dark ? "text-haze" : "text-bark";
  return (
    <fieldset className={`flex flex-col gap-3 ${dark ? "text-bone" : "text-umber"}`}>
      <legend className="mb-2 text-[15px] font-semibold">
        {t("Your picture")} <span className={`font-normal ${quiet}`}>{t("(optional)")}</span>
      </legend>
      <div className="flex flex-wrap items-center gap-4">
        <motion.div key={value || "none"} initial={{ scale: 0.85, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 20 }}>
          <UserAvatar name={name || "?"} avatar={value} size={72} />
        </motion.div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="pill-dark min-h-[48px] px-5 disabled:opacity-60">
            {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Camera aria-hidden className="h-4 w-4" />}
            {t(value?.startsWith("data:") ? "Change photo" : "Add a photo")}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className={`pill min-h-[48px] border px-4 font-semibold ${dark ? "border-line text-haze hover:border-dust" : "border-dune hover:border-umber"}`}>
              <Trash2 aria-hidden className="h-4 w-4" /> {t("No picture")}
            </button>
          )}
        </div>
        <input ref={fileRef} id={`${id}-file`} type="file" accept="image/*" onChange={pick} className="sr-only" tabIndex={-1} aria-hidden />
      </div>
      <p className={`text-sm ${quiet}`}>{t("Or choose a drawing:")}</p>
      <div role="radiogroup" aria-label={t("Choose a drawing")} className="flex flex-wrap gap-2.5">
        {PRESETS.map(p => {
          const on = value === `preset:${p.id}`;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t(p.label)}
              title={t(p.label)}
              onClick={() => onChange(`preset:${p.id}`)}
              className={`rounded-full p-0.5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${on ? "ring-2 ring-umber ring-offset-2 ring-offset-cream" : ""}`}
            >
              <UserAvatar avatar={`preset:${p.id}`} size={44} ring={false} />
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-[#9A3412]">
            {t(error)}
          </motion.p>
        )}
      </AnimatePresence>
    </fieldset>
  );
}
