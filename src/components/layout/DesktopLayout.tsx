import { useEffect, useRef } from "react";
import { SECTIONS } from "../../data/sections";
import { useLenis } from "../../context/LenisContext";
import BottomNav from "./BottomNav";
import ThemeToggle from "./ThemeToggle";
import ScrollProgressBar from "./ScrollProgressBar";
import { SectionIndexContext } from "./SliderMotionContext";
import styles from "./DesktopLayout.module.css";

interface Props {
  index: number;
  onSelect: (next: number) => void;
}

/**
 * Desktop layout: Lenis-powered vertical smooth scroll.
 * Sections are full-viewport panels stacked in the document flow.
 * Bottom nav and keyboard shortcuts call lenis.scrollTo() for navigation.
 */
export default function DesktopLayout({ index, onSelect }: Props) {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { lenisRef } = useLenis();
  const indexRef = useRef(index);
  indexRef.current = index;

  // fromObserverRef: true when the current index change was caused by the
  // IntersectionObserver (user scrolled). Prevents the scroll effect from
  // re-scrolling to the section the user just naturally scrolled to.
  const fromObserverRef = useRef(false);

  // isProgrammaticRef: true while a lenis.scrollTo animation is in flight.
  // Blocks IntersectionObserver from firing during programmatic scrolls.
  const isProgrammaticRef = useRef(false);

  // Programmatic scroll when index changes via nav click or keyboard.
  useEffect(() => {
    if (fromObserverRef.current) {
      fromObserverRef.current = false;
      return;
    }
    const target = sectionRefs.current[index];
    if (!target || !lenisRef.current) return;
    isProgrammaticRef.current = true;
    lenisRef.current.scrollTo(target.offsetTop, { duration: 0.8 });
    const t = window.setTimeout(() => {
      isProgrammaticRef.current = false;
    }, 1000);
    return () => window.clearTimeout(t);
  }, [index, lenisRef]);

  // Initial deep-link scroll: waits for Lenis to initialize (parent useEffect
  // runs after children in React, so lenisRef.current may be null on first run).
  useEffect(() => {
    if (index === 0) return;
    const tryScroll = () => {
      if (!lenisRef.current) {
        requestAnimationFrame(tryScroll);
        return;
      }
      const target = sectionRefs.current[index];
      if (target) {
        lenisRef.current.scrollTo(target.offsetTop, { immediate: true });
      }
    };
    requestAnimationFrame(tryScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver: tracks which section the user has scrolled to.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticRef.current) return;
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.intersectionRatio >= 0.55) {
          const i = sectionRefs.current.indexOf(best.target as HTMLDivElement);
          if (i !== -1 && i !== indexRef.current) {
            fromObserverRef.current = true;
            onSelect(i);
          }
        }
      },
      { threshold: [0.55, 0.75, 1] },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [onSelect]);

  // Keyboard navigation: arrow keys and number keys (1-5).
  useEffect(() => {
    const total = SECTIONS.length;
    const onKey = (e: KeyboardEvent) => {
      const i = indexRef.current;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (i > 0) onSelect(i - 1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        if (i < total - 1) onSelect(i + 1);
      } else {
        const num = Number(e.key);
        if (Number.isInteger(num) && num >= 1 && num <= total) {
          e.preventDefault();
          onSelect(num - 1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.layout}>
      {SECTIONS.map((s, i) => {
        const Section = s.Component;
        return (
          <SectionIndexContext.Provider key={s.id} value={i}>
            <div
              ref={(el) => (sectionRefs.current[i] = el)}
              data-section-index={i}
            >
              <Section />
            </div>
          </SectionIndexContext.Provider>
        );
      })}
      <BottomNav activeIndex={index} onSelect={onSelect} />
      <ThemeToggle />
      <ScrollProgressBar />
    </div>
  );
}
