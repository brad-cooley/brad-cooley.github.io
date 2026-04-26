import { motion, motionValue, useTransform } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useSliderMotion } from "./SliderMotionContext";

// useTransform requires a MotionValue. Provide a stable dummy when
// outside the slider so the hook signature stays consistent.
const DUMMY_MV = motionValue(0);

interface Props {
  /**
   * Parallax rate. `0` = locked to section (no effect). `1` = moves at
   * the same rate as the slider (i.e. fixed relative to viewport).
   * Negative values move opposite the slide direction (good for
   * "ghost" elements that drift the other way).
   */
  rate: number;
  /** Optional vertical parallax rate (rare; defaults to 0). */
  rateY?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "div" | "span";
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Translates its children at a custom rate as the desktop slider
 * scrolls horizontally past this section. No-op outside the desktop
 * slider context (renders a plain div).
 */
export default function Parallax({
  rate,
  rateY = 0,
  className,
  style,
  children,
  as = "div",
  "aria-hidden": ariaHidden,
}: Props) {
  const motionCtx = useSliderMotion();

  // Hooks must run unconditionally — compute even when ctx is null,
  // then ignore the result if not inside the slider.
  // We always pass a MotionValue; useTransform handles the math.
  const x = useTransform(motionCtx?.x ?? DUMMY_MV, (latest) => {
    if (!motionCtx) return 0;
    // Distance (in px) between this section's "natural" track offset
    // and the live offset. When current section, this is 0.
    const sectionOffset = -motionCtx.sectionIndex * motionCtx.sectionWidth;
    const delta = latest - sectionOffset;
    return delta * rate;
  });

  const y = useTransform(motionCtx?.x ?? DUMMY_MV, (latest) => {
    if (!motionCtx || rateY === 0) return 0;
    const sectionOffset = -motionCtx.sectionIndex * motionCtx.sectionWidth;
    return (latest - sectionOffset) * rateY;
  });

  if (!motionCtx) {
    const Tag = as;
    return (
      <Tag className={className} style={style} aria-hidden={ariaHidden}>
        {children}
      </Tag>
    );
  }

  const Comp = as === "span" ? motion.span : motion.div;
  return (
    <Comp className={className} style={{ ...style, x, y }} aria-hidden={ariaHidden}>
      {children}
    </Comp>
  );
}
