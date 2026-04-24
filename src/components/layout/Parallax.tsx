import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";

interface Props {
  /**
   * Parallax rate. Positive values move the element slower than scroll
   * (classic parallax). Negative values move it faster.
   * 0 = no effect. 0.2 is a subtle float, 0.5 is dramatic.
   */
  rate: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "div" | "span";
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Vertical scroll-linked parallax using Framer Motion's `useScroll`.
 * Tracks the element's position in the viewport and applies a
 * translateY offset proportional to `rate`.
 *
 * Works with Lenis smooth scroll (Lenis drives the actual scroll
 * position, Motion reads it via scroll events).
 */
export default function Parallax({
  rate,
  className,
  style,
  children,
  as = "div",
  "aria-hidden": ariaHidden,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // "start end" = element top hits viewport bottom (0)
    // "end start" = element bottom hits viewport top (1)
    offset: ["start end", "end start"],
  });

  // Map scroll progress [0, 1] to a pixel offset.
  // At progress=0.5 (element centered), offset=0.
  // The multiplier controls intensity; 200 * rate gives a good range.
  const y = useTransform(scrollYProgress, [0, 1], [rate * -150, rate * 150]);

  const Comp = as === "span" ? motion.span : motion.div;

  return (
    <Comp
      ref={ref}
      className={className}
      style={{ ...style, y, willChange: "transform" }}
      aria-hidden={ariaHidden}
    >
      {children}
    </Comp>
  );
}
