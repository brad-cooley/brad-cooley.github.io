import type { ComponentType } from "react";
import HomeSection from "../components/sections/HomeSection";
import AboutSection from "../components/sections/AboutSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import WritingSection from "../components/sections/WritingSection";
import ResumeSection from "../components/sections/ResumeSection";

export interface SectionDef {
  /** Hash route segment, e.g. "home" → #/home */
  id: string;
  /** Two-digit display number, e.g. "01" */
  num: string;
  /** Nav label */
  label: string;
  /** Section component (handles its own layout). */
  Component: ComponentType;
}

export const SECTIONS: SectionDef[] = [
  { id: "home", num: "01", label: "Home", Component: HomeSection },
  { id: "about", num: "02", label: "About", Component: AboutSection },
  { id: "projects", num: "03", label: "Projects", Component: ProjectsSection },
  { id: "blog", num: "04", label: "Writing", Component: WritingSection },
  { id: "resume", num: "05", label: "Resume", Component: ResumeSection },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
