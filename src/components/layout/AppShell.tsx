import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { useHashSection } from "../../hooks/useHashSection";
import { SECTIONS } from "../../data/sections";
import CustomCursor from "./CustomCursor";
import GrainOverlay from "./GrainOverlay";
import BottomNav from "./BottomNav";
import MobileNavPill from "./MobileNavPill";
import ThemeToggle from "./ThemeToggle";

/**
 * Top-level shell. Both desktop and mobile use vertical scroll
 * powered by Lenis. Sections are rendered in a single column.
 * An IntersectionObserver tracks which section is in view and
 * updates the hash route.
 */
export default function AppShell() {
  const isDesktop = useIsDesktop();
  const { index, goTo } = useHashSection();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticRef = useRef(false);
  const lenis = useLenis();

  // Sync document title with active section.
  useEffect(() => {
    const s = SECTIONS[index];
    if (s) document.title = `Brad Cooley — ${s.label}`;
  }, [index]);

  // Programmatic scroll to section on hash change.
  useEffect(() => {
    const target = sectionRefs.current[index];
    if (!target || !lenis) return;

    const top = target.getBoundingClientRect().top + window.scrollY;
    if (Math.abs(window.scrollY - top) < 4) return;

    isProgrammaticRef.current = true;
    lenis.scrollTo(top, {
      duration: 1.2,
      onComplete: () => {
        isProgrammaticRef.current = false;
      },
    });
  }, [index, lenis]);

  // IntersectionObserver to track which section is centered.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticRef.current) return;
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.intersectionRatio >= 0.5) {
          const i = sectionRefs.current.indexOf(best.target as HTMLDivElement);
          if (i !== -1 && i !== index) goTo(i, { replace: true });
        }
      },
      { threshold: [0.5, 0.75, 1] },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [index, goTo]);

  // Keyboard navigation (number keys jump to section).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= SECTIONS.length) {
        e.preventDefault();
        goTo(num - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  return (
    <>
      {isDesktop && <GrainOverlay />}

      <main>
        {SECTIONS.map((s, i) => {
          const Section = s.Component;
          return (
            <div
              key={s.id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              data-section-id={s.id}
            >
              <Section />
            </div>
          );
        })}
      </main>

      {isDesktop ? (
        <BottomNav activeIndex={index} onSelect={goTo} />
      ) : (
        <MobileNavPill index={index} onSelect={goTo} />
      )}
      <ThemeToggle />
      {isDesktop && <CustomCursor isDragging={false} />}
    </>
  );
}
