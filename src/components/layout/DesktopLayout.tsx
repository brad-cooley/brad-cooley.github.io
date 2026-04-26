import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import BottomNav from "./BottomNav";
import ThemeToggle from "./ThemeToggle";
import { SectionIndexContext, SliderMotionContext } from "./SliderMotionContext";
import styles from "./DesktopLayout.module.css";

const DRAG_THRESHOLD = 0.2; // 20% of viewport width
const WHEEL_THRESHOLD = 25;
const TRANSITION_LOCK_MS = 650;
const SECTION_DURATION = 0.6;
const SECTION_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Props {
  index: number;
  onSelect: (next: number) => void;
  onDragChange?: (dragging: boolean) => void;
}

/**
 * Desktop horizontal slider. Uses Framer Motion for drag + animate;
 * adds wheel/keyboard handlers to mirror the legacy navigator.
 */
export default function DesktopLayout({ index, onSelect, onDragChange }: Props) {
  const x = useMotionValue(0);
  const lockedRef = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;
  const [sectionWidth, setSectionWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  const total = SECTIONS.length;

  // Snap to current index whenever it changes or window resizes.
  useEffect(() => {
    const target = -index * window.innerWidth;
    const controls = animate(x, target, {
      duration: SECTION_DURATION,
      ease: SECTION_EASE,
    });
    return () => controls.stop();
  }, [index, x]);

  useEffect(() => {
    const onResize = () => {
      setSectionWidth(window.innerWidth);
      const target = -indexRef.current * window.innerWidth;
      x.set(target);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [x]);

  const startLock = () => {
    lockedRef.current = true;
    window.setTimeout(() => {
      lockedRef.current = false;
    }, TRANSITION_LOCK_MS);
  };

  const goNext = () => {
    if (indexRef.current < total - 1) {
      startLock();
      onSelect(indexRef.current + 1);
    }
  };

  const goPrev = () => {
    if (indexRef.current > 0) {
      startLock();
      onSelect(indexRef.current - 1);
    }
  };

  // Wheel: needs passive:false to preventDefault, so attach manually.
  useEffect(() => {
    const node = document.getElementById("desktop-track-viewport");
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockedRef.current) return;
      const delta = e.deltaX || e.deltaY;
      if (Math.abs(delta) > WHEEL_THRESHOLD) {
        delta > 0 ? goNext() : goPrev();
      }
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!lockedRef.current) goPrev();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (!lockedRef.current) goNext();
        return;
      }
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= total) {
        e.preventDefault();
        startLock();
        onSelect(num - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const handleDragStart = () => {
    onDragChange?.(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onDragChange?.(false);
    const threshold = window.innerWidth * DRAG_THRESHOLD;
    const dx = info.offset.x;
    let next = indexRef.current;
    if (dx < -threshold && indexRef.current < total - 1) next = indexRef.current + 1;
    else if (dx > threshold && indexRef.current > 0) next = indexRef.current - 1;

    if (next !== indexRef.current) {
      startLock();
      onSelect(next);
    } else {
      // Snap back
      animate(x, -indexRef.current * window.innerWidth, {
        duration: SECTION_DURATION,
        ease: SECTION_EASE,
      });
    }
  };

  return (
    <div className={styles.layout}>
      <div id="desktop-track-viewport" className={styles.viewport}>
        <SliderMotionContext.Provider value={{ x, sectionWidth }}>
          <motion.div
            className={styles.track}
            style={{ x }}
            drag="x"
            dragElastic={0.3}
            dragConstraints={{
              left: -(total - 1) * sectionWidth,
              right: 0,
            }}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {SECTIONS.map((s, i) => {
              const Section = s.Component;
              return (
                <SectionIndexContext.Provider key={s.id} value={i}>
                  <Section />
                </SectionIndexContext.Provider>
              );
            })}
          </motion.div>
        </SliderMotionContext.Provider>
      </div>
      <BottomNav activeIndex={index} onSelect={onSelect} />
      <ThemeToggle />
    </div>
  );
}
