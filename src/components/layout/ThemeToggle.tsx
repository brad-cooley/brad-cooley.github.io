import LiquidGlass from "liquid-glass-react";
import { useTheme } from "../../hooks/useTheme";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { toggle } = useTheme();
  const isDesktop = useIsDesktop();

  const icon = <span className={styles.icon} aria-hidden="true" />;

  if (isDesktop) {
    return (
      <button
        type="button"
        className={`${styles.toggle} no-print`}
        aria-label="Toggle color mode"
        onClick={toggle}
      >
        {icon}
      </button>
    );
  }

  // Mobile: liquid-glass circular bubble.
  return (
    <button
      type="button"
      className={`${styles.toggle} ${styles.mobile} no-print`}
      aria-label="Toggle color mode"
      onClick={toggle}
    >
      <LiquidGlass
        cornerRadius={999}
        padding="14px"
        displacementScale={28}
        blurAmount={0.08}
        saturation={150}
        aberrationIntensity={1}
        elasticity={0.25}
        mode="standard"
      >
        {icon}
      </LiquidGlass>
    </button>
  );
}
