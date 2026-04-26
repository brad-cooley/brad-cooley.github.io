import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { motionValue, type MotionValue } from "framer-motion";

export interface LenisCtx {
  lenisRef: React.RefObject<Lenis | null>;
  scrollY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
}

const Ctx = createContext<LenisCtx | null>(null);

export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollY = useRef(motionValue(0)).current;
  const scrollProgress = useRef(motionValue(0)).current;

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (instance: Lenis) => {
      scrollY.set(instance.scroll);
      scrollProgress.set(instance.progress);
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [scrollY, scrollProgress]);

  return (
    <Ctx.Provider value={{ lenisRef, scrollY, scrollProgress }}>{children}</Ctx.Provider>
  );
}

/** Required — throws if used outside LenisProvider */
export function useLenis(): LenisCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLenis must be used inside LenisProvider");
  return ctx;
}

/** Optional — returns null if outside LenisProvider (e.g. mobile) */
export function useLenisOptional(): LenisCtx | null {
  return useContext(Ctx);
}
