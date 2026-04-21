import SectionShell from "./SectionShell";
import Parallax from "../layout/Parallax";
import contentStyles from "./SectionContent.module.css";

export default function ProjectsSection() {
  return (
    <SectionShell num="03">
      <div className={contentStyles.inner}>
        <Parallax rate={0.12} className={contentStyles.labelCol}>
          <span className={contentStyles.eyebrow}>03 — Projects</span>
          <h2 className={contentStyles.title}>
            What
            <br />
            I&nbsp;build.
          </h2>
        </Parallax>
        <Parallax rate={0.04} className={contentStyles.textCol}>
          <p className={contentStyles.bodyText}>
            A selection of work spanning web applications, data engineering, and open-source
            contributions. Each project represents a journey of learning and craft.
          </p>
          <span className={contentStyles.wip}>— Showcase launching soon</span>
        </Parallax>
      </div>
    </SectionShell>
  );
}
