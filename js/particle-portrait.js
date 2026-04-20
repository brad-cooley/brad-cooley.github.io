/**
 * Canvas Particle Portrait
 * Renders a headshot as thousands of tiny particles that start scattered
 * and settle into position with staggered delays (wave pattern).
 * Mouse hover reveals the original image colors in a radial area.
 */
class ParticlePortrait {
  constructor(container, imageSrc, options = {}) {
    this.container = container;
    this.imageSrc = imageSrc;
    this.options = {
      particleSize: options.particleSize || 1.2,
      gap: options.gap || 3,
      ease: options.ease || 0.045,
      scatter: options.scatter || 500,
      staggerMs: options.staggerMs || 1800,
      mouseRadius: options.mouseRadius || 160,
      colorEaseIn: options.colorEaseIn || 0.08,
      colorEaseOut: options.colorEaseOut || 0.015,
      ...options,
    };

    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.revealed = false;
    this.settled = false;
    this.observer = null;
    this.resizeTimeout = null;
    this.mouse = { x: -9999, y: -9999, active: false };

    this.init();
  }

  async init() {
    try {
      this.createCanvas();
      await this.loadAndSample();
      this.setupEvents();
      this.observeVisibility();
    } catch (err) {
      console.error('ParticlePortrait: Failed to initialize', err);
    }
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'particle-portrait-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }

  async loadAndSample() {
    const img = await this.loadImage(this.imageSrc);
    this.sourceImage = img;
    this.sampleImage(img);
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  sampleImage(img) {
    // Reset any prior explicit sizing
    this.container.style.width = '';
    this.container.style.height = '';
    this.canvas.style.width = '';
    this.canvas.style.height = '';

    const style = getComputedStyle(this.container);
    const padL = parseFloat(style.paddingLeft) || 0;
    const padR = parseFloat(style.paddingRight) || 0;
    const padT = parseFloat(style.paddingTop) || 0;
    const padB = parseFloat(style.paddingBottom) || 0;
    const containerRect = this.container.getBoundingClientRect();
    const contentW = containerRect.width - padL - padR;

    // Cap height to 65% of viewport
    const maxH = window.innerHeight * 0.65 - padT - padB;

    const scale = Math.min(contentW / img.width, maxH / img.height);
    const drawW = Math.floor(img.width * scale);
    const drawH = Math.floor(img.height * scale);

    // Set canvas pixel buffer
    this.canvas.width = drawW;
    this.canvas.height = drawH;

    const offscreen = document.createElement('canvas');
    offscreen.width = drawW;
    offscreen.height = drawH;
    const offCtx = offscreen.getContext('2d');
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

        // Diagonal distance from top-left for stagger
        const diagDist = (x * 0.7 + y) / (drawW * 0.7 + drawH);

        this.particles.push({
          targetX: x,
          targetY: y,
          x: x + (Math.random() - 0.5) * scatter * 2,
          y: y + (Math.random() - 0.5) * scatter * 2,
          size: this.options.particleSize * (0.7 + Math.random() * 0.6),
          // Original image colors
          r, g, b, a,
          // Current display color blend (0 = tinted/stylized, 1 = original)
          colorReveal: 0,
          delay: diagDist * this.options.staggerMs + Math.random() * 200,
          active: false,
          settled: false,
        });
      }
    }
  }

  setupEvents() {
    // Resize
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
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
    });

    // Mouse interaction — reveal true colors
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
      this.mouse.active = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  observeVisibility() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.revealed) {
            this.revealed = true;
            this.startAnimation();
          }
        });
      },
      { threshold: 0.2 }
    );

    this.observer.observe(this.container);
  }

  startAnimation() {
    this.startTime = performance.now();

    const animate = (now) => {
      this.animationId = requestAnimationFrame(animate);
      this.update(now);
      this.draw(now);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  update(now) {
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

      // Color reveal based on mouse proximity
      let targetReveal = 0;
      if (this.mouse.active) {
        const mdx = p.targetX - this.mouse.x;
        const mdy = p.targetY - this.mouse.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < mouseRadius) {
          targetReveal = 1 - (dist / mouseRadius);
        }
      }

      // Ease color reveal toward target (fast in, slow out)
      const colorDiff = targetReveal - p.colorReveal;
      const easeRate = colorDiff > 0 ? colorEaseIn : colorEaseOut;
      if (Math.abs(colorDiff) > 0.003) {
        p.colorReveal += colorDiff * easeRate;
        allSettled = false;
      } else {
        p.colorReveal = targetReveal;
      }

      // Position easing (entrance animation)
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

  draw(now) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const t = now * 0.001; // time in seconds

    const accentR = isDark ? 204 : 240;
    const accentG = isDark ? 100 : 114;
    const accentB = isDark ? 32 : 24;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      // Shimmer: each particle rapidly flickers between shades
      // Use particle position as seed so they're all out of phase
      const flicker1 = Math.sin(t * 4.0 + p.targetX * 0.3 + p.targetY * 0.17);
      const flicker2 = Math.sin(t * 5.7 - p.targetX * 0.13 + p.targetY * 0.4);
      const flicker3 = Math.sin(t * 3.2 + p.targetX * 0.22 - p.targetY * 0.28);
      const shimmer = (flicker1 * 0.4 + flicker2 * 0.35 + flicker3 * 0.25);

      const baseAlpha = p.a / 255;
      const alpha = baseAlpha;

      const brightness = (p.r + p.g + p.b) / 3;
      const tintStrength = Math.max(0, Math.min(0.25, (brightness - 80) / 500));

      // Compute the stylized (tinted) color with shimmer baked in
      // Blend shimmer toward accent color (cosmic orange)
      const shimmerAmt = Math.max(0, shimmer) * 0.3; // 0–30% accent blend when peaking
      let styledR, styledG, styledB;
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

      ctx.fillRect(
        Math.round(p.x),
        Math.round(p.y),
        p.size,
        p.size
      );
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-particle-portrait]');
  containers.forEach((container) => {
    const src = container.getAttribute('data-particle-portrait');
    const gap = parseInt(container.getAttribute('data-particle-gap')) || undefined;
    const size = parseFloat(container.getAttribute('data-particle-size')) || undefined;
    new ParticlePortrait(container, src, { gap, particleSize: size });
  });
});
