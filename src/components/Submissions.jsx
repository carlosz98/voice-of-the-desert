import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, ExternalLink, Inbox, Loader2, Mail, MapPin, Paperclip, Trash2, Undo2, UploadCloud, X } from "lucide-react";
import { submissions } from "../lib/api.js";
import { useLang } from "../lib/i18n.jsx";
import { Link } from "../lib/router.jsx";
import { HOST } from "../lib/data.js";
import { KINDS } from "./Upload.jsx";

/* Submissions from the Upload page:
 *   MySubmissions → on /cuenta, what I've sent and what Felipe said
 *   ReviewDesk    → in Felipe's panel, approve or decline with a note */

const STATUS = {
  pending: { label: "In review", icon: Clock, cls: "bg-dune/60 text-loam" },
  approved: { label: "Approved", icon: Check, cls: "bg-[#3F6212] text-bone" },
  declined: { label: "Not this time", icon: X, cls: "bg-[#9A3412]/10 text-[#9A3412]" },
};

export function StatusBadge({ status }) {
  const { t } = useLang();
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold ${s.cls}`}>
      <s.icon aria-hidden className="h-3.5 w-3.5" /> {t(s.label)}
    </span>
  );
}

// "hace 2 días" / "2 days ago"
export function useWhen() {
  const { lang } = useLang();
  return useCallback(
    iso => {
      if (!iso) return "";
      const rtf = new Intl.RelativeTimeFormat(lang === "es" ? "es-MX" : "en-US", { numeric: "auto" });
      const secs = (new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso.replace(" ", "T")}Z`) - Date.now()) / 1000;
      const steps = [[60, "second"], [60, "minute"], [24, "hour"], [7, "day"], [4.35, "week"], [12, "month"], [Infinity, "year"]];
      let v = secs;
      for (const [size, unit] of steps) {
        if (Math.abs(v) < size) return rtf.format(Math.round(v), unit);
        v /= size;
      }
      return "";
    },
    [lang]
  );
}

function KindIcon({ kind, className = "" }) {
  const k = KINDS.find(x => x.id === kind) || KINDS[0];
  return (
    <span className={`grid h-11 w-11 flex-none place-items-center rounded-xl bg-gold/20 text-ochre ${className}`}>
      <k.icon aria-hidden className="h-5 w-5" />
    </span>
  );
}
const kindLabel = kind => (KINDS.find(x => x.id === kind) || KINDS[0]).label;

function Attachment({ s }) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {s.file_name && (
        <span className="inline-flex min-w-0 items-center gap-1.5 text-loam">
          <Paperclip aria-hidden className="h-4 w-4 flex-none" /> <span className="truncate">{s.file_name}</span>
        </span>
      )}
      {s.link && (
        <a href={s.link} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-rust underline underline-offset-2 hover:text-umber">
          <ExternalLink aria-hidden className="h-4 w-4 flex-none" /> <span className="truncate">{t("Open link")}</span>
        </a>
      )}
    </div>
  );
}

function FelipeNote({ note }) {
  const { t } = useLang();
  return (
    <p className="flex items-start gap-2.5 rounded-xl bg-umber p-3 text-[15px] leading-relaxed text-bone">
      <img src={HOST.face} alt="" className="h-7 w-7 flex-none rounded-full border border-gold object-cover" />
      <span>{t(note)}</span>
    </p>
  );
}

/* ───────── on /cuenta ───────── */

