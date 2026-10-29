import { useLang } from "../../lib/i18n.jsx";
import { motion, useScroll, useSpring } from "framer-motion";

// one calm easing for the whole site (UI/UX Pro Max: motion-consistency)
export const EASE = [0.22, 1, 0.36, 1];

/* Fades a block up as it scrolls into view, once. Reduced-motion visitors
 * get it without movement (MotionConfig reducedMotion="user"). */
export function Reveal({ as = "div", delay = 0, y = 18, className, children, ...props }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

/* A heading that slides up from behind an invisible line, like a curtain.
 * The text is always in the DOM, so screen readers and search see it. */
export function CurtainText({ as = "span", delay = 0, className = "", children }) {
  const Comp = as;
  return (
    <Comp className={`block overflow-hidden pb-[0.3em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </Comp>
  );
}

/* A photo that opens like a frame and settles into place. */
export function ImageReveal({ className = "", children, radius = 20, ...props }) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ clipPath: `inset(10% 10% 10% 10% round ${radius}px)` }}
      whileInView={{ clipPath: `inset(0% 0% 0% 0% round ${radius}px)` }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 1.1, ease: EASE }}
      {...props}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const CHAPTER = { "01": "one", "02": "two", "03": "three", "04": "four", "05": "five" };

export function SectionHead({ number, label, children, labelClass = "text-gold", className = "" }) {
  const { t } = useLang();
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Reveal as="span" className={`eyebrow flex items-center gap-2.5 ${labelClass}`}>
        <span aria-hidden>✦</span> {t("Chapter")} {t(CHAPTER[number]) || number} · {t(label)}
      </Reveal>
      <h2 className="h-display text-[clamp(32px,4.4vw,58px)]">
        <CurtainText delay={0.08}>{children}</CurtainText>
      </h2>
    </div>
  );
}

/* Thin gold line along the top that shows how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gold"
      style={{ scaleX }}
    />
  );
}
