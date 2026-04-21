import { useEffect, useRef } from "react";
import {
  ParticlePortrait as ParticlePortraitInstance,
  type ParticlePortraitOptions,
} from "./particle-portrait";
import styles from "./ParticlePortrait.module.css";

interface Props extends ParticlePortraitOptions {
  imageSrc: string;
  className?: string;
}

export default function ParticlePortrait({ imageSrc, className, ...options }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // We re-mount on imageSrc change, but option changes are intentionally
  // ignored to avoid expensive re-sampling on every render.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const instance = new ParticlePortraitInstance(node, imageSrc, options);
    return () => instance.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const cls = [styles.container, className].filter(Boolean).join(" ");
  return <div ref={containerRef} className={cls} aria-hidden="true" />;
}
