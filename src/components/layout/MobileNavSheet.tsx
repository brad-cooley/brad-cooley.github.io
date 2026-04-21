import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import styles from "./MobileNavSheet.module.css";

interface Props {
  open: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

// Morph-in spring — feels like an iOS menu blooming from the pill.
const SHEET_SPRING = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.7 };
const FADE = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

/**
 * Mobile nav sheet — morphs out of the top pill (origin top-center)
 * with a scale + opacity spring, mimicking iOS Control-Center expand.
 * Drag up to dismiss; tap backdrop to close.
 */
export default function MobileNavSheet({ open, activeIndex, onSelect, onClose }: Props) {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -40 || info.velocity.y < -300) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
            onClick={onClose}
          />
          <motion.div
            className={styles.sheet}
            role="dialog"
            aria-label="Sections"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.86, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8, transition: { duration: 0.18 } }}
            transition={SHEET_SPRING}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.6, bottom: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div className={styles.handleBar} aria-hidden="true">
              <span className={styles.grip} />
            </div>
            <ul className={styles.list} role="menu">
              {SECTIONS.map((s, i) => {
                const active = i === activeIndex;
                return (
                  <motion.li
                    key={s.id}
                    role="none"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.035, duration: 0.28, ease: "easeOut" }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className={`${styles.item} ${active ? styles.active : ""}`}
                      onClick={() => {
                        onSelect(i);
                        onClose();
                      }}
                    >
                      <span className={styles.num}>{s.num}</span>
                      <span className={styles.label}>{s.label}</span>
                      {active && <span className={styles.dot} aria-hidden="true" />}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
