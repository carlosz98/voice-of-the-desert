import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { useLang } from "../lib/i18n.jsx";

/* "Next episode" countdown. New episodes come out every Friday at
 * 7:00 p.m. Chihuahua time (UTC-6, no daylight saving), which is
 * Saturday 01:00 UTC. Change RELEASE to move the schedule. */
const RELEASE = { utcDay: 6, utcHour: 1 }; // Saturday 01:00 UTC = Friday 7 p.m. in Chihuahua

function nextRelease(now = new Date()) {
  const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), RELEASE.utcHour));
  t.setUTCDate(t.getUTCDate() + ((RELEASE.utcDay - t.getUTCDay() + 7) % 7));
  if (t <= now) t.setUTCDate(t.getUTCDate() + 7);
  return t;
}

export default function NextEpisode() {
  const { t, lang } = useLang();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const target = nextRelease(now);
  const mins = Math.max(0, Math.round((target - now) / 60000));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const es = lang === "es";

  // the visitor's own time for the release, so it's right wherever they are
  const when = target.toLocaleString(es ? "es-MX" : "en-US", { weekday: "long", hour: "numeric", minute: "2-digit" });
  const left =
    days >= 2 ? (es ? `faltan ${days} días` : `${days} days to go`)
    : days === 1 ? (es ? `falta 1 día y ${hours} h` : `1 day and ${hours} h to go`)
    : hours >= 1 ? (es ? `faltan ${hours} h` : `${hours} h to go`)
    : (es ? `en ${mins} min` : `in ${mins} min`);

  // little dial: how much of the week has passed since the last release
  const week = 7 * 24 * 60;
  const done = 1 - mins / week;

  return (
    <div className="flex w-fit items-center gap-3.5 rounded-2xl border border-[#F3E2C2]/20 bg-[#F3E2C2]/[0.06] py-2.5 pl-2.5 pr-5">
      <span className="relative grid h-12 w-12 flex-none place-items-center">
        <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
          <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(243,226,194,0.15)" strokeWidth="3" />
          <circle cx="24" cy="24" r="21" fill="none" stroke="#E6B04A" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${done * 132} 132`} />
        </svg>
        <CalendarClock aria-hidden className="h-5 w-5 text-sun" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-sun">{t("Next episode")}</span>
        <span className="text-[15px] text-bone">
          <span className="capitalize">{when}</span> · <strong className="text-cream">{left}</strong>
        </span>
      </span>
    </div>
  );
}