export function MySubmissions() {
  const { t } = useLang();
  const when = useWhen();
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    submissions.mine().then(setList).catch(e => setError(e.message));
  }, []);

  const remove = async s => {
    try {
      await submissions.remove(s.id);
      setList(l => l.filter(x => x.id !== s.id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section id="envios" aria-labelledby="envios-h" className="scroll-mt-28 flex flex-col gap-4 rounded-[22px] border border-dune bg-cream p-6 text-umber sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="envios-h" className="font-display text-[22px] font-semibold text-umber">{t("My submissions")}</h2>
        <Link to="/subir" className="pill-dark min-h-[48px] px-5">
          <UploadCloud aria-hidden className="h-4 w-4" /> {t("Send something")}
        </Link>
      </div>
      {error && <p role="alert" className="font-semibold text-[#9A3412]">{t(error)}</p>}
      {list === null ? (
        <p className="flex items-center gap-2 text-loam"><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> {t("One moment…")}</p>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-dune px-5 py-8 text-center">
          <Inbox aria-hidden className="h-8 w-8 text-ochre" />
          <p className="text-[16px] text-loam">{t("You haven't sent anything yet. A video, a song, a photo or a news tip: Felipe reads everything.")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {list.map(s => (
              <motion.li key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3 rounded-2xl bg-bone p-4 ring-1 ring-dune">
                <div className="flex items-start gap-3">
                  <KindIcon kind={s.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[18px] font-semibold leading-snug">{t(s.title)}</p>
                    <p className="text-sm text-bark">{t(kindLabel(s.kind))} · {t("sent")} {when(s.created_at)}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                {s.description && <p className="text-[15px] leading-relaxed text-loam">{t(s.description)}</p>}
                <Attachment s={s} />
                {s.felipe_note && <FelipeNote note={s.felipe_note} />}
                {s.status === "pending" && (
                  <button type="button" onClick={() => remove(s)} className="inline-flex w-fit min-h-[40px] items-center gap-1.5 text-sm font-semibold text-bark underline underline-offset-4 hover:text-[#9A3412]">
                    <Trash2 aria-hidden className="h-4 w-4" /> {t("Take it back")}
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

/* ───────── in Felipe's panel ───────── */

function ReviewItem({ s, onChange }) {
  const { t } = useLang();
  const when = useWhen();
  const [note, setNote] = useState(s.felipe_note || "");
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState(s.status === "pending");

  const decide = async status => {
    setBusy(status);
    try {
      const updated = await submissions.review(s.id, { status, felipe_note: note });
      onChange(updated);
      setEditing(status === "pending");
    } finally {
      setBusy("");
    }
  };

  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 rounded-[20px] bg-bone p-5 ring-1 ring-dune">
      <div className="flex items-start gap-3">
        <KindIcon kind={s.kind} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[19px] font-semibold leading-snug">{t(s.title)}</p>
          <p className="text-sm text-bark">{t(kindLabel(s.kind))} · {when(s.created_at)}</p>
        </div>
        <StatusBadge status={s.status} />
      </div>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-loam">
        <strong className="text-umber">{s.sender_name}</strong>
        {s.sender_town && <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="h-3.5 w-3.5" /> {s.sender_town}</span>}
        {s.sender_email && (
          <a href={`mailto:${s.sender_email}`} className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-umber">
            <Mail aria-hidden className="h-3.5 w-3.5" /> {s.sender_email}
          </a>
        )}
      </p>
      {s.description && <p className="text-[16px] leading-relaxed">{t(s.description)}</p>}
      <Attachment s={s} />

      {editing ? (
        <div className="flex flex-col gap-3 border-t border-dune pt-3">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("A note for")} {s.sender_name.split(" ")[0]} <span className="font-normal text-bark">{t("(they'll see it in their account)")}</span>
            <textarea rows={2} value={note} maxLength={2000} onChange={e => setNote(e.target.value)} placeholder={t("Thank you! I'll share it this week.")} className="w-full rounded-xl border border-dune bg-cream px-4 py-3 text-[16px] font-normal outline-none focus:border-gold focus:ring-2 focus:ring-gold/40" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!!busy} onClick={() => decide("approved")} className="pill min-h-[48px] bg-[#3F6212] px-5 font-bold text-bone disabled:opacity-60">
              {busy === "approved" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Check aria-hidden className="h-4 w-4" />} {t("Approve")}
            </button>
            <button type="button" disabled={!!busy} onClick={() => decide("declined")} className="pill min-h-[48px] border border-[#9A3412]/40 px-5 font-semibold text-[#9A3412] hover:bg-[#9A3412]/[0.06] disabled:opacity-60">
              {busy === "declined" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <X aria-hidden className="h-4 w-4" />} {t("Not this time")}
            </button>
            {s.status !== "pending" && (
              <button type="button" onClick={() => setEditing(false)} className="pill min-h-[48px] border border-dune px-5 font-semibold hover:border-umber">{t("Cancel")}</button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 border-t border-dune pt-3">
          {s.felipe_note && <FelipeNote note={s.felipe_note} />}
          <button type="button" onClick={() => setEditing(true)} className="inline-flex w-fit min-h-[40px] items-center gap-1.5 text-sm font-semibold text-bark underline underline-offset-4 hover:text-umber">
            <Undo2 aria-hidden className="h-4 w-4" /> {t("Change my answer")}
          </button>
        </div>
      )}
    </motion.li>
  );
}

const FILTERS = [
  ["pending", "In review"],
  ["approved", "Approved"],
  ["declined", "Not this time"],
  ["", "Everything"],
];

export function ReviewDesk({ onChange }) {
  const { t } = useLang();
  const [all, setAll] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    submissions.all().then(setAll).catch(e => setError(e.message));
  }, []);

  const replace = updated => {
    setAll(list => list.map(x => (x.id === updated.id ? updated : x)));
    onChange?.(); // the menu's "waiting" count
  };
  const count = st => (all || []).filter(s => !st || s.status === st).length;
  const shown = (all || []).filter(s => !filter || s.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h-display text-[clamp(28px,3.4vw,42px)]">{t("Submissions")}</h1>
        <p className="mt-1 text-lg text-loam">{t("What people sent you from the Upload page. Approve it to share it, or say why not this time.")}</p>
      </div>
      <div role="tablist" aria-label={t("Submissions")} className="flex flex-wrap gap-2">
        {FILTERS.map(([id, label]) => (
          <button
            key={id || "all"}
            role="tab"
            type="button"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`relative min-h-[44px] rounded-full px-4 text-[15px] font-semibold transition-colors ${filter === id ? "text-bone" : "bg-bone text-loam ring-1 ring-dune hover:text-umber"}`}
          >
            {filter === id && <motion.span layoutId="review-filter" className="absolute inset-0 rounded-full bg-umber" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{t(label)} <span className={filter === id ? "text-gold" : "text-bark"}>{count(id)}</span></span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="font-semibold text-[#9A3412]">{t(error)}</p>}
      {all === null ? (
        <p className="flex items-center gap-2 text-loam"><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> {t("One moment…")}</p>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-dune bg-bone/60 px-5 py-10 text-center">
          <Inbox aria-hidden className="h-8 w-8 text-ochre" />
          <p className="text-[17px] text-loam">{t(filter === "pending" ? "All caught up. Nothing waiting for you." : "Nothing here yet.")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {shown.map(s => <ReviewItem key={s.id} s={s} onChange={replace} />)}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

/* how many are waiting, for the panel menu badge */
export function usePendingCount() {
  const [n, setN] = useState(0);
  const refresh = useCallback(() => submissions.all("pending").then(l => setN(l.length)).catch(() => {}), []);
  useEffect(() => { refresh(); }, [refresh]);
  return [n, refresh];
}
