import { useEffect } from "react";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { useHashSection } from "../../hooks/useHashSection";
import { SECTIONS } from "../../data/sections";
import { LenisProvider } from "../../context/LenisContext";
import CustomCursor from "./CustomCursor";
import GrainOverlay from "./GrainOverlay";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";

export default function AppShell() {
  const isDesktop = useIsDesktop();
  const { index, goTo } = useHashSection();

  useEffect(() => {
    const s = SECTIONS[index];
    if (s) document.title = `Brad Cooley — ${s.label}`;
  }, [index]);

  return (
    <>
      {isDesktop && <GrainOverlay />}
      {isDesktop ? (
        <LenisProvider>
          <DesktopLayout index={index} onSelect={goTo} />
          <CustomCursor />
        </LenisProvider>
      ) : (
        <MobileLayout index={index} onSelect={goTo} />
      )}
    </>
  );
}
