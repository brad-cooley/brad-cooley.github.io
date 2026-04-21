import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SECTION_IDS } from "../data/sections";

/**
 * Maps the current hash route (#/home, #/about, …) to a numeric section
 * index, and exposes a setter that pushes a new hash route.
 *
 * `goTo` keeps a stable identity across renders by reading the live
 * pathname from a ref — so listeners that capture it once (wheel,
 * keyboard) always see the latest value.
 */
export function useHashSection() {
  const location = useLocation();
  const navigate = useNavigate();

  // Strip leading slash from pathname under HashRouter.
  const id = location.pathname.replace(/^\//, "") || SECTION_IDS[0];
  const fromIndex = SECTION_IDS.indexOf(id);
  const index = fromIndex === -1 ? 0 : fromIndex;

  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  const goTo = useCallback(
    (next: number, opts: { replace?: boolean } = {}) => {
      if (next < 0 || next >= SECTION_IDS.length) return;
      const target = "/" + SECTION_IDS[next];
      if (target === pathnameRef.current) return;
      navigate(target, { replace: opts.replace });
    },
    [navigate],
  );

  // Default to /home if a bogus or empty path is loaded.
  useEffect(() => {
    if (fromIndex === -1) {
      navigate("/" + SECTION_IDS[0], { replace: true });
    }
  }, [fromIndex, navigate]);

  return { index, goTo, total: SECTION_IDS.length } as const;
}
