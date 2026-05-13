import { useRef, useEffect, useCallback } from 'react'

interface Particle {
  targetX: number
  targetY: number
  x: number
  y: number
  size: number
  r: number
  g: number
  b: number
  a: number
  colorReveal: number
  delay: number
  active: boolean
  settled: boolean
}

interface ParticlePortraitProps {
  imageSrc: string
  gap?: number
  particleSize?: number
}

export default function ParticlePortrait({
  imageSrc,
  gap = 3,
  particleSize = 1.2,
}: ParticlePortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const sourceImageRef = useRef<HTMLImageElement | null>(null)
  const revealedRef = useRef(false)
  const animationIdRef = useRef<number>(0)
  const startTimeRef = useRef(0)
  const mouseRef = useRef({ x: -9999, y: -9999, active: false })

  const EASE = 0.045
  const SCATTER = 500
  const STAGGER_MS = 1800
  const MOUSE_RADIUS = 160
  const COLOR_EASE_IN = 0.08
  const COLOR_EASE_OUT = 0.015

  const sampleImage = useCallback((img: HTMLImageElement) => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    container.style.width = ''
    container.style.height = ''
    canvas.style.width = ''
    canvas.style.height = ''

    const style = getComputedStyle(container)
    const padL = parseFloat(style.paddingLeft) || 0
    const padR = parseFloat(style.paddingRight) || 0
    const padT = parseFloat(style.paddingTop) || 0
    const padB = parseFloat(style.paddingBottom) || 0
    const containerRect = container.getBoundingClientRect()
    const contentW = containerRect.width - padL - padR
    const maxH = window.innerHeight * 0.65 - padT - padB

    const scale = Math.min(contentW / img.width, maxH / img.height)
    const drawW = Math.floor(img.width * scale)
    const drawH = Math.floor(img.height * scale)

    canvas.width = drawW
    canvas.height = drawH

    const offscreen = document.createElement('canvas')
    offscreen.width = drawW
    offscreen.height = drawH
    const offCtx = offscreen.getContext('2d')!
    offCtx.drawImage(img, 0, 0, drawW, drawH)

    const imageData = offCtx.getImageData(0, 0, drawW, drawH)
    const { data } = imageData

    const particles: Particle[] = []

    for (let y = 0; y < drawH; y += gap) {
      for (let x = 0; x < drawW; x += gap) {
        const i = (y * drawW + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]

        if (a < 40) continue

        const brightness = (r + g + b) / 3
        if (brightness > 240 && a < 200) continue

        const diagDist = (x * 0.7 + y) / (drawW * 0.7 + drawH)

        particles.push({
          targetX: x,
          targetY: y,
          x: x + (Math.random() - 0.5) * SCATTER * 2,
          y: y + (Math.random() - 0.5) * SCATTER * 2,
          size: particleSize * (0.7 + Math.random() * 0.6),
          r, g, b, a,
          colorReveal: 0,
          delay: diagDist * STAGGER_MS + Math.random() * 200,
          active: false,
          settled: false,
        })
      }
    }

    particlesRef.current = particles
  }, [gap, particleSize])

  const update = useCallback((now: number) => {
    const elapsed = now - startTimeRef.current
    const particles = particlesRef.current
    const mouse = mouseRef.current

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      if (!p.active) {
        if (elapsed >= p.delay) {
          p.active = true
        } else {
          continue
        }
      }

      let targetReveal = 0
      if (mouse.active) {
        const mdx = p.targetX - mouse.x
        const mdy = p.targetY - mouse.y
        const dist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (dist < MOUSE_RADIUS) {
          targetReveal = 1 - (dist / MOUSE_RADIUS)
        }
      }

      const colorDiff = targetReveal - p.colorReveal
      const easeRate = colorDiff > 0 ? COLOR_EASE_IN : COLOR_EASE_OUT
      if (Math.abs(colorDiff) > 0.003) {
        p.colorReveal += colorDiff * easeRate
      } else {
        p.colorReveal = targetReveal
      }

      const dx = p.targetX - p.x
      const dy = p.targetY - p.y

      p.x += dx * EASE
      p.y += dy * EASE

      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        p.x = p.targetX
        p.y = p.targetY
        p.settled = true
      }
    }
  }, [])

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const t = now * 0.001

    const accentR = isDark ? 204 : 240
    const accentG = isDark ? 100 : 114
    const accentB = isDark ? 32 : 24

    const particles = particlesRef.current

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (!p.active) continue

      const flicker1 = Math.sin(t * 4.0 + p.targetX * 0.3 + p.targetY * 0.17)
      const flicker2 = Math.sin(t * 5.7 - p.targetX * 0.13 + p.targetY * 0.4)
      const flicker3 = Math.sin(t * 3.2 + p.targetX * 0.22 - p.targetY * 0.28)
      const shimmer = (flicker1 * 0.4 + flicker2 * 0.35 + flicker3 * 0.25)

      const alpha = p.a / 255
      const brightness = (p.r + p.g + p.b) / 3
      const tintStrength = Math.max(0, Math.min(0.25, (brightness - 80) / 500))

      const shimmerAmt = Math.max(0, shimmer) * 0.3
      let styledR: number, styledG: number, styledB: number
      if (isDark) {
        const base = Math.min(255, brightness + 40)
        const baseR = Math.round(base * (1 - tintStrength) + accentR * tintStrength)
        const baseG = Math.round(base * 0.88 * (1 - tintStrength) + accentG * tintStrength)
        const baseB = Math.round(base * 0.78 * (1 - tintStrength) + accentB * tintStrength)
        styledR = Math.round(baseR * (1 - shimmerAmt) + accentR * shimmerAmt)
        styledG = Math.round(baseG * (1 - shimmerAmt) + accentG * shimmerAmt)
        styledB = Math.round(baseB * (1 - shimmerAmt) + accentB * shimmerAmt)
      } else {
        const warmBase = brightness * 0.95
        const baseR = Math.round(warmBase * (1 - tintStrength) + accentR * tintStrength)
        const baseG = Math.round(warmBase * 0.92 * (1 - tintStrength) + accentG * tintStrength)
        const baseB = Math.round(warmBase * 0.85 * (1 - tintStrength) + accentB * tintStrength)
        styledR = Math.round(baseR * (1 - shimmerAmt) + accentR * shimmerAmt)
        styledG = Math.round(baseG * (1 - shimmerAmt) + accentG * shimmerAmt)
        styledB = Math.round(baseB * (1 - shimmerAmt) + accentB * shimmerAmt)
      }

      const rev = p.colorReveal

      if (rev > 0.01) {
        const avg = (p.r + p.g + p.b) / 3
        const satBoost = 1.5
        const vibR = Math.min(255, Math.round(avg + (p.r - avg) * satBoost))
        const vibG = Math.min(255, Math.round(avg + (p.g - avg) * satBoost))
        const vibB = Math.min(255, Math.round(avg + (p.b - avg) * satBoost))

        const finalR = Math.round(styledR * (1 - rev) + vibR * rev)
        const finalG = Math.round(styledG * (1 - rev) + vibG * rev)
        const finalB = Math.round(styledB * (1 - rev) + vibB * rev)

        ctx.fillStyle = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`
      } else {
        ctx.fillStyle = `rgba(${styledR}, ${styledG}, ${styledB}, ${alpha})`
      }

      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
    }
  }, [])

  const startAnimation = useCallback(() => {
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      animationIdRef.current = requestAnimationFrame(animate)
      update(now)
      draw(now)
    }

    animationIdRef.current = requestAnimationFrame(animate)
  }, [update, draw])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let resizeTimeout: ReturnType<typeof setTimeout>

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      mouseRef.current.x = (e.clientX - rect.left) * scaleX
      mouseRef.current.y = (e.clientY - rect.top) * scaleY
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (sourceImageRef.current && revealedRef.current) {
          sampleImage(sourceImageRef.current)
          particlesRef.current.forEach((p) => {
            p.x = p.targetX
            p.y = p.targetY
            p.active = true
            p.settled = true
            p.colorReveal = 0
          })
        }
      }, 200)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', handleResize)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !revealedRef.current) {
            revealedRef.current = true
            startAnimation()
          }
        })
      },
      { threshold: 0.2 }
    )

    loadImage(imageSrc).then((img) => {
      sourceImageRef.current = img
      sampleImage(img)
      observer.observe(container)
    }).catch((err) => {
      console.error('ParticlePortrait: Failed to initialize', err)
    })

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      observer.disconnect()
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [imageSrc, sampleImage, startAnimation])

  return (
    <div
      ref={containerRef}
      className="particle-portrait-container"
    >
      <canvas
        ref={canvasRef}
        className="particle-portrait-canvas"
        aria-hidden="true"
      />
    </div>
  )
}
