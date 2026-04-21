import type { ReactNode } from "react";
import Parallax from "../layout/Parallax";
import styles from "./Section.module.css";

interface SectionShellProps {
  num: string;
  children: ReactNode;
}

/**
 * Shared section shell: full-viewport panel with the giant ghost numeral
 * in the bottom right (desktop only). Ghost leads the slide for a
 * dramatic foreground sweep.
 */
export default function SectionShell({ num, children }: SectionShellProps) {
  return (
    <section className={styles.section}>
      <Parallax rate={0.2} className={styles.ghostNum} aria-hidden="true">
        {num}
      </Parallax>
      {children}
    </section>
  );
}
