import { useLang } from "../../lib/i18n.jsx";

/* Small gold "Nuevo" tag for things added in the last day or so.
 * A soft shine passes over it now and then (off for reduced motion). */
export function NewBadge({ className = "" }) {
  const { t } = useLang();
  return (
    <span className={`relative inline-flex items-center overflow-hidden rounded-full bg-gold px-2 py-0.5 align-middle font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-umber ${className}`}>
      {t("New")}
      <span aria-hidden className="absolute inset-y-0 -left-full w-1/2 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden" />
    </span>
  );
}

// "Just now", "45m ago", "5h ago", "1d ago" count as new; older doesn't
export const isFresh = ago => /^(Just now|\d+m ago|\d+h ago|1d ago)$/.test(ago || "");
