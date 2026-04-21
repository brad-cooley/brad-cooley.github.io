import { useEffect, useRef, useState } from "react";
import styles from "./CustomCursor.module.css";

const HOVER_SELECTOR = "a, button, [role='button'], [data-cursor-hover]";

interface Props {
  isDragging?: boolean;
}

export default function CustomCursor({ isDragging = false }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let rafPending = false;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          if (ref.current) {
            ref.current.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
          }
          rafPending = false;
        });
      }

      // Hover detection via element-under-cursor — works regardless of when
      // DOM nodes mount/unmount (avoids per-target listeners).
      const target = e.target as HTMLElement | null;
      const overHover = target ? !!target.closest(HOVER_SELECTOR) : false;
      setHovering(overHover);
    };

    const onLeave = () => setOpacity(0);
    const onEnter = () => setOpacity(1);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  const cls = [styles.cursor, hovering && styles.hovering, isDragging && styles.dragging]
    .filter(Boolean)
    .join(" ");

  return <div ref={ref} className={cls} aria-hidden="true" style={{ opacity }} />;
}
