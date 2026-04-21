import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import MobileNavSheet from "./MobileNavSheet";
import ThemeToggle from "./ThemeToggle";
import styles from "./MobileLayout.module.css";

interface Props {
  index: number;
  onSelect: (next: number) => void;
}

// Shared spring across pill <-> sheet morph.
const MORPH_SPRING = { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.8 };

/**
 * Mobile portrait layout. Native CSS scroll-snap drives section
 * snapping. The top pill morphs (via Framer Motion `layoutId`) into
 * the nav sheet — Motion animates the bounding box transition while
 * CSS handles the glass surface.
 */
export default function MobileLayout({ index, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const isProgrammaticRef = useRef(false);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const target = index * c.clientHeight;
    if (Math.abs(c.scrollTop - target) < 4) return;
    isProgrammaticRef.current = true;
    c.scrollTo({ top: target, behavior: "smooth" });
    const t = window.setTimeout(() => {
      isProgrammaticRef.current = false;
    }, 600);
    return () => window.clearTimeout(t);
  }, [index]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticRef.current) return;
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.intersectionRatio >= 0.55) {
          const i = sectionRefs.current.indexOf(best.target as HTMLDivElement);
          if (i !== -1 && i !== index) onSelect(i);
        }
      },
      { root: c, threshold: [0.55, 0.75, 1] },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [index, onSelect]);

  const current = SECTIONS[index];

  return (
    <>
      <div ref={containerRef} className={styles.layout}>
        {SECTIONS.map((s, i) => {
          const Section = s.Component;
          return (
            <div key={s.id} ref={(el) => (sectionRefs.current[i] = el)} data-section-index={i}>
              <Section />
            </div>
          );
        })}
      </div>

      {/* Pill <-> sheet morph. Pill hides while sheet is open so the
          shared `layoutId` can animate between their bounding boxes. */}
      <div className={styles.pillWrap}>
        <AnimatePresence>
          {!menuOpen && (
            <motion.button
              key="nav-pill"
              type="button"
              layoutId="navSurface"
              className={styles.pill}
              aria-label={`Open navigation. Current section: ${current?.label ?? ""}`}
              onClick={() => setMenuOpen(true)}
              transition={MORPH_SPRING}
              whileTap={{ scale: 0.96 }}
            >
              <span className={styles.pillGrip} aria-hidden="true" />
              <span className={styles.pillLabel}>
                <span className={styles.pillNum}>{current?.num}</span>
                <span>{current?.label}</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <MobileNavSheet
        open={menuOpen}
        activeIndex={index}
        onSelect={onSelect}
        onClose={() => setMenuOpen(false)}
        morphSpring={MORPH_SPRING}
      />

      <ThemeToggle />
    </>
  );
}
