import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";

import "@fontsource/fraunces/latin-300.css";
import "@fontsource/fraunces/latin-400.css";
import "@fontsource/fraunces/latin-400-italic.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/fraunces/latin-600-italic.css";
import "@fontsource/caveat/latin-500.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "./index.css";

import App from "./App.jsx";
import { PlayerProvider } from "./lib/player.jsx";
import { LangProvider } from "./lib/i18n.jsx";
import { AuthProvider } from "./lib/auth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* reducedMotion="user": Framer Motion turns off transform animations
        for visitors who ask for less motion (UI/UX Pro Max: reduced-motion) */}
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <AuthProvider>
          <PlayerProvider>
            <App />
          </PlayerProvider>
        </AuthProvider>
      </LangProvider>
    </MotionConfig>
  </React.StrictMode>
);
