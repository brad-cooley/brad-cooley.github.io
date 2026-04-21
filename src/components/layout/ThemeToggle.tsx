import { useTheme } from "../../hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { toggle } = useTheme();

  return (
    <button
      type="button"
      className={`${styles.toggle} no-print`}
      aria-label="Toggle color mode"
      onClick={toggle}
    >
      <span className={styles.icon} aria-hidden="true" />
    </button>
  );
}
