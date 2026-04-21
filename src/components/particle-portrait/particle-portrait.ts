/**
 * Canvas Particle Portrait
 * Renders a headshot as thousands of tiny particles that start scattered
 * and settle into position with staggered delays (wave pattern).
 * Mouse hover reveals the original image colors in a radial area.
 *
 * Ported verbatim from the original vanilla JS implementation; only types
 * have been added.
 */

export interface ParticlePortraitOptions {
  particleSize?: number;
  gap?: number;
  ease?: number;
  scatter?: number;
  staggerMs?: number;
  mouseRadius?: number;
  colorEaseIn?: number;
  colorEaseOut?: number;
}

interface Particle {
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  size: number;
  r: number;
  g: number;
  b: number;
  a: number;
  colorReveal: number;
  delay: number;
  active: boolean;
  settled: boolean;
}

interface RequiredOptions {
  particleSize: number;
  gap: number;
  ease: number;
  scatter: number;
  staggerMs: number;
  mouseRadius: number;
  colorEaseIn: number;
  colorEaseOut: number;
}

export class ParticlePortrait {
  private container: HTMLElement;
  private imageSrc: string;
  private options: RequiredOptions;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private revealed = false;
  private settled = false;
  private observer: IntersectionObserver | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private mouse = { x: -9999, y: -9999, active: false };
  private startTime = 0;
  private sourceImage: HTMLImageElement | null = null;
  private onResize: (() => void) | null = null;

  constructor(container: HTMLElement, imageSrc: string, options: ParticlePortraitOptions = {}) {
    this.container = container;
    this.imageSrc = imageSrc;
    this.options = {
      particleSize: options.particleSize ?? 1.2,
      gap: options.gap ?? 3,
      ease: options.ease ?? 0.045,
      scatter: options.scatter ?? 500,
      staggerMs: options.staggerMs ?? 1800,
      mouseRadius: options.mouseRadius ?? 160,
      colorEaseIn: options.colorEaseIn ?? 0.08,
      colorEaseOut: options.colorEaseOut ?? 0.015,
    };

    void this.init();
  }

  private async init(): Promise<void> {
    try {
      this.createCanvas();
      await this.loadAndSample();
      this.setupEvents();
      this.observeVisibility();
    } catch (err) {
      console.error("ParticlePortrait: Failed to initialize", err);
    }
  }

  private createCanvas(): void {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "particle-portrait-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);
  }

