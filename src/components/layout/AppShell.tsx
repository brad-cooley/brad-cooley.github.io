import { useEffect, useState } from "react";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { useHashSection } from "../../hooks/useHashSection";
import { SECTIONS } from "../../data/sections";
import CustomCursor from "./CustomCursor";
import GrainOverlay from "./GrainOverlay";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";

/**
 * Top-level shell: chooses Desktop vs Mobile layout, owns shared
 * overlays (cursor, grain), and syncs document.title with the active
 * section.
 */
export default function AppShell() {
  const isDesktop = useIsDesktop();
  const { index, goTo } = useHashSection();
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const s = SECTIONS[index];
    if (s) document.title = `Brad Cooley — ${s.label}`;
  }, [index]);

  return (
    <>
      {isDesktop && <GrainOverlay />}
      {isDesktop ? (
        <DesktopLayout index={index} onSelect={goTo} onDragChange={setDragging} />
      ) : (
        <MobileLayout index={index} onSelect={goTo} />
      )}
      {isDesktop && <CustomCursor isDragging={dragging} />}
    </>
  );
}
