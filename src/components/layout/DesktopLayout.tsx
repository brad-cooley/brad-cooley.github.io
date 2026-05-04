import { useEffect, useRef } from "react";
import { motion, useTransform, useMotionValueEvent } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import { useLenis } from "../../context/LenisContext";
import BottomNav from "./BottomNav";
import ThemeToggle from "./ThemeToggle";
import ScrollProgressBar from "./ScrollProgressBar";
import { SectionIndexContext } from "./SliderMotionContext";
import styles from "./DesktopLayout.module.css";

// Section 0 (Home) scrolls vertically.
// Sections 1-N live in a sticky horizontal gallery.
const NUM_GALLERY = SECTIONS.length - 1; // 4 panels

interface Props {
  index: number;
  onSelect: (next: number) => void;
}

/**
 * Desktop layout: vertical Home section followed by a sticky horizontal gallery.
 *
 * The gallery wrapper is NUM_GALLERY × 100dvh tall, providing the scroll
 * real estate. The inner sticky viewport stays pinned while the horizontal
 * flex track translates left — driven directly from the Lenis scrollY
 * MotionValue so the easing is perfectly smooth.
 *
 * Navigation formula:  section k  ←→  scrollY = k × window.innerHeight
 */
export default function DesktopLayout({ index, onSelect }: Props) {
  const { lenisRef, scrollY: lenisScrollY } = useLenis();
  const indexRef = useRef(index);
  indexRef.current = index;

  // True while a programmatic lenis.scrollTo() is animating — suppresses the
  // scroll listener so it doesn't fight back against the animation.
  const fromScrollRef = useRef(false);

  // True when the last index change came from the scroll listener (user
  // scrolled naturally). Prevents the programmatic-scroll effect from
  // re-scrolling to a position the user just freely scrolled into.
  const fromScrollEventRef = useRef(false);

  // ── Horizontal translation ─────────────────────────────────────────────
  // Gallery starts at scrollY = 1 × vh (after the 100dvh home wrapper).
  // Scroll range to traverse all gallery panels: (NUM_GALLERY - 1) × vh.
  //
  // Track is NUM_GALLERY panels wide (each 100vw).
  // At progress=0 → x=0% (About panel). At progress=1 → x=-75% (Resume).
  // xPct = -(NUM_GALLERY-1)/NUM_GALLERY × 100  (percent of track width)
  const xPct = -((NUM_GALLERY - 1) / NUM_GALLERY) * 100;

  const x = useTransform(lenisScrollY, (scroll) => {
    const vh = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (scroll - vh) / ((NUM_GALLERY - 1) * vh)));
    return `${progress * xPct}%`;
  });

  // ── Active section tracking ────────────────────────────────────────────
  // section k is active when scrollY is nearest to k × vh.
  useMotionValueEvent(lenisScrollY, "change", (scroll) => {
    if (fromScrollRef.current) return;
    const vh = window.innerHeight;
    const next = Math.min(SECTIONS.length - 1, Math.max(0, Math.round(scroll / vh)));
    if (next !== indexRef.current) {
      fromScrollEventRef.current = true;
      onSelect(next);
    }
  });

  // ── Programmatic scroll (nav click / keyboard) ─────────────────────────
  useEffect(() => {
    if (fromScrollEventRef.current) {
      fromScrollEventRef.current = false;
      return;
    }
    if (!lenisRef.current) return;
    fromScrollRef.current = true;
    lenisRef.current.scrollTo(index * window.innerHeight, { duration: 0.9 });
    const t = window.setTimeout(() => {
      fromScrollRef.current = false;
    }, 1100);
    return () => window.clearTimeout(t);
  }, [index, lenisRef]);

  // ── Initial deep-link: wait for Lenis to init, then jump ──────────────
  useEffect(() => {
    if (index === 0) return;
    const tryScroll = () => {
      if (!lenisRef.current) {
        requestAnimationFrame(tryScroll);
        return;
      }
      lenisRef.current.scrollTo(index * window.innerHeight, { immediate: true });
    };
    requestAnimationFrame(tryScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────────────
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

  const HomeSection = SECTIONS[0].Component;

  return (
    <div className={styles.layout}>
      {/* ── Section 0: Home — full-height vertical panel ── */}
      <SectionIndexContext.Provider value={0}>
        <div className={styles.homeWrap}>
          <HomeSection />
        </div>
      </SectionIndexContext.Provider>

      {/* ── Sections 1-N: Sticky horizontal gallery ── */}
      {/*
        Height = NUM_GALLERY × 100dvh creates the scroll real estate.
        The sticky inner stays pinned for exactly (NUM_GALLERY - 1) × 100dvh
        of scroll, giving each panel one full viewport of scroll time.
      */}
      <div className={styles.galleryWrap} style={{ height: `${NUM_GALLERY * 100}dvh` }}>
        <div className={styles.gallerySticky}>
          <motion.div className={styles.galleryTrack} style={{ x }}>
            {SECTIONS.slice(1).map((s, i) => {
              const Section = s.Component;
              return (
                <SectionIndexContext.Provider key={s.id} value={i + 1}>
                  <div className={styles.galleryPanel}>
                    <Section />
                  </div>
                </SectionIndexContext.Provider>
              );
            })}
          </motion.div>

        </div>
      </div>

      <BottomNav activeIndex={index} onSelect={onSelect} />
      <ThemeToggle />
      <ScrollProgressBar />
    </div>
  );
}
