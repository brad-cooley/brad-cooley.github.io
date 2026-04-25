import { useCallback, useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { SECTIONS } from "../../data/sections";
import MobileNavPill from "./MobileNavPill";
import ThemeToggle from "./ThemeToggle";
import { ScrollOrientationContext } from "./ScrollOrientationContext";

interface Props {
  index: number;
  onSelect: (next: number) => void;
}

/**
 * Mobile vertical layout powered by Lenis root (document scroll).
 * Free scroll, no snap. Lenis provides smooth inertia.
 */
export default function MobileLayout({ index, onSelect }: Props) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      <ScrollOrientationContext.Provider value="vertical">
        <MobileLayoutInner index={index} onSelect={onSelect} />
      </ScrollOrientationContext.Provider>
    </ReactLenis>
  );
}

function MobileLayoutInner({
  index,
  onSelect,
}: {
  index: number;
  onSelect: (next: number) => void;
}) {
  const lenis = useLenis();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticRef = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  // Programmatic scroll to section.
  useEffect(() => {
    const target = sectionRefs.current[index];
    if (!target || !lenis) return;
    const top = target.offsetTop;
    if (Math.abs(lenis.scroll - top) < 4) return;

    isProgrammaticRef.current = true;
    lenis.scrollTo(top, {
      duration: 1.2,
      onComplete: () => {
        isProgrammaticRef.current = false;
      },
    });
  }, [index, lenis]);

  // Track active section from scroll position.
  const handleScroll = useCallback(() => {
    if (isProgrammaticRef.current || !lenis) return;
    const sh = window.innerHeight;
    const nearest = Math.round(lenis.scroll / sh);
    const clamped = Math.max(0, Math.min(nearest, SECTIONS.length - 1));
    if (clamped !== indexRef.current) {
      onSelect(clamped);
    }
  }, [lenis, onSelect]);

  useLenis(handleScroll);

  return (
    <>
      <main>
        {SECTIONS.map((s, i) => {
          const Section = s.Component;
          return (
            <div
              key={s.id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              data-section-id={s.id}
            >
              <Section />
            </div>
          );
        })}
      </main>
      <MobileNavPill index={index} onSelect={onSelect} />
      <ThemeToggle />
    </>
  );
}
