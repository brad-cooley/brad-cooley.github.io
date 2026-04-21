import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import styles from "./MobileNavSheet.module.css";

interface Props {
  open: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

const SHEET_SPRING = { type: "spring" as const, stiffness: 380, damping: 36, mass: 0.9 };
const FADE = { duration: 0.18 };

/**
 * Mobile nav sheet — slides down from the top with the section list.
 * Drag the sheet up to dismiss; tap the backdrop to close.
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
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
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
                  <li key={s.id} role="none">
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
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
