import SectionShell from "./SectionShell";
import Parallax from "../layout/Parallax";
import ParticlePortrait from "../particle-portrait/ParticlePortrait";
import styles from "./AboutSection.module.css";
import contentStyles from "./SectionContent.module.css";

export default function AboutSection() {
  return (
    <SectionShell num="02">
      <div className={styles.layout}>
        <Parallax rate={0.1} className={styles.portraitCol}>
          <ParticlePortrait
            className={styles.portraitContainer}
            imageSrc="/assets/img/headshot.png"
            gap={3}
            particleSize={1.2}
          />
        </Parallax>
        <Parallax rate={0.04} className={styles.textCol}>
          <span className={contentStyles.eyebrow}>02 — About</span>
          <h2 className={contentStyles.title}>
            Who
            <br />I am.
          </h2>
          <p className={contentStyles.bodyText}>
            A passionate data engineer creating elegant solutions to complex problems, with an eye
            for the details that make them last. I design for the business and the people who use
            it, always leading with empathy.
          </p>
          <p className={contentStyles.bodyText}>
            Based in Grand Rapids, Michigan, but constantly exploring the world through code and
            travel. I&apos;m always tinkering, learning, and building new things.
          </p>
          <span className={contentStyles.wip}>
            Want to talk?{" "}
            <a href="mailto:brad@cooley.email">
              Email me<span className={contentStyles.linkArrow}>↗</span>
            </a>
            .
          </span>
        </Parallax>
      </div>
    </SectionShell>
  );
}
