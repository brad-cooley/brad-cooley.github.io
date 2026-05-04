import { motion, useTransform, motionValue } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import { useLenisOptional } from "../../context/LenisContext";
import styles from "./BottomNav.module.css";

// Fallback so hooks are always called unconditionally
const DUMMY_MV = motionValue(0);

interface Props {
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function BottomNav({ activeIndex, onSelect }: Props) {
  const lenis = useLenisOptional();
  const scrollProgress = lenis?.scrollProgress ?? DUMMY_MV;

  // Clip path reveals the inverted text layer from the left as scroll advances
  const clipPath = useTransform(
    scrollProgress,
    (p) => `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`
  );

  return (
    <nav className={`${styles.nav} no-print`} aria-label="Site navigation">
      {/* Fill bar grows left-to-right with scroll progress */}
      <motion.div
        className={styles.fill}
        style={{ scaleX: scrollProgress }}
        aria-hidden="true"
      />

      {/* Normal text layer */}
      <div className={styles.container}>
        {SECTIONS.map((s, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.item} ${isActive ? styles.active : ""}`}
              onClick={() => onSelect(i)}
              aria-label={s.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={styles.num}>{s.num}</span>
              <span className={styles.label}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inverted text layer — same layout, bg-colored text, clipped to fill */}
      <motion.div className={styles.invertedLayer} style={{ clipPath }} aria-hidden="true">
        <div className={styles.container}>
          {SECTIONS.map((s) => (
            <div key={s.id} className={styles.invertedItem}>
              <span className={styles.num}>{s.num}</span>
              <span className={styles.label}>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </nav>
  );
}
