/** Voice of the Desert design tokens
 *  Desert browns and creams, gold accent. Warm, storyteller type:
 *  Fraunces (soft old-style serif for headings and labels), Cormorant Garamond
 *  italic (quotes), Manrope (body), Caveat (Felipe's handwriting).
 *  Contrast checked to WCAG AA for every text/background pair used
 *  (UI/UX Pro Max rule 1: color-contrast).
 *  @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#1C140F",   // podcast night
        earth: "#231A15",   // page ground
        umber: "#2B1D17",   // dark panels, ink on light
        clay: "#3A2A20",    // raised dark surfaces
        line: "#4A372B",    // borders on dark
        bone: "#F3EEE4",    // light sections / text on dark
        cream: "#FBF7EF",   // brightest text
        sand: "#E8D8BC",    // upload band
        dune: "#DCCFBB",    // borders on light
        paper: "#E9E0D1",   // take bubbles on light
        dust: "#C9B9A3",    // muted text on dark
        haze: "#E2D6C3",    // softer text on dark
        bark: "#6B5544",    // muted text on light
        loam: "#4E3C30",    // body text on light
        gold: "#E6B04A",    // primary accent
        sun: "#F0C463",     // accent words on dark
        ochre: "#8A5A12",   // accent text on light
        rust: "#7A4E0E",

        // shadcn / 21st.dev tokens (values in src/index.css)
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: { DEFAULT: "rgb(var(--card) / <alpha-value>)", foreground: "rgb(var(--card-foreground) / <alpha-value>)" },
        primary: { DEFAULT: "rgb(var(--primary) / <alpha-value>)", foreground: "rgb(var(--primary-foreground) / <alpha-value>)" },
        secondary: { DEFAULT: "rgb(var(--secondary) / <alpha-value>)", foreground: "rgb(var(--secondary-foreground) / <alpha-value>)" },
        muted: { DEFAULT: "rgb(var(--muted) / <alpha-value>)", foreground: "rgb(var(--muted-foreground) / <alpha-value>)" },
        accent: { DEFAULT: "rgb(var(--accent) / <alpha-value>)", foreground: "rgb(var(--accent-foreground) / <alpha-value>)" },
        destructive: { DEFAULT: "rgb(var(--destructive) / <alpha-value>)", foreground: "rgb(var(--destructive-foreground) / <alpha-value>)" },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["Fraunces", "Georgia", "serif"], // small labels, set in the serif for a bookish feel
        script: ["Caveat", '"Segoe Print"', "cursive"],
      },
      keyframes: {
        marquee: { to: { transform: "translateX(-50%)" } },
        blow: {
          "0%": { transform: "translateX(-120px)", opacity: "0" },
          "10%": { opacity: ".85" },
          "90%": { opacity: ".85" },
          "100%": { transform: "translateX(110vw) translateY(-40px)", opacity: "0" },
        },
        twinkle: { "0%,100%": { opacity: ".25" }, "50%": { opacity: "1" } },
        ping2: { "0%": { transform: "scale(1)", opacity: ".7" }, "100%": { transform: "scale(2.6)", opacity: "0" } },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "25%": { transform: "translate(-2%,1%)" },
          "50%": { transform: "translate(1%,-2%)" },
          "75%": { transform: "translate(2%,2%)" },
        },
        drift: { to: { transform: "translateX(-50%)" } },
        shine: { "0%,70%": { transform: "translateX(0)" }, "100%": { transform: "translateX(420%)" } },
      },
      animation: {
        marquee: "marquee 50s linear infinite",
        blow: "blow 9s linear infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        ping2: "ping2 1.8s ease-out infinite",
        grain: "grain .6s steps(2) infinite",
        drift: "drift 120s linear infinite",
        shine: "shine 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
