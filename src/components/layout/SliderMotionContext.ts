import { createContext, useContext } from "react";
import type { MotionValue } from "framer-motion";

/**
 * Exposes the desktop slider's horizontal motion value (`x`, in px,
 * negative as you advance forward) plus geometry needed for parallax.
 *
 * `null` outside the desktop slider — components should no-op
 * gracefully (e.g. by skipping the transform).
 */
export interface SliderMotionValue {
  /** Motion value for the track's translateX, in px (≤ 0). */
  x: MotionValue<number>;
  /** Index this consumer is rendered at (0-based). */
  sectionIndex: number;
  /** Width of one section in px (== window.innerWidth at last sync). */
  sectionWidth: number;
}

export const SliderMotionContext = createContext<Omit<SliderMotionValue, "sectionIndex"> | null>(
  null,
);

/** Per-section context: just the section's index. */
export const SectionIndexContext = createContext<number>(0);

export function useSliderMotion(): SliderMotionValue | null {
  const ctx = useContext(SliderMotionContext);
  const sectionIndex = useContext(SectionIndexContext);
  if (!ctx) return null;
  return { ...ctx, sectionIndex };
}
