import SectionShell from "./SectionShell";
import Parallax from "../layout/Parallax";
import contentStyles from "./SectionContent.module.css";

export default function ResumeSection() {
  return (
    <SectionShell num="05">
      <div className={contentStyles.inner}>
        <Parallax rate={0.12} className={contentStyles.labelCol}>
          <span className={contentStyles.eyebrow}>05 — Resume</span>
          <h2 className={contentStyles.title}>
            What
            <br />
            I&apos;ve done.
          </h2>
        </Parallax>
        <Parallax rate={0.04} className={contentStyles.textCol}>
          <p className={contentStyles.bodyText}>
            Professional background, technical skills, and experience. A comprehensive look at my
            career journey as a software and data engineer.
          </p>
          <span className={contentStyles.wip}>— Full resume arriving soon</span>
        </Parallax>
      </div>
    </SectionShell>
  );
}
