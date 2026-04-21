import SectionShell from "./SectionShell";
import Parallax from "../layout/Parallax";
import styles from "./HomeSection.module.css";

export default function HomeSection() {
  return (
    <SectionShell num="01">
      <div className={styles.home}>
        <Parallax rate={0.15}>
          <h1 className={styles.name}>
            Brad
            <br />
            Cooley
          </h1>
        </Parallax>
        <div className={styles.rule} />
        <Parallax rate={0.05} className={styles.footer}>
          <p className={styles.title}>Lead Data Engineer @ Mutually Human</p>
          <div className={styles.links}>
            <a
              href="https://github.com/brad-cooley"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              GitHub
              <span className={styles.linkArrow}>↗</span>
            </a>
            <a
              href="https://linkedin.com/in/bradcooley"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              LinkedIn
              <span className={styles.linkArrow}>↗</span>
            </a>
          </div>
        </Parallax>
      </div>
    </SectionShell>
  );
}
