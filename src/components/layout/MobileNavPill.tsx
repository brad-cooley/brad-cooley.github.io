import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import MobileNavSheet from "./MobileNavSheet";
import styles from "./MobileLayout.module.css";

interface Props {
  index: number;
  onSelect: (next: number) => void;
}

const MORPH_SPRING = { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.8 };

/**
 * Mobile nav pill (fixed at top) + nav sheet morph.
 * Extracted from MobileLayout so AppShell can use it directly.
 */
export default function MobileNavPill({ index, onSelect }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = SECTIONS[index];

  return (
    <>
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
    </>
  );
}
