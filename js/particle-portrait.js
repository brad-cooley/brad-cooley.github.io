/**
 * Canvas Particle Portrait
 * Renders a headshot as thousands of particles that start scattered
 * and flow into position, with interactive hover dispersion.
 */
class ParticlePortrait {
  constructor(container, imageSrc, options = {}) {
    this.container = container;
    this.imageSrc = imageSrc;
    this.options = {
      particleSize: options.particleSize || 2,
      gap: options.gap || 3, // pixel sampling gap
      ease: options.ease || 0.06,
      returnEase: options.returnEase || 0.03,
      scatter: options.scatter || 400,
      mouseRadius: options.mouseRadius || 60,
      mouseForce: options.mouseForce || 8,
      ...options,
    };

    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: -9999, y: -9999, active: false };
    this.animationId = null;
    this.revealed = false;
    this.observer = null;
    this.resizeTimeout = null;

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
    const containerRect = this.container.getBoundingClientRect();
    const maxW = containerRect.width || 400;
    const maxH = containerRect.height || 500;

    // Scale image to fit container
    const scale = Math.min(maxW / img.width, maxH / img.height);
    const drawW = Math.floor(img.width * scale);
    const drawH = Math.floor(img.height * scale);

    this.canvas.width = drawW;
    this.canvas.height = drawH;

    // Sample pixels from image
    const offscreen = document.createElement('canvas');
    offscreen.width = drawW;
    offscreen.height = drawH;
    const offCtx = offscreen.getContext('2d');
    offCtx.drawImage(img, 0, 0, drawW, drawH);

    const imageData = offCtx.getImageData(0, 0, drawW, drawH);
    const { data } = imageData;
    const gap = this.options.gap;

    this.particles = [];

    for (let y = 0; y < drawH; y += gap) {
      for (let x = 0; x < drawW; x += gap) {
        const i = (y * drawW + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip transparent/near-transparent pixels
        if (a < 40) continue;

        // Skip very light pixels (near-white background)
        const brightness = (r + g + b) / 3;
        if (brightness > 240 && a < 200) continue;

        this.particles.push({
          targetX: x,
          targetY: y,
          x: x + (Math.random() - 0.5) * this.options.scatter * 2,
          y: y + (Math.random() - 0.5) * this.options.scatter * 2,
          size: this.options.particleSize * (0.6 + Math.random() * 0.8),
          r, g, b, a,
          vx: 0,
          vy: 0,
          settled: false,
        });
      }
    }
  }

  setupEvents() {
    // Mouse interaction on canvas
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

    // Handle resize
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (this.sourceImage && this.revealed) {
          this.sampleImage(this.sourceImage);
        }
      }, 200);
    });

    // Re-read theme changes to adjust particle colors
    const themeObserver = new MutationObserver(() => {
      // Particles use sampled colors, theme affects canvas bg (transparent)
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
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
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.update();
      this.draw();
    };
    animate();
  }

  update() {
    const { mouseRadius, mouseForce, ease, returnEase } = this.options;
    const mouseActive = this.mouse.active;
    const mx = this.mouse.x;
    const my = this.mouse.y;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Move toward target
      let dx = p.targetX - p.x;
      let dy = p.targetY - p.y;

      // Use faster ease initially, slow down as particles settle
      const currentEase = p.settled ? returnEase : ease;
      p.x += dx * currentEase;
      p.y += dy * currentEase;

      // Mark as settled when close enough
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        p.settled = true;
      }

      // Mouse repulsion
      if (mouseActive) {
        const distX = p.x - mx;
        const distY = p.y - my;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          const angle = Math.atan2(distY, distX);
          p.x += Math.cos(angle) * force * mouseForce;
          p.y += Math.sin(angle) * force * mouseForce;
          p.settled = false;
        }
      }
    }
  }

  draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check current theme for particle rendering
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (isDark) {
        // In dark mode, render with a warm-shifted brightness
        const brightness = Math.min(255, (p.r + p.g + p.b) / 3 + 40);
        ctx.fillStyle = `rgba(${brightness}, ${Math.floor(brightness * 0.88)}, ${Math.floor(brightness * 0.78)}, ${p.a / 255})`;
      } else {
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.a / 255})`;
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
