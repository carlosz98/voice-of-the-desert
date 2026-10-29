import { useEffect, useState } from "react";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, MapPin, Moon, Snowflake, Sun, Volume2, VolumeX } from "lucide-react";
import { useLang } from "../lib/i18n.jsx";
import { radioSoundOn, setRadioSound } from "../lib/radio.js";

/* Thin bar above the menu: Chihuahua's time and weather on the left;
 * share on WhatsApp, larger text and the radio sound switch on the right.
 * Weather is from Open-Meteo (free, no key). */

const TZ = "America/Chihuahua";
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=28.6353&longitude=-106.0889&current=temperature_2m,weather_code,is_day&timezone=America%2FChihuahua";

function sky(code, isDay) {
  if (code === 0) return isDay ? [Sun, "Clear"] : [Moon, "Clear night"];
  if (code <= 2) return isDay ? [CloudSun, "Partly cloudy"] : [Moon, "Partly cloudy"];
  if (code === 3) return [Cloud, "Cloudy"];
  if (code === 45 || code === 48) return [CloudFog, "Foggy"];
  if (code >= 51 && code <= 57) return [CloudDrizzle, "Drizzle"];
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return [CloudRain, "Rain"];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return [Snowflake, "Snow"];
  if (code >= 95) return [CloudLightning, "Storms"];
  return [Cloud, "Cloudy"];
}

const BIG_KEY = "votd-big-text";
function readBig() {
  try {
    return localStorage.getItem(BIG_KEY) === "on";
  } catch {
    return false;
  }
}

export function whatsappLink(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function WhatsAppGlyph({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

export default function TopStrip() {
  const { t, lang } = useLang();
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState(null);
  const [big, setBig] = useState(readBig);
  const [sound, setSound] = useState(radioSoundOn);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(WEATHER_URL)
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(j => alive && setWeather({ temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, isDay: j.current.is_day === 1 }))
        .catch(() => {});
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("big-text", big);
    try { localStorage.setItem(BIG_KEY, big ? "on" : "off"); } catch {}
  }, [big]);

  const time = now.toLocaleTimeString(lang === "es" ? "es-MX" : "en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
  const [Icon, label] = weather ? sky(weather.code, weather.isDay) : [null, null];
  const shareText = `${t("Voice of the Desert")}: ${t("Videos, music, news and a podcast, all in one place. Press play, or upload your own.")} ${location.origin + location.pathname}`;

  return (
    <div className="border-b border-bone/10 text-[13px] text-haze">
      <div className="container-x flex h-10 items-center gap-3">
        <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap sm:gap-2">
          <MapPin aria-hidden className="h-3.5 w-3.5 flex-none text-gold" />
          <span className="font-semibold text-bone">Chihuahua</span>
          <span aria-hidden className="hidden text-dust sm:inline">·</span>
          <span className="flex-none tabular-nums">{time}</span>
          {weather && (
            <>
              <span aria-hidden className="hidden text-dust sm:inline">·</span>
              {/* the weather never shrinks; the city name gives way first */}
              <span className="inline-flex flex-none items-center gap-1.5" title={t(label)}>
                <Icon aria-hidden className="h-4 w-4 text-sun" />
                <span className="font-semibold tabular-nums text-bone">{weather.temp}°C</span>
                <span className="hidden md:inline">{t(label)}</span>
                <span className="sr-only md:hidden">{t(label)}</span>
              </span>
            </>
          )}
        </span>

        <span className="ml-auto flex flex-none items-center gap-0 sm:gap-1">
          <a
            href={whatsappLink(shareText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 font-semibold sm:px-2.5 text-haze transition-colors hover:text-gold"
          >
            <WhatsAppGlyph /> <span className="hidden sm:inline">{t("Share")}</span>
            <span className="sr-only sm:hidden">{t("Share on WhatsApp")}</span>
          </a>
          <button
            type="button"
            onClick={() => setBig(b => !b)}
            aria-pressed={big}
            title={t("Larger text")}
            className={`inline-flex h-9 items-baseline gap-0.5 rounded-full px-2 pt-1.5 sm:px-2.5 font-display font-semibold transition-colors ${big ? "bg-gold text-umber" : "text-haze hover:text-gold"}`}
          >
            <span className="text-[12px]">A</span>
            <span className="text-[17px] leading-none">A</span>
            <span className="sr-only">{t("Larger text")}</span>
          </button>
          <button
            type="button"
            onClick={() => setSound(s => { setRadioSound(!s); return !s; })}
            aria-pressed={sound}
            title={t("Radio sound when you press play")}
            className="hidden h-9 w-9 place-items-center rounded-full text-haze transition-colors hover:text-gold min-[380px]:grid"
          >
            {sound ? <Volume2 aria-hidden className="h-4 w-4" /> : <VolumeX aria-hidden className="h-4 w-4" />}
            <span className="sr-only">{t("Radio sound when you press play")}</span>
          </button>
        </span>
      </div>
    </div>
  );
}
