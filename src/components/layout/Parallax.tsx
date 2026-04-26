import { motion, motionValue, useTransform } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useContext } from "react";
import { SectionIndexContext } from "./SliderMotionContext";
import { useLenisOptional } from "../../context/LenisContext";

// Stable dummy MotionValue for when Lenis is not available (mobile).
const DUMMY_MV = motionValue(0);

interface Props {
  /**
   * Vertical parallax rate. Positive values make elements drift slower than
   * the page (appear deeper/behind). Negative values make elements appear
   * closer. Range 0–0.3 gives subtle depth; rates match the original
   * horizontal-slider convention so call-sites need no changes.
   *
   * Example: rate=0.2 on a ghost numeral → numeral moves at 20% of the
   * distance scrolled past the section top → drifts 40px per 200px scrolled.
   */
  rate: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "div" | "span";
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Translates its children at a custom rate as the user scrolls vertically
 * through the parent section. No-op outside the Lenis context (mobile).
 */
export default function Parallax({
  rate,
  className,
  style,
  children,
  as = "div",
  "aria-hidden": ariaHidden,
}: Props) {
  const lenis = useLenisOptional();
  const sectionIndex = useContext(SectionIndexContext);

  // Vertical offset = (scrollY - sectionTop) * rate * SCALE
  // • sectionTop = sectionIndex * viewport height (sections are all 100vh)
  // • When fully in view (delta = 0): translateY = 0
  // • Positive rate → element drifts down slightly as you scroll past it
  //   (moves slower than page → depth-behind illusion)
  //
  // SCALE 0.3: the original rates were designed for horizontal slider widths
  // (~1920px). For vertical scroll over ~900px viewport, 0.3× gives equivalent
  // visual depth without over-translating content.
  const SCALE = 0.3;
  const y = useTransform(lenis?.scrollY ?? DUMMY_MV, (scroll) => {
    if (!lenis) return 0;
    const sectionTop = sectionIndex * window.innerHeight;
    return (scroll - sectionTop) * rate * SCALE;
  });

  if (!lenis) {
    const Tag = as;
    return (
      <Tag className={className} style={style} aria-hidden={ariaHidden}>
        {children}
      </Tag>
    );
  }

  const Comp = as === "span" ? motion.span : motion.div;
  return (
    <Comp className={className} style={{ ...style, y }} aria-hidden={ariaHidden}>
      {children}
    </Comp>
  );
}
