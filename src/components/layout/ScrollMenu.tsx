import { AnimatePresence, motion } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import styles from "./ScrollMenu.module.css";

interface Props {
  open: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

/**
 * Slide-out menu shown next to the scroll-dot indicator on mobile.
 * Mirrors the legacy `.scroll-menu` markup but driven by Framer Motion.
 */
export default function ScrollMenu({ open, activeIndex, onSelect, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className={styles.menuBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.ul
            className={styles.menu}
            role="menu"
            initial={{ opacity: 0, x: 8, y: "-50%" }}
            animate={{ opacity: 1, x: 0, y: "-50%" }}
            exit={{ opacity: 0, x: 8, y: "-50%" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {SECTIONS.map((s, i) => {
              const isActive = i === activeIndex;
              return (
                <li key={s.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.item} ${isActive ? styles.active : ""}`}
                    onClick={() => {
                      onSelect(i);
                      onClose();
                    }}
                  >
                    <span className={styles.num}>{s.num}</span>
                    <span className={styles.label}>{s.label}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        </>
      )}
    </AnimatePresence>
  );
}
