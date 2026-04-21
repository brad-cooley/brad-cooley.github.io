import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import MobileNavSheet from "./MobileNavSheet";
import ThemeToggle from "./ThemeToggle";
import styles from "./MobileLayout.module.css";

interface Props {
  index: number;
  onSelect: (next: number) => void;
}

const SCROLL_SPRING = { type: "spring" as const, stiffness: 280, damping: 32, mass: 1 };
const PULL_THRESHOLD = 70;

/**
 * Mobile portrait layout. Native scroll-snap + IntersectionObserver
 * handles section tracking; spring-animated programmatic scroll;
 * pull-down or tap the top handle to reveal section nav.
 */
export default function MobileLayout({ index, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const isProgrammaticRef = useRef(false);

  // Spring-animated programmatic scroll (replaces native smooth).
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const target = index * c.clientHeight;
    if (Math.abs(c.scrollTop - target) < 4) return;
    isProgrammaticRef.current = true;
    const controls = animate(c.scrollTop, target, {
      ...SCROLL_SPRING,
      onUpdate: (v) => {
        c.scrollTop = v;
      },
      onComplete: () => {
        isProgrammaticRef.current = false;
      },
    });
    return () => controls.stop();
  }, [index]);

  // Track active section via IntersectionObserver.
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

  // Pull-to-reveal nav: only fires when at scrollTop=0 and user drags down.
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    let startY = 0;
    let pulling = false;

    const onTouchStart = (e: TouchEvent) => {
      if (c.scrollTop > 4 || menuOpen) return;
      startY = e.touches[0].clientY;
      pulling = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) {
        setPullProgress(0);
        return;
      }
      // Rubber-band: scale down progress so it feels resistant.
      const eased = Math.min(1, dy / (PULL_THRESHOLD * 1.6));
      setPullProgress(eased);
    };
    const onTouchEnd = () => {
      if (!pulling) return;
      pulling = false;
      if (pullProgress >= 0.85) setMenuOpen(true);
      setPullProgress(0);
    };

    c.addEventListener("touchstart", onTouchStart, { passive: true });
    c.addEventListener("touchmove", onTouchMove, { passive: true });
    c.addEventListener("touchend", onTouchEnd, { passive: true });
    c.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      c.removeEventListener("touchstart", onTouchStart);
      c.removeEventListener("touchmove", onTouchMove);
      c.removeEventListener("touchend", onTouchEnd);
      c.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [menuOpen, pullProgress]);

  const current = SECTIONS[index];
  // Handle visual pull state — scales the handle & shifts it down.
  const handleY = pullProgress * 12;
  const handleScale = 1 + pullProgress * 0.15;
  const handleOpacity = 0.55 + pullProgress * 0.45;

  return (
    <>
      {/* Top handle: tap to open, also moves with pull-down gesture */}
      <motion.button
        type="button"
        className={styles.topHandle}
        aria-label={`Open navigation. Current section: ${current?.label ?? ""}`}
        onClick={() => setMenuOpen(true)}
        animate={{ y: handleY, scale: handleScale, opacity: handleOpacity }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <span className={styles.handleGrip} aria-hidden="true" />
        <span className={styles.handleLabel}>
          <span className={styles.handleNum}>{current?.num}</span>
          <span>{current?.label}</span>
        </span>
      </motion.button>

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

      <MobileNavSheet
        open={menuOpen}
        activeIndex={index}
        onSelect={onSelect}
        onClose={() => setMenuOpen(false)}
      />

      <ThemeToggle />
    </>
  );
}
