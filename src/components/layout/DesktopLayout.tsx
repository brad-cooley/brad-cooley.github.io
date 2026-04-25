import { useCallback, useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { SECTIONS } from "../../data/sections";
import BottomNav from "./BottomNav";
import ThemeToggle from "./ThemeToggle";
import { ScrollOrientationContext } from "./ScrollOrientationContext";
import styles from "./DesktopLayout.module.css";

interface Props {
  index: number;
  onSelect: (next: number) => void;
  onDragChange?: (dragging: boolean) => void;
}

/**
 * Desktop horizontal layout powered by Lenis.
 * Lenis handles smooth inertial scrolling; `gestureOrientation: 'vertical'`
 * maps vertical wheel/trackpad to horizontal scroll.
 */
export default function DesktopLayout({ index, onSelect }: Props) {
  return (
    <ReactLenis
      className={styles.layout}
      options={{
        orientation: "horizontal",
        gestureOrientation: "vertical",
        lerp: 0.1,
        duration: 1.2,
      }}
    >
      <ScrollOrientationContext.Provider value="horizontal">
        <DesktopLayoutInner index={index} onSelect={onSelect} />
      </ScrollOrientationContext.Provider>
    </ReactLenis>
  );
}

function DesktopLayoutInner({
  index,
  onSelect,
}: {
  index: number;
  onSelect: (next: number) => void;
}) {
  const lenis = useLenis();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticRef = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  // Programmatic scroll to section.
  useEffect(() => {
    const target = sectionRefs.current[index];
    if (!target || !lenis) return;
    const left = target.offsetLeft;
    if (Math.abs(lenis.scroll - left) < 4) return;

    isProgrammaticRef.current = true;
    lenis.scrollTo(left, {
      duration: 1.0,
      onComplete: () => {
        isProgrammaticRef.current = false;
      },
    });
  }, [index, lenis]);

  // Track active section from scroll position.
  const handleScroll = useCallback(() => {
    if (isProgrammaticRef.current || !lenis) return;
    const sw = window.innerWidth;
    const nearest = Math.round(lenis.scroll / sw);
    const clamped = Math.max(0, Math.min(nearest, SECTIONS.length - 1));
    if (clamped !== indexRef.current) {
      onSelect(clamped);
    }
  }, [lenis, onSelect]);

  useLenis(handleScroll);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (indexRef.current > 0) onSelect(indexRef.current - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (indexRef.current < SECTIONS.length - 1) onSelect(indexRef.current + 1);
      } else {
        const num = Number(e.key);
        if (Number.isInteger(num) && num >= 1 && num <= SECTIONS.length) {
          e.preventDefault();
          onSelect(num - 1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelect]);

  return (
    <>
      <div className={styles.track}>
        {SECTIONS.map((s, i) => {
          const Section = s.Component;
          return (
            <div
              key={s.id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              className={styles.panel}
              data-section-id={s.id}
            >
              <Section />
            </div>
          );
        })}
      </div>
      <BottomNav activeIndex={index} onSelect={onSelect} />
      <ThemeToggle />
    </>
  );
}
