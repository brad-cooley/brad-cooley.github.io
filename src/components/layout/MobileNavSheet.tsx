import { AnimatePresence, motion, type PanInfo, type Transition } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import styles from "./MobileNavSheet.module.css";

interface Props {
  open: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  morphSpring: Transition;
}

const FADE = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

/**
 * Mobile nav sheet — morphs FROM the top pill via shared
 * `layoutId="navSurface"`. The pill (in MobileLayout) and this sheet
 * trade places, with Framer Motion animating bounds.
 */
export default function MobileNavSheet({
  open,
  activeIndex,
  onSelect,
  onClose,
  morphSpring,
}: Props) {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -40 || info.velocity.y < -300) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="nav-backdrop"
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
            key="nav-sheet"
            layoutId="navSurface"
            className={styles.sheet}
            role="dialog"
            aria-label="Sections"
            aria-modal="true"
            transition={morphSpring}
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
                    transition={{
                      delay: 0.08 + i * 0.04,
                      duration: 0.28,
                      ease: "easeOut",
                    }}
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
