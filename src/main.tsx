import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ReactLenis } from "lenis/react";

// Self-host fonts (drops Google Fonts CDN dependency)
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/dm-sans/wght-italic.css";
import "@fontsource-variable/jetbrains-mono";

import "lenis/dist/lenis.css";
import "./styles/tokens.css";
import "./styles/global.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
        <App />
      </ReactLenis>
    </HashRouter>
  </StrictMode>,
);
