import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return "light";
}

/**
 * Theme is bootstrapped pre-paint by the inline script in index.html
 * (sets <html data-theme="…">). This hook syncs React state to that
 * attribute and exposes a toggle that uses the View Transitions API
 * for a cross-fade where supported.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore (private mode etc.) */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => setTheme(next);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vt = (
      document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition;

    if (reduced || typeof vt !== "function") {
      apply();
      return;
    }
    vt.call(document, apply);
  }, [theme]);

  return { theme, toggle } as const;
}
