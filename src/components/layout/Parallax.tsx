import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { useScrollOrientation } from "./ScrollOrientationContext";

interface Props {
  /**
   * Parallax rate. Positive values move the element slower than scroll
   * (classic parallax). 0 = no effect.
   */
  rate: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "div" | "span";
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Scroll-linked parallax using Framer Motion's `useScroll`.
 * Reads orientation from context: horizontal on desktop, vertical on mobile.
 * Applies translateX (horizontal) or translateY (vertical) offset.
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
  const orientation = useScrollOrientation();
  const isHorizontal = orientation === "horizontal";

  const { scrollXProgress, scrollYProgress } = useScroll({
    target: ref,
    axis: isHorizontal ? "x" : "y",
    offset: ["start end", "end start"],
  });

  const progress = isHorizontal ? scrollXProgress : scrollYProgress;

  // Map scroll progress [0, 1] to a pixel offset.
  // At progress=0.5 (element centered), offset=0.
  const range = rate * 200;
  const offset = useTransform(progress, [0, 1], [-range, range]);

  const Comp = as === "span" ? motion.span : motion.div;

  const motionStyle: CSSProperties & Record<string, unknown> = {
    ...style,
    willChange: "transform",
  };

  if (isHorizontal) {
    (motionStyle as Record<string, unknown>).x = offset;
  } else {
    (motionStyle as Record<string, unknown>).y = offset;
  }

  return (
    <Comp ref={ref} className={className} style={motionStyle} aria-hidden={ariaHidden}>
      {children}
    </Comp>
  );
}
