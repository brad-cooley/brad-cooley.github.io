# brad.cooley.dev

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Personal portfolio site, deployed at **[brad.cooley.dev](https://brad.cooley.dev)**.

Built with **Vite + React 18 + TypeScript**, animated with **Framer Motion**,
and managed with **[Bun](https://bun.sh)**.

## Stack

- **Vite 5** — dev server & production bundler
- **React 18** + **TypeScript**
- **React Router 6** (`HashRouter` for static GitHub Pages hosting)
- **Framer Motion** — drag, layout animations, view transitions
- **CSS Modules** + a single `tokens.css` for design tokens
- Self-hosted fonts via **`@fontsource`** (Syne, DM Sans, JetBrains Mono)

## Project layout

```
src/
├── App.tsx                    # Routes
├── main.tsx                   # Entry, font + style imports
├── data/sections.ts           # Single source of truth for sections
├── hooks/                     # useTheme, useHashSection, useMediaQuery, …
├── styles/                    # tokens.css + global.css
└── components/
    ├── layout/                # AppShell, Desktop/MobileLayout, Cursor, …
    ├── sections/              # HomeSection, AboutSection, …
    └── particle-portrait/     # Canvas particle effect + React wrapper
```

## Scripts

```bash
bun install          # Install dependencies
bun run dev          # Vite dev server (http://localhost:5173)
bun run build        # Type-check + production build → dist/
bun run preview      # Preview the production build
bun run lint         # ESLint
bun run format       # Prettier
```

## Deployment

`main` → **GitHub Pages** via `.github/workflows/deploy.yml` (Bun + Vite build,
uploaded as a Pages artifact). The custom domain is preserved by `public/CNAME`.

In repository **Settings → Pages**, the source must be set to **GitHub Actions**.

## License

[MIT](./LICENSE).
