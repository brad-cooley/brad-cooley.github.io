import { motion } from "framer-motion";
import { SECTIONS } from "../../data/sections";
import styles from "./BottomNav.module.css";

interface Props {
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Bottom navigation with a sliding underline. Framer Motion's `layoutId`
 * handles the slide automatically — no manual offsetLeft/offsetWidth math.
 */
export default function BottomNav({ activeIndex, onSelect }: Props) {
  return (
    <nav className={`${styles.nav} no-print`} aria-label="Site navigation">
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
              {isActive && (
                <motion.span
                  layoutId="navIndicator"
                  className={styles.indicator}
                  style={{ width: "100%" }}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
