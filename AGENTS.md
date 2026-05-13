# AGENTS.md

## What this is

Personal portfolio site (brad.cooley.dev) built with React + TypeScript + Vite, served via GitHub Pages.

## Repo layout

- `index.html` — Vite entry point (includes inline theme-flash-prevention script)
- `src/main.tsx` — React entry
- `src/App.tsx` — Root component: imports CSS, provides NavigationProvider, renders cursor/grain/theme toggle + desktop & mobile layouts
- `src/components/DesktopLayout.tsx` — Desktop horizontal-scroll sections with bottom nav
- `src/components/MobileLayout.tsx` — Mobile vertical-scroll sections with dot nav + slide-out menu
- `src/components/ParticlePortrait.tsx` — Canvas particle headshot effect (desktop About section)
- `src/hooks/useNavigation.tsx` — Navigation context: section state, wheel/drag/keyboard/touch handlers
- `src/hooks/useTheme.ts` — Theme toggle with View Transitions API fallback
- `src/hooks/useCustomCursor.ts` — Fine-pointer custom cursor tracking + hover states
- `src/css/` — `base.css` (variables, shared), `desktop.css`, `mobile-portrait.css` (ported verbatim from original static site)
- `src/assets/img/headshot.png` — Source image for particle portrait
- `CNAME` — Custom domain `brad.cooley.dev`

## Commands

```
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Key gotchas

- **Dual layout architecture.** Desktop (`.desktop-layout`) and mobile portrait (`.mobile-portrait-layout`) are completely separate React component trees. Content changes must be made in both `DesktopLayout.tsx` and `MobileLayout.tsx`.
- **CSS is plain files, not modules.** The three CSS files use global class names matching the original static site. They are imported in `App.tsx`.
- **Theme is set before React hydrates.** An inline `<script>` in `index.html` reads `localStorage` and sets `data-theme` on `<html>` to prevent flash. The React `useTheme` hook toggles the same attribute.
- **Navigation is imperative.** `useNavigation` manipulates DOM directly (transforms, classList, scrollTo) via refs for performance parity with the original vanilla JS.
- **GitHub Pages deploys from `main`.** The `CNAME` file must stay in the repo root.

## Deployment

Push to `main`. GitHub Pages needs to be configured to serve from `dist/` (via GitHub Actions) or the build output needs to be committed.
