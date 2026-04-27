import { motion, useTransform, type MotionValue } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import styles from "./GalleryProgress.module.css";

interface Props {
  numPanels: number;
  /** Continuous 0→1 progress through the gallery (from Lenis scrollY). */
  progress: MotionValue<number>;
  /** 0-based index of the active gallery panel (for dot highlight). */
  activePanel: number;
}

/**
 * Horizontal dot-and-line indicator positioned inside the sticky gallery
 * viewport. The fill bar moves continuously with scroll progress so it
 * feels connected to the Lenis momentum.
 */
export default function GalleryProgress({ numPanels, progress, activePanel }: Props) {
  const gallerySections = SECTIONS.slice(1, 1 + numPanels);

  // Smooth continuous fill — follows Lenis easing, not a hard step.
  const fillWidth = useTransform(progress, (p) => `${p * 100}%`);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.track}>
        {/* Background connector line */}
        <div className={styles.line} />

        {/* Animated fill — grows with gallery progress */}
        <motion.div className={styles.fill} style={{ width: fillWidth }} />

        {/* Per-panel dots + labels */}
        {gallerySections.map((s, i) => (
          <div key={s.id} className={styles.stop}>
            <motion.div
              className={styles.dot}
              animate={{
                backgroundColor:
                  i <= activePanel
                    ? "var(--cosmic-orange)"
                    : "var(--ink-3)",
                scale: i === activePanel ? 1.6 : 1,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span
              className={styles.label}
              animate={{ opacity: i === activePanel ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            >
              {s.num}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}
