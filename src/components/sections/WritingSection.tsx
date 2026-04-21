import SectionShell from "./SectionShell";
import Parallax from "../layout/Parallax";
import contentStyles from "./SectionContent.module.css";

export default function WritingSection() {
  return (
    <SectionShell num="04">
      <div className={contentStyles.inner}>
        <Parallax rate={0.12} className={contentStyles.labelCol}>
          <span className={contentStyles.eyebrow}>04 — Writing</span>
          <h2 className={contentStyles.title}>
            How
            <br />
            I&nbsp;think.
          </h2>
        </Parallax>
        <Parallax rate={0.04} className={contentStyles.textCol}>
          <p className={contentStyles.bodyText}>
            Thoughts on technology, development practices, and the craft of building software. A
            documentation of my learning journey.
          </p>
          <span className={contentStyles.wip}>— First posts arriving soon</span>
        </Parallax>
      </div>
    </SectionShell>
  );
}