  private async loadAndSample(): Promise<void> {
    const img = await this.loadImage(this.imageSrc);
    this.sourceImage = img;
    this.sampleImage(img);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private sampleImage(img: HTMLImageElement): void {
    if (!this.canvas) return;

    this.container.style.width = "";
    this.container.style.height = "";
    this.canvas.style.width = "";
    this.canvas.style.height = "";

    const style = getComputedStyle(this.container);
    const padL = parseFloat(style.paddingLeft) || 0;
    const padR = parseFloat(style.paddingRight) || 0;
    const padT = parseFloat(style.paddingTop) || 0;
    const padB = parseFloat(style.paddingBottom) || 0;
    const containerRect = this.container.getBoundingClientRect();
    const contentW = containerRect.width - padL - padR;

    const maxH = window.innerHeight * 0.65 - padT - padB;

    const scale = Math.min(contentW / img.width, maxH / img.height);
    const drawW = Math.floor(img.width * scale);
    const drawH = Math.floor(img.height * scale);

    this.canvas.width = drawW;
    this.canvas.height = drawH;

    const offscreen = document.createElement("canvas");
    offscreen.width = drawW;
    offscreen.height = drawH;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;
    offCtx.drawImage(img, 0, 0, drawW, drawH);

    const imageData = offCtx.getImageData(0, 0, drawW, drawH);
    const { data } = imageData;
    const gap = this.options.gap;
    const scatter = this.options.scatter;

    this.particles = [];

    for (let y = 0; y < drawH; y += gap) {
      for (let x = 0; x < drawW; x += gap) {
        const i = (y * drawW + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 40) continue;

        const brightness = (r + g + b) / 3;
        if (brightness > 240 && a < 200) continue;

        const diagDist = (x * 0.7 + y) / (drawW * 0.7 + drawH);

        this.particles.push({
          targetX: x,
          targetY: y,
          x: x + (Math.random() - 0.5) * scatter * 2,
          y: y + (Math.random() - 0.5) * scatter * 2,
          size: this.options.particleSize * (0.7 + Math.random() * 0.6),
          r,
          g,
          b,
          a,
          colorReveal: 0,
          delay: diagDist * this.options.staggerMs + Math.random() * 200,
          active: false,
          settled: false,
        });
      }
    }
  }

  private setupEvents(): void {
    this.onResize = () => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (this.sourceImage && this.revealed) {
          this.sampleImage(this.sourceImage);
          this.particles.forEach((p) => {
            p.x = p.targetX;
            p.y = p.targetY;
            p.active = true;
            p.settled = true;
            p.colorReveal = 0;
          });
        }
      }, 200);
    };
    window.addEventListener("resize", this.onResize);

    if (!this.canvas) return;
    this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
      this.mouse.active = true;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  private observeVisibility(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.revealed) {
            this.revealed = true;
            this.startAnimation();
          }
        });
      },
      { threshold: 0.2 },
    );
    this.observer.observe(this.container);
  }

  private startAnimation(): void {
    this.startTime = performance.now();

    const animate = (now: number) => {
      this.animationId = requestAnimationFrame(animate);
      this.update(now);
      this.draw(now);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private update(now: number): void {
    const elapsed = now - this.startTime;
    const ease = this.options.ease;
    const mouseRadius = this.options.mouseRadius;
    const colorEaseIn = this.options.colorEaseIn;
    const colorEaseOut = this.options.colorEaseOut;
    let allSettled = true;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (!p.active) {
        if (elapsed >= p.delay) {
          p.active = true;
        } else {
          allSettled = false;
          continue;
        }
      }

      let targetReveal = 0;
      if (this.mouse.active) {
        const mdx = p.targetX - this.mouse.x;
        const mdy = p.targetY - this.mouse.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < mouseRadius) {
          targetReveal = 1 - dist / mouseRadius;
        }
      }

      const colorDiff = targetReveal - p.colorReveal;
      const easeRate = colorDiff > 0 ? colorEaseIn : colorEaseOut;
      if (Math.abs(colorDiff) > 0.003) {
        p.colorReveal += colorDiff * easeRate;
        allSettled = false;
      } else {
        p.colorReveal = targetReveal;
      }

      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;

      p.x += dx * ease;
      p.y += dy * ease;

      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.settled = true;
      } else {
        allSettled = false;
      }
    }

    this.settled = allSettled;
  }

  private draw(now: number): void {
    if (!this.ctx || !this.canvas) return;
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const t = now * 0.001;

    const accentR = isDark ? 204 : 240;
    const accentG = isDark ? 100 : 114;
    const accentB = isDark ? 32 : 24;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      const flicker1 = Math.sin(t * 4.0 + p.targetX * 0.3 + p.targetY * 0.17);
      const flicker2 = Math.sin(t * 5.7 - p.targetX * 0.13 + p.targetY * 0.4);
      const flicker3 = Math.sin(t * 3.2 + p.targetX * 0.22 - p.targetY * 0.28);
      const shimmer = flicker1 * 0.4 + flicker2 * 0.35 + flicker3 * 0.25;

      const baseAlpha = p.a / 255;
      const alpha = baseAlpha;

      const brightness = (p.r + p.g + p.b) / 3;
      const tintStrength = Math.max(0, Math.min(0.25, (brightness - 80) / 500));

      const shimmerAmt = Math.max(0, shimmer) * 0.3;
      let styledR: number;
      let styledG: number;
      let styledB: number;
      if (isDark) {
        const base = Math.min(255, brightness + 40);
        const baseR = Math.round(base * (1 - tintStrength) + accentR * tintStrength);
        const baseG = Math.round(base * 0.88 * (1 - tintStrength) + accentG * tintStrength);
        const baseB = Math.round(base * 0.78 * (1 - tintStrength) + accentB * tintStrength);
        styledR = Math.round(baseR * (1 - shimmerAmt) + accentR * shimmerAmt);
        styledG = Math.round(baseG * (1 - shimmerAmt) + accentG * shimmerAmt);
        styledB = Math.round(baseB * (1 - shimmerAmt) + accentB * shimmerAmt);
      } else {
        const warmBase = brightness * 0.95;
        const baseR = Math.round(warmBase * (1 - tintStrength) + accentR * tintStrength);
        const baseG = Math.round(warmBase * 0.92 * (1 - tintStrength) + accentG * tintStrength);
        const baseB = Math.round(warmBase * 0.85 * (1 - tintStrength) + accentB * tintStrength);
        styledR = Math.round(baseR * (1 - shimmerAmt) + accentR * shimmerAmt);
        styledG = Math.round(baseG * (1 - shimmerAmt) + accentG * shimmerAmt);
        styledB = Math.round(baseB * (1 - shimmerAmt) + accentB * shimmerAmt);
      }

      const rev = p.colorReveal;

      if (rev > 0.01) {
        const avg = (p.r + p.g + p.b) / 3;
        const satBoost = 1.5;
        const vibR = Math.min(255, Math.round(avg + (p.r - avg) * satBoost));
        const vibG = Math.min(255, Math.round(avg + (p.g - avg) * satBoost));
        const vibB = Math.min(255, Math.round(avg + (p.b - avg) * satBoost));

        const finalR = Math.round(styledR * (1 - rev) + vibR * rev);
        const finalG = Math.round(styledG * (1 - rev) + vibG * rev);
        const finalB = Math.round(styledB * (1 - rev) + vibB * rev);

        ctx.fillStyle = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(${styledR}, ${styledG}, ${styledB}, ${alpha})`;
      }

      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }

    // Mark `settled` as used to avoid TS noUnusedLocals.
    void this.settled;
  }

  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.onResize) {
      window.removeEventListener("resize", this.onResize);
      this.onResize = null;
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    if (this.canvas && this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
  }
}
