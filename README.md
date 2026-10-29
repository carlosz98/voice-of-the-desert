# La Voz del Desierto · Voice of the Desert

**Demo** media site for Felipe Lerma (Chihuahua, México): videos, music, news with his commentary, and a podcast. Opens in Spanish, with an EN/ES switch.

> This is a demo. Stories, papers, comments and tracks are samples; nothing is uploaded or sent anywhere yet.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build in dist/
npm run typecheck
```

## Where things live

| What | File |
|---|---|
| All content (slides, videos, tracks, episodes, articles, Felipe's posts, bio) | `src/lib/data.js` |
| Spanish translations (keyed by the English text) | `src/lib/i18n.jsx` |
| Sections | `src/components/` (Hero, Watch, Listen, Host, Podcast, News, Upload, Footer) |
| Colors and fonts | `tailwind.config.js`, `src/index.css` |
| Photos and cut-out masks | `public/img/` |

Placeholders in `[brackets]` still need Felipe's real text (welcome line, track and episode names).

## Stack

Vite 5 · React 18 · Tailwind 3 · Framer Motion · lucide-react · 21st.dev newsletter ticket · Fraunces / Manrope / Cormorant Garamond / Caveat fonts.

---

Website designed & built by [Carlos Zabala](https://carlosz98.github.io/MyPortFolio/).
