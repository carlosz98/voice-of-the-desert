import { motion } from "framer-motion";
import { EASE } from "./Reveal.jsx";

/* The italic accent word in each heading, with a loose hand-drawn squiggle
 * that draws itself underneath when it scrolls into view. */
export function Accent({ className = "", children }) {
  return (
    <span className={`relative inline-block font-display font-normal italic tracking-normal ${className}`} style={{ fontSize: "1.08em" }}>
      {children}
      <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.14em] left-[2%] h-[0.24em] w-[96%] overflow-visible">
        <motion.path
          d="M3 9 C 30 3, 55 12, 82 7 S 140 2, 165 8 S 190 10, 197 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.85 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.6 }}
        />
      </svg>
    </span>
  );
}
